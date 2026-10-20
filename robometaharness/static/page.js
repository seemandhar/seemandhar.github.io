'use strict';
const dialog = document.getElementById('figure-dialog');
const enlarged = document.getElementById('enlarged-figure');
let previousFocus;
for (const trigger of document.querySelectorAll('[data-figure]')) {
  trigger.addEventListener('click', () => {
    previousFocus = trigger;
    enlarged.src = trigger.dataset.figure;
    enlarged.alt = trigger.querySelector('img').alt;
    dialog.showModal();
  });
}
document.getElementById('close-figure').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => previousFocus?.focus());
const videos = [document.getElementById('baseline-video'), document.getElementById('null-video')];
const playButton = document.getElementById('play-pair');
const status = document.getElementById('video-status');
let pairBusy = false;
function updateButton() {
  playButton.textContent = videos.some(v => !v.paused && !v.ended) ? 'Pause both replays' : 'Play both replays';
}
for (const video of videos) {
  for (const event of ['play', 'pause', 'ended']) video.addEventListener(event, updateButton);
}
playButton.addEventListener('click', async () => {
  if (pairBusy) return;
  pairBusy = true;
  if (videos.some(v => !v.paused && !v.ended)) {
    videos.forEach(v => v.pause());
    status.textContent = 'Both replays paused.';
  } else {
    // Resume from the same position if a native video control was used separately.
    const time = videos.every(v => v.ended) ? 0 : Math.min(...videos.map(v => v.currentTime));
    videos.forEach(v => { v.currentTime = time; });
    const outcomes = await Promise.allSettled(videos.map(v => v.play()));
    if (outcomes.some(result => result.status === 'rejected')) {
      videos.forEach(v => v.pause());
      status.textContent = 'Playback could not start. Use the individual video controls to retry.';
    } else {
      status.textContent = 'Playing baseline and sampling null from the same position.';
    }
  }
  pairBusy = false;
  updateButton();
});
document.getElementById('reset-pair').addEventListener('click', () => {
  videos.forEach(v => { v.pause(); v.currentTime = 0; });
  status.textContent = 'Both replays reset to the start.';
  updateButton();
});
