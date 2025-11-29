import React from 'react';

interface VideoPlayerProps {
  src: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 bg-black shadow-2xl mt-6">
      <video 
        src={src} 
        controls 
        autoPlay 
        loop
        className="w-full h-auto max-h-[500px]"
      />
      <div className="p-4 bg-surface border-t border-slate-700 flex justify-between items-center">
        <span className="text-sm text-slate-400">Preview</span>
        <a 
          href={src} 
          download="avatar.mp4"
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
        >
          Download MP4
        </a>
      </div>
    </div>
  );
};
