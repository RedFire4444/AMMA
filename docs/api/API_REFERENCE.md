# MAA Meditation App — API Reference

> **Base URL**: `https://api.mamapp.com/api` (production) | `http://localhost:3000/api` (development)
> **Authentication**: Bearer token in Authorization header (JWT from Supabase Auth)
> **Response Format**: `{ success: boolean, data: object|null, error: object|null, meta: object|null }`

---

## Authentication

### POST /auth/request-otp
Send OTP to phone number.

**Auth Required**: No

**Request Body**:
```json
{ "phone": "+919876543210" }
```

**Success Response** (200):
```json
{ "success": true, "data": {}, "error": null, "meta": null }
```

**Rate Limit**: 3 requests per phone per 10 minutes

---

### POST /auth/verify-otp
Verify OTP and get JWT tokens.

**Auth Required**: No

**Request Body**:
```json
{ "phone": "+919876543210", "otp": "123456" }
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "session": { "access_token": "...", "refresh_token": "..." },
    "user": { "id": "uuid", "phone": "+919876543210" }
  }
}
```

---

### POST /auth/email-login
Login with email and password.

**Auth Required**: No

**Request Body**:
```json
{ "email": "user@example.com", "password": "securepassword" }
```

---

### POST /auth/email-signup
Register with email and password.

**Auth Required**: No

**Request Body**:
```json
{ "email": "user@example.com", "password": "securepassword" }
```

---

## Users

### GET /users/me
Get current user's profile with stats.

**Auth Required**: Yes

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "full_name": "Priya Sharma",
    "email": "priya@example.com",
    "phone": "+919876543210",
    "avatar_url": null,
    "level": "beginner",
    "onboarding_complete": true,
    "interests": ["meditation", "yoga"],
    "meditation_goal_minutes": 10,
    "subscription_status": "free",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

### PATCH /users/me
Update user profile fields.

**Auth Required**: Yes

**Request Body** (any combination):
```json
{
  "full_name": "Priya Sharma",
  "avatar_url": "https://...",
  "interests": ["meditation", "yoga", "pranayama"],
  "meditation_goal_minutes": 15,
  "onboarding_complete": true,
  "notification_enabled": true
}
```

---

### DELETE /users/me
Delete user account and all associated data.

**Auth Required**: Yes

---

## Home

### GET /home/feed
Get aggregated home screen data.

**Auth Required**: Yes

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "greeting": "Priya",
    "daily_quote": {
      "quote_text": "Peace comes from within.",
      "author": "Buddha",
      "category": "wisdom"
    },
    "trending_courses": [
      {
        "id": "uuid",
        "title": "Foundations of Meditation",
        "instructor_name": "Swami Prakash",
        "thumbnail_url": null,
        "difficulty_level": "beginner",
        "estimated_duration_minutes": 120,
        "is_premium": false
      }
    ],
    "upcoming_events": [
      {
        "id": "uuid",
        "title": "Full Moon Meditation",
        "event_date": "2026-04-10T18:00:00Z",
        "instructor_name": "Swami Prakash",
        "is_live": false,
        "category": "meditation"
      }
    ],
    "stats": {
      "totalMinutes": 450,
      "currentStreak": 7
    }
  }
}
```

---

## Courses

### GET /courses
List courses with filters and pagination.

**Auth Required**: Yes

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| category | string | - | Filter by category |
| difficulty_level | string | - | beginner/intermediate/advanced |
| is_premium | boolean | - | Filter free/premium |
| sort | string | sort_order | sort_order/enrollment_count/created_at |
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| search | string | - | Search title/description |

---

### GET /courses/:id
Get course detail with lessons.

**Auth Required**: Yes

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "uuid",
      "title": "Foundations of Meditation",
      "description": "...",
      "instructor_name": "Swami Prakash",
      "difficulty_level": "beginner",
      "total_lessons": 8,
      "estimated_duration_minutes": 120,
      "is_premium": false,
      "enrollment_count": 250
    },
    "lessons": [
      {
        "id": "uuid",
        "title": "What is Meditation?",
        "duration_minutes": 15,
        "lesson_number": 1,
        "lesson_type": "guided_meditation",
        "is_preview": true
      }
    ],
    "enrollment": {
      "id": "uuid",
      "progress_percentage": 25,
      "lessons_completed": 2
    }
  }
}
```

---

### POST /courses/:id/enroll
Enroll in a course.

**Auth Required**: Yes

---

### PATCH /courses/enrollments/:id/progress
Update enrollment progress.

**Auth Required**: Yes

**Request Body**:
```json
{
  "lessons_completed": 3,
  "last_lesson_id": "uuid",
  "progress_percentage": 37
}
```

---

### GET /courses/:id/reviews
Get reviews for a course.

**Auth Required**: Yes

---

### POST /courses/:id/reviews
Submit a course review.

**Auth Required**: Yes

