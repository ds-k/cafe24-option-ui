import { type OptionConfig } from "../config";
import { store } from "../store";

/**
 * OptionCard 클래스는 개별 '10개입', '30개입' 등의 메인 옵션 카드를 렌더링하고 관리합니다.
 */
export class OptionCard {
  private element: HTMLElement;
  private option: OptionConfig;

  constructor(option: OptionConfig) {
    this.option = option;
    this.element = this.createElement();
    this.bindEvents();

    // Store를 구독하여 전역 상태(선택된 옵션)가 변경될 때마다 UI 업데이트
    store.subscribe((state) => {
      this.render(state);
    });
  }

  private render(state: ReturnType<typeof store.getState>) {
    const isSelected = state.selectedOption?.id === this.option.id;
    const limit = state.optionLimits[this.option.id] || 0;
    const usedCount = store.getTotalQuantityForOption(this.option.id);
    
    // limit이 설정되어 있고 한도에 도달한 경우 비활성화
    const isDisabled = limit > 0 && usedCount >= limit;

    // 선택 상태에 따라 클래스 토글
    if (isSelected) {
      this.element.classList.add("is-selected");
    } else {
      this.element.classList.remove("is-selected");
    }

    if (isDisabled) {
      this.element.classList.add("is-disabled");
      this.element.style.opacity = "0.4";
      this.element.style.pointerEvents = "none";
    } else {
      this.element.classList.remove("is-disabled");
      this.element.style.opacity = "1";
      this.element.style.pointerEvents = "auto";
    }
  }

  private createElement(): HTMLElement {
    const div = document.createElement("div");
    div.className = "custom-option-card";
    div.id = `option-card-${this.option.id}`;

    const priceFormatted = this.option.price.toLocaleString() + "원";
    
    let discountHTML = "";
    if (this.option.discountRate) {
      discountHTML = `<span class="card-discount">(${this.option.discountRate}% 할인)</span>`;
    }
    
    let badgeHTML = "";
    if (this.option.badge) {
      const badgeClass = this.option.badgeType === "orange" ? "badge-orange" : "badge-red";
      badgeHTML = `<span class="card-badge ${badgeClass}">${this.option.badge}</span>`;
    }

    div.innerHTML = `
      <div class="card-content">
        <div class="card-left">
          <div class="card-radio-wrapper">
            <div class="card-radio"></div>
          </div>
          <span class="card-name">${this.option.name}</span>
        </div>
        <div class="card-right">
          <div class="card-price-info">
            <div class="card-price-row">
              <span class="card-price">${priceFormatted}</span>
              ${discountHTML}
              ${badgeHTML}
            </div>
            ${this.option.unitPriceText ? `<div class="card-unit-price">${this.option.unitPriceText}</div>` : ""}
          </div>
        </div>
      </div>
    `;
    return div;
  }

  private bindEvents() {
    // 카드 클릭 시 Store에 선택 액션 전달
    this.element.addEventListener("click", () => {
      store.selectOption(this.option);
    });
  }



  // DOM 요소 반환
  public getElement(): HTMLElement {
    return this.element;
  }
}
