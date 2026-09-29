/*
  Runs before the first paint, so the page never renders in the wrong theme and
  then snaps. Night is the default: an unset preference is not a request for the
  system's theme, it is someone who has not chosen, and the house style is dark.

  Deliberately inline and dependency-free -- anything that waits for React has
  already lost the race it exists to win.
*/
const SCRIPT = `try{var t=localStorage.getItem("duelistt-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
