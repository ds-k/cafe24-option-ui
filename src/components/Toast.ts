export class Toast {
  private element: HTMLElement;
  private timeoutId: number | null = null;

  constructor(targetElement: HTMLElement = document.body) {
    this.element = this.createElement();
    this.bindEvents();
    targetElement.appendChild(this.element);
  }

  private createElement(): HTMLElement {
    const div = document.createElement("div");
    div.className = "cafe24-toast";
    div.style.display = "none";
    return div;
  }

  private bindEvents() {
    window.addEventListener("show-toast", (e: Event) => {
      const customEvent = e as CustomEvent;
      this.show(customEvent.detail.message);
    });
  }

  public show(message: string, duration: number = 2000) {
    this.element.textContent = message;
    this.element.style.display = "block";
    
    // 강제 리플로우 후 opacity 트랜지션 적용
    void this.element.offsetWidth; 
    this.element.classList.add("show");

    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      this.element.classList.remove("show");
      // 트랜지션 끝난 후 display none
      setTimeout(() => {
        this.element.style.display = "none";
      }, 300);
    }, duration);
  }
}
