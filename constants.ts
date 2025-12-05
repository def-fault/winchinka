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
// [대회 정보 통합]
// ==========================================
export const TOURNAMENTS: Tournament[] = [
  {
    id: 'season-3',
    season: '3',
    title: "제3회 윈친카 무투대회",
    subtitle: "크레센도 매치",
    status: 'upcoming',
    date: "2026년 예정",
    posterUrl: resolvePublicAsset('season3.png'),
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
    status: 'completed',
    date: "2025년 11월 29일 ~ 2025년 11월 30일",
    posterUrl: resolvePublicAsset('season2.png'),
    format: "무작위맵 3:3 팀전",
    prizePool: "100만원",
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
      "https://www.youtube.com/watch?v=JrtispzIs6Q"
    ],
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
    prizePool: "18만원 + 소정의 상품",
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
      { name: "루비 (노바스텔라)" },
      { name: "DOS (놀이터)" },
      { name: "우나 (윈친카)" }
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
    prizePool: "18만원 + 소정의 상품",
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
      { name: "루비 (노바스텔라)" },
      { name: "DOS (놀이터)" },
      { name: "우나 (윈친카)" }
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
  { name: "루비", title: "노바스텔라", imageUrl: getAvatarUrl("루비") },
  { name: "우나", title: "윈친카", imageUrl: getAvatarUrl("우나") },
  { name: "DOS", title: "놀이터", imageUrl: getAvatarUrl("DOS") },
  { name: "진실", title: "투신", imageUrl: getAvatarUrl("진실") },
  { name: "세라핀", title: "투신", imageUrl: getAvatarUrl("세라핀") },
  { name: "효륵사마", title: "투신", imageUrl: getAvatarUrl("효륵") },
  { name: "거북", title: "우주", imageUrl: getAvatarUrl("거북") },
  { name: "별", title: "우주", imageUrl: getAvatarUrl("별") },
  { name: "카모", title: "투신", imageUrl: getAvatarUrl("카모") },
  { name: "틀랩퍼", title: "투신", imageUrl: getAvatarUrl("틀랩") },
  { name: "원탑", title: "우주", imageUrl: getAvatarUrl("원탑") },
  { name: "융하", title: "F E E L 、", imageUrl: getAvatarUrl("융하") },
  { name: "Sia", title: "투신", imageUrl: getAvatarUrl("Sia") }
];

export const STAFF_MEMBERS: StaffMember[] = [
  { name: "대쉬", role: "총괄 기획 / 기술 담당", imageUrl: getAvatarUrl("대쉬") },
  { name: "루나", role: "대회 중계 / 방송 담당", imageUrl: getAvatarUrl("루나") },
  { name: "우나", role: "커뮤니티 매니저 / 운영 지원", imageUrl: getAvatarUrl("우나") },
  { name: "빡스냥", role: "[최강의 듀오] 1차 해설진", imageUrl: getAvatarUrl("빡스") },
  { name: "진실", role: "[최강의 듀오] 2차 해설진", imageUrl: getAvatarUrl("진실") },
  { name: "원탑 ", role: "[트리플 아레나] 해설진", imageUrl: getAvatarUrl("원탑 ") },
  { name: "복숭아", role: "소통 담당", imageUrl: getAvatarUrl("복숭") },
  { name: "칠지도", role: "보조 지원", imageUrl: getAvatarUrl("칠지") },
  { name: "유미캣", role: "보조 지원", imageUrl: getAvatarUrl("유미") },
  { name: "성녀", role: "보조 지원", imageUrl: getAvatarUrl("성녀") }
];

export const BGM_PLAYLIST: BGMTrack[] = [
  { title: "포폴라", url: resolvePublicAsset('bgm1.mp3') },
  { title: "오행산", url: resolvePublicAsset('bgm2.mp3') },
  { title: "발데란", url: resolvePublicAsset('bgm3.mp3') },
  { title: "아마쿠사", url: resolvePublicAsset('bgm4.mp3') },
  { title: "세렌초원", url: resolvePublicAsset('bgm5.mp3') },
  { title: "세리엔", url: resolvePublicAsset('bgm6.mp3') }
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
  }
];

export const GEMINI_SYSTEM_INSTRUCTION = `
당신은 '윈드슬레이어' 게임의 커뮤니티 '윈친카'의 마스코트 캐릭터 '구리구리'입니다.
사용자의 질문에 대해 친근하고 장난스러운 반말을 사용해야 합니다.
가장 중요한 규칙은 문장의 끝마다 반드시 '~구리'라는 어미를 붙이는 것입니다. (예: 안녕구리! 그건 100만원이구리!)
대회 데이터(TOURNAMENTS)를 기반으로 역대 우승자, 규칙, 상금 등에 대해 안내해주세요.
모르는 정보는 지어내지 말고 "그건 아직 잘 모르겠구리..."라고 답하세요.
`;