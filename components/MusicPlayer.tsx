
import React, { useState, useRef, useEffect } from 'react';
import { BGM_PLAYLIST } from '../constants';
import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, VolumeIcon, VolumeXIcon, MusicNoteIcon } from './Icons';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = BGM_PLAYLIST[currentTrackIndex];

  // Reset error state when track changes
  useEffect(() => {
    setHasError(false);
  }, [currentTrackIndex]);

  // Effect to handle audio source changes and playing state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      
      if (isPlaying && !hasError) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .catch(error => {
              console.warn("Playback prevented:", error);
              // Don't set error state here for simple autoplay blocks, only actual load errors
            });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, isMuted, volume, hasError]);

  const handlePlayPause = () => {
    // If we are in error state and user clicks play, try to play again or next
    if (hasError) {
       handleNext();
    } else {
       setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    setHasError(false);
    // Reset retry count on manual navigation
    setRetryCount(0);
    setCurrentTrackIndex((prev) => (prev + 1) % BGM_PLAYLIST.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setHasError(false);
    setRetryCount(0);
    setCurrentTrackIndex((prev) => (prev - 1 + BGM_PLAYLIST.length) % BGM_PLAYLIST.length);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    handleNext();
  };

  const handleError = () => {
    console.error(`[MusicPlayer] Failed to load track: ${currentTrack.url}`);
    // Avoid logging the event object 'e' directly to prevent circular reference errors
    setHasError(true);
    
    // Stop attempting if we've tried every song in the playlist once
    if (retryCount >= BGM_PLAYLIST.length) {
        setIsPlaying(false);
        setRetryCount(0);
        return;
    }

    // Auto-skip to next track if current fails
    if (isPlaying) {
        setRetryCount(prev => prev + 1);
        // Brief timeout to prevent rapid-fire skipping loops
        setTimeout(() => {
            setCurrentTrackIndex((prev) => (prev + 1) % BGM_PLAYLIST.length);
        }, 1000);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        src={currentTrack.url}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Main Player UI */}
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-72 md:w-80 glass-panel rounded-xl p-4 shadow-[0_0_25px_rgba(59,130,246,0.3)]' : 'w-14 h-14 rounded-full'
      }`}>
        {isExpanded ? (
          <div className="flex flex-col gap-3">
            {/* Header / Minimize */}
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-game-primary font-bold text-sm">
                <MusicNoteIcon className="w-4 h-4 animate-bounce" />
                <span>BGM PLAYER</span>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-xs">최소화</span>
              </button>
            </div>

            {/* Track Info */}
            <div className="py-2">
              <div className={`font-bold text-sm truncate mb-1 ${hasError ? 'text-red-400' : 'text-white'}`}>
                {hasError ? "재생 불가 (파일 없음)" : currentTrack.title}
              </div>
              <div className="text-xs text-gray-400 flex justify-between">
                <span>{currentTrackIndex + 1} / {BGM_PLAYLIST.length}</span>
                {isPlaying && !hasError && <span className="text-green-400 animate-pulse">Playing...</span>}
                {hasError && <span className="text-red-400">Error</span>}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <button onClick={handlePrev} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <SkipBackIcon className="w-5 h-5" />
              </button>
              
              <button 
                onClick={handlePlayPause} 
                className={`p-3 text-white rounded-full shadow-lg hover:scale-105 transition-transform ${
                    hasError ? 'bg-gray-600' : 'bg-gradient-to-tr from-game-primary to-game-accent'
                }`}
              >
                {isPlaying && !hasError ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 pl-0.5" />}
              </button>
              
              <button onClick={handleNext} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <SkipForwardIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
               <button onClick={() => setIsMuted(!isMuted)}>
                 {isMuted || volume === 0 ? (
                   <VolumeXIcon className="w-4 h-4 text-gray-400" />
                 ) : (
                   <VolumeIcon className="w-4 h-4 text-gray-400" />
                 )}
               </button>
               <input 
                 type="range" 
                 min="0" 
                 max="1" 
                 step="0.05" 
                 value={isMuted ? 0 : volume}
                 onChange={handleVolumeChange}
                 className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-game-primary [&::-webkit-slider-thumb]:rounded-full"
               />
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsExpanded(true)}
            className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-300 shadow-lg relative ${
              isPlaying && !hasError
                ? 'bg-gradient-to-tr from-game-primary to-purple-600 animate-[spin_4s_linear_infinite]' 
                : hasError 
                    ? 'bg-red-900/50 border border-red-500'
                    : 'bg-slate-800 border border-slate-600 hover:bg-slate-700'
            }`}
          >
            {isPlaying && !hasError ? (
              <MusicNoteIcon className="w-6 h-6 text-white" />
            ) : hasError ? (
              <VolumeXIcon className="w-6 h-6 text-red-400" />
            ) : (
              <PlayIcon className="w-6 h-6 text-gray-300 ml-1" />
            )}
            
            {hasError && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;
    