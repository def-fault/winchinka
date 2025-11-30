import React, { useState } from 'react';
import { TOURNAMENTS, HALL_OF_FAME_SUPPORTERS, STAFF_MEMBERS } from '../constants';
import { CrownIcon, HeartIcon, ShieldIcon, MedalIcon } from './Icons';

const BASE_PATH = import.meta.env.BASE_URL || '/';

const resolvePublicAsset = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  const baseUrl = typeof document !== 'undefined'
    ? new URL(BASE_PATH, document.baseURI)
    : new URL(BASE_PATH, 'http://localhost/');

  return new URL(normalizedPath, baseUrl).href;
};

const PROFILE_IMAGE_OVERRIDES: Record<string, string> = {
  // Staff
  '대쉬': 'dash.png',
  '루나': 'luna.png',
  '우나': 'una.png',
  '빡스냥': 'ppaksnyang.png',
  '진실': 'jinsil.png',
  '원탑': 'wontap.png',
  '복숭아': 'boksunga.png',
  '칠지도': 'chiljido.png',
  '유미캣': 'yumicat.png',
  '성녀': 'seongnyeo.png',

  // Supporters
  '루비': 'ruby.png',
  'DOS': 'dos.png',
  '세라핀': 'seraphine.png',
  '효륵사마': 'hyoruksama.png',
  '거북': 'geobuk.png',
  '별': 'byeol.png',
  '카모': 'kamo.png',
  '틀랩퍼': 'tlepper.png',
  '원탑 ': 'onetop.png',
  '융하': 'yungha.png',
  'Sia': 'sia.png',
};

const getProfileImageUrl = (name: string, fallback?: string) => {
  const override = PROFILE_IMAGE_OVERRIDES[name];
  if (override) {
    return resolvePublicAsset(override);
  }
  return fallback;
};

interface HoverState {
  name: string;
  imageUrl: string;
  role?: string;
  x: number;
  y: number;
}

