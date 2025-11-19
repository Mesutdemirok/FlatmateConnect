import { authUtils } from './auth';
import { ApiError, AuthResponse, FeedItem, Listing, LoginCredentials, User } from '@/types';

const API_BASE = '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const token = authUtils.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        authUtils.logout();
        window.location.href = '/auth/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'An error occurred',
        }));
        const error: ApiError = {
          message: errorData.message || 'An error occurred',
          status: response.status,
        };
        throw error;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      const apiError: ApiError = {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
      throw apiError;
    }
  }

  async getFeed(): Promise<FeedItem[]> {
    const response = await this.request<{ feed: FeedItem[] }>('/feed');
    return response.feed || [];
  }

  async getListingBySlug(slug: string): Promise<Listing> {
    return await this.request<Listing>(`/listings/slug/${slug}`);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return await this.request<User>('/auth/me');
  }

  async contactOwner(listingId: string, message: string): Promise<void> {
    await this.request(`/contact/${listingId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getSeekers(): Promise<any[]> {
    const response = await this.request<{ seekers: any[] }>('/seekers');
    return response.seekers || [];
  }

  async createListing(data: any): Promise<Listing> {
    return await this.request<Listing>('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
