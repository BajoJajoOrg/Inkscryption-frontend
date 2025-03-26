import axios from 'axios';

const API_URL = 'https://api.hooli-pishem.ru/api/v1';

export interface CanvasData {
	id: number;
	canvas_name: string;
	update_time: string;
	canvas_url: string;
	data?: any;
}

export interface OcrResponse {
	text: string;
}

export const getAllCanvases = async ({
	name = '',
	created_at = '',
}: { name?: string; created_at?: string } = {}): Promise<CanvasData[]> => {
	const params: { name?: string; created_at?: string } = {};
	if (name) params.name = name;
	if (created_at) params.created_at = created_at;

	try {
		const response = await axios.get(`${API_URL}/get`, {
			params,
		});

		console.log('Response data:', response.data);

		if (response.data && Array.isArray(response.data.canvases)) {
			return response.data.canvases;
		}

		console.warn('Ответ не содержит canvases или неверный формат:', response.data);
		return [];
	} catch (error) {
		console.error('Ошибка при получении canvases:', error);
		return [];
	}
};

export const getCanvasById = async (id: string): Promise<CanvasData[]> => {
	const response = await fetch(`${API_URL}/get?id=${id}`);
	if (!response.ok) throw new Error(`Failed to fetch canvas ${id}`);
	return response.json();
};

// export const createCanvas = async (title: string): Promise<CanvasData> => {
// 	const response = await fetch(`${API_URL}/add`, {
// 		method: 'POST',
// 		headers: { 'Content-Type': 'application/json' },
// 		body: JSON.stringify({ title }),
// 	});
// 	if (!response.ok) throw new Error('Failed to create canvas');
// 	return response.json();
// };

export const createCanvas = async (name: string): Promise<CanvasData> => {
	const response = await axios.post(`${API_URL}/add?name=${name}`);
	return response.data;
};

export const updateCanvas = async (id: string, data: any): Promise<CanvasData> => {
	const formData = new FormData();
	formData.append('image', data);

	// const response = await axios.post(`${API_URL}/update?id=${id}`);
	// return response.data;
	const response = await fetch(`${API_URL}/update?id=${id}`, {
		method: 'POST',
		body: formData,
	});

	console.log({ response });
	if (!response.ok) throw new Error('Failed to process OCR');
	return response.json();
};

export const deleteCanvas = async (id: string): Promise<void> => {
	const response = await fetch(`${API_URL}/canvases/${id}`, {
		method: 'DELETE',
	});
	if (!response.ok) throw new Error('Failed to delete canvas');
};

export const getOcr = async (data: Blob): Promise<OcrResponse> => {
	const formData = new FormData();
	formData.append('image', data);
	const response = await fetch(`${API_URL}/add`, {
		method: 'POST',
		body: formData,
	});
	if (!response.ok) throw new Error('Failed to process OCR');
	return response.json();
};
