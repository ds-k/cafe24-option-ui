import "./style.css";
import { PcApp } from "./apps/PcApp";
import { MobileApp } from "./apps/MobileApp";

document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.querySelector<HTMLElement>(
    "#cafe24-custom-options-root",
  );
  if (!rootElement) {
    console.warn(
      "[Cafe24OptionCustomizer] Root element '#cafe24-custom-options-root' not found.",
    );
    return;
  }

  // 카페24 환경 모바일 감지 베스트 프랙티스
  const w = window as any;
  const isMobileDevice =
    w.CAFE24?.MOBILE_DEVICE === true ||
    w.CAFE24?.MOBILE === true ||
    w.CAFE24?.ROUTE?.is_mobile === true ||
    window.location.pathname.startsWith("/m/") ||
    window.innerWidth <= 768;

  if (isMobileDevice) {
    new MobileApp(rootElement);
  } else {
    new PcApp(rootElement);
  }
});
