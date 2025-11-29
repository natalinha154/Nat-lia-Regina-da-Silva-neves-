export interface JobStatusResponse {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  result_url: string | null;
  error: string | null;
}

export interface UploadResponse {
  job_id: string;
  status: string;
}
