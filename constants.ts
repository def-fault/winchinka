import { Tournament, HallOfFameSponsor, StaffMember, BGMTrack, GalleryItem } from './types';

const BASE_PATH = import.meta.env.BASE_URL || '/';

/**
 * Builds a URL to a file that lives inside Vite's `public/` folder.
 */
const resolvePublicAsset = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  const baseUrl = typeof document !== 'undefined'
    ? new URL(BASE_PATH, document.baseURI)
    : new URL(BASE_PATH, 'http://localhost/');

  return new URL(normalizedPath, baseUrl).href;
};

// ==========================================
// [시즌 1-1 참가자 명단] - 2인 구성 (팀대표 + 팀원)
// ==========================================
export const season1_1Participants = [
  {
    name: '뚀쪆',
    members: [
      { name: '드디어드디어', class: '도적' },
      { name: '대쉬', class: '도적' },
    ],
  },
  {
    name: '어쌔신에게 꽃을',
    members: [
      { name: '어쌔신', class: '도적' },
      { name: '당신에게꽃을', class: '마법사' },
    ],
  },
  {
    name: '가보자구',
    members: [
      { name: '보스', class: '전사' },
      { name: '가령', class: '도적' },
    ],
  },
  {
    name: '꿈라우마',
    members: [
      { name: '이건꿈이야', class: '마법사' },
      { name: '트라우마', class: '도적' },
    ],
  },
  {
    name: '평화와 전쟁',
    members: [
      { name: '예달', class: '사제' },
      { name: '잿빛', class: '도적' },
    ],
  },
  {
    name: '햄토리 1팀',
    members: [
      { name: '증명', class: '사제' },
      { name: '절단', class: '도적' },
    ],
  },
  {
    name: '마신족장 우정잉',
    members: [
      { name: '우정잉', class: '도적' },
      { name: '마신족', class: '궁수' },
    ],
  },
  {
    name: '깡패',
    members: [
      { name: '째트킥', class: '무도가' },
      { name: '생활', class: '무도가' },
    ],
  },
] as const;

// ==========================================
// [시즌 1-2 참가자 명단] - 2인 구성 (팀대표 + 팀원)
// ==========================================
export const season1_2Participants = [
  {
    name: '아킬레우스 1팀',
    members: [
      { name: '영민', class: '버서커' },
      { name: '카모', class: '카운터' },
    ],
  },
  {
    name: '따닉',
    members: [
      { name: '패닉', class: '파이터' },
      { name: '까마귀88', class: '버서커' },
    ],
  },
  {
    name: '야인시대',
    members: [
      { name: '유수', class: '카운터' },
      { name: '베니마루', class: '파이터' },
    ],
  },
  {
    name: '밟으면 꿈틀',
    members: [
      { name: '무인도', class: '어쌔신' },
      { name: '트라우마', class: '트랩퍼' },
    ],
  },
  {
    name: '가보자구',
    members: [
      { name: '보스', class: '성기사' },
      { name: '가령', class: '트랩퍼' },
    ],
  },
  {
    name: '침착한 으뜸',
    members: [
      { name: '키보드부순침착맨', class: '비스트마스터' },
      { name: '으뜸', class: '파이터' },
    ],
  },
  {
    name: 'Run',
    members: [
      { name: '된장', class: '트랩퍼' },
      { name: 'Sia', class: '비스트마스터' },
    ],
  },
  {
    name: '와쏘베쏘',
    members: [
      { name: '일병', class: '파이터' },
      { name: '긴', class: '트랩퍼' },
    ],
  },
] as const;


