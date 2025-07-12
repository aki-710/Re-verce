console.log("JS動いてるよ〜");

const form = document.getElementById('postForm');
const textInput = document.getElementById('textInput');
const imageInput = document.getElementById('imageInput');
const list = document.getElementById('postList');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = textInput.value.trim();
    const imageFile = imageInput.files[0]; // 選択された画像ファイルを取得

    if (!text && !imageFile) {
        alert('テキストを入力するか、画像を選択してください。');
        return;
    }

    const formData = new FormData(); // ファイルアップロードにはFormDataを使用
    formData.append('text', text); // テキストデータを追加
    if (imageFile) {
        formData.append('image', imageFile); // 画像ファイルを追加。フィールド名は'image'
    }

    try {
        const response = await fetch('/post', {
            method: 'POST',
            // FormDataを使用する場合、Content-Typeヘッダーは自動的に設定されるため、明示的に設定しない
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '投稿に失敗しました');
        }

        textInput.value = ''; // テキスト入力欄をクリア
        imageInput.value = ''; // 画像入力欄をクリア
        loadPosts(); // 投稿を再読み込み
    } catch (error) {
        console.error('投稿エラー:', error);
        alert('投稿中にエラーが発生しました: ' + error.message);
    }
});

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
                // 画像パスがあればimgタグを追加。max-widthとmax-heightでサイズ調整
                content += `<br><img src="${p.imagePath}" alt="投稿された画像" style="max-width: 200px; max-height: 200px; object-fit: contain;">`;
            }
            content += `</li>`;
            return content;
        }).join('');
    } catch (error) {
        console.error('投稿読み込みエラー:', error);
        alert('投稿の読み込み中にエラーが発生しました: ' + error.message);
    }
}

// ページ読み込み時に投稿を読み込む
loadPosts();