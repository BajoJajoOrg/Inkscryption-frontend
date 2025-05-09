import { useAuthStore } from ':store';
import { refreshToken } from './auth';

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
	const authStore = useAuthStore.getState();
	let token = authStore.accessToken;

	const response = await fetch(url, {
		...options,
		headers: {
			...options.headers,
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	});

	if (response.status === 401 && authStore.refreshToken) {
		try {
			const { access_token, refresh_token } = await refreshToken(authStore.refreshToken);
			authStore.setAuth(access_token, refresh_token);

			return fetch(url, {
				...options,
				headers: {
					...options.headers,
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`,
				},
			});
		} catch (error) {
			authStore.clearAuth();
			throw new Error('Сессия истекла. Пожалуйста, войдите заново.');
		}
	}

	return response;
};
