// server.js
const express = require('express');
const fs      = require('fs');
const path    = require('path');
const multer  = require('multer');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE   = path.join(__dirname, 'posts.json');
const UPLOAD_DIR  = path.join(__dirname, 'uploads');

/* uploads フォルダを必ず用意 */
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log('[init] uploads ディレクトリを作成');
}

/* Multer (複数画像) */
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

/* ---------- POST /post  ---------- */
app.post('/post', upload.array('image', 10), (req, res) => {
  const text       = (req.body.text || '').trim();
  const imageFiles = req.files || [];

  if (!text && imageFiles.length === 0) {
    return res.status(400).json({ error: 'テキストまたは画像が空です' });
  }

  const post = {
    id:   Date.now(),
    text,
    time: new Date().toISOString(),
    imagePath: imageFiles.map(f => path.join('/uploads', f.filename))
  };

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
