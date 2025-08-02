const tauri = __TAURI__;
const core = tauri.core;
const path = tauri.path;
const fs = tauri.fs;
const register = tauri.globalShortcut.register;

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
  const fileName = grabBagVideoPaths[rand];
  console.log("Picked video index:", rand, "Path:", fileName);
  try {
    const fileBytes = await fs.readFile(
      await path.join(appLocalDataDirPath, "GrabBag", fileName)
    );
    const blob = new Blob([new Uint8Array(fileBytes)], { type: "video/mp4" });
    const blobUrl = URL.createObjectURL(blob);
    reactbotPlayer.src = blobUrl;
    reactbotPlayer.currentTime = 0.0;
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
};

window.addEventListener("DOMContentLoaded", async () => {
  appLocalDataDirPath = await path.appDataDir();
  grabBagVideoPaths = await (async () => {
    const entries = await fs.readDir("GrabBag", { baseDir: fs.BaseDirectory.AppData });
    return entries
      .filter(e => e.isFile)
      .map(e => e.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  })();
  grabBagIdlePath = grabBagVideoPaths.shift();
  console.log(grabBagIdlePath)
  const fileBytesIdle = await fs.readFile(
    await path.join(appLocalDataDirPath, "GrabBag", grabBagIdlePath)
  );
  const blobIdle = new Blob([new Uint8Array(fileBytesIdle)], { type: "video/mp4" });
  const blobUrlIdle = URL.createObjectURL(blobIdle);
  reactbotIdle.src = blobUrlIdle
  reactbotPlayer.addEventListener("ended", playIdleVideo);
  reactbotPlayer.addEventListener("canplaythrough", playPlayerVideo);
  await register('F7', (event) => {
    if (event.state === "Pressed" && !reactbotPlayer.classList.contains("playing")) playRandomVideo();
  });
});

