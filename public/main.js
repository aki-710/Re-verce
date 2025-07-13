console.log("JS動いてるよ〜");

const form = document.getElementById('postForm');
const textInput = document.getElementById('textInput');
const imageInput = document.getElementById('imageInput');
const list = document.getElementById('postList');

// タブ切り替えとスワイプ処理
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

// タブ・ナビゲーションのイベント
memoryTab.addEventListener('click', () => showPanel(0));
chatTab.addEventListener('click', () => showPanel(1));
memoryNav.addEventListener('click', () => showPanel(0));
chatNav.addEventListener('click', () => showPanel(1));

// スワイプ検出用
let startX = 0;
swipeContainer.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});
swipeContainer.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;
  if (diff > 50) showPanel(1); // 左スワイプ
  else if (diff < -50) showPanel(0); // 右スワイプ
});

// 投稿フォーム送信
form.addEventListener('submit', async (e) => {
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
    formData.append('image', imageFiles[i]); // 複数画像対応
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
  } catch (error) {
    console.error('投稿エラー:', error);
    alert('投稿中にエラーが発生しました: ' + error.message);
  }
});

// 投稿一覧の読み込み
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

// 初期読み込み
loadPosts();

const postForm = document.getElementById('postForm');
const plusBtn = document.querySelectorAll('.nav-btn')[2]; // 3番目の＋ボタン

let formVisible = false;

plusBtn.addEventListener('click', () => {
  formVisible = !formVisible;
  if (formVisible) {
    postForm.style.display = 'flex';
    postForm.classList.add('fade-in');
  } else {
    postForm.style.display = 'none';
    postForm.classList.remove('fade-in');
  }
});

