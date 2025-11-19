import React, { useState, useRef, useEffect } from 'react';
import { BGM_PLAYLIST } from '../constants';
import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, VolumeIcon, VolumeXIcon, MusicNoteIcon } from './Icons';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = BGM_PLAYLIST[currentTrackIndex];

  // Effect to handle audio source changes and playing state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      
      // Only attempt play if we are supposed to be playing
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Auto-play prevented:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, isMuted, volume]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % BGM_PLAYLIST.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + BGM_PLAYLIST.length) % BGM_PLAYLIST.length);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    handleNext();
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
              <div className="text-white font-bold text-sm truncate mb-1">
                {currentTrack.title}
              </div>
              <div className="text-xs text-gray-400 flex justify-between">
                <span>{currentTrackIndex + 1} / {BGM_PLAYLIST.length}</span>
                {isPlaying && <span className="text-green-400 animate-pulse">Playing...</span>}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <button onClick={handlePrev} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <SkipBackIcon className="w-5 h-5" />
              </button>
              
              <button 
                onClick={handlePlayPause} 
                className="p-3 bg-gradient-to-tr from-game-primary to-game-accent text-white rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 pl-0.5" />}
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
            className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isPlaying 
                ? 'bg-gradient-to-tr from-game-primary to-purple-600 animate-[spin_4s_linear_infinite]' 
                : 'bg-slate-800 border border-slate-600 hover:bg-slate-700'
            }`}
          >
            {isPlaying ? (
              <MusicNoteIcon className="w-6 h-6 text-white" />
            ) : (
              <PlayIcon className="w-6 h-6 text-gray-300 ml-1" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;