// src/services/api.ts
import axios, { AxiosResponse } from "axios";

const API_URL = "http://localhost:8087/api/v1";

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
  const response: AxiosResponse<CanvasData[]> = await axios.get(
    `${API_URL}/canvases`
  );
  return response.data;
};

export const getCanvasById = async (id: string): Promise<CanvasData> => {
  const response: AxiosResponse<CanvasData> = await axios.get(
    `${API_URL}/canvases/${id}`
  );
  return response.data;
};

export const createCanvas = async (title: string): Promise<CanvasData> => {
  const response: AxiosResponse<CanvasData> = await axios.post(
    `${API_URL}/canvases`,
    { title }
  );
  return response.data;
};

export const updateCanvas = async (
  id: string,
  data: any
): Promise<CanvasData> => {
  const response: AxiosResponse<CanvasData> = await axios.put(
    `${API_URL}/canvases/${1}`,
    { data }
  );
  return response.data;
};

export const deleteCanvas = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/canvases/${id}`);
};

export const getOcr = async (data: Blob) => {
  const formData = new FormData();
  formData.append("image", data);
  for (const [key, value] of formData.entries()) {
    console.log("Key:", key, "Value:", value);
  }
  console.log({data})
  const response: AxiosResponse<OcrResponse> = await axios.post(
    `${API_URL}/add`,
      formData,
  );
  return response.data;
};
