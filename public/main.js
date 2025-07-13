console.log("JS動いてるよ〜");

const form = document.getElementById('postForm');
const textInput = document.getElementById('textInput');
const imageInput = document.getElementById('imageInput');
const list = document.getElementById('postList');

const memoryTab = document.getElementById('memoryTab');
const chatTab = document.getElementById('chatTab');
const presentTab = document.getElementById('presentTab');
const memoryNav = document.getElementById('memoryNav');
const presentNav = document.getElementById('presentNav');
const swipeContainer = document.getElementById('swipeContainer');

// ポップアップ制御
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

// パネル切り替え（0=memory, 1=chat, 2=present）
function showPanel(index) {
  swipeContainer.style.transform = `translateX(-${index * 100}%)`;

  // タブの表示制御
  [memoryTab, chatTab, presentTab].forEach((tab, i) => {
    if (i === index) tab.classList.add('active');
    else tab.classList.remove('active');
  });
}

// タブ
memoryTab.addEventListener('click', () => showPanel(0));
chatTab.addEventListener('click', () => showPanel(1));
presentTab.addEventListener('click', () => showPanel(2));

// ナビ
memoryNav.addEventListener('click', () => showPanel(0));
presentNav.addEventListener('click', () => showPanel(2)); // 🎁 は present に！

// スワイプ処理
let startX = 0;
swipeContainer.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});
swipeContainer.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;
  if (diff > 50) {
    showPanel(Math.min(2, currentPanelIndex() + 1));
  } else if (diff < -50) {
    showPanel(Math.max(0, currentPanelIndex() - 1));
  }
});

function currentPanelIndex() {
  const transform = swipeContainer.style.transform || 'translateX(0%)';
  const match = transform.match(/-?(\d+)%/);
  const percent = match ? parseInt(match[1]) : 0;
  return percent / 100;
}

// 投稿処理（省略せず）
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

// 投稿一覧読み込み
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

loadPosts();
