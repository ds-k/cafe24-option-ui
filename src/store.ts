import { cafe24Sync } from "./cafe24Sync";
import { type OptionConfig } from "./config";

export interface FlavorSelection {
  [flavorId: string]: number; // flavorId -> quantity (개수)
}

export interface CartItem {
  id: string; // 고유 ID
  optionId: string; // "10개입"
  optionName: string; // "10개입"
  price: number;
  flavors: { name: string; quantity: number }[];
  quantity: number; // 장바구니 아이템의 수량
}

export interface AppState {
  selectedOption: OptionConfig | null;
  flavorSelections: FlavorSelection;
  totalSelectedCount: number;
  optionLimits: { [optionId: string]: number };
  cartItems: CartItem[];
}

type Listener = (state: AppState) => void;

class Store {
  private state: AppState = {
    selectedOption: null,
    flavorSelections: {},
    totalSelectedCount: 0,
    optionLimits: {},
    cartItems: [],
  };
  private listeners: Listener[] = [];

  getState(): AppState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // 특정 옵션의 전체 수량을 계산
  public getTotalQuantityForOption(optionId: string): number {
    return this.state.cartItems
      .filter((item) => item.optionId === optionId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  // Cafe24 DOM 파싱 후 횟수 한도 초기화
  setOptionLimits(limits: { [optionId: string]: number }) {
    this.state = {
      ...this.state,
      optionLimits: limits,
    };
    this.notify();
  }

  // 메인 옵션 선택
  selectOption(option: OptionConfig) {
    const limit = this.state.optionLimits[option.id] || 0;
    const currentTotal = this.getTotalQuantityForOption(option.id);

    // limit이 0보다 큰데 이미 한도에 도달했다면 차단
    if (limit > 0 && currentTotal >= limit) {
      return;
    }

    if (this.state.selectedOption?.id === option.id) return;

    this.state = {
      ...this.state,
      selectedOption: option,
      flavorSelections: {},
      totalSelectedCount: 0,
    };
    this.notify();
  }

  // 맛 수량 변경
  setFlavorQuantity(flavorId: string, quantity: number) {
    if (!this.state.selectedOption) return;
    if (quantity < 0) quantity = 0;

    const targetCount = Math.floor(this.state.selectedOption.count / 10);
    const currentCount = this.state.totalSelectedCount;
    const currentQuantity = this.state.flavorSelections[flavorId] || 0;
    const diff = quantity - currentQuantity;

    if (currentCount + diff > targetCount) {
      return;
    }

    this.state = {
      ...this.state,
      flavorSelections: {
        ...this.state.flavorSelections,
        [flavorId]: quantity,
      },
      totalSelectedCount: currentCount + diff,
    };
    this.notify();
  }

  // 동기화 헬퍼 메서드: 이전 총수량의 옵션을 삭제하고 새로운 총수량의 옵션을 클릭
  private syncToCafe24(optionId: string, oldTotal: number, newTotal: number) {
    if (oldTotal === newTotal) return;

    // 1. 기존에 선택되어 있던 Cafe24 옵션 삭제
    if (oldTotal > 0) {
      cafe24Sync.deleteItem(optionId, oldTotal);
    }

    // 2. 새 수량에 맞는 Cafe24 옵션 클릭 (_1, _2 등)
    if (newTotal > 0) {
      cafe24Sync.triggerCafe24Click(optionId, newTotal);
    }
  }

  // 선택 완료 처리
  completeSelection(flavorsList: { name: string; quantity: number }[]) {
    if (!this.state.selectedOption) return;

    const option = this.state.selectedOption;
    const optionId = option.id;

    const limit = this.state.optionLimits[optionId] || 0;
    const oldTotal = this.getTotalQuantityForOption(optionId);
    const newTotal = oldTotal + 1;

    if (limit > 0 && newTotal > limit) return; // 한도 초과

    // 상태 변경에 따른 Cafe24 원본 DOM 동기화
    this.syncToCafe24(optionId, oldTotal, newTotal);

    const newItem: CartItem = {
      id: `${optionId}_${Date.now()}`,
      optionId: optionId,
      optionName: option.name,
      price: option.price,
      flavors: flavorsList,
      quantity: 1,
    };

    this.state = {
      ...this.state,
      cartItems: [...this.state.cartItems, newItem],
      selectedOption: null,
      flavorSelections: {},
      totalSelectedCount: 0,
    };
    this.notify();
  }

  // 장바구니 아이템 수량 변경 (+/-)
  updateCartItemQuantity(id: string, delta: number) {
    const item = this.state.cartItems.find((i) => i.id === id);
    if (!item) return;

    const optionId = item.optionId;
    const limit = this.state.optionLimits[optionId] || 0;
    const oldTotal = this.getTotalQuantityForOption(optionId);
    const newTotal = oldTotal + delta;

    if (delta > 0 && limit > 0 && newTotal > limit) return; // 증가 시 한도 체크
    if (newTotal < 1) return; // 최소 1개는 유지해야 함 (0은 삭제 X 버튼 사용)

    // Cafe24 동기화
    this.syncToCafe24(optionId, oldTotal, newTotal);

    this.state = {
      ...this.state,
      cartItems: this.state.cartItems.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + delta } : i,
      ),
    };
    this.notify();
  }

  // 장바구니 아이템 삭제 (X 버튼)
  removeCartItem(id: string) {
    const itemToDelete = this.state.cartItems.find((item) => item.id === id);
    if (!itemToDelete) return;

    const optionId = itemToDelete.optionId;
    const oldTotal = this.getTotalQuantityForOption(optionId);
    const newTotal = oldTotal - itemToDelete.quantity;

    // Cafe24 동기화
    this.syncToCafe24(optionId, oldTotal, newTotal);

    this.state = {
      ...this.state,
      cartItems: this.state.cartItems.filter((item) => item.id !== id),
    };
    this.notify();
  }

  // 선택 상태 초기화
  resetSelection() {
    this.state = {
      ...this.state,
      selectedOption: null,
      flavorSelections: {},
      totalSelectedCount: 0,
    };
    this.notify();
  }
}

export const store = new Store();
