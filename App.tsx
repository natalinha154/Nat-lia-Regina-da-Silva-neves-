import React, { useState, useEffect } from 'react';
import { uploadFiles, checkStatus } from './services/api';
import { FileUpload } from './components/FileUpload';
import { VideoPlayer } from './components/VideoPlayer';
import { JobStatusResponse } from './types';

const App: React.FC = () => {
  // State Management
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatusResponse['status']>('queued');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image Preview for Processing State
  const [processingImagePreview, setProcessingImagePreview] = useState<string | null>(null);

  // Generate preview URL when image is selected
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setProcessingImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setProcessingImagePreview(null);
    }
  }, [imageFile]);

  // Polling Logic
  useEffect(() => {
    let intervalId: any;

    if (jobId && (status === 'queued' || status === 'processing')) {
      intervalId = setInterval(async () => {
        try {
          const jobStatus = await checkStatus(jobId);
          setStatus(jobStatus.status);
          setProgress(jobStatus.progress);
          
          if (jobStatus.status === 'completed' && jobStatus.result_url) {
            setResultUrl(jobStatus.result_url);
            clearInterval(intervalId);
          } else if (jobStatus.status === 'error') {
            setError(jobStatus.error || "Unknown processing error");
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Polling error", err);
          // Don't set global error immediately on poll fail to avoid flickering, 
          // but could add a retry counter here.
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, status]);

  const handleGenerate = async () => {
    if (!imageFile || !audioFile) return;

    setIsSubmitting(true);
    setError(null);
    setResultUrl(null);
    setProgress(0);

    try {
      const response = await uploadFiles(imageFile, audioFile);
      setJobId(response.job_id);
      setStatus('queued');
    } catch (err: any) {
      console.error(err);
      // Usa a mensagem de erro específica vinda do service/api.ts
      setError(err.message || "Failed to upload files.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setAudioFile(null);
    setJobId(null);
    setResultUrl(null);
    setError(null);
    setProgress(0);
    setStatus('queued');
  };

  // Dynamic Status Text based on progress
  const getStatusText = () => {
    if (status === 'queued') return "Iniciando worker...";
    if (progress < 30) return "Identificando pontos faciais...";
    if (progress < 70) return "Sincronizando lábios com áudio...";
    if (progress < 90) return "Renderizando vídeo final...";
    return "Finalizando...";
  };

  // Render Processing State (The "Pro" Scan UI)
  if (jobId && !resultUrl && !error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
           <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-[100px]" />
           <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-[100px]" />
        </div>

        <div className="z-10 flex flex-col items-center max-w-md w-full">
          {/* Avatar Scanning Container */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 border-slate-700/50 shadow-2xl overflow-hidden mb-8 group">
             {/* Static Image */}
             <img 
               src={processingImagePreview || ""} 
               alt="Processing Avatar" 
               className="w-full h-full object-cover grayscale brightness-50 contrast-125"
             />
             
             {/* Scanning Line Animation */}
             <div className="absolute inset-0 w-full h-1 bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
             
             {/* Radar/Pulse Overlay */}
             <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-ping" />
             
             {/* Tech Overlay Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />
          </div>

          {/* Progress Bar & Text */}
          <div className="w-full space-y-4 text-center">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse">
              {getStatusText()}
            </h2>
            
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-500 ease-out relative"
                style={{ width: `${Math.max(5, progress)}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
              </div>
            </div>
            
            <p className="text-slate-400 font-mono text-sm">
              Process ID: <span className="text-slate-500">{jobId.slice(0, 8)}...</span> | {progress}%
            </p>
          </div>
        </div>

        {/* CSS for custom scan animation */}
        <style>{`
          @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  // Render Main Form or Result
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12 text-center space-y-4">
          <div className="inline-block p-3 rounded-2xl bg-slate-800/50 border border-slate-700 mb-4 backdrop-blur-sm">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Sync<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Avatar</span> AI
          </h1>
          <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
            Transforme fotos estáticas em vídeos falantes usando inteligência artificial.
          </p>
        </header>

        {/* Main Card */}
        <main className="bg-surface/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 md:p-8 shadow-2xl">
          {!resultUrl ? (
            <div className="space-y-8">
              {/* Upload Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <FileUpload 
                  label="1. Foto do Avatar" 
                  accept="image/*"
                  file={imageFile}
                  onFileSelect={setImageFile}
                  icon={<span className="text-4xl">📸</span>}
                />
                
                <FileUpload 
                  label="2. Áudio da Fala" 
                  accept="audio/*"
                  file={audioFile}
                  onFileSelect={setAudioFile}
                  icon={<span className="text-4xl">🎙️</span>}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  {error}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={!imageFile || !audioFile || isSubmitting}
                  className={`
                    px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300
                    flex items-center gap-3
                    ${(!imageFile || !audioFile) 
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-105 hover:shadow-indigo-500/25 text-white'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>✨ Gerar Avatar Animado</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Success State
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Resultado Final</h3>
                <button 
                  onClick={handleReset}
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  ← Criar Novo
                </button>
              </div>
              
              <div className="bg-black/40 rounded-2xl p-4 border border-slate-700/50">
                <VideoPlayer src={resultUrl} />
              </div>

              <div className="flex justify-center pt-4">
                 <p className="text-slate-500 text-sm">
                   Vídeo gerado via FFmpeg (Simulação MVP)
                 </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
