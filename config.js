/**
 * Victory Password Portal - Configuration
 * Centralized settings for Supabase Authentication and App Redirection.
 */

export const CONFIG = {
  // Supabase Project Credentials
  SUPABASE_URL: "https://tuvnoqmydxrnlkmururi.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1dm5vcW15ZHhybmxrbXVydXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTgyOTMsImV4cCI6MjEwNjc5NDI5M30.2lwRpDge7DsGy18j5IknykaOXbaZCq_pcdwntd52B_g",

  // Target App URL to redirect after password is reset
  // Can be overridden via URL parameter: ?redirect_to=https://...
  DEFAULT_APP_URL: "https://ais-pre-sifftteimg6k4zvmuey3pm-190869008164.asia-east1.run.app",

  // App Metadata
  APP_NAME: "Victory",
  TAGLINE: "Next-Generation Sports & Performance Platform",
  VERSION: "1.0.0",

  // Redirect countdown delay in seconds
  REDIRECT_DELAY_SECONDS: 3,
};

/**
 * Returns the resolved redirect URL, checking URL parameters first.
 */
export function getRedirectUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const customRedirect = urlParams.get("redirect_to") || urlParams.get("return_to");
  if (customRedirect && (customRedirect.startsWith("http://") || customRedirect.startsWith("https://"))) {
    return customRedirect;
  }
  return CONFIG.DEFAULT_APP_URL;
}
