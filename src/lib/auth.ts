/**
 * Authentication utility functions
 */

/**
 * Clear all auth data and redirect to login
 */
export function logout(): void {
  // Clear localStorage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  
  // Clear cookie
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  // Redirect to login
  window.location.href = '/login';
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): { id: string; email: string; fullName: string; role: string } | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}
