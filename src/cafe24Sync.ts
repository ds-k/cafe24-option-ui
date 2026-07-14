import { store } from "./store";

export class Cafe24Sync {
  constructor() {
    // 순환 참조 방지를 위해 생성자에서 초기화하지 않고 외부에서 명시적으로 init()을 호출합니다.
  }

  // 1. Cafe24 원본 DOM에서 각 메인 옵션별 최대 허용 횟수(limit)를 추출
  public init() {
    const limits: { [key: string]: number } = {};
    const optionSpans = document.querySelectorAll(".ec-product-button li a span");

    optionSpans.forEach((span) => {
      const text = span.textContent?.trim() || "";
      // 텍스트 예: "10개입_1", "30개입_2"
      const match = text.match(/^(\d+개입)_(\d+)$/);
      if (match) {
        const optionName = match[1]; // "10개입" (이 값이 바로 config.ts의 id와 동일함)
        const suffixNumber = parseInt(match[2], 10); // 1, 2, ...
        
        // 발견된 가장 큰 suffix 숫자가 곧 최대 횟수
        if (!limits[optionName] || suffixNumber > limits[optionName]) {
          limits[optionName] = suffixNumber;
        }
      }
    });

    console.log("[Cafe24 Sync] Parsed Limits from Native DOM:", limits);
    
    // 순환 참조가 해결된 상태이므로 안전하게 store 호출
    store.setOptionLimits(limits);
  }

  // 2. 선택 완료 시 원본 DOM 클릭 트리거
  public triggerCafe24Click(optionId: string, targetSuffix: number) {
    // 옵션 식별 문자열을 사용하여 타겟 텍스트 생성
    const targetText = `${optionId}_${targetSuffix}`; // 예: "30개입_1"

    // 해당 텍스트를 가진 원본 a 태그를 찾아 클릭 이벤트를 발생시킵니다.
    const optionSpans = document.querySelectorAll(".ec-product-button li a span");
    let found = false;

    optionSpans.forEach((span) => {
      if (span.textContent?.trim() === targetText) {
        const aTag = span.closest("a");
        if (aTag) {
          aTag.click(); // 강제 클릭!
          console.log(`[Cafe24 Sync] Triggered click on: ${targetText}`);
          found = true;
        }
      }
    });

    if (!found) {
      console.warn(`[Cafe24 Sync] Could not find original button for: ${targetText}`);
    }
  }

  // 3. 커스텀 장바구니 리스트의 수량 변경을 Cafe24 원본에 동기화
  public updateQuantity(optionId: string, suffix: number, quantity: number) {
    const targetText = `${optionId}_${suffix}`; // "30개입_1" 등

    const totalRows = document.querySelectorAll("#totalProducts tbody tr");
    totalRows.forEach(row => {
      if (row.textContent?.includes(targetText)) {
        const qtyInput = row.querySelector(".quantity_opt") as HTMLInputElement;
        if (qtyInput) {
          qtyInput.value = quantity.toString();
          qtyInput.dispatchEvent(new Event("change", { bubbles: true }));
          qtyInput.dispatchEvent(new Event("blur", { bubbles: true }));
        }
      }
    });
  }

  // 4. 커스텀 장바구니 아이템 삭제 시 Cafe24 원본에서도 삭제
  public deleteItem(optionId: string, suffix: number) {
    const targetText = `${optionId}_${suffix}`;

    const totalRows = document.querySelectorAll("#totalProducts tbody tr");
    let found = false;
    totalRows.forEach(row => {
      if (row.textContent?.includes(targetText)) {
        // 삭제 버튼 탐색 및 클릭 이벤트 트리거
        const deleteBtn = row.querySelector(".option_box_del")?.closest("a");

        if (deleteBtn) {
          (deleteBtn as HTMLElement).click();
          console.log(`[Cafe24 Sync] Triggered delete on: ${targetText}`);
          found = true;
        }
      }
    });

    if (!found) {
      console.warn(`[Cafe24 Sync] Could not find delete button for: ${targetText}`);
    }
  }
}

export const cafe24Sync = new Cafe24Sync();
