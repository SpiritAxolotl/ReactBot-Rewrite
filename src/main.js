const tauri = window.__TAURI__;
const core = tauri.core;
const path = tauri.path;
const fs = tauri.fs;

const reactbot = document.querySelector(`#reactbot`);

const playRandomVideo = () => {
  
};

window.addEventListener("DOMContentLoaded", async () => {
  const appLocalDataDirPath = await path.appLocalDataDir();
  reactbot.src = core.convertFileSrc(await path.join(appLocalDataDirPath, "GrabBag", "0 breathing idle loop.mp4"));
  window.addEventListener("keypress", (e) => {
    e.preventDefault();
    console.log(`key pressed: ${e.key}`);
    if (e.key === "7") playRandomVideo();
  });
});
