/**
 * Victory Password Portal - Application Logic
 * Supabase Auth, Password Strength Scoring, Security Checklist & Celebrations.
 */

import { createClient } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';
import { CONFIG, getRedirectUrl } from './config.js';

// Initialize Supabase Client
export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// DOM Elements
const elements = {
  // Panels
  panelReset: document.getElementById('panelReset'),
  panelSuccess: document.getElementById('panelSuccess'),

  // Session & Alerts
  sessionBadge: document.getElementById('sessionBadge'),
  sessionStatusText: document.getElementById('sessionStatusText'),
  alertBox: document.getElementById('alertBox'),
  alertMessage: document.getElementById('alertMessage'),

  // Reset Form
  formReset: document.getElementById('formResetPassword'),
  inputPassword: document.getElementById('inputPassword'),
  inputConfirmPassword: document.getElementById('inputConfirmPassword'),
  submitResetBtn: document.getElementById('submitResetBtn'),
  togglePassBtn: document.getElementById('togglePassBtn'),
  toggleConfirmPassBtn: document.getElementById('toggleConfirmPassBtn'),
  eyeIconOpen: document.getElementById('eyeIconOpen'),
  eyeIconClosed: document.getElementById('eyeIconClosed'),
  eyeIconConfirmOpen: document.getElementById('eyeIconConfirmOpen'),
  eyeIconConfirmClosed: document.getElementById('eyeIconConfirmClosed'),

  // Password Strength & Checklist
  strengthContainer: document.getElementById('strengthContainer'),
  strengthScoreLabel: document.getElementById('strengthScoreLabel'),
  matchIndicator: document.getElementById('matchIndicator'),
  reqLength: document.getElementById('reqLength'),
  reqUppercase: document.getElementById('reqUppercase'),
  reqNumber: document.getElementById('reqNumber'),
  reqMatch: document.getElementById('reqMatch'),

  // Countdown & Redirects
  countdownRing: document.getElementById('countdownRing'),
  countdownTimer: document.getElementById('countdownTimer'),
  countdownSeconds: document.getElementById('countdownSeconds'),
  manualRedirectBtn: document.getElementById('manualRedirectBtn'),
  footerAppLink: document.getElementById('footerAppLink'),

  // Dev Drawer
  devDrawerToggle: document.getElementById('devDrawerToggle'),
  devModal: document.getElementById('devModal'),
  devCloseBtn: document.getElementById('devCloseBtn'),
  devSimulateVerified: document.getElementById('devSimulateVerified'),
  devSimulateExpired: document.getElementById('devSimulateExpired'),
  devSimulateSuccess: document.getElementById('devSimulateSuccess'),
  devResetState: document.getElementById('devResetState'),
};

// Current State
const state = {
  activeSession: null,
  activeUserEmail: null,
  isRecoveryFlow: false,
  passwordValid: false,
  redirectTimer: null,
};

// ==========================================
// 1. Alert & UI Helpers
// ==========================================

function showAlert(message, type = 'error', html = false) {
  elements.alertBox.className = `banner-alert ${type}`;
  if (html) {
    elements.alertMessage.innerHTML = message;
  } else {
    elements.alertMessage.textContent = message;
  }
  elements.alertBox.style.display = 'flex';
}

function hideAlert() {
  elements.alertBox.style.display = 'none';
  elements.alertMessage.textContent = '';
}

function setBtnLoading(button, isLoading, loadingText = 'Processing...') {
  const textSpan = button.querySelector('.btn-text');
  if (isLoading) {
    button.classList.add('is-loading');
    button.disabled = true;
    if (textSpan) textSpan.dataset.originalText = textSpan.textContent;
    if (textSpan) textSpan.textContent = loadingText;
  } else {
    button.classList.remove('is-loading');
    button.disabled = false;
    if (textSpan && textSpan.dataset.originalText) {
      textSpan.textContent = textSpan.dataset.originalText;
    }
  }
}

function updateSessionBadge(text, isVerified = false) {
  elements.sessionStatusText.textContent = text;
  if (isVerified) {
    elements.sessionBadge.classList.add('verified');
  } else {
    elements.sessionBadge.classList.remove('verified');
  }
}

// ==========================================
// 2. Password Visibility Toggles
// ==========================================

function setupPasswordToggle(input, btn, iconOpen, iconClosed) {
  btn.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    iconOpen.style.display = isPassword ? 'none' : 'block';
    iconClosed.style.display = isPassword ? 'block' : 'none';
    input.focus();
  });
}

setupPasswordToggle(
  elements.inputPassword, 
  elements.togglePassBtn, 
  elements.eyeIconOpen, 
  elements.eyeIconClosed
);