**Request Body**:
```json
{ "rating": 5, "review_text": "Excellent course!" }
```

---

## Meditation Sessions

### POST /sessions
Log a completed meditation session.

**Auth Required**: Yes

**Request Body**:
```json
{
  "duration_minutes": 15,
  "session_type": "guided",
  "mood_before": 5,
  "mood_after": 8,
  "notes": "Felt very calm"
}
```

---

## Habits

### GET /habits/all
Get all habit types with streaks and 30-day heatmap data.

**Auth Required**: Yes

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "streaks": {
      "meditation_current_streak": 7,
      "meditation_longest_streak": 21,
      "exercise_current_streak": 3,
      "exercise_longest_streak": 14
    },
    "logs": {
      "meditation": [
        { "logged_at": "2026-04-05", "completed": true },
        { "logged_at": "2026-04-04", "completed": true }
      ],
      "exercise": [...]
    }
  }
}
```

---

### POST /habits/log
Log a habit for today.

**Auth Required**: Yes

**Request Body**:
```json
{
  "habit_type": "meditation",
  "completed": true,
  "duration_minutes": 15,
  "mood_rating": 8
}
```

---

### GET /habits/streak
Get streak for a specific habit type.

**Auth Required**: Yes

**Query**: `?habit_type=meditation`

---

### POST /habits/checkin
Manual daily check-in with mood.

**Auth Required**: Yes

**Request Body**:
```json
{ "mood_rating": 7, "notes": "Good day" }
```

---

### GET /habits/vision-board
Get user's vision board images.

**Auth Required**: Yes

---

### POST /habits/vision-board
Upload vision board image.

**Auth Required**: Yes

**Request Body**:
```json
{ "image_url": "https://...", "caption": "My goal" }
```

---

### DELETE /habits/vision-board/:id
Remove vision board image.

**Auth Required**: Yes

---

### GET /habits/day-journey
Get today's day journey schedule.

**Auth Required**: Yes

---

### POST /habits/performance/rate
Submit daily productivity rating.

**Auth Required**: Yes

**Request Body**:
```json
{ "productivity_rating": 4 }
```

---

### GET /habits/performance/weekly
Get weekly performance data (last 7 days).

**Auth Required**: Yes

---

## Content Directory

### GET /directory
Browse content with search and filters.

**Auth Required**: Yes

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| q | string | Full-text search query |
| category | string | bhajan/meditation/satsang/talk/chanting |
| page | number | Page number |
| limit | number | Items per page |

---

### POST /directory/:id/bookmark
Bookmark content item.

**Auth Required**: Yes

---

### DELETE /directory/:id/bookmark
Remove bookmark.

**Auth Required**: Yes

---

### GET /directory/bookmarks
Get user's bookmarked content.

**Auth Required**: Yes

---

### POST /directory/:id/view
Track content view (increments view_count).

**Auth Required**: Yes

---

## Events

### GET /events
List upcoming events sorted by date.

**Auth Required**: Yes

---

### POST /events/:id/register
Register for an event (idempotent).

**Auth Required**: Yes

---

### GET /events/:id/stream
Get live stream URL (registered users only).

**Auth Required**: Yes

**Error** (403): `"Must be registered to access stream"`

---

## Payments

### POST /payments/create-order
Create a payment order for subscription.

**Auth Required**: Yes

**Request Body**:
```json
{ "plan_type": "monthly" }
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "amount": 19900,
    "currency": "INR",
    "plan_type": "monthly"
  }
}
```

---

### POST /payments/verify
Verify payment and activate subscription.

**Auth Required**: Yes

**Request Body**:
```json
{
  "gateway_order_id": "order_xxx",
  "gateway_payment_id": "pay_xxx",
  "gateway_signature": "sig_xxx"
}
```

---

### GET /payments/history
Get user's payment history.

**Auth Required**: Yes

---

## Subscriptions

### GET /subscriptions/status
Check current subscription status.

**Auth Required**: Yes

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "subscription": {
      "plan_type": "monthly",
      "status": "active",
      "expires_at": "2026-05-05T00:00:00Z"
    },
    "isPremium": true
  }
}
```

---

### POST /subscriptions/cancel
Cancel subscription (keeps access until period end).

**Auth Required**: Yes

**Request Body** (optional):
```json
{ "reason": "Too expensive" }
```

---

## Notifications

### GET /notifications
Get user's notifications.

**Auth Required**: Yes

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unread_count": 3
  }
}
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Request body validation failed |
| PREMIUM_REQUIRED | 403 | Active subscription required |
| SUBSCRIPTION_EXPIRED | 403 | Subscription has expired |
| INVALID_SIGNATURE | 400 | Payment signature verification failed |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_SERVER_ERROR | 500 | Server error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| /auth/request-otp | 3 per phone per 10 minutes |
| All other endpoints | 100 per IP per minute |

---

*Total: 38 endpoints across 8 resource groups*
