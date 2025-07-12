// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // multerをインポート
const app = express();
const PORT = 3000;

// データファイルのパス
const DATA_FILE = path.join(__dirname, 'posts.json');
// 画像アップロード用ディレクトリ
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// アップロードディレクトリが存在しない場合は作成
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`Created uploads directory at: ${UPLOADS_DIR}`);
}

// Multerのストレージ設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // public/uploads にファイルを保存
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        // アップロードされた画像にユニークなファイル名を作成
        // 例: 1678886400000.png
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// JSONボディパーサー (テキストデータ用、Multerより前に配置)
app.use(express.json());
// 'public' ディレクトリから静的ファイルを公開
app.use(express.static('public'));

// 投稿を受け取るAPI (ファイルアップロードも処理)
// upload.single('image') は、'image'というフィールド名の単一ファイルを処理
app.post('/post', upload.single('image'), (req, res) => {
    // req.body.text でテキストデータを取得
    const text = req.body.text ? String(req.body.text).trim() : '';
    // req.file でアップロードされたファイル情報を取得
    const imageFile = req.file;

    if (!text && !imageFile) {
        return res.status(400).json({ error: 'テキストまたは画像が空です' });
    }

    const post = {
        id: Date.now(), // ユニークなID
        text, // 投稿テキスト
        time: new Date().toISOString(), // 投稿時刻 (ISO形式)
    };

    if (imageFile) {
        // public ディレクトリからの相対パスで画像パスを保存
        // 例: /uploads/1678886400000.png
        post.imagePath = path.join('/uploads', imageFile.filename);
        console.log(`Image uploaded: ${post.imagePath}`);
    }

    let posts = [];
    if (fs.existsSync(DATA_FILE)) {
        try {
            posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        } catch (e) {
            console.error('Error reading or parsing posts.json:', e);
            posts = []; // エラー時は空の配列として扱う
        }
    }
    posts.unshift(post); // 新しい投稿を配列の先頭に追加

    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
        res.json({ message: '投稿完了！', post });
    } catch (e) {
        console.error('Error writing to posts.json:', e);
        res.status(500).json({ error: 'サーバーエラー：データの保存に失敗しました' });
    }
});

// 投稿一覧を取得するAPI
app.get('/posts', (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            res.json(posts);
        } catch (e) {
            console.error('Error reading or parsing posts.json for GET:', e);
            res.status(500).json({ error: 'サーバーエラー：データの読み込みに失敗しました' });
        }
    } else {
        res.json([]); // ファイルがない場合は空の配列を返す
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🚀 サーバー起動！→ http://localhost:${PORT}`);
});