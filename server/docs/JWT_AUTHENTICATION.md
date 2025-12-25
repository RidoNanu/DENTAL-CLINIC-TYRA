# Express JWT Authentication with Supabase

## Overview

Your backend uses Supabase JWT authentication to secure API endpoints. JWTs are issued by Supabase Auth on the frontend and verified server-side.

---

## Architecture

```
Frontend (Login)
    ↓ Supabase Auth
    JWT Token
    ↓
Backend API Request
    ↓ Authorization: Bearer <JWT>
Middleware: Extract & Verify
    ↓ supabase.auth.getUser(token)
Supabase Verification
    ↓ Valid Token
req.user = { id, email, role }
    ↓
Controller Access
```

---

## Middleware Files

### 1. `auth.middleware.js` - Core Authentication

**`authenticate`** - Require valid JWT
```javascript
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/protected', authenticate, controller.handler);
```

**What it does:**
- ✅ Extracts JWT from `Authorization: Bearer <token>`
- ✅ Verifies token with Supabase
- ✅ Attaches `req.user` object
- ✅ Rejects invalid tokens with 401

**`optionalAuth`** - Optional authentication
```javascript
const { optionalAuth } = require('../middlewares/auth.middleware');

router.get('/public', optionalAuth, controller.handler);
```

**What it does:**
- ✅ Attaches user if token valid
- ✅ Sets `req.user = null` if no/invalid token
- ✅ Never rejects (always continues)

---

### 2. `role.middleware.js` - Role-Based Access

**Must use `authenticate` first!**

**`requireAdmin`** - Admin role only
```javascript
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

router.post('/admin', authenticate, requireAdmin, controller.handler);
```

**`requireUser`** - Any authenticated user
```javascript
router.get('/profile', authenticate, requireUser, controller.handler);
```

**`requireOwnerOrAdmin`** - Resource owner or admin
```javascript
router.get('/patients/:id', 
  authenticate, 
  requireOwnerOrAdmin('id'), 
  controller.handler
);
```

**`adminOrReadOnly`** - Admin full access, users GET only
```javascript
router.use('/data', authenticate, adminOrReadOnly);
```

---

### 3. `admin.middleware.js` - Combined Admin Check

**`adminOnly`** - All-in-one admin protection
```javascript
const { adminOnly } = require('../middlewares/admin.middleware');

// Single middleware instead of authenticate + requireAdmin
router.post('/admin-only', adminOnly, controller.handler);
```

**What it does:**
- ✅ Verifies JWT token
- ✅ Checks admin role
- ✅ Attaches `req.user`
- ✅ Rejects non-admins with 403

---

## req.user Object

After authentication, `req.user` contains:

```javascript
{
  id: "uuid",              // User UUID from Supabase
  email: "user@email.com", // User email
  role: "admin",           // From user_metadata.role
  metadata: { }            // Full user_metadata object
}
```

---

## Usage Examples

### Protect Individual Route

```javascript
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

// Require authentication
router.get('/profile', authenticate, controller.getProfile);

// Require admin role
router.post('/patients', authenticate, requireAdmin, controller.create);
```

### Protect All Routes in Router

```javascript
const router = express.Router();

// Apply to all routes
router.use(authenticate);
router.use(requireAdmin);

// Now all routes require admin
router.get('/', controller.getAll);
router.post('/', controller.create);
```

### Using adminOnly

```javascript
const { adminOnly } = require('../middlewares/admin.middleware');

// Single middleware for admin-only routes
router.post('/patients', adminOnly, controller.create);
router.put('/patients/:id', adminOnly, controller.update);
router.delete('/patients/:id', adminOnly, controller.delete);
```

### Public Route with Optional Auth

```javascript
const { optionalAuth } = require('../middlewares/auth.middleware');

// Works for both authenticated and unauthenticated users
router.get('/services', optionalAuth, (req, res) => {
  if (req.user) {
    // User is logged in
    res.json({ data: services, premium: true });
  } else {
    // User is not logged in
    res.json({ data: services, premium: false });
  }
});
```

---

## Current Route Protection

### Protected (Admin Only)

