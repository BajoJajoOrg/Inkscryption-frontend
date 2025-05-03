import dayjs from 'dayjs';

export interface CanvasData {
  id: number;
  canvas_name: string;
  created_at: string;
  update_time: string;
  directory_id?: number;
}

export interface DirectoryData {
  id: number;
  directory_name: string;
  created_at: string;
  update_time: string;
  parent_id?: number;
}

export interface DirectoryContent {
  canvases: CanvasData[];
  directories: DirectoryData[];
}

export interface ErrorResponse {
  message: string;
  details?: any;
}

// Моковые данные
let mockCanvases: CanvasData[] = [
  {
    id: 1,
    canvas_name: 'Заметки по проекту',
    created_at: '2025-04-01T10:00:00Z',
    update_time: '2025-04-02T12:00:00Z',
    directory_id: undefined,
  },
  {
    id: 2,
    canvas_name: 'Идеи для дизайна',
    created_at: '2025-03-15T09:00:00Z',
    update_time: '2025-03-16T11:00:00Z',
    directory_id: 1,
  },
];

let mockDirectories: DirectoryData[] = [
  {
    id: 1,
    directory_name: 'Рабочие проекты',
    created_at: '2025-03-01T08:00:00Z',
    update_time: '2025-03-01T08:00:00Z',
    parent_id: undefined,
  },
  {
    id: 2,
    directory_name: 'Личные заметки',
    created_at: '2025-02-01T07:00:00Z',
    update_time: '2025-02-01T07:00:00Z',
    parent_id: undefined,
  },
];

export const getDirectoryContent = async (params: {
  directoryId?: number;
  name?: string;
  created_at?: string;
}): Promise<DirectoryContent> => {
  const { directoryId, name, created_at } = params;

  let canvases = mockCanvases.filter((c) => c.directory_id === directoryId);
  let directories = mockDirectories.filter((d) => d.parent_id === directoryId);

  if (name) {
    const lowerName = name.toLowerCase();
    canvases = canvases.filter((c) => c.canvas_name.toLowerCase().includes(lowerName));
    directories = directories.filter((d) => d.directory_name.toLowerCase().includes(lowerName));
  }

  if (created_at) {
    const [start, end] = created_at.split(':').map((d) => dayjs(d, 'YYYYMMDD'));
    canvases = canvases.filter((c) =>
      dayjs(c.created_at).isBetween(start, end, 'day', '[]')
    );
    directories = directories.filter((d) =>
      dayjs(d.created_at).isBetween(start, end, 'day', '[]')
    );
  }

  return { canvases, directories };
};

export const createCanvas = async (title: string, directoryId?: number): Promise<CanvasData> => {
  const newCanvas: CanvasData = {
    id: Math.floor(Math.random() * 10000),
    canvas_name: title,
    created_at: new Date().toISOString(),
    update_time: new Date().toISOString(),
    directory_id: directoryId,
  };
  mockCanvases.push(newCanvas);
  return newCanvas;
};

export const createDirectory = async (title: string, parentId?: number): Promise<DirectoryData> => {
  const newDirectory: DirectoryData = {
    id: Math.floor(Math.random() * 10000),
    directory_name: title,
    created_at: new Date().toISOString(),
    update_time: new Date().toISOString(),
    parent_id: parentId,
  };
  mockDirectories.push(newDirectory);
  return newDirectory;
};