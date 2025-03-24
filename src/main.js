const tauri = __TAURI__;
const core = tauri.core;
const path = tauri.path;
const fs = tauri.fs;

const reactbotIdle = document.querySelector(`#reactbot-idle`);
const reactbotPlayer = document.querySelector(`#reactbot-player`);
let appLocalDataDirPath = "";
let grabBagVideoPaths = [];
let grabBagIdlePath = "";

const getGrabBagVideo = async (...paths) => {
  return core.convertFileSrc(await path.join(appLocalDataDirPath, "GrabBag", ...paths));
};

const playRandomVideo = async () => {
  const rand = Math.floor(Math.random() * grabBagVideoPaths.length);
  console.log("Picked video index:", rand, "\nPath:", grabBagVideoPaths[rand]);
  try {
    //const blob = await fetch(await getGrabBagVideo(grabBagVideoPaths[rand])).then(a => a.blob());
    //reactbot.src = URL.createObjectURL(blob);
    reactbotPlayer.src = await getGrabBagVideo(grabBagVideoPaths[rand]);
    reactbotPlayer.currentTime = 0.0;
    //reactbot.removeAttribute("loop");
    //reactbot.currentTime = 0.0;
    //reactbot.play();
  } catch (e) {
    console.error("ReactBot wasn't able to fetch the video resource! Here's the error:", e);
  }
};

const playPlayerVideo = async () => {
  reactbotPlayer.classList.add("playing");
  reactbotPlayer.play();
}

const playIdleVideo = async () => {
  reactbotPlayer.classList.remove("playing");
  reactbotIdle.currentTime = 0.0;
  //reactbotIdle.src = await getGrabBagVideo(grabBagIdlePath);
  //reactbotIdle.setAttribute("loop", "");
};

window.addEventListener("DOMContentLoaded", async () => {
  appLocalDataDirPath = await path.appLocalDataDir();
  grabBagVideoPaths = await (async () => {
    const entries = await fs.readDir("GrabBag", { baseDir: fs.BaseDirectory.AppLocalData });
    return entries.filter(e=>e.isFile).map(e=>e.name);
  })();
  grabBagIdlePath = grabBagVideoPaths.shift();
  reactbotIdle.src = await getGrabBagVideo(grabBagIdlePath);
  reactbotPlayer.addEventListener("ended", playIdleVideo);
  reactbotPlayer.addEventListener("loadeddata", playPlayerVideo);
  window.addEventListener("keypress", (e) => {
    e.preventDefault();
    //console.log(`key pressed: ${e.key}`);
    if (e.key === "7" && !reactbotPlayer.classList.contains("playing")) playRandomVideo();
  });
});