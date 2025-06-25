export const API_URL = import.meta.env.VITE_API_URL as string;
import { synchronizedRefresh } from './auth';
import { useAuthStore } from ':store/authStore';

export interface ErrorResponse {
    code: number;
    message: string;
    status?: string;
    error?: string;
    details?: any;
}

// Вспомогательная функция для обработки ответа
export const handleResponse = async (response: Response) => {
    if (!response.ok) {
        let errorData: ErrorResponse;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { code: response.status, message: response.statusText };
        }
        console.error('[DEBUG] API error:', errorData);
        throw errorData;
    }
    try {
        const data = await response.json();
        return data;
    } catch (e) {
        console.error('[DEBUG] Failed to parse response as JSON:', e);
        throw new Error('Invalid server response');
    }
};

// Обёртка для запросов с авторизацией
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = localStorage.getItem('access_token');
    if (!token) {
        console.error('[DEBUG] No access token available');
        throw new Error('No access token available. Please log in.');
    }

    const headers: Record<string, string> = {
        ...(typeof options.headers === 'object' &&
        !Array.isArray(options.headers) &&
        !(options.headers instanceof Headers)
            ? options.headers
            : {}),
        Authorization: `Bearer ${token}`,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        try {
            token = await synchronizedRefresh();
            headers.Authorization = `Bearer ${token}`;
            return fetch(url, { ...options, headers }); // Повторяем запрос
        } catch (error) {
            console.error('Refresh failed:', error);
            useAuthStore.getState().logout();
            throw new Error('Сессия истекла. Пожалуйста, войдите заново.');
        }
    }

    return response;
};
