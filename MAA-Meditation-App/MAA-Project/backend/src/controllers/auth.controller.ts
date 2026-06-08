/**
 * File: auth.controller.ts
 *
 * Description: Handles authentication endpoints: phone OTP request/verify, email login/signup. Creates user profiles on first login.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase, supabaseAnon } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';

/**
 * POST /api/auth/request-otp
 * Send OTP to phone number via Supabase Auth
 */
export const requestOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      res.status(400).json(error('INVALID_PHONE', 'Please provide a valid phone number', 400));
      return;
    }

    const { error: supabaseError } = await supabaseAnon.auth.signInWithOtp({ phone });
    console.log(`[Auth] signInWithOtp called for ${phone}`);

    if (supabaseError) {
      console.error(`[Auth] Supabase OTP error for ${phone}:`, {
        code: (supabaseError as any).code,
        message: supabaseError.message,
        status: (supabaseError as any).status
      });
      res.status(400).json(error('OTP_SEND_FAILED', supabaseError.message, 400));
      return;
    }

    res.status(200).json(success({ message: `OTP sent to ${phone}` }));
  } catch (err) {
    console.error('requestOTP error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to send OTP', 500));
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify OTP and return JWT tokens
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    const { data, error: supabaseError } = await supabaseAnon.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });

    if (supabaseError || !data.session) {
      res.status(401).json(error('OTP_INVALID', 'Invalid or expired OTP', 401));
      return;
    }

    // Upsert user profile on login — update timestamps
    const { user, session } = data;
    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: user!.id,
        phone: user!.phone,
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      },
      { onConflict: 'id', ignoreDuplicates: false }
    );
    if (upsertError) {
      console.error('[Auth] verifyOTP profile upsert failed:', upsertError.message);
    } else {
      console.log(`[Auth] verifyOTP: last_login_at updated for user ${user!.id}`);
    }

    res.status(200).json(
      success({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        user: {
          id: user!.id,
          phone: user!.phone,
        },
      })
    );
  } catch (err) {
    console.error('verifyOTP error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'OTP verification failed', 500));
  }
};

/**
 * POST /api/auth/email-login
 * Sign in with email + password via Supabase Auth
 */
export const emailLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    let { data, error: supabaseError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (supabaseError) {
      console.log(`[Auth] signInWithPassword failed:`, supabaseError.message);
      
      // If login fails, try to sign up the user automatically via Admin API
      console.log(`[Auth] Attempting auto-signup via admin API...`);
      const { error: adminError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (adminError) {
        console.log(`[Auth] Admin auto-signup failed:`, adminError.message);
        
        const errMsg = adminError.message.toLowerCase();
        // If they are already registered, it means they just typed the wrong password
        if (errMsg.includes('already registered') || 
            errMsg.includes('already exists')) {
          res.status(401).json(error('LOGIN_FAILED', 'Invalid email or password', 401));
          return;
        }
        res.status(400).json(error('LOGIN_FAILED', adminError.message, 400));
        return;
      }

      console.log(`[Auth] Admin auto-signup succeeded for new user. Retrying login...`);
      // Since they are now successfully signed up and confirmed, retry the signInWithPassword
      const retryResponse = await supabaseAnon.auth.signInWithPassword({
        email,
        password,
      });

      if (retryResponse.error) {
        console.log(`[Auth] Retry login failed:`, retryResponse.error.message);
        res.status(401).json(error('LOGIN_FAILED', retryResponse.error.message, 401));
        return;
      }

      data = retryResponse.data;
      supabaseError = null;
    }

    if (!data.session) {
      console.log(`[Auth] No session created.`);
      res.status(401).json(error('LOGIN_FAILED', 'Failed to start session', 401));
      return;
    }

    // Upsert user profile on login — update timestamps
    const { user, session } = data;
    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: user!.id,
        email: user!.email,
        auth_provider: 'email',
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      },
      { onConflict: 'id', ignoreDuplicates: false }
    );
    if (upsertError) {
      console.error('[Auth] emailLogin profile upsert failed:', upsertError.message);
    } else {
      console.log(`[Auth] emailLogin: last_login_at updated for user ${user!.id}`);
    }

    res.status(200).json(
      success({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        user: {
          id: user!.id,
          email: user!.email,
        },
      })
    );
  } catch (err) {
    console.error('emailLogin error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Login failed', 500));
  }
};

/**
 * POST /api/auth/email-signup
 * Register with email + password via Supabase Auth
 */
export const emailSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data, error: adminError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (adminError) {
      res.status(400).json(error('SIGNUP_FAILED', adminError.message, 400));
      return;
    }

    res.status(201).json(
      success({
        message: 'Account created successfully.',
        userId: data.user?.id,
      })
    );
  } catch (err) {
    console.error('emailSignup error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Signup failed', 500));
  }
};

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json(error('MISSING_REFRESH_TOKEN', 'Refresh token is required', 400));
      return;
    }

    const { data, error: supabaseError } = await supabaseAnon.auth.refreshSession({
      refresh_token,
    });

    if (supabaseError || !data.session) {
      res.status(401).json(error('REFRESH_FAILED', 'Invalid or expired refresh token', 401));
      return;
    }

    res.status(200).json(
      success({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })
    );
  } catch (err) {
    console.error('refreshToken error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Token refresh failed', 500));
  }
};

