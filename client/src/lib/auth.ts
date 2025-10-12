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

export async function register(data: RegisterData): Promise<{ user: AuthUser }> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Send/receive cookies
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kayıt işlemi başarısız oldu');
  }

  const result = await response.json();
  // No need to set token - it's in httpOnly cookie
  return result;
}

export async function login(data: LoginData): Promise<{ user: AuthUser }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Send/receive cookies
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Giriş işlemi başarısız oldu');
  }

  const result = await response.json();
  // No need to set token - it's in httpOnly cookie
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
    const response = await fetch('/api/auth/me', {
      credentials: 'include', // Send httpOnly cookie
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeToken(); // Clean up any old localStorage token
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
