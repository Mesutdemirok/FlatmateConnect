import axios, { type AxiosInstance } from "axios";

export interface ApiConfig {
  baseURL?: string;
  token?: string;
}

export class OdanetAPI {
  private client: AxiosInstance;

  constructor(config: ApiConfig = {}) {
    const baseURL = config.baseURL || process.env.API_BASE_URL || "https://www.odanet.com.tr/api";
    
    this.client = axios.create({
      baseURL,
      headers: config.token ? {
        Authorization: `Bearer ${config.token}`
      } : {}
    });
  }

  setToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Auth endpoints
  auth = {
    login: (email: string, password: string) =>
      this.client.post("/auth/login", { email, password }),
    
    register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
      this.client.post("/auth/register", data),
    
    logout: () =>
      this.client.post("/auth/logout"),
    
    me: () =>
      this.client.get("/auth/me"),
  };

  // Listings endpoints
  listings = {
    getAll: (filters?: Record<string, any>) =>
      this.client.get("/listings", { params: filters }),
    
    getById: (id: string) =>
      this.client.get(`/listings/${id}`),
    
    getBySlug: (slug: string) =>
      this.client.get(`/oda-ilani/${slug}`),
    
    create: (data: any) =>
      this.client.post("/listings", data),
    
    update: (id: string, data: any) =>
      this.client.patch(`/listings/${id}`, data),
    
    delete: (id: string) =>
      this.client.delete(`/listings/${id}`),
  };

  // Seekers endpoints
  seekers = {
    getAll: (filters?: Record<string, any>) =>
      this.client.get("/seekers/public", { params: filters }),
    
    getById: (id: string) =>
      this.client.get(`/seekers/${id}`),
    
    getBySlug: (slug: string) =>
      this.client.get(`/oda-arayan/${slug}`),
    
    create: (data: any) =>
      this.client.post("/seekers", data),
    
    update: (id: string, data: any) =>
      this.client.patch(`/seekers/${id}`, data),
    
    delete: (id: string) =>
      this.client.delete(`/seekers/${id}`),
  };

  // Messages/Conversations endpoints
  messages = {
    getConversations: () =>
      this.client.get("/messages/conversations"),
    
    getMessages: (conversationId: string) =>
      this.client.get(`/messages/${conversationId}`),
    
    send: (data: { receiverId: string; message: string; listingId?: string }) =>
      this.client.post("/messages", data),
    
    markAsRead: (conversationId: string) =>
      this.client.patch(`/messages/${conversationId}/read`),
  };

  // User profile endpoints
  users = {
    getProfile: () =>
      this.client.get("/users/me"),
    
    updateProfile: (data: any) =>
      this.client.patch("/users/me", data),
    
    uploadProfileImage: (formData: FormData) =>
      this.client.post("/users/me/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      }),
  };
}

// Export a default instance
export const api = new OdanetAPI();

// Export for direct use
export const login = (email: string, password: string) =>
  api.auth.login(email, password);

export const register = (data: { email: string; password: string; firstName: string; lastName: string }) =>
  api.auth.register(data);

export const getListings = (filters?: Record<string, any>) =>
  api.listings.getAll(filters);

export const getSeekers = (filters?: Record<string, any>) =>
  api.seekers.getAll(filters);

export const getConversations = () =>
  api.messages.getConversations();

export default api;
