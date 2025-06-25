import { API_URL, handleResponse } from ":api";
import { useAuthStore } from ":store";

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

export const refreshToken = async (refreshToken: string) => {
    try {
        const response = await fetch('https://auth.hooli-pishem.ru/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        if (!response.ok) throw new Error('Failed to refresh token');
        const { accessToken, refreshToken: newRefreshToken } = await response.json();
        console.log('New tokens:', { accessToken, newRefreshToken });
        useAuthStore.getState().setAuth(accessToken, newRefreshToken);
        return accessToken;
    } catch (error) {
        console.error('Refresh token failed:', error);
        useAuthStore.getState().logout();
        throw error;
    }
};