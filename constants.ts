
import { Tournament, HallOfFameSponsor, StaffMember, BGMTrack, GalleryItem } from './types';

export const TOURNAMENTS: Tournament[] = [
  {
    id: 'season-3',
    season: '3',
    title: "제3회 윈친카 무투대회",
    subtitle: "크레센도 매치",
    status: 'upcoming',
    date: "2026년 예정",
    posterUrl: "/season3.png",
    format: "1:1 → 2:2 → 3:3 (순차 진행)",
    prizePool: "미정",
    sponsors: [],
    description: "점차 강렬해지는 승부! 1:1 개인전으로 시작하여 2:2 듀오, 그리고 3:3 팀전으로 이어지는 '크레센도' 방식의 단계별 서바이벌. 라운드가 거듭될수록 더 큰 전략과 협동심이 요구됩니다."
  },
  {
    id: 'season-2',
    season: '2',
    title: "제2회 윈터시즌 윈친카 무투대회",
    subtitle: "트리플 아레나",
    status: 'active',
    date: "2025년 11월 29일 ~ 2025년 11월 30일",
    posterUrl: "/season2.png",
    format: "무작위맵 3:3 팀전",
    prizePool: "100만원",
    sponsors: [
      { name: "진실 (투신)" },
      { name: "세라핀 (투신)" },
      { name: "효륵사마 (투신)" },
      { name: "거북 (우주)" },
      { name: "별 (우주)" },
      { name: "카모 (투신)" },
      { name: "틀랩퍼 (투신)" },
      { name: "원탑 (우주)" },
      { name: "융하 (낭만)" },
      { name: "Sia (투신)" }
    ],
    description: "제2회 윈친카 무투대회는 3:3 팀전으로 진행됩니다. 무작위 맵에서의 치열한 전투와 전략이 빛날 이번 시즌! 총 상금 100만원을 걸고 펼쳐지는 겨울의 전설에 도전하세요."
  },
  {
    id: 'season-1-2',
    season: '1-2',
    title: "제1회 윈친카 무투대회",
    subtitle: "최강의 듀오 (2차 전직)",
    status: 'completed',
    date: "2025년 9월 27일 ~ 2025년 9월 28일",
    posterUrl: "/season1-2.png",
    format: "2:2 듀오 매치",
    prizePool: "18만원 + 소정의 상품",
    winner: {
      name: "아킬레우스 1팀",
      players: [
        { name: "영민" },
        { name: "카모" }
      ]
    },
    runnerUp: {
      name: "따닉",
      players: [
        { name: "패닉" },
        { name: "까마귀88" }
      ]
    },
    sponsors: [
      { name: "루비 (노바스텔라)" },
      { name: "우나 (윈친카)" }
    ],
    videoUrls: [
      "https://www.youtube.com/watch?v=ypWTx7l2Jvw"
    ],
    description: "역사적인 첫 번째 윈친카 무투대회의 2부 리그. 2차 전직 캐릭터들 간의 화려한 스킬 연계가 돋보였던 듀오 토너먼트입니다."
  },
  {
    id: 'season-1-1',
    season: '1-1',
    title: "제1회 윈친카 무투대회",
    subtitle: "최강의 듀오 (1차 전직)",
    status: 'completed',
    date: "2025년 9월 20일 ~ 2025년 9월 21일",
    posterUrl: "/season1-1.png",
    format: "2:2 듀오 매치",
    prizePool: "18만원 + 소정의 상품",
    winner: {
      name: "햄토리 1팀",
      players: [
        { name: "증명" },
        { name: "절단" }
      ]
    },
    runnerUp: {
      name: "가보자구",
      players: [
        { name: "보스" },
        { name: "가령" }
      ]
    },
    sponsors: [
      { name: "루비 (노바스텔라)" },
      { name: "우나 (윈친카)" }
    ],
    videoUrls: [
      "https://www.youtube.com/watch?v=ap9paalYr7Y",
      "https://www.youtube.com/watch?v=YxY41DVmJ4A"
    ],
    description: "윈친카 무투대회의 서막을 알린 1부 리그. 기본기에 충실한 1차 전직 캐릭터들의 박진감 넘치는 컨트롤 싸움이 펼쳐졌습니다."
  }
];