setupPasswordToggle(
  elements.inputConfirmPassword, 
  elements.toggleConfirmPassBtn, 
  elements.eyeIconConfirmOpen, 
  elements.eyeIconConfirmClosed
);

// ==========================================
// 3. Password Security & Strength Engine
// ==========================================

function evaluatePassword() {
  const pass = elements.inputPassword.value;
  const confirm = elements.inputConfirmPassword.value;

  // Criteria
  const hasMinLength = pass.length >= 8;
  const hasUpperLower = /[a-z]/.test(pass) && /[A-Z]/.test(pass);
  const hasNumberOrSymbol = /[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass);
  const matches = pass.length > 0 && pass === confirm;

  // Update Checklist UI
  updateChecklistItem(elements.reqLength, hasMinLength);
  updateChecklistItem(elements.reqUppercase, hasUpperLower);
  updateChecklistItem(elements.reqNumber, hasNumberOrSymbol);
  updateChecklistItem(elements.reqMatch, matches);

  // Match Indicator next to Confirm label
  if (confirm.length > 0) {
    if (matches) {
      elements.matchIndicator.textContent = '✓ Matches';
      elements.matchIndicator.style.color = 'var(--primary)';
    } else {
      elements.matchIndicator.textContent = '✕ Does not match';
      elements.matchIndicator.style.color = 'var(--danger)';
    }
  } else {
    elements.matchIndicator.textContent = '';
  }

  // Calculate Strength Score (0 to 4)
  let score = 0;
  if (pass.length > 0) {
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (hasUpperLower) score++;
    if (hasNumberOrSymbol) score++;
  }

  // Cap score to 4
  score = Math.min(score, 4);

  // Update Strength Meter Bar
  elements.strengthContainer.className = 'strength-container';
  const scoreLabels = ['None', 'Weak', 'Fair', 'Good', 'Strong'];
  const scoreClasses = ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong'];

  if (pass.length > 0 && score > 0) {
    elements.strengthContainer.classList.add(scoreClasses[score]);
    elements.strengthScoreLabel.textContent = scoreLabels[score];
  } else if (pass.length > 0) {
    elements.strengthContainer.classList.add('strength-weak');
    elements.strengthScoreLabel.textContent = 'Weak';
  } else {
    elements.strengthScoreLabel.textContent = 'None';
  }

  // State
  state.passwordValid = hasMinLength && hasUpperLower && hasNumberOrSymbol && matches;
}

function updateChecklistItem(itemEl, isValid) {
  const icon = itemEl.querySelector('.req-icon');
  if (isValid) {
    itemEl.classList.add('valid');
    icon.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else {
    itemEl.classList.remove('valid');
    icon.innerHTML = '';
  }
}

elements.inputPassword.addEventListener('input', evaluatePassword);
elements.inputConfirmPassword.addEventListener('input', evaluatePassword);

// ==========================================
// 4. Supabase Auth Session Detection
// ==========================================

async function initSupabaseSession() {
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  const hashParams = new URLSearchParams(hash.replace(/^#/, ''));

  // 1. Check for PKCE Authorization Code (?code=...)
  const code = urlParams.get('code');
  if (code) {
    updateSessionBadge('Exchanging recovery link code...');
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        handleExpiredOrInvalidToken(error.message);
        return;
      }
      if (data.session) {
        handleVerifiedSession(data.session);
        return;
      }
    } catch (err) {
      handleExpiredOrInvalidToken(err.message || 'Error verifying recovery token.');
      return;
    }
  }

  // 2. Check for Hash Fragment Token (#access_token=...&type=recovery)
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (accessToken && refreshToken) {
    updateSessionBadge('Authenticating recovery session...');
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        handleExpiredOrInvalidToken(error.message);
        return;
      }
      if (data.session) {
        handleVerifiedSession(data.session);
        return;
      }
    } catch (err) {
      handleExpiredOrInvalidToken(err.message || 'Failed to authenticate recovery session.');
      return;
    }
  }

  // 3. Check for existing Supabase active session
  const { data: { session } } = await supabase.auth.getSession();
  if (session && session.user) {
    handleVerifiedSession(session);
    return;
  }

  // 4. Default: Ready to set password
  updateSessionBadge('Enter your new password below.');
}

function handleVerifiedSession(session) {
  state.activeSession = session;
  state.activeUserEmail = session.user?.email || null;
  state.isRecoveryFlow = true;

  const emailDisplay = state.activeUserEmail 
    ? `Verified: ${maskEmail(state.activeUserEmail)}`
    : 'Authenticated recovery session';

  updateSessionBadge(emailDisplay, true);
  elements.panelReset.style.display = 'block';
}