const HallOfFamePage: React.FC = () => {
  const [hoverState, setHoverState] = useState<HoverState | null>(null);

  // 완료된 대회 중 우승자가 있는 대회만 가져오기
  const completedTournaments = TOURNAMENTS.filter(
    t => t.status === 'completed' && t.winner
  );

  const handleMouseEnter = (e: React.MouseEvent, name: string, imageUrl: string, role?: string) => {
    setHoverState({
      name,
      imageUrl,
      role,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoverState) {
      setHoverState(prev => prev ? ({
        ...prev,
        x: e.clientX,
        y: e.clientY
      }) : null);
    }
  };

  const handleMouseLeave = () => {
    setHoverState(null);
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20 space-y-20 relative">
      
      {/* Floating Profile Card */}
      {hoverState && (
        <div 
          className="fixed pointer-events-none z-50 transition-opacity duration-200"
          style={{ 
            left: `${hoverState.x + 20}px`, 
            top: `${hoverState.y + 20}px` 
          }}
        >
          <div className="glass-panel bg-slate-900/90 p-4 rounded-2xl border-2 border-game-primary shadow-[0_0_24px_rgba(59,130,246,0.6)] flex flex-col items-center gap-3 min-w-[190px]">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-2 border-white/40 bg-slate-800">
              {hoverState.imageUrl && (
                <img 
                  src={hoverState.imageUrl} 
                  alt={hoverState.name} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-white text-lg md:text-xl">
                {hoverState.name}
              </div>
              {hoverState.role && (
                <div className="text-xs md:text-sm text-game-accent font-bold mt-1">
                  {hoverState.role}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 neon-text">
          HALL OF FAME
        </h1>
        <p className="text-gray-400 text-lg">
          윈친카 무투대회를 빛낸 영광의 주역들을 소개합니다.
        </p>
      </div>

      {/* Section 1: The Winners (Champions) */}
      <section>
        <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
          <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/50">
            <CrownIcon className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">LEGENDARY CHAMPIONS</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {completedTournaments.map((t) => {
            // 시즌 2인지 확인 (가로 배치를 위해)
            const isFeatured = t.season === '2';

            return (
              <div 
                key={t.id} 
                className={`glass-panel p-6 rounded-xl border border-yellow-500/20 relative overflow-hidden group hover:border-yellow-500/50 transition-colors ${
                  isFeatured ? 'md:col-span-2' : ''
                }`}
              >
                <div className="absolute top-0 right-0 bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-bl-lg">
                  SEASON {t.season}
                </div>
                
                <h3 className="text-xl font-display text-white mb-1">{t.subtitle}</h3>
                <p className="text-sm text-gray-500 mb-6">{t.format} | {t.date}</p>

                {/* 시즌 2일 때는 가로 배치(grid), 그 외에는 세로 배치(flex) */}
                <div className={isFeatured ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-4"}>
                  
                  {/* Winner (골드 스타일 유지) */}
                  <div className="bg-gradient-to-r from-yellow-900/40 to-transparent p-4 rounded-lg border-l-4 border-yellow-500 h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <MedalIcon className="w-5 h-5 text-yellow-400" />
                      <span className="font-bold text-yellow-400">WINNER</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{t.winner?.name}</div>
                    <div className="text-sm text-gray-400">
                      {t.winner?.players.map(p => p.name).join(', ')}
                    </div>
                  </div>

                  {/* Runner Up (은색 그라디언트로 변경!) */}
                  {t.runnerUp && (
                    <div className="bg-gradient-to-r from-slate-700/50 to-transparent p-4 rounded-lg border-l-4 border-slate-300 h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <MedalIcon className="w-5 h-5 text-slate-300" />
                        <span className="font-bold text-slate-300">RUNNER UP</span>
                      </div>
                      <div className="text-xl font-bold text-white mb-1">{t.runnerUp.name}</div>
                      <div className="text-sm text-gray-400">
                        {t.runnerUp.players.map(p => p.name).join(', ')}
                      </div>
                    </div>
                  )}

                  {/* 3rd & 4th Place */}
                  {(t.thirdPlace || t.fourthPlace) && (
                    <div className={`grid grid-cols-2 gap-4 ${isFeatured ? 'md:col-span-2 mt-2' : ''}`}>
                      
                      {/* 3rd Place (무색으로 변경!) */}
                      {t.thirdPlace && (
                        <div className="bg-white/5 p-3 rounded-lg border-l-4 border-slate-700">
                           <div className="flex items-center gap-1.5 mb-1.5">
                             <MedalIcon className="w-4 h-4 text-slate-500" />
                             <span className="font-bold text-slate-500 text-xs tracking-wider">3rd PLACE</span>
                           </div>
                           <div className="font-bold text-white mb-0.5 text-sm">{t.thirdPlace.name}</div>
                           <div className="text-xs text-gray-500 truncate">
                             {t.thirdPlace.players.map(p => p.name).join(', ')}
                           </div>
                        </div>
                      )}

                      {/* 4th Place (무색 유지) */}
                      {t.fourthPlace && (
                        <div className="bg-white/5 p-3 rounded-lg border-l-4 border-slate-700">
                           <div className="flex items-center gap-1.5 mb-1.5">
                             <MedalIcon className="w-4 h-4 text-slate-500" />
                             <span className="font-bold text-slate-500 text-xs tracking-wider">4th PLACE</span>
                           </div>
                           <div className="font-bold text-white mb-0.5 text-sm">{t.fourthPlace.name}</div>
                           <div className="text-xs text-gray-500 truncate">
                             {t.fourthPlace.players.map(p => p.name).join(', ')}
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Supporters */}
      <section>
         <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
          <div className="p-3 bg-pink-500/10 rounded-full border border-pink-500/50">
            <HeartIcon className="w-8 h-8 text-pink-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">NOBLE SUPPORTERS</h2>
        </div>
        <p className="text-gray-400 mb-6 text-center md:text-left">
          대회 개최를 위해 소중한 후원을 해주신 분들입니다. 여러분의 정성이 윈드슬레이어를 살아숨쉬게 합니다.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {HALL_OF_FAME_SUPPORTERS.map((s, idx) => {
            const supporterImage = getProfileImageUrl(s.name, s.imageUrl);

            return (
              <div
                key={idx}
                className="glass-panel p-4 rounded-lg flex flex-col items-center text-center hover:bg-pink-500/10 transition-colors border border-white/5 hover:border-pink-500/30 cursor-help"
                onMouseEnter={(e) => handleMouseEnter(e, s.name, supporterImage || '', s.title)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mb-3 shadow-lg overflow-hidden">
                   {supporterImage ? (
                      <img src={supporterImage} alt={s.name} className="w-full h-full object-cover opacity-90" />
                   ) : (
                      <span>{s.name[0]}</span>
                   )}
                 </div>
                 <div className="font-bold text-white">{s.name}</div>
                 <div className="text-xs text-pink-400 mt-1 font-bold">{s.title}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Staff */}
      <section>
         <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
          <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/50">
            <ShieldIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">OPERATIONS STAFF</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STAFF_MEMBERS.map((staff, idx) => {
            const staffImage = getProfileImageUrl(staff.name, staff.imageUrl);

            return (
              <div
                key={idx}
                className="glass-panel p-6 rounded-xl flex items-center gap-4 border border-blue-500/10 hover:border-blue-500/40 transition-colors cursor-help"
                onMouseEnter={(e) => handleMouseEnter(e, staff.name, staffImage || '', staff.role)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl text-gray-400 font-display border-2 border-slate-600 overflow-hidden">
                   {staffImage ? (
                      <img src={staffImage} alt={staff.name} className="w-full h-full object-cover" />
                   ) : (
                      <span>{staff.name[0]}</span>
                   )}
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{staff.name}</div>
                  <div className="text-sm text-blue-400 font-bold uppercase tracking-wider">{staff.role}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default HallOfFamePage;