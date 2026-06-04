// CasFlou auth utilities - manages session token and user state
// Note: No exports - this is loaded as a regular script, not a module

const AUTH_TOKEN_KEY = 'casflou_session';
const USER_KEY = 'casflou_user';

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

function setSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function isAuthenticated() {
  return !!getToken();
}
