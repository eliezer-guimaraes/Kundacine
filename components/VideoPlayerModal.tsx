'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useRef, useState, useEffect } from 'react';
import { useApp, ContentItem } from '@/context/AppContext';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, AlertCircle, Info, Disc } from 'lucide-react';

export default function VideoPlayerModal() {
  const { activePlayingEpisode, setPlayingEpisode, recordWatchHistory } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (activePlayingEpisode) {
      setIsPlaying(false);
      setHasError(false);
      setCurrentTime(0);
      
      // Auto register watch action at 10% progress initially or trigger on load
      if (activePlayingEpisode.content) {
        recordWatchHistory(
          activePlayingEpisode.content,
          5, // 5% initially
          activePlayingEpisode.videoUrl,
          activePlayingEpisode.seasonNumber,
          activePlayingEpisode.episodeNumber,
          activePlayingEpisode.episodeTitle
        );
      }
    }
  }, [activePlayingEpisode]);

  if (!activePlayingEpisode) return null;

  const { videoUrl, content, seasonNumber, episodeNumber, episodeTitle } = activePlayingEpisode;

  // Toggle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setHasError(true);
      });
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle progress updates
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 100;
    setCurrentTime(current);
    
    // Periodically update watch history progress in context!
    const progressPercent = Math.min(100, Math.floor((current / dur) * 100));
    if (progressPercent > 5 && progressPercent % 5 === 0) {
      recordWatchHistory(
        content,
        progressPercent,
        videoUrl,
        seasonNumber,
        episodeNumber,
        episodeTitle
      );
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
    // Automatically trigger play on start
    videoRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      // Fallback for browser auto-play prevention
      setIsPlaying(false);
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekVal = parseFloat(e.target.value);
    videoRef.current.currentTime = seekVal;
    setCurrentTime(seekVal);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleClose = () => {
    if (videoRef.current) {
      // Record final progress before shutting down
      const dur = videoRef.current.duration || 100;
      const progressPercent = Math.min(100, Math.round((videoRef.current.currentTime / dur) * 100));
      recordWatchHistory(
        content,
        progressPercent || 20,
        videoUrl,
        seasonNumber,
        episodeNumber,
        episodeTitle
      );
    }
    setPlayingEpisode(null);
  };

  // Human legible duration helper
  const formatTimeHelper = (timeSecs: number) => {
    const mins = Math.floor(timeSecs / 60);
    const secs = Math.floor(timeSecs % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      id="cinematic-videoplayer-overlay"
      className="fixed inset-0 bg-black z-50 flex flex-col justify-between select-none overflow-hidden text-white"
    >
      {/* Top Header Controls bar */}
      <div 
        id="player-top-header"
        className="absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <div>
            <h2 className="font-sans font-extrabold text-white text-base sm:text-xl relative flex items-center gap-2">
              {content.title}
              <span className="text-gray-400 font-normal text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                {content.category}
              </span>
            </h2>
            {seasonNumber && (
              <p className="text-xs text-[#f65c41] font-semibold mt-0.5">
                Temporada {seasonNumber} • Episódio {episodeNumber}: &quot;{episodeTitle}&quot;
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleClose}
          className="text-gray-300 hover:text-white bg-red-600 hover:bg-red-700 py-1.5 px-4 rounded-full text-xs font-bold transition-all shadow cursor-pointer"
        >
          Fechar Player
        </button>
      </div>

      {/* Video Content Canvas */}
      <div className="relative flex-1 bg-black flex items-center justify-center">
        {hasError ? (
          <div className="text-center p-6 bg-white/5 border border-white/10 rounded-2xl max-w-sm absolute z-10 mx-4">
            <AlertCircle className="w-12 h-12 text-[#f65c41] mx-auto mb-3 animate-bounce" />
            <p className="text-sm font-semibold text-white">Erro ao carregar do servidor de transmissão</p>
            <p className="text-xs text-gray-400 mt-2">Mas não se preocupe! Registramos o conteúdo na sua estante do &quot;Continue Assistindo&quot;.</p>
            <button
              onClick={() => { setHasError(false); togglePlay(); }}
              className="mt-4 bg-[#f65c41] hover:bg-[#ff6c54] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={() => setHasError(true)}
            className="w-full h-full max-h-[85vh] object-contain"
            playsInline
          />
        )}
      </div>

      {/* Underline Progress Slider and Bottom Bar controls */}
      <div 
        id="player-bottom-controls"
        className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 space-y-4"
      >
        {/* Timeline Range line */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-400 font-bold font-mono">{formatTimeHelper(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-[#f65c41] hover:accent-[#ff6c54] h-1.5 bg-white/20 rounded-full cursor-pointer outline-none"
          />
          <span className="text-[10px] text-gray-400 font-bold font-mono">{formatTimeHelper(duration)}</span>
        </div>

        {/* Control Button Rail */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play Button */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-[#f65c41] p-1.5 focus:outline-none transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
            </button>

            {/* Volume toggle */}
            <button
              onClick={toggleMute}
              className="text-white hover:text-[#f65c41] p-1.5 focus:outline-none transition-colors"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            <span className="text-xs font-semibold text-gray-300 hidden sm:inline">Transmissão ativa • 1080p Full HD</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 py-1 px-3 rounded-full text-[10px] uppercase font-bold tracking-widest text-[#f65c41]">
              <Disc className="w-3.5 h-3.5 text-[#f65c41] animate-spin" />
              <span>Tocando via KundaCDN</span>
            </div>
            
            <button
              onClick={handleFullscreen}
              className="text-white hover:text-[#f65c41] p-1.5 focus:outline-none transition-colors"
              title="Tela Inteira"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
