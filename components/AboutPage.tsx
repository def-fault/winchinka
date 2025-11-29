import React from 'react';
import { InfoIcon, UsersIcon, SwordsIcon } from './Icons';

const AboutPage: React.FC = () => {
  const qnaList = [
    {
      q: "대회 참가 신청은 어디에서 하나요?",
      a: "매 대회마다 공지되는 구글폼을 작성해서 제출해주세요."
    },
    {
      q: "기본적인 규칙을 알고 싶어요!",
      a: "공통 규칙으로는 악세서리 착용 금지이며, 대회 10분 전까지 대기 장소에 모여주세요. 대회마다 진행 방식의 차이가 조금씩 있기 때문에 대회 참가자 톡방에 입장하여 공지를 읽고 스탭 분들의 지시를 잘 따라주세요."
    },
    {
      q: "대회 중 버그가 발생하면 재경기를 하나요?",
      a: "잡기 버그 발생 시에는 바로 적팀이 풀어줘야하고, 그 과정을 방해하면 안됩니다. 의도하지 않게 발생하는 버그들에 대해서는 재경기 조건으로 충족되지 않습니다. (예: 위치 버그, 포탈 버그, 근성의 파이터 피격 버그 등)"
    },
    {
      q: "제한시간 종료 시 승패 판정은 어떻게 하나요?",
      a: "인원 수가 같을 경우, 피 색상(녹색 3점, 황색 2점, 적색 1점)에 따라 점수를 부여하여 판정승이 결정됩니다. (예: 2:2 상황, 적색-녹색 vs 황색-황색 = 4:4 무승부)"
    },
    {
      q: "팀원을 교체하고 싶어요",
      a: "사유와 함께, 본인 증빙 자료를 준비하여 대회 시작 1시간 전까지 스탭분들에게 문의 부탁드립니다."
    },
    {
      q: "기타 문의 사항이 있어요",
      a: "윈친카 디스코드 (윈디) 문의하기 기능을 이용해서 문의 부탁드립니다."
    }
  ];

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-16 pb-24">
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

      {/* FAQ Section */}
      <section>
        <div className="flex items-center gap-4 mb-8">
           <div className="h-10 w-2 bg-game-primary rounded-full shadow-[0_0_15px_rgba(var(--game-primary-rgb),0.8)]" />
           {/* 타이틀 크기 확대: text-3xl -> text-4xl md:text-5xl */}
           <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
             자주 묻는 질문
           </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {qnaList.map((item, index) => (
            <div 
              key={index}
              className="glass-panel rounded-xl overflow-hidden border border-white/10 hover:border-game-primary/40 transition-all duration-300 group"
            >
              {/* Question Header: 패딩 축소 (py-4)로 얇게 만듦 */}
              <div className="bg-white/5 py-4 px-6 flex items-center gap-3 border-b border-white/5">
                <span className="text-game-primary font-black text-xl leading-none shrink-0 drop-shadow-md">
                  Q.
                </span>
                {/* 질문 폰트 사이즈 축소: text-lg */}
                <h3 className="text-lg font-bold text-white leading-snug">
                  {item.q}
                </h3>
              </div>
              
              {/* Answer Body */}
              <div className="bg-black/20 p-6 flex items-start gap-3">
                <span className="text-gray-500 font-black text-lg leading-none mt-1 shrink-0 select-none opacity-50">
                  A.
                </span>
                {/* 답변 폰트 사이즈 축소: text-base */}
                <p className="text-gray-300 text-base leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;