// src/utils/auth.js
export function isAuthenticated(request) {
  const cookies = request.headers.get('cookie');
  const authToken = cookies?.split(';').find(cookie => cookie.trim().startsWith('directus_session_token='));

  if (!authToken) {
    return false;
  }

  // Optionally, validate the authToken value here (e.g., check if it's expired or invalid)
  return true;
}