// ==========================================
// [시즌 2 참가자 명단] - 3인 구성 (팀대표 + 팀원1 + 팀원2)
// ==========================================
export const season2Participants = [
  {
    name: '제발1승만요',
    members: [
      { name: '킬러', class: '트랩퍼' },
      { name: '거북', class: '버서커' },
      { name: '꽃화', class: '다크프리스트' },
    ],
  },
  {
    name: '랭커',
    members: [
      { name: '진리', class: '버서커' },
      { name: '순애킬러금태양', class: '카운터' },
      { name: 'Bless_you', class: '성기사' },
    ],
  },
  {
    name: '초보들의반란',
    members: [
      { name: '왕초보슬레이어', class: '버서커' },
      { name: '데스나이트', class: '성기사' },
      { name: '짱군', class: '트랩퍼' },
    ],
  },
  {
    name: '알고보니훈훈해',
    members: [
      { name: '보스', class: '성기사' },
      { name: '알러뷰', class: '비숍' },
      { name: '추성훈', class: '카운터' },
    ],
  },
  {
    name: 'king',
    members: [
      { name: '영민', class: '버서커' },
      { name: '카모', class: '카운터' },
      { name: '에이바', class: '서모너' },
    ],
  },
  {
    name: '양가비',
    members: [
      { name: '비에고', class: '버서커' },
      { name: '양', class: '서모너' },
      { name: '가령', class: '트랩퍼' },
    ],
  },
  {
    name: '날먹',
    members: [
      { name: '증명', class: '비숍' },
      { name: '절단', class: '어쌔신' },
      { name: 'Time', class: '성기사' },
    ],
  },
  {
    name: '씌꾸륏',
    members: [
      { name: '키보드부순침착맨', class: '비스트마스터' },
      { name: '.노메아.', class: '버서커' },
      { name: '◈かげ.', class: '다크프리스트' },
    ],
  },
  {
    name: '어쌔신에게 꽃을주러갈래',
    members: [
      { name: '어쌔신', class: '어쌔신' },
      { name: '갈래', class: '버서커' },
      { name: '당신에게꽃을', class: '엘리멘탈리스트' },
    ],
  },
  {
    name: '승재와 아이들',
    members: [
      { name: '승재', class: '카운터' },
      { name: '지구인', class: '비숍' },
      { name: '에녹', class: '엘리멘탈리스트' },
    ],
  },
  {
    name: '비밀결사대',
    members: [
      { name: '이해', class: '비숍' },
      { name: '나딘', class: '카운터' },
      { name: 'Okinawa', class: '서모너' },
    ],
  },
  {
    name: 'SCP',
    members: [
      { name: 'Summon', class: '서모너' },
      { name: '乃', class: '파이터' },
      { name: '태세', class: '버서커' },
    ],
  },
  {
    name: '아오지들판',
    members: [
      { name: '별', class: '다크프리스트' },
      { name: '탈모인판별가', class: '트랩퍼' },
      { name: '버논', class: '파이터' },
    ],
  },
  {
    name: '살군대',
    members: [
      { name: '^^', class: '파이터' },
      { name: '프레디머큐리', class: '서모너' },
      { name: '별히', class: '비숍' },
    ],
  },
  {
    name: '세상은 잔혹하다',
    members: [
      { name: '일월', class: '성기사' },
      { name: '잔혹', class: '서모너' },
      { name: '청도', class: '파이터' },
    ],
  },
  {
    name: '나얼빵',
    members: [
      { name: '나태함', class: '버서커' },
      { name: '얼그레이', class: '엘리멘탈리스트' },
      { name: '크림빵', class: '서모너' },
    ],
  },
] as const;

