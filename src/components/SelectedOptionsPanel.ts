import { store } from "../store";

export class SelectedOptionsPanel {
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
    div.className = "selected-options-panel";
    return div;
  }

  private bindEvents() {
    this.element.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // 수량 증가
      const plusBtn = target.closest(".cart-qty-plus");
      if (plusBtn) {
        const id = plusBtn.getAttribute("data-id");
        if (id) {
          store.updateCartItemQuantity(id, 1);
        }
      }

      // 수량 감소
      const minusBtn = target.closest(".cart-qty-minus");
      if (minusBtn) {
        const id = minusBtn.getAttribute("data-id");
        if (id) {
          store.updateCartItemQuantity(id, -1);
        }
      }

      // 삭제
      const deleteBtn = target.closest(".cart-delete-btn");
      if (deleteBtn) {
        const id = deleteBtn.getAttribute("data-id");
        if (id) {
          store.removeCartItem(id);
        }
      }
    });
  }

  private render(state: ReturnType<typeof store.getState>) {
    if (state.cartItems.length === 0) {
      this.element.style.display = "none";
      this.element.innerHTML = "";
      return;
    }

    this.element.style.display = "flex";

    const itemsHTML = state.cartItems.map(item => {
      const quantity = item.quantity;
      const flavorText = item.flavors.map(f => `${f.name}*${f.quantity}`).join(" + ");
      const totalPrice = (item.price * quantity).toLocaleString();

      return `
        <div class="cart-item">
          <div class="cart-item-header">
            <span class="cart-item-title">${item.optionName}</span>
            <button class="cart-delete-btn" data-id="${item.id}">
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1L1 13M1 1L13 13" stroke="#777777" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="cart-item-flavors">${flavorText}</div>
          <div class="cart-item-bottom">
            <div class="cart-qty-ctrl">
              <button class="cart-qty-btn cart-qty-minus" data-id="${item.id}">−</button>
              <span class="cart-qty-num">${quantity}</span>
              <button class="cart-qty-btn cart-qty-plus" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-price">${totalPrice}원</div>
          </div>
        </div>
      `;
    }).join("");

    this.element.innerHTML = `
      <div class="selected-options-header">선택한 옵션</div>
      <div class="selected-options-list">
        ${itemsHTML}
      </div>
    `;
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}
