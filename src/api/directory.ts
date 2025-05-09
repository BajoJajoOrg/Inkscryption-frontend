import { API_URL, CanvasData, ErrorResponse } from ':api';

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
	try {
		const query = new URLSearchParams();
		if (params.name) query.append('name', params.name);
		if (params.created_at) query.append('created_at', params.created_at);

		const url = params.directoryId
			? `${API_URL}/folder/${params.directoryId}?${query.toString()}`
			: `${API_URL}/folder/0?${query.toString()}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				// 'Authorization': `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Failed to fetch directory content');
		}

		return await response.json();
	} catch (error) {
		throw {
			message: error instanceof Error ? error.message : 'Unknown error',
			details: error,
		} as ErrorResponse;
	}
};

// Создание директории
export const createDirectory = async (name: string, parentId?: number): Promise<DirectoryData> => {
	try {
		const response = await fetch('/api/folder', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				// 'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify({
				name,
				parent: parentId || null,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Failed to create directory');
		}

		return await response.json();
	} catch (error) {
		throw {
			message: error instanceof Error ? error.message : 'Unknown error',
			details: error,
		} as ErrorResponse;
	}
};

// Удаление директории
export const deleteDirectory = async (directoryId: number): Promise<void> => {
	try {
		const response = await fetch(`/api/folder/${directoryId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				// Добавьте заголовок авторизации, если требуется
				// 'Authorization': `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Failed to delete directory');
		}
	} catch (error) {
		throw {
			message: error instanceof Error ? error.message : 'Unknown error',
			details: error,
		} as ErrorResponse;
	}
};
