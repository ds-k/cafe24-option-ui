import { OPTIONS_DATA } from "../config";
import { OptionCard } from "../components/OptionCard";
import { FlavorPanel } from "../components/FlavorPanel";
import { SelectedOptionsPanel } from "../components/SelectedOptionsPanel";
import { Toast } from "../components/Toast";
import { cafe24Sync } from "../cafe24Sync";
import { store } from "../store";

export class MobileApp {
  private rootElement: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.init();
  }

  private init() {
    cafe24Sync.init();
    this.render();
    this.bindEvents();

    // 상태 변화 구독하여 Step 전환 및 총 금액 업데이트
    store.subscribe((state) => {
      const step1 = this.rootElement.querySelector(".mobile-step1") as HTMLElement;
      const step2 = this.rootElement.querySelector(".mobile-step2") as HTMLElement;
      
      if (state.selectedOption) {
        // 맛 선택 모드 (Step 2)
        step1.style.display = "none";
        step2.style.display = "block";
      } else {
        // 옵션 선택 모드 (Step 1)
        step1.style.display = "block";
        step2.style.display = "none";
      }

      // 총 금액 업데이트 (장바구니 아이템 기준)
      const footerPriceArea = this.rootElement.querySelector(".mobile-total-price-area") as HTMLElement;
      if (footerPriceArea) {
        if (state.cartItems.length > 0) {
          const totalPrice = state.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
          footerPriceArea.innerHTML = `
            <span style="font-size: 14px; color: #333;">총 상품금액</span>
            <span style="font-size: 18px; font-weight: 700; color: #171717;">${totalPrice.toLocaleString()}원</span>
          `;
          footerPriceArea.style.display = "flex";
        } else {
          footerPriceArea.style.display = "none";
        }
      }
    });
  }

  private render() {
    this.rootElement.innerHTML = `
      <div class="custom-option-wrapper mobile">
        <!-- 고정 하단 바 (닫혀 있을 때) -->
        <div class="mobile-floating-bar closed-state">
          <button class="btn-cart-half">장바구니</button>
          <button class="btn-buy-half">바로 구매하기</button>
        </div>

        <!-- 바텀 시트 오버레이 -->
        <div class="mobile-bottom-sheet-overlay"></div>

        <!-- 바텀 시트 본체 -->
        <div class="mobile-bottom-sheet">
          <div class="mobile-step1">
            <div class="option-accordion">
              <div class="custom-option-header" id="accordion-header">
                <span>옵션 선택 (필수)</span>
                <div class="header-arrow" style="transform: rotate(180deg);">
                  <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#777777" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <div class="custom-option-list" id="accordion-content"></div>
            </div>
            <div class="selected-options-container"></div>
            <div class="mobile-sheet-footer">
               <div class="mobile-total-price-area" style="display: none; justify-content: space-between; align-items: flex-end; margin-bottom: 12px;"></div>
               <div class="mobile-action-buttons">
                 <button class="btn-cart-small">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5.8973 8.35821L4.54581 19.1791C4.33157 20.893 5.67069 22.4 7.40113 22.4H16.5989C18.3293 22.4 19.6684 20.893 19.4542 19.1791L18.1027 8.35821C17.9254 6.94025 16.7262 5.86667 15.2974 5.86667H8.70258C7.27376 5.86667 6.07461 6.94025 5.8973 8.35821Z" stroke="#333333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                   </svg>
                 </button>
                 <button class="btn-buy-submit">바로 구매하기</button>
               </div>
            </div>
          </div>
          
          <div class="mobile-step2" style="display: none;">
            <div class="flavor-panel-container"></div>
          </div>
        </div>
      </div>
    `;

    const accordionHeader = this.rootElement.querySelector("#accordion-header") as HTMLElement;
    const accordionContent = this.rootElement.querySelector("#accordion-content") as HTMLElement;
    const flavorPanelContainer = this.rootElement.querySelector(".flavor-panel-container") as HTMLElement;
    const selectedOptionsContainer = this.rootElement.querySelector(".selected-options-container") as HTMLElement;

    // 옵션 카드 렌더링
    OPTIONS_DATA.forEach((option) => {
      const card = new OptionCard(option);
      accordionContent.appendChild(card.getElement());
    });

    // 아코디언 토글 로직
    let isAccordionOpen = true;
    accordionHeader.addEventListener("click", () => {
      isAccordionOpen = !isAccordionOpen;
      if (isAccordionOpen) {
        accordionContent.style.display = "flex";
        accordionHeader.querySelector<HTMLElement>(".header-arrow")!.style.transform = "rotate(180deg)";
      } else {
        accordionContent.style.display = "none";
        accordionHeader.querySelector<HTMLElement>(".header-arrow")!.style.transform = "rotate(0deg)";
      }
    });

    // 서브 패널 부착
    if (flavorPanelContainer) {
      const flavorPanel = new FlavorPanel();
      flavorPanelContainer.appendChild(flavorPanel.getElement());
    }

    // 선택한 옵션 리스트 부착
    if (selectedOptionsContainer) {
      const selectedOptionsPanel = new SelectedOptionsPanel();
      selectedOptionsContainer.appendChild(selectedOptionsPanel.getElement());
    }

    // 전역 토스트 마운트
    const wrapper = this.rootElement.querySelector(".custom-option-wrapper") as HTMLElement;
    if (wrapper) {
      new Toast(wrapper);
    }
  }

  private bindEvents() {
    const btnCartHalf = this.rootElement.querySelector(".btn-cart-half") as HTMLElement;
    const btnBuyHalf = this.rootElement.querySelector(".btn-buy-half") as HTMLElement;
    const floatingBar = this.rootElement.querySelector(".mobile-floating-bar") as HTMLElement;
    
    const overlay = this.rootElement.querySelector(".mobile-bottom-sheet-overlay") as HTMLElement;
    const bottomSheet = this.rootElement.querySelector(".mobile-bottom-sheet") as HTMLElement;
    
    const btnCartSmall = this.rootElement.querySelector(".btn-cart-small") as HTMLElement;
    const btnBuySubmit = this.rootElement.querySelector(".btn-buy-submit") as HTMLElement;

    const openSheet = () => {
      overlay.classList.add("active");
      bottomSheet.classList.add("active");
      floatingBar.style.display = "none"; // 열릴 때 하단 바 숨김
    };

    const closeSheet = () => {
      overlay.classList.remove("active");
      bottomSheet.classList.remove("active");
      floatingBar.style.display = "flex"; // 닫힐 때 하단 바 보임
    };

    btnCartHalf.addEventListener("click", openSheet);
    btnBuyHalf.addEventListener("click", openSheet);
    overlay.addEventListener("click", closeSheet);
    
    // 바텀 시트 내에서의 진짜 장바구니 버튼 클릭
    btnCartSmall.addEventListener("click", () => {
      const state = store.getState();
      if (state.cartItems.length === 0) {
        window.dispatchEvent(new CustomEvent("show-toast", {
          detail: { message: "옵션을 선택해 주세요.", type: "error" }
        }));
        return;
      }
      const nativeCartBtn = document.querySelector("#actionCart, #actionCartClone, .btnBasket") as HTMLElement;
      if (nativeCartBtn) {
         nativeCartBtn.click();
         closeSheet();
      } else {
         window.dispatchEvent(new CustomEvent("show-toast", {
          detail: { message: "모바일 장바구니 버튼을 찾을 수 없습니다.", type: "error" }
        }));
      }
    });

    // 바텀 시트 내에서의 진짜 구매하기 버튼 클릭
    btnBuySubmit.addEventListener("click", () => {
      const state = store.getState();
      if (state.cartItems.length === 0) {
        window.dispatchEvent(new CustomEvent("show-toast", {
          detail: { message: "옵션을 선택해 주세요.", type: "error" }
        }));
        return;
      }
      
      const nativeBuyBtn = document.querySelector("#btn_buy_mobile_clone_id, #actionBuy, a.btnStrong") as HTMLElement;
      if (nativeBuyBtn) {
         nativeBuyBtn.click();
      } else {
         window.dispatchEvent(new CustomEvent("show-toast", {
          detail: { message: "모바일 구매하기 버튼을 찾을 수 없습니다.", type: "error" }
        }));
      }
    });
  }
}
