import { getApiUrl } from './apiConfig';

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
  const response = await fetch(getApiUrl('/api/auth/register'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kayıt işlemi başarısız oldu');
  }

  const result = await response.json();
  setToken(result.token);
  return result;
}

export async function login(data: LoginData): Promise<{ user: AuthUser; token: string }> {
  const response = await fetch(getApiUrl('/api/auth/login'), {
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
  setToken(result.token);
  return result;
}

export async function logout(): Promise<void> {
  try {
    await fetch(getApiUrl('/api/auth/logout'), {
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
  const token = getToken();
  
  console.log('🔍 getCurrentUser called:', {
    hasLocalStorageToken: !!token,
    timestamp: new Date().toISOString()
  });

  try {
    // Send request with credentials to include cookies (OAuth uses httpOnly cookie)
    const response = await fetch(getApiUrl('/api/auth/me'), {
      headers: token ? {
        'Authorization': `Bearer ${token}`,
      } : {},
      credentials: 'include', // Always include cookies
    });

    console.log('📡 /api/auth/me response:', {
      status: response.status,
      ok: response.ok
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('❌ Unauthorized (401) - clearing localStorage token');
        removeToken();
      }
      return null;
    }

    const user = await response.json();
    console.log('✅ User fetched successfully:', {
      userId: user.id,
      email: user.email
    });
    
    return user;
  } catch (error) {
    console.error('❌ Get current user error:', error);
    removeToken();
    return null;
  }
}
