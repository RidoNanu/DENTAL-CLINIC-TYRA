# Deployment Guide

## 🚨 Critical Security Configuration

### Disable Supabase Email Signup
To prevent unauthorized users from creating admin accounts, you **MUST disable email signups** in your Supabase project settings.

1. Go to your **Supabase Dashboard**.
2. Navigate to **Authentication** -> **Providers** -> **Email**.
3. Toggle **OFF** the "Allow Email Signups" option.
4. Ensure only your pre-created admin accounts exist in the **Users** table.

> **WARNING:** Leaving "Allow Email Signups" enabled will allow anyone to create an account given a valid email, which effectively grants them admin access in the current system design.

## Deployment Steps
1. Set up environment variables locally and in production.
2. Run database migrations.
3. Deploy server and client applications.
