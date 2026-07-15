import { FLAVORS_DATA } from "../config";
import { store } from "../store";


export class FlavorPanel {
  private element: HTMLElement;

  constructor() {
    this.element = this.createElement();
    this.bindEvents();

    store.subscribe((state) => {
      this.render(state);
    });
  }

  private createElement(): HTMLElement {
    const div = document.createElement("div");
    div.className = "flavor-panel";
    div.style.display = "none";
    return div;
  }

  private bindEvents() {
    this.element.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      
      // 수량 증가 버튼 클릭
      const plusBtn = target.closest(".flavor-qty-plus");
      if (plusBtn) {
        const flavorId = plusBtn.getAttribute("data-id");
        if (flavorId) {
          const currentQty = store.getState().flavorSelections[flavorId] || 0;
          store.setFlavorQuantity(flavorId, currentQty + 1);
        }
      }

      // 수량 감소 버튼 클릭
      const minusBtn = target.closest(".flavor-qty-minus");
      if (minusBtn) {
        const flavorId = minusBtn.getAttribute("data-id");
        if (flavorId) {
          const currentQty = store.getState().flavorSelections[flavorId] || 0;
          if (currentQty > 0) {
            store.setFlavorQuantity(flavorId, currentQty - 1);
          }
        }
      }

      // 닫기 버튼 클릭
      const closeBtn = target.closest(".flavor-close-btn");
      if (closeBtn) {
        store.resetSelection();
      }

      // 선택완료 버튼 클릭
      const completeBtn = target.closest(".flavor-complete-btn");
      if (completeBtn && !completeBtn.hasAttribute("disabled")) {
        const state = store.getState();
        if (state.selectedOption) {
          // 맛 리스트 구성
          const flavorsList = Object.entries(state.flavorSelections)
            .filter(([_, qty]) => qty > 0)
            .map(([flavorId, qty]) => {
              const flavor = FLAVORS_DATA.find(f => f.id === flavorId);
              return { name: flavor ? flavor.name : flavorId, quantity: qty };
            });
            
          // 1. 상태 완료 처리 및 Cafe24 DOM 동기화
          store.completeSelection(flavorsList);
          
          // 3. 토스트 알림 띄우기
          window.dispatchEvent(new CustomEvent("show-toast", {
            detail: { message: "선택한 상품이 추가되었습니다.", type: "success" }
          }));
        }
      }
    });
  }

  private render(state: ReturnType<typeof store.getState>) {
    if (!state.selectedOption) {
      this.element.style.display = "none";
      return;
    }

    this.element.style.display = "flex";

    // 맛 리스트 아이템이 10개입이므로 목표 수량은 / 10
    const targetCount = Math.floor(state.selectedOption.count / 10);
    const currentCount = state.totalSelectedCount;
    const remainingCount = targetCount - currentCount;
    
    // UI 표시용 총 수량 (1개 선택 시 10개)
    const targetDisplayCount = targetCount * 10;
    const currentDisplayCount = currentCount * 10;
    const remainingDisplayCount = remainingCount * 10;

    let tooltipHTML = "";
    if (remainingCount > 0) {
      tooltipHTML = `
        <div class="flavor-tooltip">
          현재 ${currentDisplayCount}개 선택됨 · <span style="color: #FF692E;">옵션을 ${remainingDisplayCount}개 더 선택해 주세요</span>
        </div>
      `;
    }

    const flavorsHTML = FLAVORS_DATA.map((flavor) => {
      const qty = state.flavorSelections[flavor.id] || 0;
      
      let newTextHTML = "";
      if (flavor.isNew) {
        newTextHTML = `<div class="flavor-new-text">신제품 출시!</div>`;
      }

      let soldOutOverlay = "";
      if (flavor.isSoldOut) {
        soldOutOverlay = `<div class="flavor-soldout-overlay">품절</div>`;
      }

      return `
        <div class="flavor-item ${flavor.isSoldOut ? "sold-out" : ""}">
          <div class="flavor-img-wrapper">
            <img src="${flavor.imageUrl}" class="flavor-img" />
            ${soldOutOverlay}
          </div>
          <div class="flavor-info">
            ${newTextHTML}
            <div class="flavor-name">${flavor.name}</div>
            <div class="flavor-desc">${flavor.calories}kcal, 단백질 ${flavor.protein}g</div>
          </div>
          <div class="flavor-qty-ctrl">
            <button class="flavor-qty-btn flavor-qty-minus" data-id="${flavor.id}" ${qty <= 0 || flavor.isSoldOut ? "disabled" : ""}>−</button>
            <span class="flavor-qty-num">${qty}</span>
            <button class="flavor-qty-btn flavor-qty-plus" data-id="${flavor.id}" ${remainingCount <= 0 || flavor.isSoldOut ? "disabled" : ""}>+</button>
          </div>
        </div>
      `;
    }).join("");

    const isCompleteActive = currentCount === targetCount;

    this.element.innerHTML = `
      <div class="custom-option-header" style="margin-bottom: 20px; width: 100%;">
        <span>${state.selectedOption.name} 맛 선택</span>
        <div class="flavor-close-btn" style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; margin-right: -8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="#777777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      
      <div class="flavor-list">
        ${flavorsHTML}
      </div>

      <div class="flavor-panel-footer">
        <div class="flavor-total-area">
          <span class="flavor-total-label">총 수량</span>
          <div class="flavor-total-value-wrapper">
            ${tooltipHTML}
            <span class="flavor-total-value" style="color: ${remainingCount > 0 ? '#FF692E' : '#FF692E'}; font-weight: 700;">
              (${currentDisplayCount}/${targetDisplayCount}개)
            </span>
          </div>
        </div>
        
        <button class="flavor-complete-btn ${isCompleteActive ? 'active' : ''}" ${!isCompleteActive ? 'disabled' : ''}>
          선택완료
        </button>
      </div>
    `;
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}
