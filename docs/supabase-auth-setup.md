# Supabase Auth Setup Checklist

This document guides you through manual authentication configurations required in the Supabase Dashboard for development and production environments.

---

## 1. Authentication Provider Setup

1. Navigate to the **Supabase Dashboard** → **Authentication** → **Providers**.
2. Select **Email**:
   - Ensure the provider is **Enabled**.
   - Enable **Confirm Email** (highly recommended for production; can be toggled off for local testing if desired).
   - Ensure **Secure Passwords** is toggled on (minimum password configurations are managed here).

---

## 2. URL Configurations

Configure redirects and redirect wildcards under **Authentication** → **URL Configuration**:

### 2.1 Site URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-production-domain.com`

### 2.2 Redirect URLs
Add the following URL paths exactly:

```text
http://localhost:3000/auth/confirm
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
http://localhost:3000/**
```

*Note: The wildcard `http://localhost:3000/**` is suitable for local testing but should be removed or strictly scoped in production.*

---

## 3. Email Templates Customization

Customize email templates under **Authentication** → **Email Templates**:

### 3.1 Confirm Signup
Change the HTML body to trigger the correct hashing verification route:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your account:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/dashboard">
    Confirm email address
  </a>
</p>
```

### 3.2 Reset Password (Recovery)
Change the HTML body to direct password recovery tokens:

```html
<h2>Reset Password</h2>

<p>Follow this link to reset your account password:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">
    Reset password
  </a>
</p>
```

---

## 4. Rate Limits & Security

1. **Email Sending Limits**:
   - Navigate to **Authentication** → **Email Templates** → **Settings**.
   - Set limits on email sends per hour. The default Supabase development SMTP server is subject to low limits (approx 3-5 emails per hour).
   - **Recommendation**: Integrate a custom SMTP provider (e.g. Resend, SendGrid) before production deployment to avoid `429` rate limit errors during email confirmation tests.

2. **CAPTCHA Hardening**:
   - Enable CAPTCHA (Hcaptcha or Cloudflare Turnstile) in **Authentication** → **Settings** before launch to prevent registration spam.
