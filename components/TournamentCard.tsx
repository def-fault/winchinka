
import React, { useState } from 'react';
import { Tournament } from '../types';
import { CalendarIcon, TrophyIcon, UsersIcon, SwordsIcon } from './Icons';

interface Props {
  tournament: Tournament;
  onClick: (t: Tournament) => void;
}

const meteorStyle = `
  @keyframes meteor-orbit {
    from { offset-distance: 0%; }
    to   { offset-distance: 100%; }
  }
  .meteor-orbit-wrapper {
    position: absolute;
    inset: -2px;
    border-radius: 14px;
    pointer-events: none;
    z-index: 50;
    overflow: hidden;
  }
  .meteor {
    position: absolute;
    width: 120px;
    height: 4px;
    offset-path: inset(0px round 14px);
    offset-rotate: auto;
    animation: meteor-orbit 3s linear infinite;
    background: linear-gradient(to right, 
      rgba(139, 92, 246, 0) 0%, 
      rgba(139, 92, 246, 0.3) 50%,
      rgba(167, 139, 250, 0.8) 80%,
      #ffffff 100%
    );
    filter: blur(1px);
    box-shadow: 0 0 10px rgba(167, 139, 250, 0.5);
    border-radius: 2px;
  }
  .meteor::after {
    content: '';
    position: absolute;
    right: -2px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 
      0 0 10px #fff,
      0 0 20px rgba(167, 139, 250, 0.8),
      0 0 30px rgba(139, 92, 246, 0.6);
  }
  .meteor-2 {
    animation-delay: -1.5s;
  }
`;

const TournamentCard: React.FC<Props> = ({ tournament, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const isSeason3 = tournament.id === 'season-3';

  // Determine badge style and text based on status
  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'completed':
        return {
          text: '종료됨',
          className: 'bg-slate-800 border-slate-500 text-slate-300'
        };
      case 'active':
        return {
          text: '접수중',
          className: 'bg-game-win text-black border-yellow-400 animate-pulse'
        };
      case 'upcoming':
      default:
        return {
          text: '개최 예정',
          className: 'bg-game-primary/20 border-game-primary text-game-primary'
        };
    }
  };

  const badge = getStatusBadge();

  const card = (
    <div 
      onClick={() => onClick(tournament)}
      className="glass-panel rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] group h-full flex flex-col"
    >
      <div className="relative h-64 overflow-hidden bg-slate-800">
        {/* Use a dark overlay to make text readable if image loads, or just cool effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60 z-10" />
        
        {!imgError ? (
          <img 
            src={tournament.posterUrl} 
            alt={tournament.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Fallback placeholder if image is missing */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 group-hover:scale-110 transition-transform duration-700 p-4 text-center">
            <SwordsIcon className="w-16 h-16 text-slate-600 mb-2" />
            <span className="text-slate-500 text-sm font-bold mb-1">이미지 준비중</span>
            <span className="text-slate-600 text-xs break-all">
              SEASON {tournament.season}
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 z-20">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.className}`}>
            {badge.text}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col relative z-20">
        <div className="mb-2">
          <h3 className="text-2xl font-display font-black italic text-white mb-1">
            SEASON {tournament.season}
          </h3>
          <p className="text-game-primary font-bold text-sm tracking-widest uppercase">
            {tournament.subtitle}
          </p>
        </div>
        
        <div className="space-y-2 text-gray-400 text-sm mt-auto">
           <div className="flex items-center gap-2">
             <CalendarIcon className="w-4 h-4 text-slate-500" />
             <span>{tournament.date}</span>
           </div>
           <div className="flex items-center gap-2">
             <UsersIcon className="w-4 h-4 text-slate-500" />
             <span>{tournament.format}</span>
           </div>
           <div className="flex items-center gap-2">
             <TrophyIcon className="w-4 h-4 text-game-win" />
             <span className="text-game-win font-bold">{tournament.prizePool}</span>
           </div>
        </div>
      </div>
    </div>
  );

  if (!isSeason3) return card;

  return (
    <>
      <style>{meteorStyle}</style>
      <div style={{ position: 'relative' }}>
        {/* 유성 두 개가 카드 테두리를 따라 돌아요 냥~ */}
        <div className="meteor-orbit-wrapper">
          <div className="meteor" />
          <div className="meteor meteor-2" />
        </div>
        {card}
      </div>
    </>
  );
};

export default TournamentCard;