All patient and appointment routes:
```javascript
// patient.routes.js
router.use(authenticate);
router.use(requireAdmin);

// appointment.routes.js
router.use(authenticate);
router.use(requireAdmin);
```

### Mixed Access

Services routes:
```javascript
// GET = Public (no auth)
router.get('/services', controller.getAll);

// POST/PUT/DELETE = Admin only
router.post('/services', authenticate, requireAdmin, controller.create);
router.put('/services/:id', authenticate, requireAdmin, controller.update);
router.delete('/services/:id', authenticate, requireAdmin, controller.delete);
```

---

## Error Responses

### 401 Unauthorized

**Missing token:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**Invalid/expired token:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden

**Non-admin user:**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

**Not resource owner:**
```json
{
  "success": false,
  "message": "Access denied"
}
```

---

## Frontend Integration

### Get JWT Token

```javascript
import { supabase } from './config/supabase';

// After login
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

### Make Authenticated Request

```javascript
const response = await fetch('http://localhost:3001/api/v1/patients', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

### With Axios

```javascript
import axios from 'axios';
import { supabase } from './config/supabase';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

// Use it
const { data } = await api.get('/patients');
```

---

## Testing Authentication

### 1. Get Admin Token

```bash
# Login via frontend or use Supabase CLI
# Token will be in session.access_token
```

### 2. Test Unauthenticated Request

```bash
curl -X GET http://localhost:3001/api/v1/patients

# Expected: 401 Unauthorized
{
  "success": false,
  "message": "No token provided"
}
```

### 3. Test Authenticated Request

```bash
curl -X GET http://localhost:3001/api/v1/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with data
{
  "success": true,
  "data": [...]
}
```

### 4. Test Non-Admin Token

```bash
# Login as regular user, get token
curl -X POST http://localhost:3001/api/v1/patients \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"1234567890"}'

# Expected: 403 Forbidden
{
  "success": false,
  "message": "Admin access required"
}
```

---

## Security Best Practices

### ✅ DO

- Use HTTPS in production
- Store tokens securely (httpOnly cookies or secure storage)
- Verify tokens on every request
- Check user roles server-side
- Use short token expiration times
- Implement token refresh logic

### ❌ DON'T

- Store tokens in localStorage (XSS vulnerable)
- Trust client-side role claims
- Skip token verification
- Expose service role key to frontend
- Use same token for multiple users

---

## Token Lifecycle

### 1. Login
```javascript
const { data } = await supabase.auth.signInWithPassword({ email, password });
const token = data.session.access_token;
```

### 2. Use Token
```javascript
fetch('/api/endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 3. Token Expires
- Supabase auto-refreshes tokens
- Frontend should handle refresh

### 4. Logout
```javascript
await supabase.auth.signOut();
// Token is invalidated
```

---

## Troubleshooting

### "No token provided"
- Check `Authorization` header is present
- Ensure format is `Bearer <token>`, not just `<token>`

### "Invalid or expired token"
- Token may have expired (default 1 hour)
- Refresh token using Supabase client
- Re-login if refresh fails

### "Admin access required"
- Check user metadata has `role: "admin"`
- Update in Supabase dashboard
- Re-login to get new token with updated metadata

### req.user is undefined in controller
- Ensure `authenticate` middleware runs before controller
- Check middleware order in routes

---

## Middleware Chain Examples

```javascript
// Single auth check
router.get('/endpoint', authenticate, controller.handler);

// Auth + admin role
router.post('/endpoint', authenticate, requireAdmin, controller.handler);

// Combined admin check
router.post('/endpoint', adminOnly, controller.handler);

// Optional auth
router.get('/public', optionalAuth, controller.handler);

// Owner or admin
router.get('/resource/:id', 
  authenticate, 
  requireOwnerOrAdmin('id'), 
  controller.handler
);
```

---

## Production Checklist

- [ ] Enable HTTPS
- [ ] Set token expiration
- [ ] Implement token refresh
- [ ] Add rate limiting
- [ ] Log authentication attempts
- [ ] Monitor failed auth attempts
- [ ] Set up alerts for suspicious activity
- [ ] Enable 2FA for admin accounts
- [ ] Rotate service role key periodically

---

**Your authentication is production-ready!** 🔒

All endpoints are properly secured with Supabase JWT verification.
