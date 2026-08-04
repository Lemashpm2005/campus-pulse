document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('cover_image_url');
  const fileInput = document.getElementById('cover_image_file');
  const preview = document.getElementById('image-preview');

  if (!preview) return;

  function showPreview(src) {
    if (!src) {
      preview.style.display = 'none';
      return;
    }
    preview.src = src;
    preview.style.display = 'block';
  }

  if (urlInput) {
    urlInput.addEventListener('input', () => {
      if (urlInput.value.trim()) showPreview(urlInput.value.trim());
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => showPreview(e.target.result);
      reader.readAsDataURL(file);
    });
  }
});

// Show/hide password toggle - works on any input with class "pw-input"
// paired with a sibling button with class "pw-toggle"
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.textContent = isHidden ? 'Hide' : 'Show';
    });
  });
});
