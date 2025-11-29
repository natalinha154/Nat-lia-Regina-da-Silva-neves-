import { UploadResponse, JobStatusResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const uploadFiles = async (imageFile: File, audioFile: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('audio', audioFile);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Tentar ler a mensagem de erro do backend
      let errorMessage = 'Upload failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // Se não for JSON, usa status text
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    // Detectar erro de conexão (fetch falha totalmente)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Não foi possível conectar ao servidor backend (http://localhost:8000). Verifique se ele está rodando.');
    }
    throw error;
  }
};

export const checkStatus = async (jobId: string): Promise<JobStatusResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch status');
    }

    return response.json();
  } catch (error) {
    console.error("Status check failed", error);
    throw error;
  }
};
