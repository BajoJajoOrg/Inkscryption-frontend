import { API_URL, handleResponse } from "./api";

export interface AuthResponse {
    access_token: string;
    refresh_token?: string; // Опционально
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  // Вход
  export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
  
    return handleResponse(response);
  };
  
  // Обновление токена
  export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  
    return handleResponse(response);
  };