
import React from 'react';
import { Tournament, Team } from '../types';
import { ArrowLeftIcon, TrophyIcon, SwordsIcon, CoinsIcon, CrownIcon, VideoIcon } from './Icons';

interface Props {
  tournament: Tournament;
  onBack: () => void;
}

const WinnerCard: React.FC<{ team: Team; rank: 1 | 2 }> = ({ team, rank }) => {
  const isFirst = rank === 1;

  return (
    <div className={`relative p-6 rounded-2xl border flex flex-col items-center text-center overflow-hidden ${
      isFirst 
        ? 'bg-gradient-to-br from-yellow-900/40 to-slate-900 border-yellow-500/50 neon-border shadow-[0_0_30px_rgba(234,179,8,0.2)]' 
        : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600'
    }`}>
      {isFirst && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className="bg-game-win p-3 rounded-full shadow-lg">
             <CrownIcon className="w-6 h-6 text-black" />
           </div>
        </div>
      )}
      
      <h4 className={`font-display text-3xl font-black mt-4 mb-2 ${isFirst ? 'text-game-win' : 'text-gray-300'}`}>
        {isFirst ? 'WINNER' : 'RUNNER UP'}
      </h4>
      <div className="text-xl font-bold text-white mb-6">{team.name}</div>
      
      <div className="w-full space-y-2">
        {team.players.map((player, idx) => (
          <div key={idx} className="flex justify-between items-center bg-black/30 px-4 py-2 rounded">
            <span className="text-gray-200">{player.name}</span>
            <span className="text-xs text-gray-500 font-mono border border-gray-700 px-1 rounded">{player.class}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TournamentDetail: React.FC<Props> = ({ tournament, onBack }) => {

  const hasParticipants = Boolean(tournament.participants && tournament.participants.length > 0);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="animate-fade-in w-full">
      {/* Header Navigation */}
      <button 
        onClick={onBack}
        className="group flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <div className="p-2 rounded-full bg-slate-800 group-hover:bg-game-primary transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </div>
        <span className="font-bold">목록으로 돌아가기</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Poster & Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800 group">
             <img 
               src={tournament.posterUrl} 
               alt="Poster" 
               className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
             />
             <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                <h1 className="text-4xl font-display font-black italic text-white mb-1">
                  SEASON {tournament.season}
                </h1>
                <p className="text-game-primary font-bold text-lg tracking-widest uppercase">
                  {tournament.subtitle}
                </p>
             </div>
          </div>

          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-600 pb-2 flex items-center gap-2">
              <SwordsIcon className="w-5 h-5 text-game-fire" /> 대회 정보
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500">개최 일자</span>
                <span>{tournament.date}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-gray-500">진행 방식</span>
                <span>{tournament.format}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-gray-500">총 상금</span>
                <span className="text-game-win font-bold">{tournament.prizePool}</span>
              </div>
            </div>
          </div>
          
          {tournament.sponsors.length > 0 && (
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white border-b border-slate-600 pb-2 mb-4 flex items-center gap-2">
                <CoinsIcon className="w-5 h-5 text-yellow-400" /> 후원자 (Sponsors)
              </h3>
              <ul className="space-y-3">
                {tournament.sponsors.map((sponsor, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                    <div>
                      <span className="font-bold text-white block">{sponsor.name}</span>
                      {sponsor.amount && <span className="text-xs text-yellow-500 block">{sponsor.amount}</span>}
                      {sponsor.message && <span className="text-xs text-gray-500 mt-0.5 block">"{sponsor.message}"</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Content & Winners */}
        <div className="lg:col-span-8 space-y-8">
          {/* Description */}
          <div className="glass-panel p-8 rounded-xl">
             <h2 className="text-2xl font-display text-white mb-4">대회 개요</h2>
             <p className="text-gray-300 leading-relaxed whitespace-pre-line">
               {tournament.description}
             </p>
          </div>

          {/* Winners Section - Only if completed */}
          {tournament.status === 'completed' && tournament.winner && (
            <div className="space-y-6">
               <div className="flex items-center gap-3 mb-2">
                 <TrophyIcon className="w-8 h-8 text-game-win" />
                 <h2 className="text-3xl font-display text-white">HALL OF FAME</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <WinnerCard team={tournament.winner} rank={1} />
                 {tournament.runnerUp && <WinnerCard team={tournament.runnerUp} rank={2} />}
               </div>
            </div>
          )}

          {/* Video Archive Section */}
          {tournament.videoUrls && tournament.videoUrls.length > 0 && (
             <div className="space-y-6">
               <div className="flex items-center gap-3 mb-2">
                 <VideoIcon className="w-8 h-8 text-game-primary" />
                 <h2 className="text-3xl font-display text-white">VIDEO ARCHIVE</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {tournament.videoUrls.map((url, idx) => {
                    const videoId = getYoutubeId(url);
                    return videoId ? (
                      <div key={idx} className="space-y-2">
                        <div className="rounded-xl overflow-hidden shadow-lg border border-slate-700 bg-black">
                          <div className="relative pt-[56.25%]">
                            <iframe 
                              className="absolute top-0 left-0 w-full h-full"
                              src={`https://www.youtube.com/embed/${videoId}?origin=${window.location.origin}`} 
                              title={`Tournament Video ${idx + 1}`}
                              frameBorder="0" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                              allowFullScreen
                            ></iframe>
                          </div>
                        </div>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-center text-xs text-gray-500 hover:text-game-primary transition-colors"
                        >
                          ▶ 유튜브에서 보기
                        </a>
                      </div>
                    ) : null;
                 })}
               </div>
             </div>
          )}

          {/* Fallback for upcoming or active (only when no roster to show) */}
          {(tournament.status === 'upcoming' || tournament.status === 'active') && !hasParticipants && (
            <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-xl border-dashed border-2 border-slate-600">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-2xl font-bold text-white mb-2">대회 준비 중</h3>
              <p className="text-gray-400">상세 정보가 곧 공개될 예정입니다.</p>

              {tournament.participants && tournament.participants.length > 0 && (
                <div className="w-full mt-12 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 rounded-full bg-game-primary shadow-[0_0_20px_rgba(94,234,212,0.7)]" />
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-game-primary font-bold">참가팀 명단</p>
                      <h4 className="text-2xl font-display text-white font-black">TEAM ROSTER</h4>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[720px] rounded-xl border border-slate-700 bg-slate-900/60 backdrop-blur divide-y divide-slate-800">
                      <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] px-4 py-3 text-sm font-bold text-gray-300 bg-slate-800/70">
                        <span className="pl-2">팀명</span>
                        <span>팀대표</span>
                        <span>팀원 1</span>
                        <span>팀원 2</span>
                      </div>

                      {tournament.participants.map((team) => (
                        <div key={team.name} className="grid grid-cols-[1.2fr_1fr_1fr_1fr] px-4 py-4 gap-2 text-sm text-gray-200">
                          <div className="pl-2 font-semibold text-white">{team.name}</div>
                          {team.members.map((member, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center gap-2">
                                {member.role && (
                                  <span className="text-[10px] uppercase tracking-widest text-game-primary border border-game-primary/60 rounded px-1 py-0.5">
                                    {member.role}
                                  </span>
                                )}
                                <span className="font-medium text-white">{member.name}</span>
                              </div>
                              {member.class && (
                                <div className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-black/40 px-2 py-1 rounded-md border border-slate-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-game-primary" />
                                  <span className="font-mono">{member.class}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tournament.participants && tournament.participants.length > 0 && (
            <div className="glass-panel p-8 rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full bg-game-primary shadow-[0_0_20px_rgba(94,234,212,0.7)]" />
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-game-primary font-bold">참가팀 명단</p>
                  <h4 className="text-2xl font-display text-white font-black">TEAM ROSTER</h4>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[720px] rounded-xl border border-slate-700 bg-slate-900/60 backdrop-blur divide-y divide-slate-800">
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] px-4 py-3 text-sm font-bold text-gray-300 bg-slate-800/70">
                    <span className="pl-2">팀명</span>
                    <span>팀대표</span>
                    <span>팀원 1</span>
                    <span>팀원 2</span>
                  </div>

                  {tournament.participants.map((team) => (
                    <div key={team.name} className="grid grid-cols-[1.2fr_1fr_1fr_1fr] px-4 py-4 gap-2 text-sm text-gray-200">
                      <div className="pl-2 font-semibold text-white">{team.name}</div>
                      {team.members.map((member, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            {member.role && (
                              <span className="text-[10px] uppercase tracking-widest text-game-primary border border-game-primary/60 rounded px-1 py-0.5">
                                {member.role}
                              </span>
                            )}
                            <span className="font-medium text-white">{member.name}</span>
                          </div>
                          {member.class && (
                            <div className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-black/40 px-2 py-1 rounded-md border border-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-game-primary" />
                              <span className="font-mono">{member.class}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasParticipants && (
            <div className="glass-panel p-8 rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full bg-game-primary shadow-[0_0_20px_rgba(94,234,212,0.7)]" />
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-game-primary font-bold">참가팀 명단</p>
                  <h4 className="text-2xl font-display text-white font-black">TEAM ROSTER</h4>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[720px] rounded-xl border border-slate-700 bg-slate-900/60 backdrop-blur divide-y divide-slate-800">
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] px-4 py-3 text-sm font-bold text-gray-300 bg-slate-800/70">
                    <span className="pl-2">팀명</span>
                    <span>팀대표</span>
                    <span>팀원 1</span>
                    <span>팀원 2</span>
                  </div>

                  {tournament.participants.map((team) => (
                    <div key={team.name} className="grid grid-cols-[1.2fr_1fr_1fr_1fr] px-4 py-4 gap-2 text-sm text-gray-200">
                      <div className="pl-2 font-semibold text-white">{team.name}</div>
                      {team.members.map((member, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            {member.role && (
                              <span className="text-[10px] uppercase tracking-widest text-game-primary border border-game-primary/60 rounded px-1 py-0.5">
                                {member.role}
                              </span>
                            )}
                            <span className="font-medium text-white">{member.name}</span>
                          </div>
                          {member.class && (
                            <div className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-black/40 px-2 py-1 rounded-md border border-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-game-primary" />
                              <span className="font-mono">{member.class}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasParticipants && (
            <div className="glass-panel p-8 rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full bg-game-primary shadow-[0_0_20px_rgba(94,234,212,0.7)]" />
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-game-primary font-bold">참가팀 명단</p>
                  <h4 className="text-2xl font-display text-white font-black">TEAM ROSTER</h4>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[720px] rounded-xl border border-slate-700 bg-slate-900/60 backdrop-blur divide-y divide-slate-800">
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] px-4 py-3 text-sm font-bold text-gray-300 bg-slate-800/70">
                    <span className="pl-2">팀명</span>
                    <span>팀대표</span>
                    <span>팀원 1</span>
                    <span>팀원 2</span>
                  </div>

                  {participants.map((team) => (
                    <div key={team.name} className="grid grid-cols-[1.2fr_1fr_1fr_1fr] px-4 py-4 gap-2 text-sm text-gray-200">
                      <div className="pl-2 font-semibold text-white">{team.name}</div>
                      {team.members.map((member, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            {member.role && (
                              <span className="text-[10px] uppercase tracking-widest text-game-primary border border-game-primary/60 rounded px-1 py-0.5">
                                {member.role}
                              </span>
                            )}
                            <span className="font-medium text-white">{member.name}</span>
                          </div>
                          {member.class && (
                            <div className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-black/40 px-2 py-1 rounded-md border border-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-game-primary" />
                              <span className="font-mono">{member.class}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Explicit Bottom Spacer for Safety (Increased to 48 ~ 192px) */}
      <div className="h-48 w-full"></div>
    </div>
  );
};

export default TournamentDetail;
