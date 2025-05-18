import { API_URL, handleResponse } from ":api";

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