function handleExpiredOrInvalidToken(errorDetails = '') {
  updateSessionBadge('Recovery link invalid or expired');
  showAlert(
    'This password recovery link has expired or was already used. Please request a new reset email from your Victory app.',
    'error'
  );
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name}***@${domain}`;
  return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
}

// Listen to Supabase auth events
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
    if (session) {
      handleVerifiedSession(session);
    }
  }
});

// ==========================================
// 5. Form Handlers
// ==========================================

// Handle Set New Password Submission
elements.formReset.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const pass = elements.inputPassword.value;
  const confirm = elements.inputConfirmPassword.value;

  // Validation
  if (pass.length < 8) {
    showAlert('Password must contain at least 8 characters.');
    elements.inputPassword.focus();
    return;
  }

  if (pass !== confirm) {
    showAlert('Passwords do not match. Please verify both fields.');
    elements.inputConfirmPassword.focus();
    return;
  }

  if (!state.passwordValid) {
    showAlert('Please meet all security requirements in the checklist below.');
    return;
  }

  setBtnLoading(elements.submitResetBtn, true, 'Updating Password...');

  try {
    const { data, error } = await supabase.auth.updateUser({ password: pass });

    if (error) {
      setBtnLoading(elements.submitResetBtn, false);
      if (error.message.includes('Auth session missing') || error.message.includes('token is expired')) {
        handleExpiredOrInvalidToken(error.message);
      } else {
        showAlert(error.message || 'Unable to update password. Please try again.');
      }
      return;
    }

    // Success!
    setBtnLoading(elements.submitResetBtn, false);
    triggerSuccessCelebration();
  } catch (err) {
    setBtnLoading(elements.submitResetBtn, false);
    showAlert(err.message || 'Network error occurred while updating password.');
  }
});

// ==========================================
// 6. Success Celebration & Redirect Countdown
// ==========================================

function triggerSuccessCelebration() {
  // Confetti Burst
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#baf437', '#10b981', '#ffffff', '#cbff4d'],
    });
  } catch (_) {
    // fallback if canvas-confetti is not loaded
  }

  // Switch to success view
  elements.panelReset.style.display = 'none';
  elements.panelSuccess.style.display = 'block';

  let remaining = CONFIG.REDIRECT_DELAY_SECONDS;
  elements.countdownTimer.textContent = remaining;
  elements.countdownSeconds.textContent = `${remaining} seconds`;

  const targetUrl = getRedirectUrl();
  elements.manualRedirectBtn.href = targetUrl;

  const total = CONFIG.REDIRECT_DELAY_SECONDS;
  clearInterval(state.redirectTimer);

  state.redirectTimer = setInterval(() => {
    remaining--;
    const progress = remaining / total;
    elements.countdownRing.style.setProperty('--progress', progress);
    elements.countdownTimer.textContent = remaining;
    elements.countdownSeconds.textContent = `${remaining} second${remaining === 1 ? '' : 's'}`;

    if (remaining <= 0) {
      clearInterval(state.redirectTimer);
      window.location.href = targetUrl;
    }
  }, 1000);
}

// ==========================================
// 7. Footer Link Setup
// ==========================================

const redirectTarget = getRedirectUrl();
elements.footerAppLink.href = redirectTarget;
elements.manualRedirectBtn.href = redirectTarget;

// ==========================================
// 8. Developer & Preview Simulation
// ==========================================

elements.devDrawerToggle.addEventListener('click', () => {
  elements.devModal.classList.toggle('open');
});

elements.devCloseBtn.addEventListener('click', () => {
  elements.devModal.classList.remove('open');
});

elements.devSimulateVerified.addEventListener('click', () => {
  handleVerifiedSession({ user: { email: 'alex.winner@victory.com' } });
  showAlert('Simulated: Active user session loaded (alex.winner@victory.com).', 'info');
  elements.devModal.classList.remove('open');
});

elements.devSimulateExpired.addEventListener('click', () => {
  handleExpiredOrInvalidToken('Simulation: token expired');
  elements.devModal.classList.remove('open');
});

elements.devSimulateSuccess.addEventListener('click', () => {
  triggerSuccessCelebration();
  elements.devModal.classList.remove('open');
});

elements.devResetState.addEventListener('click', () => {
  state.activeSession = null;
  state.activeUserEmail = null;
  clearInterval(state.redirectTimer);
  updateSessionBadge('Enter your new password below.');
  hideAlert();
  elements.panelReset.style.display = 'block';
  elements.panelSuccess.style.display = 'none';
  elements.devModal.classList.remove('open');
});

// Initialize on page load
initSupabaseSession();