// Helper to generate placeholder avatar URLs
const getAvatarUrl = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200&font-size=0.4&bold=true`;

export const HALL_OF_FAME_SUPPORTERS: HallOfFameSponsor[] = [
  { name: "루비", title: "노바스텔라", imageUrl: getAvatarUrl("루비") },
  { name: "우나", title: "윈친카", imageUrl: getAvatarUrl("우나") },
  { name: "진실", title: "투신", imageUrl: getAvatarUrl("진실") },
  { name: "세라핀", title: "투신", imageUrl: getAvatarUrl("세라핀") },
  { name: "효륵사마", title: "투신", imageUrl: getAvatarUrl("효륵") },
  { name: "거북", title: "우주", imageUrl: getAvatarUrl("거북") },
  { name: "별", title: "우주", imageUrl: getAvatarUrl("별") },
  { name: "카모", title: "투신", imageUrl: getAvatarUrl("카모") },
  { name: "틀랩퍼", title: "투신", imageUrl: getAvatarUrl("틀랩") },
  { name: "원탑", title: "우주", imageUrl: getAvatarUrl("원탑") },
  { name: "융하", title: "낭만", imageUrl: getAvatarUrl("융하") },
  { name: "Sia", title: "투신", imageUrl: getAvatarUrl("Sia") },
];

export const STAFF_MEMBERS: StaffMember[] = [
  { name: "대쉬", role: "총괄 기획 / 기술 담당", imageUrl: getAvatarUrl("대쉬") },
  { name: "루나", role: "중계 / 방송 담당", imageUrl: getAvatarUrl("루나") },
  { name: "빡스냥", role: "최강의 듀오 1차 해설진", imageUrl: getAvatarUrl("빡스") },
  { name: "진실", role: "최강의 듀오 2차 해설진", imageUrl: getAvatarUrl("진실") },
  { name: "우나", role: "카페 매니저 / 운영 지원", imageUrl: getAvatarUrl("우나") },
  { name: "복숭아", role: "소통 담당", imageUrl: getAvatarUrl("복숭") },
  { name: "칠지도", role: "보조 지원", imageUrl: getAvatarUrl("칠지") },
  { name: "유미캣", role: "보조 지원", imageUrl: getAvatarUrl("유미") },
  { name: "성녀", role: "보조 지원", imageUrl: getAvatarUrl("성녀") },
];

export const BGM_PLAYLIST: BGMTrack[] = [
  {
    title: "포폴라",
    url: "/bgm1.mp3"
  },
  {
    title: "오행산",
    url: "/bgm2.mp3"
  },
  {
    title: "발데란",
    url: "/bgm3.mp3"
  },
  {
    title: "아마쿠사",
    url: "/bgm4.mp3"
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'art-1',
    title: "제1회 대회 우승 축전",
    author: "금손유저1",
    imageUrl: "art1.jpg",
    description: "아킬레우스 팀의 우승을 축하하며 그린 팬아트입니다.",
    date: "2025.09.28"
  },
  {
    id: 'art-2',
    title: "윈친카 화이팅",
    author: "그림쟁이",
    imageUrl: "art2.jpg",
    description: "모든 참가자분들 고생 많으셨습니다!",
    date: "2025.10.01"
  },
  {
    id: 'art-3',
    title: "결승전 명장면",
    author: "팬아트장인",
    imageUrl: "art3.jpg",
    description: "결승전 마지막 한타 장면을 그려봤어요.",
    date: "2025.09.21"
  }
];

export const GEMINI_SYSTEM_INSTRUCTION = `
당신은 '윈드슬레이어' 게임의 커뮤니티 '윈친카'의 마스코트 캐릭터 '구리구리'입니다.
사용자의 질문에 대해 친근하고 장난스러운 반말을 사용해야 합니다.
가장 중요한 규칙은 문장의 끝마다 반드시 '~구리'라는 어미를 붙이는 것입니다. (예: 안녕구리! 그건 100만원이구리!)
대회 데이터(TOURNAMENTS)를 기반으로 역대 우승자, 규칙, 상금 등에 대해 안내해주세요.
모르는 정보는 지어내지 말고 "그건 아직 잘 모르겠구리..."라고 답하세요.
`;
