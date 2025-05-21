import { API_URL, fetchWithAuth, handleResponse, ErrorResponse } from ':api';

export interface MoveItemParams {
	id: number;
	identity: 'canvas' | 'folder';
	parent_id?: number;
}

export const moveItem = async (params: MoveItemParams): Promise<void> => {
	console.log({ params });

	const url = `${API_URL}/change-parent`;

	const response = await fetchWithAuth(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		try {
			const error: ErrorResponse = await response.json();
			console.error('[DEBUG] API error:', error);
			throw new Error(error.message);
		} catch {
			console.error('[DEBUG] API error: Failed to parse response', response.status);
			throw new Error(`Ошибка ${response.status}: Не удалось переместить элемент`);
		}
	}
	console.log('[DEBUG] API success:', response.status);
};

// Интерфейсы
export interface CanvasData {
	id: number;
	name: string;
	update_time: string;
	canvas_url: string;
	created_at: string;
	directory_id?: number;
}

export interface CanvasDataFull extends CanvasData {
	data?: any;
}

export interface OcrResponse {
	text: string;
}

export interface TextToImageResponse {
	image: string;
}

export const getAllCanvases = async ({
	name = '',
	created_at = '',
}: { name?: string; created_at?: string } = {}): Promise<CanvasData[]> => {
	const params = new URLSearchParams();
	if (name) params.append('name', name.trim());
	if (created_at) params.append('created_at', created_at);

	const url = `${API_URL}/canvas?${params.toString()}`;
	console.log('Requesting URL:', url);

	const response = await fetchWithAuth(url, { method: 'GET' });
	const data = await handleResponse(response);
	console.log('API response:', data);
	return data;
};

export const getCanvasById = async (id: string): Promise<CanvasDataFull> => {
	const response = await fetchWithAuth(`${API_URL}/canvas/${id}`, { method: 'GET' });
	return handleResponse(response);
};

export const createCanvas = async (name: string, folderId?: number): Promise<CanvasData> => {
	const response = await fetchWithAuth(`${API_URL}/canvas`, {
		method: 'POST',
		body: JSON.stringify({
			name: name,
			folder_id: folderId || 0,
		}),
	});

	return handleResponse(response);
};

export const updateCanvas = async (id: string, data?: any, name?: string): Promise<CanvasData> => {
	try {
		if (!data && !name) {
			throw new Error('Data or name is missing');
		}

		console.log('Data for update:', {
			dataType: data ? (data instanceof Blob ? 'Blob' : typeof data) : 'none',
			name: name,
			...(data instanceof Blob ? { type: data.type, size: data.size } : {}),
		});

		let response;
		if (name && !data) {
			// Переименование: отправляем POST с { name }
			response = await fetchWithAuth(`${API_URL}/canvas/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: name }),
			});
		} else {
			// Обновление файла: отправляем FormData
			const formData = new FormData();
			formData.append('file', data);

			for (const [key, value] of formData.entries()) {
				console.log('FormData entry:', {
					key,
					value: value instanceof Blob ? { type: value.type, size: value.size } : value,
				});
			}

			console.log('Sending PUT request:', { url: `${API_URL}/canvas/${id}` });

			response = await fetchWithAuth(`${API_URL}/canvas/${id}`, {
				method: 'PUT',
				body: formData,
			});
		}

		return handleResponse(response);
	} catch (error: any) {
		console.error('Failed to update canvas:', error.message || error);
		throw new Error('Failed to update canvas');
	}
};

export const deleteCanvas = async (id: number): Promise<void> => {
	const response = await fetchWithAuth(`${API_URL}/canvas/${id}`, { method: 'DELETE' });

	if (!response.ok) {
		const errorData: ErrorResponse = await response.json().catch(() => ({
			code: response.status,
			message: response.statusText,
		}));
		console.error('API error:', errorData);
		throw errorData;
	}
};

export const getOcr = async (image: File, id: string): Promise<OcrResponse> => {
	const formData = new FormData();
	formData.append('file', image);
	formData.append('id', id);

	for (const [key, value] of formData.entries()) {
		console.log('FormData entry:', {
			key,
			value: value instanceof Blob ? { type: value.type, size: value.size } : value,
		});
	}

	const response = await fetchWithAuth(`${API_URL}/ml/image-to-text`, {
		method: 'POST',
		body: formData,
	});

	return handleResponse(response);
};

export const textToImage = async (text: string): Promise<TextToImageResponse> => {
	const response = await fetchWithAuth(`${API_URL}/ml/text-to-image`, {
		method: 'POST',
		body: JSON.stringify({ text }),
	});

	return handleResponse(response);
};
