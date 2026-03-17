import React, { useRef, useState, useEffect } from 'react';

interface VideoIntroProps {
  onFinished: () => void;
}

// 접히는 애니메이션 스타일을 <style> 태그로 주입
const style = `
  @keyframes fold-up {
    0%   { transform: scaleY(1); opacity: 1; }
    100% { transform: scaleY(0); opacity: 0; }
  }
  .video-intro-wrapper {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #000;
    overflow: hidden;
    transform-origin: top center;
  }
  .video-intro-wrapper.folding {
    animation: fold-up 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  .video-intro-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .video-intro-skip {
    position: absolute;
    bottom: 40px;
    right: 40px;
    padding: 10px 24px;
    background: rgba(255,255,255,0.15);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    letter-spacing: 0.05em;
    transition: background 0.2s;
    font-family: inherit;
  }
  .video-intro-skip:hover {
    background: rgba(255,255,255,0.3);
  }
`;

const VideoIntro: React.FC<VideoIntroProps> = ({ onFinished }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [folding, setFolding] = useState(false);
  const [gone, setGone] = useState(false);

  const triggerFold = () => {
    if (folding) return;
    setFolding(true);
    setTimeout(() => {
      setGone(true);
      onFinished();
    }, 700);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React muted prop이 DOM에 반영 안 되는 버그 직접 수정
    video.muted = true;
    video.play().catch(console.error);

    video.addEventListener('ended', triggerFold);
    return () => video.removeEventListener('ended', triggerFold);
  }, []);

  if (gone) return null;

  return (
    <>
      <style>{style}</style>
      <div className={`video-intro-wrapper${folding ? ' folding' : ''}`}>
        <video
          ref={videoRef}
          src="/video.mp4?v=2"
          playsInline
          className="video-intro-video"
        />
        <button
          className="video-intro-skip"
          onClick={triggerFold}
        >
          건너뛰기 ▶
        </button>
      </div>
    </>
  );
};

export default VideoIntro;