/**
 * POST /api/auth/logout
 * Sign out user and invalidate tokens
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Set the session for logout
      await supabaseAnon.auth.setSession({
        access_token: token,
        refresh_token: req.body.refresh_token || '',
      });
    }

    const { error: supabaseError } = await supabaseAnon.auth.signOut();

    if (supabaseError) {
      console.warn('Logout error (non-critical):', supabaseError.message);
    }

    res.status(200).json(success({ message: 'Logged out successfully' }));
  } catch (err) {
    console.error('logout error:', err);
    res.status(200).json(success({ message: 'Logged out successfully' })); // Always succeed
  }
};

/**
 * POST /api/auth/session
 * Get current user session info
 */
export const getSession = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(error('NO_TOKEN', 'Authorization token required', 401));
      return;
    }

    const token = authHeader.substring(7);
    
    // Verify the token with Supabase
    const { data, error: supabaseError } = await supabaseAnon.auth.getUser(token);

    if (supabaseError || !data.user) {
      res.status(401).json(error('INVALID_TOKEN', 'Invalid or expired token', 401));
      return;
    }

    res.status(200).json(
      success({
        user: {
          id: data.user.id,
          email: data.user.email,
          phone: data.user.phone,
        },
      })
    );
  } catch (err) {
    console.error('getSession error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Session validation failed', 500));
  }
};

/**
 * GET /api/auth/google-callback
 *
 * This page is loaded inside the React Native WebView after Supabase completes
 * the Google OAuth redirect. It reads the tokens from the URL fragment (#access_token=…)
 * and posts them back to the app via window.ReactNativeWebView.postMessage().
 *
 * This is more reliable than URL interception because the hash fragment is
 * accessible to JavaScript but not to the native navigation-state listener.
 */
export const googleCallback = async (_req: Request, res: Response): Promise<void> => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Signing you in…</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #FFF5EE 0%, #FFF8F4 100%);
        }
        .card {
          text-align: center;
          padding: 2.5rem 2rem;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(237,118,36,0.12);
          max-width: 340px;
          width: 90%;
        }
        .icon { font-size: 3rem; margin-bottom: 1rem; }
        h1 { font-size: 1.4rem; font-weight: 700; color: #5C250E; margin-bottom: 0.5rem; }
        p  { font-size: 0.9rem; color: #87553E; line-height: 1.5; }
        .spinner {
          margin: 1.5rem auto 0;
          width: 32px; height: 32px;
          border: 3px solid rgba(237,118,36,0.2);
          border-top-color: #ED7624;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .error-card { display: none; }
        .error-card.visible { display: block; }
        .error-icon { font-size: 3rem; margin-bottom: 1rem; }
        h2 { font-size: 1.3rem; font-weight: 700; color: #DC2626; margin-bottom: 0.5rem; }
      </style>
    </head>
    <body>
      <div class="card" id="loading-card">
        <div class="icon">🙏</div>
        <h1>Signing you in…</h1>
        <p>Just a moment.</p>
        <div class="spinner"></div>
      </div>
      <div class="card error-card" id="error-card">
        <div class="error-icon">⚠️</div>
        <h2>Sign-in failed</h2>
        <p id="error-msg">No tokens received. Please go back and try again.</p>
      </div>

      <script>
        (function () {
          try {
            // Tokens live in the URL hash fragment after Supabase OAuth redirect
            var fragment = window.location.hash.substring(1)
                        || window.location.search.substring(1);
            var params   = new URLSearchParams(fragment);

            var accessToken  = params.get('access_token');
            var refreshToken = params.get('refresh_token');
            var errorDesc    = params.get('error_description');

            if (accessToken) {
              var payload = JSON.stringify({
                type: 'GOOGLE_AUTH_SUCCESS',
                access_token:  accessToken,
                refresh_token: refreshToken || ''
              });

              // Post to React Native WebView
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(payload);
              } else {
                // Fallback: native injectedJavaScript picks this up
                window.postMessage(payload, '*');
              }
            } else if (errorDesc) {
              document.getElementById('loading-card').style.display = 'none';
              document.getElementById('error-card').classList.add('visible');
              document.getElementById('error-msg').textContent = errorDesc;

              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type:  'GOOGLE_AUTH_ERROR',
                  error: errorDesc
                }));
              }
            } else {
              // No tokens and no error — edge case, show loading briefly
              setTimeout(function () {
                document.getElementById('loading-card').style.display = 'none';
                document.getElementById('error-card').classList.add('visible');
              }, 3000);
            }
          } catch (e) {
            console.error('Google callback error:', e);
          }
        })();
      </script>
    </body>
    </html>
  `);
};

/**
 * POST /api/auth/google-profile
 * Register/upsert user profile when logged in via Google OAuth
 */
export const googleProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json(error('UNAUTHORIZED', 'Not authenticated', 401));
      return;
    }

    // Upsert user profile in the users table — update timestamps
    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: user.id,
        email: user.email,
        auth_provider: 'google',
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      },
      { onConflict: 'id', ignoreDuplicates: false }
    );
    if (upsertError) {
      console.error('[Auth] googleProfile upsert failed:', upsertError.message);
    } else {
      console.log(`[Auth] googleProfile: last_login_at updated for user ${user.id}`);
    }

    res.status(200).json(
      success({
        user: {
          id: user.id,
          email: user.email,
        },
      })
    );
  } catch (err) {
    console.error('googleProfile error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to register Google profile', 500));
  }
};
