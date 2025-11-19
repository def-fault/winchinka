
import React from 'react';
import { InfoIcon, UsersIcon, SwordsIcon } from './Icons';

const AboutPage: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-12 pb-20">
      {/* Hero / Slogan */}
      <section className="text-center py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-game-accent/20 blur-[100px] rounded-full pointer-events-none" />
        
        <h1 className="relative text-5xl md:text-6xl font-display font-black text-white mb-8 leading-tight">
          <span className="block text-2xl md:text-3xl font-bold text-game-primary mb-4 tracking-widest opacity-80">
            COMMUNITY PROJECT
          </span>
          유저가 만들어가는<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary via-purple-500 to-pink-500 neon-text">
            윈드슬레이어
          </span>
        </h1>

        <p className="text-xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
          윈친카 무투대회는 게임사가 아닌, <strong className="text-white">유저들이 직접 기획하고 후원하며 만들어가는</strong> 순수 커뮤니티 대회입니다.
          우리는 게임을 사랑하는 마음 하나로 뭉쳐, 잊지 못할 추억과 전설적인 승부를 기록합니다.
        </p>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-2xl text-center hover:bg-white/5 transition-colors group">
          <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <UsersIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">커뮤니티 주도</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            윈친카(윈드슬레이어 친구들 카페) 멤버들이 주축이 되어, 규칙 제정부터 상금 모금까지 모든 과정이 유저의 손으로 이루어집니다.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl text-center hover:bg-white/5 transition-colors group">
          <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <SwordsIcon className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">공정한 승부</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            레벨과 장비를 떠나, 오직 컨트롤과 전략으로 승부하는 공정한 룰을 지향합니다. 누구나 전설의 주인공이 될 수 있습니다.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl text-center hover:bg-white/5 transition-colors group">
          <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <InfoIcon className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">기록과 보존</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            단순한 일회성 이벤트로 끝나지 않도록, 모든 대회의 결과와 명장면을 이 아카이브에 영구적으로 보존합니다.
          </p>
        </div>
      </section>

      {/* Message */}
      <section className="glass-panel p-10 rounded-2xl border border-game-primary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-game-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <h2 className="text-2xl font-display font-bold text-white mb-6 relative z-10">
          함께 역사를 써내려갈 당신을 기다립니다.
        </h2>
        <div className="space-y-4 text-gray-300 relative z-10">
          <p>
            윈드슬레이어의 세계는 여러분의 참여로 더욱 풍성해집니다. 
            대회 참가자가 되어 실력을 뽐내거나, 후원자가 되어 대회를 빛내거나, 
            관객이 되어 뜨거운 응원을 보내주세요.
          </p>
          <p className="font-bold text-white">
            여러분이 있는 한, 윈드슬레이어의 전설은 계속됩니다.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
