
import React, { useState } from 'react';
import { ViewState, Tournament } from './types';
import { TOURNAMENTS } from './constants';
import TournamentCard from './components/TournamentCard';
import TournamentDetail from './components/TournamentDetail';
import ChatWidget from './components/ChatWidget';
import MusicPlayer from './components/MusicPlayer';
import AboutPage from './components/AboutPage';
import HallOfFamePage from './components/HallOfFamePage';
import { TrophyIcon } from './components/Icons';

const CAFE_URL = "https://cafe.naver.com/windslayerschin";

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LIST);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const handleTournamentClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setView(ViewState.DETAIL);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setView(ViewState.LIST);
    setSelectedTournament(null);
    window.scrollTo(0, 0);
  };

  const navigateTo = (targetView: ViewState) => {
    setView(targetView);
    setSelectedTournament(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050b14] relative selection:bg-game-primary selection:text-white">
      {/* Clean background with subtle gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_#050b14_60%)] pointer-events-none" />
      
      {/* Global Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050b14]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleBack}>
            <div className="w-8 h-8 bg-gradient-to-tr from-game-primary to-game-accent rounded flex items-center justify-center shadow-lg">
               <TrophyIcon className="text-white w-5 h-5" />
            </div>
            <span className="font-display text-xl tracking-wider font-bold text-white neon-text">
              윈친카 <span className="text-game-primary">아카이브</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <button 
              onClick={() => navigateTo(ViewState.ABOUT)}
              className={`transition-colors ${view === ViewState.ABOUT ? 'text-white font-bold' : 'hover:text-white'}`}
            >
              대회 소개
            </button>
            <button 
              onClick={() => navigateTo(ViewState.HALL_OF_FAME)}
              className={`transition-colors ${view === ViewState.HALL_OF_FAME ? 'text-white font-bold' : 'hover:text-white'}`}
            >
              명예의 전당
            </button>
            <a 
              href={CAFE_URL}
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-white transition-all flex items-center gap-2"
            >
              <span>윈친카 바로가기</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10">
        {view === ViewState.LIST && (
          <>
            {/* Hero Section */}
            <section className="mb-16 text-center relative animate-fade-in">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-game-primary/20 blur-[100px] rounded-full pointer-events-none" />
              <h1 className="relative text-5xl md:text-7xl font-display font-black text-white mb-6 tracking-tighter">
                LEGENDS OF <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary via-purple-500 to-game-fire neon-text">
                  WIND SLAYER
                </span>
              </h1>
              <p className="relative text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                윈친카 무투대회의 역사를 기록하는 아카이브입니다.<br/>
                수많은 강자들이 거쳐간 영광의 순간들을 확인하세요.
              </p>
            </section>

            {/* Tournament Grid */}
            <section className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-1 h-8 bg-game-primary neon-border" />
                 <h2 className="text-2xl font-bold text-white">TOURNAMENTS</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TOURNAMENTS.map((t) => (
                  <TournamentCard 
                    key={t.id} 
                    tournament={t} 
                    onClick={handleTournamentClick} 
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {view === ViewState.DETAIL && selectedTournament && (
          <TournamentDetail 
            tournament={selectedTournament} 
            onBack={handleBack} 
          />
        )}

        {view === ViewState.ABOUT && <AboutPage />}
        
        {view === ViewState.HALL_OF_FAME && <HallOfFamePage />}

      </main>

      {/* Spacer to guarantee separation between content and footer */}
      {view !== ViewState.DETAIL && <div className="h-20" />}

      {/* Footer - ONLY RENDER IF NOT IN DETAIL VIEW */}
      {view !== ViewState.DETAIL && (
        <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm py-8 relative z-10">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
            <p>© 2025 WinChinKa Archive. Community Fan Site.</p>
          </div>
        </footer>
      )}

      {/* AI Chat Widget */}
      <ChatWidget />
      
      {/* Music Player Widget */}
      <MusicPlayer />
    </div>
  );
};

export default App;
