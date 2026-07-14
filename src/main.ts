import "./style.css";
import { OPTIONS_DATA } from "./config";
import { OptionCard } from "./components/OptionCard";
import { FlavorPanel } from "./components/FlavorPanel";
import { SelectedOptionsPanel } from "./components/SelectedOptionsPanel";
import { Toast } from "./components/Toast";
import { cafe24Sync } from "./cafe24Sync";

class Cafe24OptionCustomizer {
  private rootElement!: HTMLElement;

  constructor(rootSelector: string) {
    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) {
      console.warn(
        `[Cafe24OptionCustomizer] Root element '${rootSelector}' not found.`,
      );
      return;
    }
    this.rootElement = root;
    this.init();
  }

  private init() {
    // 컴포넌트 마운트 시 Cafe24 DOM 파싱 동기화 실행
    cafe24Sync.init();
    this.render();
  }

  private render() {
    // 1. 기본 뼈대 컨테이너 렌더링
    this.rootElement.innerHTML = `
      <div class="custom-option-wrapper" style="position: relative;">
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
        <div class="flavor-panel-container"></div>
        <div class="selected-options-container"></div>
      </div>
    `;

    const accordionHeader = this.rootElement.querySelector(
      "#accordion-header",
    ) as HTMLElement;
    const accordionContent = this.rootElement.querySelector(
      "#accordion-content",
    ) as HTMLElement;
    const flavorPanelContainer = this.rootElement.querySelector(
      ".flavor-panel-container",
    ) as HTMLElement;
    const selectedOptionsContainer = this.rootElement.querySelector(
      ".selected-options-container",
    ) as HTMLElement;

    // 2. 옵션 카드 렌더링
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
        accordionHeader.querySelector<HTMLElement>(
          ".header-arrow",
        )!.style.transform = "rotate(180deg)";
      } else {
        accordionContent.style.display = "none";
        accordionHeader.querySelector<HTMLElement>(
          ".header-arrow",
        )!.style.transform = "rotate(0deg)";
      }
    });

    // 3. 서브 패널 (FlavorPanel) 부착
    if (flavorPanelContainer) {
      const flavorPanel = new FlavorPanel();
      flavorPanelContainer.appendChild(flavorPanel.getElement());
    }

    // 4. 선택한 옵션 리스트 (SelectedOptionsPanel) 부착
    if (selectedOptionsContainer) {
      const selectedOptionsPanel = new SelectedOptionsPanel();
      selectedOptionsContainer.appendChild(selectedOptionsPanel.getElement());
    }

    // 5. 전역 토스트 컴포넌트 마운트
    const wrapper = this.rootElement.querySelector(
      ".custom-option-wrapper",
    ) as HTMLElement;
    if (wrapper) {
      new Toast(wrapper);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Cafe24OptionCustomizer("#cafe24-custom-options-root");
});
