import checkIcon from "../assets/icons/check.svg";
import cautionIcon from "../assets/icons/caution.svg";

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
      this.show(customEvent.detail.message, customEvent.detail.type || "success");
    });
  }

  public show(message: string, type: "success" | "error" = "success", duration: number = 2000) {
    const icon = type === "success" ? checkIcon : cautionIcon;
    this.element.innerHTML = `<img src="${icon}" alt="${type}" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 8px;"><span>${message}</span>`;
    this.element.style.display = "flex";
    this.element.style.alignItems = "center";
    
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
