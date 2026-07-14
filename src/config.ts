export interface OptionConfig {
  id: string; // 식별자
  name: string; // 화면에 표시할 이름
  price: number; // 판매가
  originalPrice?: number; // 정가
  discountRate?: number; // 할인율 표시
  unitPriceText?: string; // 개당 가격 표시
  badge?: string; // 뱃지 문구
  badgeType?: "orange" | "red" | "none"; // 뱃지 색상/스타일 타입
  count: number; // 선택해야 하는 총 수량 (예: 10, 30, 50, 100)
}

export interface FlavorConfig {
  id: string;
  name: string; // 예: 떡볶이맛(10개입)
  calories: number; // 예: 130
  protein: number; // 예: 18
  imageUrl: string; // 썸네일 이미지 URL
  isNew?: boolean; // 신제품 표시 여부
  isSoldOut?: boolean; // 품절 여부
}

export const OPTIONS_DATA: OptionConfig[] = [
  {
    id: "10개입",
    name: "10개입",
    price: 24700,
    discountRate: 25,
    unitPriceText: "1개 : 2,470원",
    count: 10,
  },
  {
    id: "30개입",
    name: "30개입",
    price: 70500,
    discountRate: 29,
    unitPriceText: "1개 : 2,350원",
    badge: "가장 많이 사요",
    badgeType: "orange",
    count: 30,
  },
  {
    id: "50개입",
    name: "50개입",
    price: 111500,
    discountRate: 32,
    unitPriceText: "1개 : 2,230원",
    count: 50,
  },
  {
    id: "100개입",
    name: "100개입",
    price: 196000,
    discountRate: 41,
    unitPriceText: "1개 : 1,960원",
    badge: "최대할인",
    badgeType: "red",
    count: 100,
  },
];

import tteokImg from './assets/images/tteok.png';
import curryImg from './assets/images/curry.png';
import hotImg from './assets/images/chicken.png';
import chipotleImg from './assets/images/mayo.png';
import honeyImg from './assets/images/honey.png';

export const FLAVORS_DATA: FlavorConfig[] = [
  {
    id: "flavor-1",
    name: "떡볶이맛(10개입)",
    calories: 130,
    protein: 18,
    imageUrl: tteokImg,
    isNew: true,
  },
  {
    id: "flavor-2",
    name: "버터치킨커리맛(10개입)",
    calories: 105,
    protein: 18,
    imageUrl: curryImg,
    isSoldOut: true,
  },
  {
    id: "flavor-3",
    name: "핫양념치킨맛(10개입)",
    calories: 125,
    protein: 19,
    imageUrl: hotImg,
  },
  {
    id: "flavor-4",
    name: "치폴레마요맛(10개입)",
    calories: 125,
    protein: 18,
    imageUrl: chipotleImg,
  },
  {
    id: "flavor-5",
    name: "허니소이맛(10개입)",
    calories: 125,
    protein: 18,
    imageUrl: honeyImg,
  }
];
