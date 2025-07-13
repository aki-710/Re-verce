console.log("JS動いてるよ〜");

// 投稿フォーム関連
const postForm = document.getElementById('postForm');
const textInput = document.getElementById('textInput');
const imageInput = document.getElementById('imageInput');
const list = document.getElementById('postList');
const plusBtn = document.getElementById('plusBtn');
const navBtns = document.querySelectorAll('.nav-btn');

let formVisible = false;

function showForm() {
  postForm.style.display = 'block';
  postForm.classList.add('fade-in');
  formVisible = true;
}

function hideForm() {
  postForm.style.display = 'none';
  postForm.classList.remove('fade-in');
  formVisible = false;
}

plusBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (formVisible) {
    hideForm();
  } else {
    showForm();
  }
});

document.addEventListener('click', (e) => {
  if (formVisible && !postForm.contains(e.target) && e.target !== plusBtn) {
    hideForm();
  }
});

navBtns.forEach((btn) => {
  if (btn !== plusBtn) {
    btn.addEventListener('click', () => {
      if (formVisible) {
        hideForm();
      }
    });
  }
});

// 投稿送信
postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = textInput.value.trim();
  const imageFiles = imageInput.files;

  if (!text && imageFiles.length === 0) {
    alert('テキストを入力するか、画像を選択してください。');
    return;
  }

  const formData = new FormData();
  formData.append('text', text);
  for (let i = 0; i < imageFiles.length; i++) {
    formData.append('image', imageFiles[i]);
  }

  try {
    const response = await fetch('/post', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '投稿に失敗しました');
    }

    textInput.value = '';
    imageInput.value = '';
    loadPosts();
    hideForm();
  } catch (error) {
    console.error('投稿エラー:', error);
    alert('投稿中にエラーが発生しました: ' + error.message);
  }
});

// 投稿読み込み
async function loadPosts() {
  try {
    const res = await fetch('/posts');
    if (!res.ok) {
      throw new Error('投稿の読み込みに失敗しました');
    }
    const posts = await res.json();

    list.innerHTML = posts.map(p => {
      let content = `<li>${p.text}（${new Date(p.time).toLocaleString()}）`;
      if (p.imagePath) {
        if (Array.isArray(p.imagePath)) {
          p.imagePath.forEach(path => {
            content += `<br><img src="${path}" alt="投稿画像" style="max-width: 200px; max-height: 200px;" />`;
          });
        } else {
          content += `<br><img src="${p.imagePath}" alt="投稿画像" style="max-width: 200px; max-height: 200px;" />`;
        }
      }
      content += `</li>`;
      return content;
    }).join('');
  } catch (error) {
    console.error('投稿読み込みエラー:', error);
    alert('投稿の読み込み中にエラーが発生しました: ' + error.message);
  }
}

loadPosts();

// タブとスワイプ
const swipeContainer = document.getElementById('swipeContainer');
const memoryTab = document.getElementById('memoryTab');
const chatTab = document.getElementById('chatTab');
const memoryNav = document.getElementById('memoryNav');
const chatNav = document.getElementById('chatNav');

function showPanel(index) {
  swipeContainer.style.transform = `translateX(-${index * 100}%)`;
  if (index === 0) {
    memoryTab.classList.add('active');
    chatTab.classList.remove('active');
  } else {
    chatTab.classList.add('active');
    memoryTab.classList.remove('active');
  }
}

memoryTab.addEventListener('click', () => showPanel(0));
chatTab.addEventListener('click', () => showPanel(1));
memoryNav.addEventListener('click', () => showPanel(0));
chatNav.addEventListener('click', () => showPanel(1));

let startX = 0;
swipeContainer.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});
swipeContainer.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;
  if (diff > 50) showPanel(1);
  else if (diff < -50) showPanel(0);
});
