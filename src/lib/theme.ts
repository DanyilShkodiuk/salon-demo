/** localStorage key for the visitor's light/dark choice. */
export const THEME_KEY = "luna-theme";

/**
 * Runs in <head> before the page paints: applies the saved theme, or the system one when
 * nothing is saved, and keeps following the system until the visitor picks a theme.
 */
export const THEME_SCRIPT = `(function(){var k=${JSON.stringify(THEME_KEY)},r=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)");function saved(){try{return localStorage.getItem(k)}catch(e){return null}}function apply(){var t=saved();r.dataset.theme=t==="dark"||t==="light"?t:m.matches?"dark":"light"}apply();m.addEventListener("change",function(){if(!saved())apply()})})();`;
