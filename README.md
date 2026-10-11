# ⚡ Victory Pass — Secure Password Recovery & Authentication Portal

A production-ready, ultra-modern password recovery and authentication landing application designed for the **Victory** platform. Built with Vanilla CSS, ES Modules, Vite, and **Supabase Auth**.

---

## 🌟 Key Features

- **Supabase Auth Integration**:
  - **PKCE Flow Support**: Automatically detects and exchanges authorization `?code=...` query parameters for an authenticated session.
  - **Implicit & Hash Fragment Support**: Parses `#access_token=...&refresh_token=...&type=recovery` tokens.
  - **Real-Time Auth Listener**: Subscribes to `onAuthStateChange` (`PASSWORD_RECOVERY`, `SIGNED_IN`, `USER_UPDATED`).
- **Interactive Password Security Engine**:
  - Live strength scoring (None, Weak, Fair, Good, Strong) with an animated multi-segment meter.
  - Real-time checklist validation:
    - Minimum 8 characters
    - Uppercase and lowercase letters
    - Numbers or special characters
    - Passwords match confirmation
- **Focused Password Reset Flow**:
  - Direct, distraction-free interface for users arriving from a recovery link or active session.
  - Automatic PKCE token exchange and seamless password updates via `supabase.auth.updateUser`.
- **Celebratory Success State**:
  - Confetti burst animation upon successful password update.
  - Automated 3-second redirect countdown ring to the Victory application.
  - Immediate "Launch Victory App Now" manual action button.
- **Electric Lime & Dark Carbon Design**:
  - Tailored to Victory's sports/performance aesthetic.
  - Ambient glowing gradients, glassmorphism card, and tactile micro-animations.
  - Fully mobile-responsive across all devices.
- **Developer Simulation Mode**:
  - Built-in collapsible drawer at the bottom right allowing instant simulation of active sessions, expired links, and success screens without waiting for email delivery.

---

## 🚀 Quick Start

### 1. Run Development Server
```bash
npm install
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 2. Build for Production
```bash
npm run build
```
Optimized static files will be generated in the `dist/` directory, ready to deploy to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.).

---

## ⚙️ Configuration & Supabase Setup

### Configuration File (`config.js`)
Edit [config.js](file:///c:/Users/shubh/OneDrive/Desktop/Victory%20pass/config.js) to adjust:
- `SUPABASE_URL`: Your Supabase project URL.
- `SUPABASE_ANON_KEY`: Your Supabase public anonymous API key.
- `DEFAULT_APP_URL`: The destination URL where users will be redirected after setting their password.
- `REDIRECT_DELAY_SECONDS`: Countdown duration before automatic redirect.

### Configuring Supabase Dashboard
To ensure users receive emails that redirect directly to this portal:
1. Go to your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Navigate to **Authentication** > **URL Configuration**.
3. Set **Site URL** or add to **Redirect URLs**:
   - For local development: `http://localhost:5173/`
   - For production: `https://your-domain.com/` (or your hosted domain)
4. Under **Email Templates** > **Reset Password**, ensure the action URL is set to `{{ .ConfirmationURL }}`.
