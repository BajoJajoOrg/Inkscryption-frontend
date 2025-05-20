import { API_URL, ErrorResponse, handleResponse, fetchWithAuth, CanvasData } from ':api';

export interface DirectoryData {
	id: number;
	name: string;
	parent_folder_id: number | null;
	updated_at: string;
	created_at: string;
}

export interface BreadcrumbItem {
	id: number;
	name: string;
}

export interface DirectoryContent {
	folder: DirectoryData;
	breadcrumbs: BreadcrumbItem[];
	folders: DirectoryData[];
	canvases: CanvasData[];
}

// Получение содержимого директории
export const getDirectoryContent = async (params: {
	directoryId?: number;
	name?: string;
	created_at?: string;
}): Promise<DirectoryContent> => {
	const query = new URLSearchParams();
	if (params.name) query.append('name', params.name);
	if (params.created_at) query.append('created_at', params.created_at);

	const url = params.directoryId
		? `${API_URL}/folder/${params.directoryId}?${query.toString()}`
		: `${API_URL}/folder/0?${query.toString()}`;

	const response = await fetchWithAuth(url, {
		method: 'GET',
	});

	return handleResponse(response);
};

// Создание директории
export const createDirectory = async (name: string, parentId?: number): Promise<DirectoryData> => {
	const response = await fetchWithAuth(`${API_URL}/folder`, {
		method: 'POST',
		body: JSON.stringify({
			name,
			parent: parentId || null,
		}),
	});

	return handleResponse(response);
};

// Удаление директории
export const deleteDirectory = async (directoryId: number): Promise<void> => {
	console.log({directoryId})
	const response = await fetchWithAuth(`${API_URL}/folder/${directoryId}`, {
		method: 'DELETE',
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

export const updateDirectory = async (id: number, name: string): Promise<DirectoryData> => {
	try {
	  if (!name.trim()) {
		throw new Error('Name is missing');
	  }
  
	  console.log('[DEBUG] Updating directory:', { id, name });
  
	  const response = await fetchWithAuth(`${API_URL}/folder/${id}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name }),
	  });
  
	  return handleResponse(response);
	} catch (error: any) {
	  console.error('[DEBUG] Failed to update directory:', error.message || error);
	  throw new Error('Failed to update directory');
	}
  };