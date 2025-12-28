const TOKEN_KEY = 'ainative_access_token';
const REFRESH_TOKEN_KEY = 'ainative_refresh_token';
const USER_KEY = 'ainative_user';

export interface User {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  role: 'USER' | 'ADMIN' | 'SUPERUSER';
}

export interface LoginCredentials {
  username: string;  // Can be email
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user?: User;
}

// Token management
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// User management
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio/v1';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/public/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  } catch (networkError) {
    console.error('Login network error:', networkError);
    throw new Error('Network error. Please check your connection.');
  }

  if (!response.ok) {
    let errorMessage = 'Login failed';
    try {
      const error = await response.json();
      errorMessage = error.detail || errorMessage;
    } catch {
      // Response wasn't JSON
    }
    throw new Error(errorMessage);
  }

  const data: AuthResponse = await response.json();

  // Store tokens
  setAuthToken(data.access_token);
  if (data.refresh_token) {
    setRefreshToken(data.refresh_token);
  }

  // Fetch and store user profile (don't block on failure)
  try {
    await fetchAndStoreUser();
  } catch (userError) {
    console.error('Failed to fetch user after login:', userError);
    // Continue anyway - user can be fetched later
  }

  return data;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/public/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (networkError) {
    console.error('Register network error:', networkError);
    throw new Error('Network error. Please check your connection.');
  }

  if (!response.ok) {
    let errorMessage = 'Registration failed';
    try {
      const error = await response.json();
      errorMessage = error.detail || errorMessage;
    } catch {
      // Response wasn't JSON
    }
    throw new Error(errorMessage);
  }

  const authData: AuthResponse = await response.json();

  setAuthToken(authData.access_token);
  if (authData.refresh_token) {
    setRefreshToken(authData.refresh_token);
  }

  // Fetch and store user profile (don't block on failure)
  try {
    await fetchAndStoreUser();
  } catch (userError) {
    console.error('Failed to fetch user after register:', userError);
  }

  return authData;
}

export async function logout(): Promise<void> {
  try {
    const token = getAuthToken();
    if (token) {
      await fetch(`${API_BASE_URL}/public/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuth();
  }
}

export async function refreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/public/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!response.ok) {
      clearAuth();
      return false;
    }

    const data: AuthResponse = await response.json();
    setAuthToken(data.access_token);
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token);
    }

    return true;
  } catch (error) {
    clearAuth();
    return false;
  }
}

async function fetchAndStoreUser(): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}/public/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const user: User = await response.json();
      setCurrentUser(user);
    } else {
      console.error('Failed to fetch user, status:', response.status);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Fetch user request timed out');
    } else {
      console.error('Failed to fetch user:', error);
    }
  }
}
