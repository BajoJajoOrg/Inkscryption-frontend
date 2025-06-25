import { handleResponse } from ':api';
import { useAuthStore } from ':store';

export interface AuthResponse {
    id: string;
    access_token: string;
    email: string;
    password: string;
    refresh_token?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`https://auth.hooli-pishem.ru/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    return handleResponse(response);
};

export const register = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`https://auth.hooli-pishem.ru/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    return handleResponse(response);
};

// Глобальная переменная для хранения текущего рефреш-запроса
let refreshPromise: Promise<string> | null = null;

export const refreshToken = async (refreshToken: string) => {
    try {
        const response = await fetch('https://auth.hooli-pishem.ru/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Refresh error:', errorData);
            if (response.status === 400 || response.status === 401) {
                useAuthStore.getState().logout();
            }
            throw new Error('Failed to refresh token');
        }

        const { access_token, refreshToken: refresh_token } = await response.json();
        useAuthStore.getState().setAuth(access_token, refresh_token);
        return access_token;
    } catch (error) {
        useAuthStore.getState().logout();
        throw error;
    }
};

// Функция для синхронизированного рефреша
export const synchronizedRefresh = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
        console.error('No refresh token available');
        useAuthStore.getState().logout();
        throw new Error('No refresh token available');
    }

    // Если рефреш уже выполняется, ждем его завершения
    if (refreshPromise) {
        return refreshPromise;
    }

    // Создаем новый рефреш-запрос
    refreshPromise = refreshToken(refresh).finally(() => {
        refreshPromise = null; // Сбрасываем после завершения
    });

    return refreshPromise;
};

