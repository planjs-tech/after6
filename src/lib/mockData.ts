export type CompanyStatus = "VERIFIED" | "FORMER_EMPLOYEE" | "EXPIRED";

export interface MatchProfile {
  id: string;
  nickname: string;
  age: number;
  gender: "M" | "F";
  companyName: string;
  companyType: "대기업/중견" | "IT/게임" | "스타트업" | "바이오/연구";
  companyStatus: CompanyStatus;
  jobRole: string;
  mannerTemp: number;
  distanceKm: number;
  bio: string;
  interests: string[];
  avatarColor: string;
  avatarEmoji: string;
}

export interface Venue {
  id: string;
  name: string;
  area: "판교역" | "삼평동" | "백현동";
  location: string;
  capacity: number;
  eventPrice: number;
  isAdBoosted: boolean;
  isNewBoost?: boolean;
  rating: number;
  tags: string[];
  /** 예약 가능한 날짜|시간 슬롯 목록 (실제 DB에서는 availability_slots 테이블) */
  availableSlots: string[];
}

export interface CateringOption {
  id: string;
  name: string;
  provider: string;
  pricePerPerson: number;
  description: string;
}

export interface EventConditions {
  requireCurrentEmployee: boolean;
  minAge: number;
  maxAge: number;
  minMannerTemp: number;
}

export interface GroupEvent {
  id: string;
  title: string;
  theme: "로테이션 소개팅" | "와인 미팅" | "보드게임" | "IT 네트워킹";
  dateValue: string; // YYYY-MM-DD
  dateText: string;
  timeSlot: "19:30 ~ 21:30" | "15:00 ~ 17:00" | "18:30 ~ 20:30";
  daysLeft: number; // 아고다식 차등 환불 계산용 D-Day
  venue: Venue;
  catering: CateringOption | null;
  hostName: string;
  hostCompany: string;
  hostGrade: "일반 호스트" | "우수 호스트" | "슈퍼 호스트";
  hostTemp: number;
  isMyHosted?: boolean;
  maleCount: number;
  maleCapacity: number;
  femaleCount: number;
  femaleCapacity: number;
  conditions: EventConditions;
  ticketPrice: number;
  breakdown: {
    venuePerPerson: number;
    cateringPerPerson: number;
    hostFee: number;
    platformFee: number;
  };
  participantCompanies: string[];
  avgMannerTemp: number;
  status: "RECRUITING" | "CONFIRMED" | "IN_PROGRESS" | "DISSOLVED";
}

export interface ChatRoom {
  id: string;
  partnerName: string;
  partnerCompany: string;
  partnerStatus: CompanyStatus;
  partnerEmoji: string;
  sourceLabel: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: {
    id: string;
    sender: "me" | "partner" | "system";
    text: string;
    time: string;
  }[];
}

export const REFUND_TIERS = [
  { label: "모임 7일 전 이상", rate: 100, note: "전액 무료 취소 (아고다 무료취소형)" },
  { label: "모임 3일 ~ 6일 전", rate: 70, note: "장소 예약 위약금 30% 공제" },
  { label: "모임 1일 ~ 2일 전", rate: 50, note: "대체 인원 충원 및 식음료 준비 비용" },
  { label: "모임 당일 취소 / 노쇼", rate: 0, note: "환불 불가 + 매너온도 -2.0°C 차감" },
];

export function calculateRefund(ticketPrice: number, daysLeft: number) {
  if (daysLeft >= 7) return { rate: 100, amount: ticketPrice, penaltyTemp: 0 };
  if (daysLeft >= 3)
    return { rate: 70, amount: Math.round(ticketPrice * 0.7), penaltyTemp: 0 };
  if (daysLeft >= 1)
    return { rate: 50, amount: Math.round(ticketPrice * 0.5), penaltyTemp: 0 };
  return { rate: 0, amount: 0, penaltyTemp: -2.0 };
}

