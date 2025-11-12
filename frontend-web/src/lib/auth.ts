const TOKEN_KEY = 'auth_token';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  bio?: string;
  verificationStatus?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function register(data: RegisterData): Promise<{ user: AuthUser; token: string }> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Ensure cookies are sent
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kayıt işlemi başarısız oldu');
  }

  const result = await response.json();
  if (result.token) {
    setToken(result.token);
  }
  return result;
}

export async function login(data: LoginData): Promise<{ user: AuthUser; token: string }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Giriş işlemi başarısız oldu');
  }

  const result = await response.json();
  if (result.token) {
    setToken(result.token);
  }
  return result;
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeToken();
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Always try with both token and cookies
    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers,
      credentials: 'include', // Always include cookies
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Only remove token if we're sure it's invalid
        console.log('Auth check failed with 401, clearing token');
        removeToken();
      }
      return null;
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    // Don't remove token on network errors, only on auth failures
    return null;
  }
}
