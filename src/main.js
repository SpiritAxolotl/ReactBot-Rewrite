const tauri = __TAURI__;
const core = tauri.core;
const path = tauri.path;
const fs = tauri.fs;

const reactbot = document.querySelector(`#reactbot`);
let appLocalDataDirPath = "";

const getGrabBag = async (...paths) => {
  return core.convertFileSrc(await path.join(appLocalDataDirPath, "GrabBag", ...paths));
};

const playRandomVideo = () => {
  
};

window.addEventListener("DOMContentLoaded", async () => {
  appLocalDataDirPath = await path.appLocalDataDir();
  reactbot.src = await getGrabBag("0 breathing idle loop.mp4");
  window.addEventListener("keypress", (e) => {
    e.preventDefault();
    console.log(`key pressed: ${e.key}`);
    if (e.key === "7") playRandomVideo();
  });
});