// ==========================================
// [시즌 3 참가자 명단] - 3인 구성 (팀대표 + 팀원1 + 팀원2)
// ==========================================
export const season3Participants = [
  {
    name: '미워도 다시 한번',
    members: [
      { name: '영순', class: '성기사' },
      { name: '루드', class: '파이터' },
      { name: '장이수', class: '어쌔신' },
    ],
  },
  {
    name: '이름없음',
    members: [
      { name: '탱딜힐', class: '성기사' },
      { name: '목성', class: '비스트마스터' },
      { name: '백호', class: '파이터' },
    ],
  },
  {
    name: '유단자야?',
    members: [
      { name: '별', class: '다크프리스트' },
      { name: '지코', class: '파이터' },
      { name: '왕초', class: '어쌔신' },
    ],
  },
  {
    name: '청설모',
    members: [
      { name: '청도', class: '파이터' },
      { name: '설화', class: '어쌔신' },
      { name: '씨요킬러닼프양', class: '다크프리스트' },
    ],
  },
  {
    name: '심연 사랑해',
    members: [
      { name: '나태함', class: '버서커' },
      { name: '정적', class: '어쌔신' },
      { name: '추성훈', class: '카운터' },
    ],
  },
  {
    name: '엄머머~',
    members: [
      { name: '무지성난타', class: '파이터' },
      { name: '수직', class: '다크프리스트' },
      { name: '사령관', class: '버서커' },
    ],
  },
  {
    name: '형제는 용감했다',
    members: [
      { name: '푸퍼', class: '카운터' },
      { name: '밤포', class: '버서커' },
      { name: '쏭스타', class: '트랩퍼' },
    ],
  },
  {
    name: '우리빼고 다~~나깡!!',
    members: [
      { name: '다나깡', class: '어쌔신' },
      { name: '짱군', class: '트랩퍼' },
      { name: '18.5cm', class: '성기사' },
    ],
  },
  {
    name: '시샘블로그많관부',
    members: [
      { name: '시샘', class: '다크프리스트' },
      { name: '헤븐스윙', class: '카운터' },
      { name: '선양', class: '어쌔신' },
    ],
  },
  {
    name: '올리브영',
    members: [
      { name: 'Egg', class: '비스트마스터' },
      { name: '미토', class: '파이터' },
      { name: '보호본능', class: '다크프리스트' },
    ],
  },
  {
    name: '어우사',
    members: [
      { name: '뒷모습', class: '어쌔신' },
      { name: '귀결', class: '다크프리스트' },
      { name: '귀여운낙타', class: '파이터' },
    ],
  },
  {
    name: '왕밤빵짱',
    members: [
      { name: '거북', class: '버서커' },
      { name: '혈기', class: '파이터' },
      { name: 'nox', class: '트랩퍼' },
    ],
  },
  {
    name: '시진핀',
    members: [
      { name: '성지', class: '성기사' },
      { name: '절단', class: '어쌔신' },
      { name: 'Sia', class: '비스트마스터' },
    ],
  },
  {
    name: '우승하게 해주세요',
    members: [
      { name: '꿈이아니야', class: '서모너' },
      { name: '트라우마', class: '트랩퍼' },
      { name: '乃', class: '파이터' },
    ],
  },
  {
    name: '광탈팀',
    members: [
      { name: '비에고', class: '버서커' },
      { name: '비비큐', class: '파이터' },
      { name: '세인', class: '다크프리스트' },
    ],
  },
  {
    name: '늙고병듦',
    members: [
      { name: '소로소로몽', class: '다크프리스트' },
      { name: '지쿵이', class: '비스트마스터' },
      { name: '뭘봐?', class: '카운터' },
    ],
  },
] as const;


