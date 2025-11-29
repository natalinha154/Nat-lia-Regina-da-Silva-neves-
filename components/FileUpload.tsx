import React, { useRef, useState, useEffect } from 'react';

interface FileUploadProps {
  label: string;
  accept: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  icon?: React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, accept, file, onFileSelect, icon }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Gerar preview da imagem/arquivo
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Limpar memória quando o componente desmontar ou arquivo mudar
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      // Validação básica do tipo MIME baseada no accept
      if (accept === "image/*" && !droppedFile.type.startsWith("image/")) return;
      if (accept === "audio/*" && !droppedFile.type.startsWith("audio/")) return;
      
      onFileSelect(droppedFile);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const isImage = file?.type.startsWith('image/');

  return (
    <div className="flex flex-col gap-3 group">
      <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider pl-1">
        {label}
      </label>
      
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative w-full h-64 rounded-2xl border-2 transition-all duration-300 ease-out cursor-pointer overflow-hidden
          flex flex-col items-center justify-center
          ${dragActive 
            ? 'border-primary bg-primary/20 scale-[1.02] shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
            : 'border-slate-600/50 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
          }
          ${file ? 'border-transparent' : 'border-dashed'}
        `}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept={accept} 
          className="hidden" 
          onChange={handleChange}
        />

        {/* Estado com Arquivo Selecionado */}
        {file && preview ? (
          <>
            {isImage ? (
              // Preview de Imagem
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <p className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                    Trocar Imagem
                  </p>
                </div>
              </div>
            ) : (
              // Preview de Áudio
              <div className="flex flex-col items-center justify-center gap-4 text-center p-6 w-full h-full bg-gradient-to-br from-indigo-900/50 to-slate-900/50">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl animate-pulse">
                  🎵
                </div>
                <div className="max-w-full">
                  <p className="text-lg font-medium text-white truncate px-4">
                    {file.name}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <audio src={preview} controls className="w-3/4 mt-2 h-8" />
              </div>
            )}
            
            {/* Botão de remover flutuante (opcional, aqui apenas indicativo de troca via clique) */}
          </>
        ) : (
          // Estado Vazio
          <div className="flex flex-col items-center justify-center text-center p-6 transition-transform duration-300 group-hover:-translate-y-1">
            <div className={`
              w-20 h-20 rounded-full mb-4 flex items-center justify-center text-4xl
              transition-colors duration-300
              ${dragActive ? 'bg-primary text-white' : 'bg-slate-700/50 text-slate-400 group-hover:bg-slate-700 group-hover:text-primary'}
            `}>
              {icon}
            </div>
            <p className="text-lg font-medium text-slate-200">
              {dragActive ? "Solte o arquivo aqui" : "Clique ou arraste"}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {accept === "image/*" ? "JPG ou PNG" : "MP3 ou WAV"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};