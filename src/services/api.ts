const API_URL = 'http://localhost:8087/api/v1';

export interface CanvasData {
	id: string;
	title: string;
	createdAt: string;
	data?: any;
}

export interface OcrResponse {
	text: string;
}

export const getAllCanvases = async (): Promise<CanvasData[]> => {
	const response = await fetch(`${API_URL}/canvases`);
	if (!response.ok) throw new Error('Failed to fetch canvases');
	return response.json();
};

export const getCanvasById = async (id: string): Promise<CanvasData> => {
	const response = await fetch(`${API_URL}/canvases/${id}`);
	if (!response.ok) throw new Error(`Failed to fetch canvas ${id}`);
	return response.json();
};

export const createCanvas = async (title: string): Promise<CanvasData> => {
	const response = await fetch(`${API_URL}/canvases`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ title }),
	});
	if (!response.ok) throw new Error('Failed to create canvas');
	return response.json();
};

export const updateCanvas = async (id: string, data: any): Promise<CanvasData> => {
	const response = await fetch(`${API_URL}/canvases/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ data }),
	});
	if (!response.ok) throw new Error('Failed to update canvas');
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