// ==========================================
// [대회 정보 통합]
// ==========================================
export const TOURNAMENTS: Tournament[] = [
  {
    id: 'season-4',
    season: '4',
    title: "제4회 윈친카 무투대회",
    subtitle: "트리플 클래시",
    status: 'upcoming',
    date: "2026년 여름 예정",
    posterUrl: resolvePublicAsset('season4.png?v=2'),
    format: "3:3 팀전",
    prizePool: "100만원",
    pdfUrl: resolvePublicAsset('2026-2.pdf'),
    formUrl: "https://forms.gle/placeholder",
    sponsors: [
      { name: "우위 (올리브영)", amount: "100,000원", avatarUrl: resolvePublicAsset('uwi.png') },
      { name: "진실 (투신)", amount: "100,000원", avatarUrl: resolvePublicAsset('jinsil.png') },
      { name: "molang (귀신)", amount: "1000만 골드", avatarUrl: resolvePublicAsset('molang.png') },
      { name: "거북 (투신)", amount: "200,000원", avatarUrl: resolvePublicAsset('geobuk.png') },
      { name: "통모짜핫도그 (투신)", amount: "200,000원", avatarUrl: resolvePublicAsset('hotdog.png') },
      { name: "사과맛크림 (하루)", amount: "100,000원", avatarUrl: resolvePublicAsset('applecream.jpg') }
    ],
    funding: {
      goal: 1000000,
      current: 700000
    },
    description: "제4회 윈친카 무투대회는 3:3 팀전으로 진행됩니다. 무작위 맵에서의 치열한 전투와 전략이 빛날 이번 시즌! 총 상금 100만원을 걸고 펼쳐지는 여름의 전설에 도전하세요."
  },
  {
    id: 'season-3',
    season: '3',
    title: "제3회 윈친카 무투대회",
    subtitle: "크레센도 매치",
    status: 'completed',
    date: "2026년 5월 9일",
    posterUrl: resolvePublicAsset('season3.png'),
    format: "1:1 → 2:2 → 3:3 (순차 진행)",
    prizePool: "100만원 + 경품",
    pdfUrl: resolvePublicAsset('2026-1.pdf'),
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdlNyEdx2dqiOdDNUzioETc51qTM6rKY7-W5TTHGZ_kDLEKiw/viewform?usp=dialog",
    participants: season3Participants,
    preliminaryMatches: [
      { defenseTeam: '이름이뭐에요전화버논뭐에요', attackTeam: '엄머머~', winner: 'attack' },
      { defenseTeam: '세얼간이', attackTeam: '청설모', winner: 'attack' },
      { defenseTeam: 'LA 최고의 갱단', attackTeam: '미워도 다시 한번', winner: 'attack' },
      { defenseTeam: '어우사', attackTeam: '심판을 받아라', winner: 'defense' },
      { defenseTeam: '우승하게 해주세요', attackTeam: '롤러터', winner: 'defense' },
      { defenseTeam: '갱주들', attackTeam: '광탈팀', winner: 'attack' },
      { defenseTeam: '꽃이필무렵', attackTeam: '이름없음', winner: 'attack' },
      { defenseTeam: '우나의 관리자권한', attackTeam: '올리브영', winner: 'attack' },
      { defenseTeam: '늙고병듦', attackTeam: 'Ssiyo', winner: 'defense' },
    ],
    winner: {
      name: "시진핀",
      players: [
        { name: "성지" },
        { name: "절단" },
        { name: "Sia" }
      ]
    },
    runnerUp: {
      name: "광탈팀",
      players: [
        { name: "비에고" },
        { name: "비비큐" },
        { name: "세인" }
      ]
    },
    thirdPlace: {
      name: "미워도 다시 한 번",
      players: [
        { name: "영순" },
        { name: "루드" },
        { name: "장이수" }
      ]
    },
    fourthPlace: {
      name: "늙고병듦",
      players: [
        { name: "소로소로몽" },
        { name: "지쿵이" },
        { name: "뭘봐?" }
      ]
    },
    videoUrls: [
      "https://www.youtube.com/watch?v=7KBKOheDEaM"
    ],
    sponsors: [
      { name: "우위 (올리브영)", amount: "1,000,000원 + 경품", avatarUrl: resolvePublicAsset('uwi.png') },
      { name: "주먹이운다 (올리브영)", amount: "99s 완드", avatarUrl: resolvePublicAsset('zumuk.png') },
      { name: "미토 (올리브영)", avatarUrl: resolvePublicAsset('mito.png') },
      { name: "소곤소곤 (올리브영)", avatarUrl: resolvePublicAsset('sogon.png') },
      { name: "다겸이 (올리브영)", avatarUrl: resolvePublicAsset('dagy.png') }
    ],
    funding: {
      goal: 1000000,
      current: 1000000
    },
    description: "점차 강렬해지는 승부! 1:1 개인전으로 시작하여 2:2 듀오, 그리고 3:3 팀전으로 이어지는 '크레센도' 방식의 단계별 서바이벌. 라운드가 거듭될수록 더 큰 전략과 협동심이 요구됩니다."
  },
  {
    id: 'season-2',
    season: '2',
    title: "제2회 윈터시즌 윈친카 무투대회",
    subtitle: "트리플 아레나",
    status: 'completed',
    date: "2025년 11월 29일 ~ 2025년 11월 30일",
    posterUrl: resolvePublicAsset('season2.png'),
    format: "무작위맵 3:3 팀전",
    prizePool: "100만원",
    pdfUrl: resolvePublicAsset('2025-2.pdf'),
    formUrl: "https://forms.gle/placeholder",
    participants: season2Participants, // 3인 구성
    winner: {
      name: "날먹",
      players: [
        { name: "증명" },
        { name: "절단" },
        { name: "Time" }
      ]
    },
    runnerUp: {
      name: "SCP",
      players: [
        { name: "Summon" },
        { name: "乃" },
        { name: "태세" }
      ]
    },
    thirdPlace: {
      name: "양가비",
      players: [
        { name: "비에고" },
        { name: "양" },
        { name: "가령" }
      ]
    },
    fourthPlace: {
      name: "king",
      players: [
        { name: "영민" },
        { name: "카모" },
        { name: "에이바" }
      ]
    },
    videoUrls: [
      "https://www.youtube.com/watch?v=UiQUEeLPNa0",
      "https://www.youtube.com/watch?v=JrtispzIs6Q",
      "https://www.youtube.com/shorts/vygalq4gwBk",
      "https://www.youtube.com/shorts/LVZ86HPeSLE",
      "https://www.youtube.com/shorts/B6HY01sRTlc",
      "https://www.youtube.com/shorts/TMGoo5ri21M",
      "https://www.youtube.com/shorts/bjLOAPFn8Fc"
    ],
    sponsors: [
      { name: "진실 (투신)", amount: "200,000원", avatarUrl: resolvePublicAsset('jinsil.png') },
      { name: "세라핀 (투신)", amount: "100,000원", avatarUrl: resolvePublicAsset('seraphine.png') },
      { name: "거북 (우주)", amount: "200,000원", avatarUrl: resolvePublicAsset('geobuk.png') },
      { name: "별 (우주)", amount: "30,000원", avatarUrl: resolvePublicAsset('byeol.png') },
      { name: "카모 (투신)", amount: "100,000원", avatarUrl: resolvePublicAsset('kamo.png') },
      { name: "틀랩퍼 (투신)", amount: "100,000원", avatarUrl: resolvePublicAsset('tlepper.png') },
      { name: "원탑 (우주)", amount: "5,000,000 골드", avatarUrl: resolvePublicAsset('wontap.png') },
      { name: "융하 (낭만)", amount: "5,000,000 골드", avatarUrl: resolvePublicAsset('yungha.png') },
      { name: "Sia (투신)", amount: "100,000원", avatarUrl: resolvePublicAsset('sia.png') },
      { name: "효륵사마 (투신)", amount: "재능기부", avatarUrl: resolvePublicAsset('hyoruksama.png') }
    ],
    funding: {
      goal: 1000000,
      current: 1000000
    },
    description: "제2회 윈친카 무투대회는 3:3 팀전으로 진행됩니다. 무작위 맵에서의 치열한 전투와 전략이 빛날 이번 시즌! 총 상금 100만원을 걸고 펼쳐지는 겨울의 전설에 도전하세요.",
  },
  {
    id: 'season-1-2',
    season: '1-2',
    title: "제1회 윈친카 무투대회",
    subtitle: "최강의 듀오 (2차 전직)",
    status: 'completed',
    date: "2025년 9월 27일 ~ 2025년 9월 28일",
    posterUrl: resolvePublicAsset('season1-2.png'),
    format: "2:2 듀오 매치",
    prizePool: "18만원 + 경품",
    participants: season1_2Participants, // 2인 구성
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
      { name: "루비 (노바스텔라)", avatarUrl: resolvePublicAsset('ruby.png') },
      { name: "DOS (놀이터)", avatarUrl: resolvePublicAsset('dos.png') },
      { name: "우나 (윈친카)", avatarUrl: resolvePublicAsset('una.png') }
    ],
    videoUrls: [
      "https://www.youtube.com/watch?v=ypWTx7l2Jvw",
      "https://www.youtube.com/watch?v=6HqQbzxeLZU",
      "https://www.youtube.com/watch?v=2Zmqo9YrYaI",
      "https://www.youtube.com/watch?v=i7DMsLwhz_E"
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
    posterUrl: resolvePublicAsset('season1-1.png'),
    format: "2:2 듀오 매치",
    prizePool: "18만원 + 경품",
    participants: season1_1Participants, // 2인 구성
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
      { name: "루비 (노바스텔라)", avatarUrl: resolvePublicAsset('ruby.png') },
      { name: "DOS (놀이터)", avatarUrl: resolvePublicAsset('dos.png') },
      { name: "우나 (윈친카)", avatarUrl: resolvePublicAsset('una.png') }
    ],
    videoUrls: [
      "https://www.youtube.com/watch?v=ap9paalYr7Y",
      "https://www.youtube.com/watch?v=YxY41DVmJ4A"
    ],
    description: "윈친카 무투대회의 서막을 알린 1부 리그. 기본기에 충실한 1차 전직 캐릭터들의 박진감 넘치는 컨트롤 싸움이 펼쳐졌습니다."
  }
];

const getAvatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200&font-size=0.4&bold=true`;

export const HALL_OF_FAME_SUPPORTERS: HallOfFameSponsor[] = [
  { name: "루비", title: "노바스텔라", imageUrl: resolvePublicAsset('ruby.png') },
  { name: "우나", title: "윈친카", imageUrl: resolvePublicAsset('una.png') },
  { name: "진실", title: "투신", imageUrl: resolvePublicAsset('jinsil.png') },
  { name: "Sia", title: "투신", imageUrl: resolvePublicAsset('sia.png') },
  { name: "카모", title: "투신", imageUrl: resolvePublicAsset('kamo.png') },
  { name: "틀랩퍼", title: "투신", imageUrl: resolvePublicAsset('tlepper.png') },
  { name: "세라핀", title: "투신", imageUrl: resolvePublicAsset('seraphine.png') },
  { name: "효륵사마", title: "투신", imageUrl: resolvePublicAsset('hyoruksama.png') },
  { name: "거북", title: "투신", imageUrl: resolvePublicAsset('geobuk.png') },
  { name: "별", title: "우주", imageUrl: resolvePublicAsset('byeol.png') },
  { name: "원탑", title: "우주", imageUrl: resolvePublicAsset('wontap.png') },
  { name: "융하", title: "F E E L 、", imageUrl: resolvePublicAsset('yungha.png') },
  { name: "우위", title: "올리브영", imageUrl: resolvePublicAsset('uwi.png') },
  { name: "다겸이", title: "올리브영", imageUrl: resolvePublicAsset('dagy.png') },
  { name: "미토", title: "올리브영", imageUrl: resolvePublicAsset('mito.png') },
  { name: "소곤소곤", title: "올리브영", imageUrl: resolvePublicAsset('sogon.png') },
  { name: "주먹이운다", title: "올리브영", imageUrl: resolvePublicAsset('zumuk.png') },
  { name: "DOS", title: "놀이터", imageUrl: resolvePublicAsset('dos.png') },
  { name: "molang", title: "귀신", imageUrl: resolvePublicAsset('molang.png') },
  { name: "통모짜핫도그", title: "투신", imageUrl: resolvePublicAsset('hotdog.png') },
  { name: "사과맛크림", title: "하루", imageUrl: resolvePublicAsset('applecream.jpg') },
];

export const STAFF_MEMBERS: StaffMember[] = [
  { name: "대쉬", role: "총괄 기획 / 기술 담당", imageUrl: resolvePublicAsset('dash.png') },
  { name: "루나", role: "대회 중계 / 방송 담당", imageUrl: resolvePublicAsset('luna.png') },
  { name: "우나", role: "커뮤니티 매니저 / 운영 지원", imageUrl: resolvePublicAsset('una.png') },
  { name: "빡스냥", role: "[최강의 듀오] 1차 해설진", imageUrl: resolvePublicAsset('ppaksnyang.png') },
  { name: "진실", role: "[최강의 듀오] 2차 해설진", imageUrl: resolvePublicAsset('jinsil.png') },
  { name: "원탑 ", role: "[트리플 아레나] 해설진", imageUrl: resolvePublicAsset('wontap.png') },
  { name: "핵토파스칼킥", role: "[크레센도 매치] 해설진", imageUrl: resolvePublicAsset('hecto.png') },
  { name: "복숭아", role: "소통 담당", imageUrl: resolvePublicAsset('boksunga.png') },
  { name: "칠지도", role: "보조 지원", imageUrl: resolvePublicAsset('chiljido.png') },
  { name: "유미캣", role: "보조 지원", imageUrl: resolvePublicAsset('yumicat.png') },
  { name: "성녀", role: "보조 지원", imageUrl: resolvePublicAsset('seongnyeo.png') }
];

export const BGM_PLAYLIST: BGMTrack[] = [
  { title: "포폴라", url: resolvePublicAsset('bgm1.mp3') },
  { title: "오행산", url: resolvePublicAsset('bgm2.mp3') },
  { title: "발데란", url: resolvePublicAsset('bgm3.mp3') },
  { title: "아마쿠사", url: resolvePublicAsset('bgm4.mp3') },
  { title: "발데란 광산", url: resolvePublicAsset('bgm5.mp3') },
  { title: "세렌초원", url: resolvePublicAsset('bgm6.mp3') },
  { title: "세리엔", url: resolvePublicAsset('bgm7.mp3') }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'art-1',
    title: "최강의 듀오 우승 축전 1차",
    author: "효륵사마",
    imageUrl: "art1.png",
    description: "1회차 1차 부문 축전이에요 ㅎㅎ\n전직 전 1차 스킬로만 승부를 겨뤄야 해서 완전 근본 싸움이었죠..!\n보면서 심장이 쫄리고 진짜 재밌어서, 웅장하게 그렸던 기억이 나요!",
    date: "2025.09.29"
  },
  {
    id: 'art-2',
    title: "최강의 듀오 우승 축전 2차",
    author: "효륵사마",
    imageUrl: "art2.png",
    description: "1회차 2차 부문 축전이에요…!\n다양한 2차 전직으로 이루어져 있어서, 엄청난 조합을 보는 재미가 쏠쏠했답니다 ㅎㅎ\n게다가 다들 캐릭터가 귀엽고 개성 넘쳐서 그리는동안 너무 재밋었습니다!",
    date: "2025.09.29"
  },
  {
    id: 'art-3',
    title: "최강의 듀오 기념사진",
    author: "루나",
    imageUrl: "art3.png",
    description: "윈친카 무투대회 첫 무대의 중계를 맡아 현장의 열기를 전달할 수 있어 뜻깊었습니다. 모두 함께 의미있는 대회를 만들고자 준비하던 과정과, 출전한 선수분들의 열기가 벌써부터 그립습니다. 앞으로의 대회에서도 신뢰받는 중계로 보답하겠습니다. 윈드슬레이어 화이팅! 윈친카 화이팅!",
    date: "2025.09.30"
  },
  {
    id: 'art-4',
    title: "트리플 아레나 우승 축전",
    author: "효륵사마",
    imageUrl: "art4.png",
    description: "1회 축전 그린 게 엊그제 같은데 벌써 2회네요! 이번에는 3대 3이라 더욱 재미있게 봤고, 진짜 저번 대회보다 더 심장 쫄깃한 경기가 많았습니다. 대존잼… 이 맛에 무투를 즐기지 싶었습니다!! 절단님, 증명님, 타임님 플레이를 보면서 ‘이게 진짜 팀이구나!’ 싶었어요!~ 그리고 나무칼 전사 비숍은 정말 인상 깊었습니다! 다른 참가자 분들도 모두 너무너무 수고하셨고, 개최해주신 기획진 분들께도 진심으로 감사드립니다!!!",
    date: "2025.12.05"
  },
  {
    id: 'art-5',
    title: "트리플 아레나 준우승 축전",
    author: "효륵사마",
    imageUrl: "art5.png",
    description: "준우승팀 SCP팀입니다 옷 맞춰입으셔서 너무 귀여웠어요 ㅎㅎ 5꽉경기 클라스 미쳤다..... 역시 너무잘하십니다..ㅜㅡㅜ멋진경기 감사합니다!",
    date: "2025.12.12"
  },
  {
    id: 'art-6',
    title: "한유저의 윈드슬레이어 ",
    author: "핵토파스칼킥",
    imageUrl: "art6.png",
    description: "안녕하세요 핵토파스칼킥 입니다. 다들 윈친카 무투대회 좋아하시죠?? 저는 대회여는 날만 손꼽아 기다리고 있어요 ㅎㅎ 고생해주신 대쉬님.진실님.유튜브♥루나 님그리고 후원해주신 분들과 투신 길드에게 감사하는 마음으로 그렸던 일주일이였고, 대회 개최를 위해 고생하신 분들에게 조금이나마 보탬이 되고싶었어요. 만화를 통해 감사드린다는 말 전하고 싶습니다! 다음주에는 사연 읽어드려요2 업로드 예정입니다. 재밌게 봐주시고! 요즘 눈 많이와서 길 미끄러운데 조심하시구 건강하게 같이 게임합시다 캬캬캬!",
    date: "2025.12.14"
  },
  {
    id: 'art-7',
    title: "크레센도 매치 기념 사진",
    author: "대쉬",
    imageUrl: "art7.png",
    description: "크레센도 매치 기념 사진 입니다.",
    date: "2026.05.10"
  },
  {
    id: 'art-8',
    title: "크레센도 매치 커스텀 프로필 모음",
    author: "대쉬",
    imageUrl: "art8.png",
    description: "크레센도 매치에 쓰인 커스텀 프로필 모음입니다.",
    date: "2026.05.10"
  },
  {
    id: 'art-9',
    title: "크레센도 매치 우승 축하함미다",
    author: "007",
    imageUrl: "art9.png",
    description: "후덜덜해보여서 후덜덜하게 했습니다 추카추카합니다~~",
    date: "2026.05.11"
  },
  {
    id: 'art-11',
    title: "윈친카 무투대회 후기- 1",
    author: "핵토파스칼킥",
    imageUrl: "art11.png",
    description: "안녕하세요 핵토파스칼킥 입니다.\n무투대회 후기 만화를 그려봤어요! ㅋㅋ 이런 구도 많이 나왔죠?\n답답하셨을 분들도 있을거고 승리를 위해서\n충분히 그럴 수도 있다고 생각하시는 분들도 계시거든요!\n만화를 통해서 해소? 가 좀 되었으면 해서 그려봤습니다.\n이후에 무투대회 썰? 만화가 짧게 1~2편 정도 준비가 되어있으니\n재밌게 봐주시면 감사드리겠습니다!",
    date: "2026.05.11"
  },
  {
    id: 'art-12',
    title: "윈친카 무투대회 후기2",
    author: "핵토파스칼킥",
    imageUrl: "art12.png",
    description: "안녕하세요 핵토파스칼킥 입니다! ㅋㅋ 사실 만화랑은 전혀 다르게 진실님이랑.대쉬님 그리고 루나님이 많은 도움을 주셨답니다? ㅎㅎ 대회 준비하는데 아조씨들끼리 \"이거 어떻게 하는거냐?\" 이러고 있는게 그림이 재밌었거든요! ㅋㅋㅋㅋㅋㅋ 앞으로도 무투대회 많은 사랑 바랍니다! 만화도 재밌게 봐주셔서 항상 감사해요!",
    date: "2026.05.17"
  },
  {
    id: 'art-13',
    title: "크레센도 매치 우승 축전",
    author: "효륵사마",
    imageUrl: "art13.png",
    description: "어느덧 3회네욥!!!!!! 늘 멋진 경기 보여주신 선수분들 너무 감사합니다. 우승 너무 축하드립니다!!!",
    date: "2026.05.19"
  }
];
