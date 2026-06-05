/**
 * File: audio.service.ts
 *
 * Description: Ambient sound playback service for the meditation timer.
 * Loads audio from remote URLs, loops them automatically, and provides
 * play/stop/pause controls. Works with Google Drive direct-download links.
 *
 * Author: Navnit(Ninjacode911)
 */

import Sound from 'react-native-sound';

// Enable playback in silence mode (important for iOS)
Sound.setCategory('Playback');

export type SoundKey =
  | 'nature'
  | 'rain'
  | 'ocean'
  | 'birds'
  | 'bowl'
  | 'morning_clarity'
  | 'anxiety_relief'
  | 'deep_sleep'
  | 'mindful_focus';

/**
 * AMBIENT & GUIDED SOUND URLS
 */
export const AMBIENT_SOUND_URLS: Record<SoundKey, string> = {
  nature: 'https://docs.google.com/uc?export=download&id=11cqLAQeeoAX6x-9L_4hF8xsMZboOSHtp',
  rain: 'https://sachpwffbahripgsscsn.supabase.co/storage/v1/object/public/ambient-sounds/Rain-sound-app.mp3',
  ocean: 'https://sachpwffbahripgsscsn.supabase.co/storage/v1/object/public/ambient-sounds/ocean-sound-app.mp3',
  birds: 'https://sachpwffbahripgsscsn.supabase.co/storage/v1/object/public/ambient-sounds/Birds-sound-app.mp3',
  bowl: 'https://sachpwffbahripgsscsn.supabase.co/storage/v1/object/public/ambient-sounds/Bowl-sound-app.mp3',
  morning_clarity: 'https://sachpwffbahripgsscsn.supabase.co/storage/v1/object/public/ambient-sounds/Guided_Morning_Clarity.wav',
  anxiety_relief: 'https://sachpwffbahripgsscsn.supabase.co/storage/v1/object/public/ambient-sounds/Guided_Anxiety_Relief.wav',
  deep_sleep: 'https://sachpwffbahripgsscsn.supabase.co/storage/v1/object/public/ambient-sounds/Guided_Deep_Sleep.wav',
  mindful_focus: 'https://docs.google.com/uc?export=download&id=1hn69_Un5DwM7Cqxq7oxc75EdU70WAPKy',
};

export const CHIME_URL = 'https://sachpwffbahripgsscsn.supabase.co/storage/v1/object/public/ambient-sounds/Chime-sound-app.mp3';

class AudioService {
  private currentSound: Sound | null = null;
  private currentKey: SoundKey | null = null;
  private isLoading: boolean = false;
  private chimeSound: Sound | null = null;
  private isFading: boolean = false;

  /**
   * Play an ambient sound by key. Stops any currently playing sound first.
   * The sound will loop indefinitely until stop() is called.
   */
  async play(key: SoundKey, forceRestart: boolean = false): Promise<void> {
    // If the same sound is already loaded, ensure it is playing (resuming if paused)
    if (this.currentKey === key && this.currentSound) {
      if (forceRestart) {
        this.currentSound.setCurrentTime(0);
      }
      this.currentSound.play();
      return;
    }

    // Stop any currently playing sound
    await this.stop();

    const url = AMBIENT_SOUND_URLS[key];
    if (!url || url.includes('PLACEHOLDER')) {
      if (__DEV__) console.warn(`[AudioService] No URL configured for sound: ${key}`);
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    return new Promise<void>((resolve) => {
      const sound = new Sound(url, '', (error) => {
        this.isLoading = false;

        if (error) {
          console.error(`[AudioService] Failed to load sound "${key}":`, error);
          resolve();
          return;
        }

        const isGuided = ['morning_clarity', 'anxiety_relief', 'deep_sleep', 'mindful_focus'].includes(key);
        sound.setNumberOfLoops(isGuided ? 0 : -1); // Guided tracks play once, ambient loops indefinitely
        sound.setVolume(0.7);
        sound.play((success) => {
          if (!success) {
            if (__DEV__) console.warn(`[AudioService] Playback failed for: ${key}`);
          }
        });

        this.currentSound = sound;
        this.currentKey = key;
        resolve();
      });
    });
  }

  /**
   * Pause the currently playing sound
   */
  pause(): void {
    if (this.currentSound) {
      this.currentSound.pause();
    }
  }

  /**
   * Resume the currently paused sound
   */
  resume(): void {
    if (this.currentSound) {
      this.currentSound.play();
    }
  }

  /**
   * Stop and release the currently playing sound
   */
  async stop(): Promise<void> {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.release();
      this.currentSound = null;
      this.currentKey = null;
    }
  }

  /**
   * Plays a single chime over the ambient sound. Fades the ambient sound down,
   * plays the chime, and fades the ambient sound back up.
   */
  async playChime(): Promise<void> {
    if (this.isFading) return;
    this.isFading = true;

    // Fade down current ambient sound if it exists
    if (this.currentSound) {
      this.fadeVolume(this.currentSound, 0.7, 0.1, 1000);
    }

    return new Promise((resolve) => {
      // Load and play the chime
      const chime = new Sound(CHIME_URL, '', (error) => {
        if (error) {
          if (__DEV__) console.warn('[AudioService] Failed to load chime:', error);
          this.restoreAmbientVolume();
          resolve();
          return;
        }

        chime.setVolume(1.0);
        chime.play((_success) => {
          chime.release();
          this.restoreAmbientVolume();
          resolve();
        });
      });
    });
  }

  private restoreAmbientVolume() {
    if (this.currentSound) {
      this.fadeVolume(this.currentSound, 0.1, 0.7, 2000).then(() => {
        this.isFading = false;
      });
    } else {
      this.isFading = false;
    }
  }

  private fadeVolume(
    sound: Sound,
    from: number,
    to: number,
    durationMs: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const steps = 20;
      const stepDuration = durationMs / steps;
      const volumeStep = (to - from) / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const newVolume = from + volumeStep * currentStep;
        // Check if sound still exists, user might have stopped the session during fade
        if (sound) {
            sound.setVolume(newVolume);
        }

        if (currentStep >= steps) {
          clearInterval(interval);
          resolve();
        }
      }, stepDuration);
    });
  }

  /**
   * Returns the key of the currently active sound, or null if none playing
   */
  getCurrentKey(): SoundKey | null {
    return this.currentKey;
  }
}

export const audioService = new AudioService();
