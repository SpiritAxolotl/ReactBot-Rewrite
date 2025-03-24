const tauri = __TAURI__;
const core = tauri.core;
const path = tauri.path;
const fs = tauri.fs;

const main = async () => {
  const reactbot = document.querySelector(`#reactbot`);
  let appLocalDataDirPath = "";
  const [grabBagIdlePath, grabBagVideoPaths] = await (async () => {
    const entries = await fs.readDir("GrabBag", { baseDir: fs.BaseDirectory.AppLocalData });
    const filtered = entries.filter(e=>e.isFile).map(e=>e.name);
    return [filtered.shift(), filtered];
  })();
  
  window.grabBagVideoPaths = grabBagVideoPaths;
  window.grabBagIdlePath = grabBagIdlePath;
  
  const getGrabBagVideo = async (...paths) => {
    return core.convertFileSrc(await path.join(appLocalDataDirPath, "GrabBag", ...paths));
  };
  
  const playRandomVideo = async () => {
    const rand = Math.floor(Math.random() * grabBagVideoPaths.length);
    reactbot.removeAttribute("loop");
    reactbot.src = await getGrabBagVideo(grabBagVideoPaths[rand]);
    reactbot.currentTime = 0.0;
    reactbot.play();
  };
  
  const playIdleVideo = async () => {
    reactbot.src = await getGrabBagVideo(grabBagIdlePath);
    reactbot.setAttribute("loop");
  };
  
  console.log("here");
  
  window.addEventListener("DOMContentLoaded", async () => {
    console.log("here 3");
    appLocalDataDirPath = await path.appLocalDataDir();
    await playIdleVideo();
    reactbot.addEventListener("ended", playIdleVideo);
    window.addEventListener("keypress", (e) => {
      e.preventDefault();
      console.log(`key pressed: ${e.key}`);
      if (e.key === "7") playRandomVideo();
    });
    console.log("here 4");
  });
  
  console.log("here 2");
};

main();