export const API_URL = import.meta.env.VITE_API_URL as string;

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
	const authStore = useAuthStore.getState();
	let token = authStore.accessToken;
	if (!token) {
		console.error('[DEBUG] No access token available');
		throw new Error('No access token available. Please log in.');
	}
	// Создаём объект заголовков с явной типизацией
	const headers: Record<string, string> = {
		...(typeof options.headers === 'object' &&
		!Array.isArray(options.headers) &&
		!(options.headers instanceof Headers)
			? options.headers
			: {}),
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	};

	// Для FormData не добавляем Content-Type
	if (!(options.body instanceof FormData)) {
		headers['Content-Type'] = 'application/json';
	}

	// Запрос
	const response = await fetch(url, {
		...options,
		headers,
	});

	// Обработка 401
	if (response.status === 401) {
		authStore.logout();
		throw new Error('Сессия истекла. Пожалуйста, войдите заново.');
	}

	return response;
};
