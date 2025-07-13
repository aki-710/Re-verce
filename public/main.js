console.log("JS動いてるよ〜");

const form = document.getElementById('postForm');
const textInput = document.getElementById('textInput');
const imageInput = document.getElementById('imageInput');
const list = document.getElementById('postList');

const memoryTab = document.getElementById('memoryTab');
const chatTab = document.getElementById('chatTab');
const memoryNav = document.getElementById('memoryNav');
const chatNav = document.getElementById('chatNav');
const swipeContainer = document.getElementById('swipeContainer');

// ポップアップ操作
const openFormBtn = document.getElementById('openFormBtn');
const closeForm = document.getElementById('closeForm');

openFormBtn.addEventListener('click', () => {
  form.style.display = 'block';
  form.classList.add('fade-in');
});

closeForm.addEventListener('click', () => {
  form.style.display = 'none';
  form.classList.remove('fade-in');
});

// パネル切り替え
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

// スワイプ処理
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

// 投稿処理
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = textInput.value.trim();
  const files = imageInput.files;

  if (!text && files.length === 0) {
    alert('テキストを入力するか、画像を選択してください。');
    return;
  }

  const formData = new FormData();
  formData.append('text', text);
  for (let i = 0; i < files.length; i++) {
    formData.append('image', files[i]);
  }

  try {
    const res = await fetch('/post', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || '投稿に失敗しました');
    }

    textInput.value = '';
    imageInput.value = '';
    form.style.display = 'none';
    loadPosts();
  } catch (err) {
    console.error(err);
    alert('投稿エラー: ' + err.message);
  }
});

async function loadPosts() {
  try {
    const res = await fetch('/posts');
    const posts = await res.json();
    list.innerHTML = posts.map(post => {
      let html = `<li>${post.text}（${new Date(post.time).toLocaleString()}）`;
      if (post.imagePath) {
        if (Array.isArray(post.imagePath)) {
          post.imagePath.forEach(path => {
            html += `<br><img src="${path}" alt="画像" style="max-width: 200px;" />`;
          });
        } else {
          html += `<br><img src="${post.imagePath}" alt="画像" style="max-width: 200px;" />`;
        }
      }
      html += '</li>';
      return html;
    }).join('');
  } catch (err) {
    console.error(err);
    alert('投稿の読み込みに失敗しました');
  }
}

// 初期読み込み
loadPosts();
