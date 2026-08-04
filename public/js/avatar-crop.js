// Simple canvas-based avatar cropper: pick a photo, drag to reposition,
// use the zoom slider to scale, then "Use This Photo" bakes it into a
// square image sent to the server as base64 (no extra libraries needed).
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('avatar_file_raw');
  const canvas = document.getElementById('avatar-crop-canvas');
  const zoomSlider = document.getElementById('avatar-zoom');
  const useBtn = document.getElementById('avatar-use-btn');
  const hiddenDataInput = document.getElementById('avatar_data');
  const cropWrap = document.getElementById('avatar-crop-wrap');
  const resultPreview = document.getElementById('avatar-result-preview');

  if (!fileInput || !canvas) return;

  const ctx = canvas.getContext('2d');
  const SIZE = canvas.width; // square canvas, e.g. 260x260

  let img = null;
  let scale = 1;
  let minScale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.save();
    // Circular clip preview so it's obvious this becomes the profile photo
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    if (img) {
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, offsetX, offsetY, w, h);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function clampOffset() {
    const w = img.width * scale;
    const h = img.height * scale;
    offsetX = Math.min(0, Math.max(SIZE - w, offsetX));
    offsetY = Math.min(0, Math.max(SIZE - h, offsetY));
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      img = new Image();
      img.onload = () => {
        minScale = Math.max(SIZE / img.width, SIZE / img.height);
        scale = minScale;
        offsetX = (SIZE - img.width * scale) / 2;
        offsetY = (SIZE - img.height * scale) / 2;
        zoomSlider.min = minScale;
        zoomSlider.max = minScale * 3;
        zoomSlider.step = (minScale * 3 - minScale) / 100;
        zoomSlider.value = minScale;
        cropWrap.style.display = 'block';
        draw();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  zoomSlider.addEventListener('input', () => {
    if (!img) return;
    const oldScale = scale;
    scale = parseFloat(zoomSlider.value);
    // zoom toward center of canvas
    offsetX -= (SIZE / 2 - offsetX) * (scale / oldScale - 1);
    offsetY -= (SIZE / 2 - offsetY) * (scale / oldScale - 1);
    clampOffset();
    draw();
  });

  function startDrag(x, y) {
    dragging = true;
    lastX = x;
    lastY = y;
  }
  function moveDrag(x, y) {
    if (!dragging || !img) return;
    offsetX += x - lastX;
    offsetY += y - lastY;
    lastX = x;
    lastY = y;
    clampOffset();
    draw();
  }
  function endDrag() { dragging = false; }

  canvas.addEventListener('mousedown', (e) => startDrag(e.offsetX, e.offsetY));
  canvas.addEventListener('mousemove', (e) => moveDrag(e.offsetX, e.offsetY));
  window.addEventListener('mouseup', endDrag);

  canvas.addEventListener('touchstart', (e) => {
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0];
    startDrag(t.clientX - r.left, t.clientY - r.top);
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0];
    moveDrag(t.clientX - r.left, t.clientY - r.top);
  }, { passive: false });
  canvas.addEventListener('touchend', endDrag);

  useBtn.addEventListener('click', () => {
    if (!img) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    hiddenDataInput.value = dataUrl;
    if (resultPreview) {
      resultPreview.src = dataUrl;
      resultPreview.style.display = 'block';
    }
  });
});
