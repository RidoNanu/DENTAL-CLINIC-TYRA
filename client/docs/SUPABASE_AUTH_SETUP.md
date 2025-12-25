# Supabase Authentication Setup Guide

## 🎯 What Was Changed

### ✅ Removed
- ❌ Hardcoded credentials (`admin@tyradentistree.com` / `admin123`)
- ❌ Mock authentication with setTimeout
- ❌ localStorage-based session
- ❌ Alert-based error handling

### ✅ Added
- ✅ Real Supabase authentication
- ✅ Secure session management (handled by Supabase)
- ✅ Admin role verification
- ✅ Proper error handling with UI feedback
- ✅ Loading states
- ✅ Auto-redirect if already logged in

---

## 🔧 Setup Instructions

### 1. Add Environment Variables

Update `client/.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

⚠️ **IMPORTANT:** Use the **anon key**, NOT the service role key!

---

### 2. Create Admin User in Supabase

You need to create an admin user with the proper role.

#### Option A: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   - Email: `admin@tyradentistree.com`
   - Password: (choose a secure password)
   - **User Metadata** (click "Add field"):
     ```json
     {
       "role": "admin"
     }
     ```
4. Click **Create user**

#### Option B: Via SQL

Run this in Supabase SQL Editor:

```sql
-- Insert user into auth.users (you'll need to use Supabase dashboard for this)
-- OR use the Admin API from your backend

-- Then update user metadata
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@tyradentistree.com';
```

---

### 3. Restart Frontend Dev Server

```bash
cd client
npm run dev
```

---

## 🔐 How It Works

### Authentication Flow

```
1. User enters email/password
   ↓
2. supabase.auth.signInWithPassword()
   ↓
3. Supabase validates credentials
   ↓
4. Check user_metadata.role === 'admin'
   ↓
5. If admin → Redirect to dashboard
   If not admin → Sign out + Show error
```

### Session Management

- ✅ Supabase stores session in localStorage
- ✅ Auto-refresh tokens
- ✅ Persistent sessions across page reloads
- ✅ Auto-redirect if already logged in

### Security

- ✅ Uses **anon key** (safe for frontend)
- ✅ RLS policies enforce database security
- ✅ Backend APIs verify JWT tokens
- ✅ Role checked on every login
- ✅ Non-admin users are signed out immediately

---

## 🧪 Testing

### Valid Admin Login
1. Go to `http://localhost:5173/admin/login`
2. Enter admin credentials
3. Should redirect to `/admin/dashboard`

### Invalid Credentials
- Shows: "Invalid email or password"

### Non-Admin User
- Shows: "Access denied. Admin privileges required."

### Already Logged In
- Auto-redirects to dashboard (no login form shown)

---

## 📝 Code Changes Summary

### Files Created
- ✅ `client/.env` - Environment variables
- ✅ `client/src/config/supabase.js` - Supabase client

### Files Modified
- ✅ `client/src/pages/admin/Login.jsx` - Real authentication

### Key Features
```javascript
// Check existing session on mount
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) navigate('/admin/dashboard');
  };
  checkSession();
}, []);

// Sign in with Supabase
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Verify admin role
const userRole = data.user?.user_metadata?.role;
if (userRole !== 'admin') {
  await supabase.auth.signOut();
  throw new Error('Access denied');
}
```

---

## 🔄 Next Steps

### 1. Protect Dashboard Routes

Update your admin dashboard to check authentication:

```javascript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const userRole = session.user?.user_metadata?.role;
      if (userRole !== 'admin') {
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return <div>Dashboard Content</div>;
};
```

### 2. Add Logout Functionality

```javascript
const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate('/admin/login');
};
```

### 3. Get Access Token for Backend API Calls

```javascript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Use token in API calls
fetch('http://localhost:3001/api/v1/patients', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

---

## ⚠️ Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in `client/` directory
- Restart dev server after adding env vars

### "Invalid login credentials"
- Verify user exists in Supabase dashboard
- Check email/password are correct
- Ensure email is confirmed (or disable email confirmation in Supabase settings)

### "Access denied. Admin privileges required."
- Check user metadata has `"role": "admin"`
- Update via Supabase dashboard or SQL

### Session not persisting
- Check browser localStorage (Supabase stores session there)
- Clear cookies/localStorage and try again

---

## 🎉 Production Checklist

Before deploying:

- [ ] Set strong admin password
- [ ] Add `.env` to `.gitignore`
- [ ] Use environment variables in production
- [ ] Enable email confirmation in Supabase (optional)
- [ ] Set up password reset flow (optional)
- [ ] Add rate limiting to prevent brute force
- [ ] Enable 2FA for admin accounts (Supabase Pro feature)

---

**Ready to test!** 🚀

Just add your Supabase credentials to `.env` and create an admin user.
