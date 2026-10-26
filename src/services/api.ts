// client/src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:4005";

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      },
    );
  }

  // Generic GET request
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  // Generic POST request
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  // Generic PUT request
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  // Generic PATCH request
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.patch(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }

  // Profile specific methods
  async updateProfileName(name: string): Promise<ApiResponse> {
    return this.patch("/users/profile/name", { name });
  }

  async updateProfileEmail(email: string): Promise<ApiResponse> {
    return this.patch("/users/profile/email", { email });
  }

  async updateProfilePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse> {
    return this.patch("/users/profile/password", {
      currentPassword,
      newPassword,
    });
  }

  async updateProfilePlan(
    plan: string,
    paymentIntentId: string,
  ): Promise<ApiResponse> {
    return this.post("/users/profile/plan", { plan, paymentIntentId });
  }

  async logoutAllDevices(): Promise<ApiResponse> {
    return this.post("/auth/logout-all");
  }

  async sendVerificationEmail(email: string): Promise<ApiResponse> {
    return this.post("/auth/resend-verification", { email });
  }

  async checkVerificationStatus(email: string): Promise<ApiResponse> {
    return this.get(`/auth/status/${email}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.get("/health");
  }
}

export const apiService = new ApiService();
export default apiService;
