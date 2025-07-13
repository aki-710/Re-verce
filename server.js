// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'posts.json');

// アップロード先とファイル名の設定
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename:    (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOAD_DIR));

// 投稿を取得するエンドポイント
app.get('/posts', (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            res.json(posts);
        } catch (e) {
            console.error('Error reading posts.json:', e);
            res.status(500).json({ error: 'データ読み込み失敗' });
        }
    } else {
        res.json([]);
    }
});

// 投稿を受け取るエンドポイント（複数画像対応）
app.post('/post', upload.array('image'), (req, res) => {
    const text = req.body.text ? String(req.body.text).trim() : '';
    const imageFiles = req.files || [];

  if (!text && imageFiles.length === 0) {
    return res.status(400).json({ error: 'テキストまたは画像が空です' });
  }

    const post = {
        id: Date.now(),
        text,
        time: new Date().toISOString(),
    };

    if (imageFiles.length > 0) {
        post.imagePath = imageFiles.map(file => path.join('/uploads', file.filename));
        console.log('画像アップロード:', post.imagePath);
    }

  let posts = [];
  if (fs.existsSync(DATA_FILE)) {
    try { posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
    catch (e) { console.error('[read] posts.json 失敗:', e); }
  }

  posts.unshift(post);

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
    res.json({ message: '投稿完了！', post });
  } catch (e) {
    console.error('[write] posts.json 失敗:', e);
    res.status(500).json({ error: '保存に失敗しました' });
  }
});

/* ---------- GET /posts  ---------- */
app.get('/posts', (_, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.json([]);
  try {
    const posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(posts);
  } catch (e) {
    console.error('[read] posts.json 失敗:', e);
    res.status(500).json({ error: '読み込みに失敗しました' });
  }
});

/* ---------- 起動 ---------- */
app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});
