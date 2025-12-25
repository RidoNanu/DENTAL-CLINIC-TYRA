# Quick Start: Testing Admin Authentication

## ✅ Prerequisites

Make sure both servers are running:
```bash
# Terminal 1 - Backend
cd server
npm run dev
# Should be running on http://localhost:3001

# Terminal 2 - Frontend  
cd client
npm run dev
# Should be running on http://localhost:5174
```

---

## 🧪 Step-by-Step Testing

### 1. Create Admin User in Supabase

1. Go to https://supabase.com/dashboard
2. Open your project: **yrprzengbridjadumbem**
3. Navigate to **Authentication** → **Users**
4. Click **Add user** → **Create new user**
5. Fill in:
   - Email: `ridonanus5b5@gmail.com` (or any email)
   - Password: `Killuminati5@` (or choose your own)
   - Auto Confirm User: **YES** ✓
6. Click **Create user**

**Note:** No need to add custom metadata. Any authenticated Supabase user = admin.

---

### 2. Test Login

1. Open browser: `http://localhost:5174/admin/login`
2. Enter credentials:
   - Email: `ridonanus5b5@gmail.com`
   - Password: `Killuminati5@`
3. Click **Sign In**

**Expected Result:**
- ✅ Redirects to `/admin/dashboard`
- ✅ No errors in console (except browser extension noise)
- ✅ Dashboard loads successfully

---

### 3. Verify Session in Browser Console

Open browser DevTools → Console:

```javascript
// Check if session exists
supabase.auth.getSession().then(s => console.log(s))

// Expected output:
{
  data: {
    session: {
      access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      user: {
        id: "...",
        email: "ridonanus5b5@gmail.com"
      }
    }
  }
}
```

---

### 4. Test Backend API (Manual)

#### Without Token (Should Fail)
```bash
curl http://localhost:3001/api/v1/patients
```

**Expected Response:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

#### With Token (Should Work)

**Get your JWT token:**
```javascript
// In browser console after login:
supabase.auth.getSession().then(s => {
  console.log('Token:', s.data.session.access_token)
})
```

**Test API:**
```bash
# Replace YOUR_TOKEN with actual JWT
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/v1/patients
```

**Expected Response:**
```json
{
  "success": true,
  "data": []
}
```

---

### 5. Test Frontend API Client

The frontend should automatically attach JWT to all requests.

**Test by using the admin dashboard:**
1. Navigate to **Patients** page
2. Try creating a patient
3. Check Network tab in DevTools
4. Verify `Authorization` header is present

---

### 6. Test Swagger UI

1. Open `http://localhost:3001/api/docs`
2. Try a protected endpoint (e.g., GET /patients)
   - Should get **401 Unauthorized**
3. Click **Authorize** button (top right)
4. Enter your JWT token (from step 4)
5. Click **Authorize**
6. Try GET /patients again
   - Should work! ✅

---

### 7. Test Logout

1. Click logout button in dashboard
2. Should redirect to `/admin/login`
3. Try accessing `/admin/dashboard` directly
4. Should redirect back to login

---

### 8. Test Session Persistence

1. Login to dashboard
2. Refresh the page (F5)
3. Should stay on dashboard (no redirect to login)
4. Close browser and reopen
5. Go to `http://localhost:5174/admin/dashboard`
6. Should still be logged in

---

## 🐛 Troubleshooting

### Problem: Login redirects back to login page

**Possible causes:**
- Email not confirmed in Supabase
- Browser extension blocking redirects
- Session not being created

**Solutions:**
```javascript
// Check console for errors
console.log('Login error:', error)

// Verify Supabase connection
supabase.auth.getSession().then(console.log)

// Check if email is confirmed in Supabase dashboard
```

### Problem: API returns 401

**Possible causes:**
- No JWT token in request
- JWT token expired
- Invalid token

**Solutions:**
```javascript
// Check if token exists
supabase.auth.getSession().then(s => {
  if (!s.data.session) {
    console.log('No session - need to login')
  } else {
    console.log('Token exists:', s.data.session.access_token)
  }
})
```

### Problem: Swagger not accepting token

**Make sure:**
- Using JWT token (not anon key)
- Token format: Just the token, no "Bearer " prefix
- Token is from a logged-in user
- Token hasn't expired (default 1 hour)

---

## ✅ Success Indicators

You know everything is working when:

- [x] Login redirects to dashboard
- [x] Dashboard shows without errors
- [x] API calls include Authorization header
- [x] Backend accepts requests with valid JWT
- [x] Backend rejects requests without JWT
- [x] Logout clears session and redirects
- [x] Refresh keeps you logged in
- [x] Swagger works with JWT token

---

## 🎉 All Working?

Great! Your authentication system is fully functional and production-ready!

**Next steps:**
1. Create more admin users as needed
2. Start building admin features
3. Add more protected routes
4. Implement additional dashboard pages

**Remember:**
- JWT tokens expire after 1 hour (configurable in Supabase)
- Supabase auto-refreshes tokens
- Always use HTTPS in production
- Keep service role key secret!
