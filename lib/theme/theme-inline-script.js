import { THEME_STORAGE_KEY } from "./constants.js";

/** Blocking script injected in root layout to prevent theme flash. */
export function getThemeInlineScript() {
  const key = THEME_STORAGE_KEY;
  return `(function(){try{var m=localStorage.getItem("${key}")||"system";var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
}
