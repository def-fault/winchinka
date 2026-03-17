import React, { useRef, useState, useEffect } from 'react';

interface VideoIntroProps {
  onFinished: () => void;
}

const VideoIntro: React.FC<VideoIntroProps> = ({ onFinished }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [folding, setFolding] = useState(false);
  const [gone, setGone] = useState(false);

  const handleEnded = () => {
    setFolding(true);
    setTimeout(() => {
      setGone(true);
      onFinished();
    }, 700);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React의 muted prop이 DOM에 반영 안 되는 버그 직접 수정
    video.muted = true;
    video.play().catch(() => {
      // 자동재생 실패 시 무음으로 재시도
      video.muted = true;
      video.play().catch(console.error);
    });

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, []);

  if (gone) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#000',
        overflow: 'hidden',
        transformOrigin: 'top center',
        transition: folding
          ? 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease'
          : 'none',
        transform: folding ? 'scaleY(0)' : 'scaleY(1)',
        opacity: folding ? 0 : 1,
      }}
    >
      <video
        ref={videoRef}
        src="/video.mp4"
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      {/* 스킵 버튼 */}
      <button
        onClick={handleEnded}
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          padding: '10px 24px',
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '4px',
          fontSize: '14px',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          letterSpacing: '0.05em',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      >
        건너뛰기 ▶
      </button>
    </div>
  );
};

export default VideoIntro;
