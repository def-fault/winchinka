
import React, { useState } from 'react';
import { TOURNAMENTS, HALL_OF_FAME_SUPPORTERS, STAFF_MEMBERS } from '../constants';
import { CrownIcon, HeartIcon, ShieldIcon, MedalIcon } from './Icons';

interface HoverState {
  name: string;
  imageUrl: string;
  role?: string;
  x: number;
  y: number;
}

const HallOfFamePage: React.FC = () => {
  const [hoverState, setHoverState] = useState<HoverState | null>(null);

  // Extract completed tournaments with winners
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
    <div className="animate-fade-in max-w-6xl mx-auto pb-40 space-y-20 relative">
      
      {/* Floating Profile Card */}
      {hoverState && (
        <div 
          className="fixed pointer-events-none z-50 transition-opacity duration-200"
          style={{ 
            left: `${hoverState.x + 20}px`, 
            top: `${hoverState.y + 20}px` 
          }}
        >
          <div className="glass-panel bg-slate-900/90 p-3 rounded-xl border-2 border-game-primary shadow-[0_0_20px_rgba(59,130,246,0.5)] flex flex-col items-center gap-2 min-w-[150px]">
             <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-white/20 bg-slate-800">
               {hoverState.imageUrl && (
                 <img 
                   src={hoverState.imageUrl} 
                   alt={hoverState.name} 
                   className="w-full h-full object-cover"
                 />
               )}
             </div>
             <div className="text-center">
               <div className="font-display font-bold text-white text-lg">{hoverState.name}</div>
               {hoverState.role && (
                 <div className="text-xs text-game-accent font-bold">{hoverState.role}</div>
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
          {completedTournaments.map((t) => (
            <div key={t.id} className="glass-panel p-6 rounded-xl border border-yellow-500/20 relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
              <div className="absolute top-0 right-0 bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-bl-lg">
                SEASON {t.season}
              </div>
              
              <h3 className="text-xl font-display text-white mb-1">{t.subtitle}</h3>
              <p className="text-sm text-gray-500 mb-6">{t.format} | {t.date}</p>

              <div className="flex flex-col gap-4">
                {/* Winner */}
                <div className="bg-gradient-to-r from-yellow-900/40 to-transparent p-4 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-center gap-2 mb-2">
                    <MedalIcon className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-yellow-400">WINNER</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{t.winner?.name}</div>
                  <div className="text-sm text-gray-400">
                    {t.winner?.players.map(p => p.name).join(', ')}
                  </div>
                </div>

                {/* Runner Up */}
                <div className="bg-white/5 p-4 rounded-lg border-l-4 border-gray-400">
                  <div className="flex items-center gap-2 mb-2">
                    <MedalIcon className="w-5 h-5 text-gray-400" />
                    <span className="font-bold text-gray-400">RUNNER UP</span>
                  </div>
                  <div className="text-xl font-bold text-white mb-1">{t.runnerUp?.name}</div>
                  <div className="text-sm text-gray-500">
                    {t.runnerUp?.players.map(p => p.name).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
          {HALL_OF_FAME_SUPPORTERS.map((s, idx) => (
            <div 
              key={idx} 
              className="glass-panel p-4 rounded-lg flex flex-col items-center text-center hover:bg-pink-500/10 transition-colors border border-white/5 hover:border-pink-500/30 cursor-help"
              onMouseEnter={(e) => handleMouseEnter(e, s.name, s.imageUrl || '', s.title)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mb-3 shadow-lg overflow-hidden">
                 {s.imageUrl ? (
                    <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover opacity-90" />
                 ) : (
                    <span>{s.name[0]}</span>
                 )}
               </div>
               <div className="font-bold text-white">{s.name}</div>
               <div className="text-xs text-pink-400 mt-1 font-bold">{s.title}</div>
            </div>
          ))}
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
          {STAFF_MEMBERS.map((staff, idx) => (
            <div 
              key={idx} 
              className="glass-panel p-6 rounded-xl flex items-center gap-4 border border-blue-500/10 hover:border-blue-500/40 transition-colors cursor-help"
              onMouseEnter={(e) => handleMouseEnter(e, staff.name, staff.imageUrl || '', staff.role)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl text-gray-400 font-display border-2 border-slate-600 overflow-hidden">
                 {staff.imageUrl ? (
                    <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-cover" />
                 ) : (
                    <span>{staff.name[0]}</span>
                 )}
              </div>
              <div>
                <div className="text-lg font-bold text-white">{staff.name}</div>
                <div className="text-sm text-blue-400 font-bold uppercase tracking-wider">{staff.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HallOfFamePage;