export const MOCK_PROFILES: MatchProfile[] = [
  {
    id: "p1",
    nickname: "지우",
    age: 29,
    gender: "F",
    companyName: "네이버",
    companyType: "IT/게임",
    companyStatus: "VERIFIED",
    jobRole: "프로덕트 디자이너",
    mannerTemp: 38.4,
    distanceKm: 0.6,
    bio: "판교역 근처에서 근무하고 있어요. 퇴근 후 맛있는 파스타나 와인 한 잔 하면서 소소한 이야기 나누는 걸 좋아합니다.",
    interests: ["전시회", "와인", "필라테스", "브런치"],
    avatarColor: "from-rose-400 to-orange-300",
    avatarEmoji: "🦊",
  },
  {
    id: "p2",
    nickname: "서준",
    age: 31,
    gender: "M",
    companyName: "카카오",
    companyType: "IT/게임",
    companyStatus: "VERIFIED",
    jobRole: "백엔드 엔지니어",
    mannerTemp: 39.1,
    distanceKm: 0.9,
    bio: "일할 땐 집중하고 주말엔 탄천 러닝이나 보드게임 모임 자주 나갑니다. 대화가 잘 통하는 분을 만나고 싶어요.",
    interests: ["러닝", "보드게임", "스페셜티 커피", "여행"],
    avatarColor: "from-indigo-500 to-sky-400",
    avatarEmoji: "🐻",
  },
  {
    id: "p3",
    nickname: "하은",
    age: 27,
    gender: "F",
    companyName: "비바리퍼블리카(토스)",
    companyType: "스타트업",
    companyStatus: "FORMER_EMPLOYEE",
    jobRole: "서비스 기획자",
    mannerTemp: 37.6,
    distanceKm: 1.2,
    bio: "잠시 쉬면서 이직 준비 중이라 전 직장으로 표시돼요 :) 판교 라운지에서 열리는 로테이션 모임도 가끔 참여합니다!",
    interests: ["독서", "테니스", "재즈바", "사진"],
    avatarColor: "from-emerald-400 to-teal-500",
    avatarEmoji: "🐰",
  },
  {
    id: "p4",
    nickname: "민재",
    age: 32,
    gender: "M",
    companyName: "넥슨코리아",
    companyType: "IT/게임",
    companyStatus: "VERIFIED",
    jobRole: "게임 클라이언트 개발",
    mannerTemp: 38.0,
    distanceKm: 1.4,
    bio: "판교 제1테크노밸리 근무 중입니다. 진지하게 알아갈 수 있는 분 찾고 있어요. 1:1도 좋고 4:4 모임도 환영입니다!",
    interests: ["맛집탐방", "영화", "드라이브", "고양이"],
    avatarColor: "from-violet-500 to-purple-400",
    avatarEmoji: "🦁",
  },
];

export const MOCK_VENUES: Venue[] = [
  {
    id: "v1",
    name: "라운지 판교 아지트",
    area: "판교역",
    location: "판교역 1번 출구 도보 4분",
    capacity: 20,
    eventPrice: 240000,
    isAdBoosted: true,
    rating: 4.9,
    tags: ["프라이빗 룸", "조명 맛집", "음향 완비"],
    availableSlots: [
      "2026-12-04|19:30 ~ 21:30",
      "2026-12-05|15:00 ~ 17:00",
      "2026-12-05|19:30 ~ 21:30",
      "2026-12-06|15:00 ~ 17:00",
    ],
  },
  {
    id: "v2",
    name: "테이블634 와인바",
    area: "판교역",
    location: "알파돔시티 라스트리트 2층",
    capacity: 16,
    eventPrice: 200000,
    isAdBoosted: true,
    isNewBoost: true,
    rating: 4.8,
    tags: ["NEW 입점", "와인 콜키지", "분위기"],
    availableSlots: [
      "2026-12-04|19:30 ~ 21:30",
      "2026-12-05|19:30 ~ 21:30",
    ],
  },
  {
    id: "v3",
    name: "삼평동 보드 & 커피 스튜디오",
    area: "삼평동",
    location: "삼평동 유스페이스2 인근",
    capacity: 12,
    eventPrice: 120000,
    isAdBoosted: false,
    rating: 4.7,
    tags: ["가성비", "보드게임 구비", "소규모"],
    availableSlots: [
      "2026-12-05|15:00 ~ 17:00",
      "2026-12-06|15:00 ~ 17:00",
      "2026-12-06|18:30 ~ 20:30",
    ],
  },
  {
    id: "v4",
    name: "백현동 카페거리 프라이빗 룸",
    area: "백현동",
    location: "백현동 카페거리 도보 3분",
    capacity: 14,
    eventPrice: 160000,
    isAdBoosted: false,
    rating: 4.8,
    tags: ["조용한 분위기", "주차 가능"],
    availableSlots: [
      "2026-12-04|18:30 ~ 20:30",
      "2026-12-05|15:00 ~ 17:00",
      "2026-12-06|18:30 ~ 20:30",
    ],
  },
];

export const MOCK_CATERINGS: CateringOption[] = [
  {
    id: "c1",
    name: "핑거푸드 & 논알콜 스파클링 세트",
    provider: "판교 델리 키친",
    pricePerPerson: 12000,
    description: "카나페 4종, 과일 컵, 스파클링 에이드 1인 1병",
  },
  {
    id: "c2",
    name: "와인 페어링 치즈 플래터",
    provider: "테이블634 케이터링",
    pricePerPerson: 18000,
    description: "브리치즈, 하몽, 크래커, 올리브 & 하우스 와인 2잔",
  },
];

