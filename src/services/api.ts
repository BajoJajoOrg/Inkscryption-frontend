const API_URL = import.meta.env.VITE_API_URL as string;

// Интерфейсы
export interface CanvasData {
	id: number;
	canvas_name: string;
	update_time: string;
	canvas_url: string;
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

export interface ErrorResponse {
	code: number;
	message: string;
	details?: any;
}

// Вспомогательная функция для обработки ответа
const handleResponse = async (response: Response) => {
	if (!response.ok) {
		const errorData: ErrorResponse = await response.json().catch(() => ({
			code: response.status,
			message: response.statusText,
		}));
		console.error('API error:', errorData);
		throw errorData;
	}
	return response.json();
};

// Методы API
export const getAllCanvases = async ({
	name = '',
	created_at = '',
}: { name?: string; created_at?: string } = {}): Promise<CanvasData[]> => {
	const params = new URLSearchParams();
	if (name) params.append('name', name.trim());
	if (created_at) params.append('created_at', created_at);

	const url = `${API_URL}/canvas?${params.toString()}`;
	console.log('Requesting URL:', url);

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	const data = await handleResponse(response);
	console.log('API response:', data);
	return data;
};

export const getCanvasById = async (id: string): Promise<CanvasDataFull> => {
	const response = await fetch(`${API_URL}/canvas/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	return handleResponse(response);
};

export const createCanvas = async (canvas_name: string): Promise<CanvasData> => {
	const response = await fetch(`${API_URL}/canvas`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ canvas_name }),
	});

	return handleResponse(response);
};

export const updateCanvas = async (id: string, data: any): Promise<CanvasData> => {
	try {
		// Проверяем, что data существует
		if (!data) {
			throw new Error('Data is missing');
		}

		// Логируем тип данных
		console.log('Data for update:', {
			dataType: data instanceof Blob ? 'Blob' : typeof data,
			...(data instanceof Blob ? { type: data.type, size: data.size } : {}),
		});

		const formData = new FormData();
		formData.append('file', data);

		// Логируем содержимое FormData
		for (const [key, value] of formData.entries()) {
			console.log('FormData entry:', {
				key,
				value: value instanceof Blob ? { type: value.type, size: value.size } : value,
			});
		}

		console.log('Sending PUT request:', { url: `${API_URL}/canvas/${id}` });

		const response = await fetch(`${API_URL}/canvas/${id}`, {
			method: 'PUT',
			body: formData,
		});

		return handleResponse(response);
	} catch (error: any) {
		console.error('Failed to update canvas:', error.message || error);
		throw new Error('Failed to update canvas');
	}
};

export const deleteCanvas = async (id: number): Promise<void> => {
	const response = await fetch(`${API_URL}/canvas/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	});

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

	// Логируем содержимое FormData
	for (const [key, value] of formData.entries()) {
		console.log('FormData entry:', {
			key,
			value: value instanceof Blob ? { type: value.type, size: value.size } : value,
		});
	}

	const response = await fetch(`${API_URL}/ml/image-to-text`, {
		method: 'POST',
		body: formData,
	});

	return handleResponse(response);
};

export const textToImage = async (text: string): Promise<TextToImageResponse> => {
	const response = await fetch(`${API_URL}/ml/text-to-image`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ text }),
	});

	return handleResponse(response);
};