export const MOCK_EVENTS: GroupEvent[] = [
  {
    id: "e1",
    title: "금요일 퇴근 후 판교 6:6 로테이션 와인 미팅",
    theme: "와인 미팅",
    dateValue: "2026-12-04",
    dateText: "12월 4일 (금)",
    timeSlot: "19:30 ~ 21:30",
    daysLeft: 8,
    venue: MOCK_VENUES[0],
    catering: MOCK_CATERINGS[1],
    hostName: "호스트 제이",
    hostCompany: "카카오",
    hostGrade: "슈퍼 호스트",
    hostTemp: 41.2,
    maleCount: 5,
    maleCapacity: 6,
    femaleCount: 5,
    femaleCapacity: 6,
    conditions: {
      requireCurrentEmployee: true,
      minAge: 26,
      maxAge: 35,
      minMannerTemp: 36.5,
    },
    ticketPrice: 53000,
    breakdown: {
      venuePerPerson: 20000,
      cateringPerPerson: 18000,
      hostFee: 9000,
      platformFee: 6000,
    },
    participantCompanies: ["네이버", "카카오", "넥슨", "라인", "스타트업"],
    avgMannerTemp: 38.2,
    status: "RECRUITING",
  },
  {
    id: "e2",
    title: "토요일 오후 가볍게 즐기는 4:4 보드게임 소개팅",
    theme: "보드게임",
    dateValue: "2026-12-05",
    dateText: "12월 5일 (토)",
    timeSlot: "15:00 ~ 17:00",
    daysLeft: 2,
    venue: MOCK_VENUES[2],
    catering: MOCK_CATERINGS[0],
    hostName: "호스트 민트",
    hostCompany: "SK C&C",
    hostGrade: "우수 호스트",
    hostTemp: 39.5,
    maleCount: 3,
    maleCapacity: 4,
    femaleCount: 4,
    femaleCapacity: 4,
    conditions: {
      requireCurrentEmployee: false,
      minAge: 25,
      maxAge: 34,
      minMannerTemp: 36.0,
    },
    ticketPrice: 39000,
    breakdown: {
      venuePerPerson: 15000,
      cateringPerPerson: 12000,
      hostFee: 7000,
      platformFee: 5000,
    },
    participantCompanies: ["SK", "한컴", "판교 스타트업"],
    avgMannerTemp: 37.8,
    status: "RECRUITING",
  },
  {
    id: "e3",
    title: "판교 IT 직군 퇴근길 5:5 스피드 데이팅 (진행 중 데모)",
    theme: "로테이션 소개팅",
    dateValue: "2026-11-26",
    dateText: "오늘 (목)",
    timeSlot: "19:30 ~ 21:30",
    daysLeft: 0,
    venue: MOCK_VENUES[1],
    catering: null,
    hostName: "호스트 루카스",
    hostCompany: "네이버",
    hostGrade: "우수 호스트",
    hostTemp: 39.8,
    maleCount: 5,
    maleCapacity: 5,
    femaleCount: 5,
    femaleCapacity: 5,
    conditions: {
      requireCurrentEmployee: true,
      minAge: 27,
      maxAge: 36,
      minMannerTemp: 37.0,
    },
    ticketPrice: 35000,
    breakdown: {
      venuePerPerson: 20000,
      cateringPerPerson: 0,
      hostFee: 10000,
      platformFee: 5000,
    },
    participantCompanies: ["네이버", "카카오", "엔씨소프트", "토스"],
    avgMannerTemp: 38.6,
    status: "IN_PROGRESS",
  },
];

export const MOCK_CHATS: ChatRoom[] = [
  {
    id: "c1",
    partnerName: "지우",
    partnerCompany: "네이버",
    partnerStatus: "VERIFIED",
    partnerEmoji: "🦊",
    sourceLabel: "1:1 매칭",
    lastMessage: "판교역 근처면 퇴근하고 7시쯤 어떠세요?",
    lastTime: "오후 4:12",
    unread: 1,
    messages: [
      {
        id: "m1",
        sender: "system",
        text: "서로 호감을 표시해 1:1 매칭이 성사되었습니다. 매너 있는 대화를 시작해 보세요!",
        time: "오후 3:40",
      },
      {
        id: "m2",
        sender: "me",
        text: "안녕하세요 지우님! 저도 판교 제1테크노밸리 쪽에서 일하고 있어요 :)",
        time: "오후 3:55",
      },
      {
        id: "m3",
        sender: "partner",
        text: "반가워요! 판교역 근처면 퇴근하고 7시쯤 어떠세요?",
        time: "오후 4:12",
      },
    ],
  },
  {
    id: "c2",
    partnerName: "민재",
    partnerCompany: "넥슨코리아",
    partnerStatus: "VERIFIED",
    partnerEmoji: "🦁",
    sourceLabel: "금요일 와인 미팅 상호선택",
    lastMessage: "어제 모임에서 이야기 너무 즐거웠습니다!",
    lastTime: "어제",
    unread: 0,
    messages: [
      {
        id: "m4",
        sender: "system",
        text: "단체 로테이션 모임에서 서로를 호감 상대로 선택하여 채팅방이 열렸습니다.",
        time: "어제",
      },
      {
        id: "m5",
        sender: "partner",
        text: "어제 모임에서 이야기 너무 즐거웠습니다!",
        time: "어제",
      },
    ],
  },
];
