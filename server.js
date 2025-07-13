const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'posts.json');

// OpenAI クライアントの初期化
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// アップロード先とファイル名の設定
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの配信（HTMLやJS、CSS）
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// 画像をBase64に変換する関数
function imageToBase64(imagePath) {
    const fullPath = path.join(__dirname, imagePath.replace(/^\//, ''));
    const imageBuffer = fs.readFileSync(fullPath);
    return imageBuffer.toString('base64');
}

// OpenAI Vision APIで画像を解析する関数
async function analyzeImage(base64Image) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "この画像に何が写っているか、簡潔に日本語で説明してください。"
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API エラー:', error);
        return null;
    }
}

// 投稿を受け取るエンドポイント（複数画像対応）
app.post('/post', upload.array('image'), async (req, res) => {
    let text = req.body.text ? String(req.body.text).trim() : '';
    const imageFiles = req.files || [];

    if (!text && imageFiles.length === 0) {
        return res.status(400).json({ error: 'テキストまたは画像が空です' });
    }

    const post = {
        id: Date.now(),
        text,
        time: new Date().toISOString(),
    };

    // 画像がアップロードされた場合
    if (imageFiles.length > 0) {
        post.imagePath = imageFiles.map(file => path.join('/uploads', file.filename));
        console.log('画像アップロード:', post.imagePath);

        // 画像認識を実行
        try {
            const imageDescriptions = [];
            for (const imagePath of post.imagePath) {
                const base64Image = imageToBase64(imagePath);
                const description = await analyzeImage(base64Image);
                if (description) {
                    imageDescriptions.push(description);
                }
            }

            // 画像認識結果を投稿文に追加
            if (imageDescriptions.length > 0) {
                const additionalText = '\n\n【画像認識結果】\n' + imageDescriptions.join('\n');
                post.text = text + additionalText;
            }
        } catch (error) {
            console.error('画像認識処理でエラーが発生しました:', error);
            // エラーが発生しても投稿は続行する
        }
    }

    let posts = [];
    if (fs.existsSync(DATA_FILE)) {
        try {
            posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        } catch (e) {
            console.error('Error reading posts.json:', e);
        }
    }

    posts.unshift(post);

    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
        res.json({ message: '投稿完了！', post });
    } catch (e) {
        console.error('Error writing posts.json:', e);
        res.status(500).json({ error: 'データ保存に失敗しました' });
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`サーバー起動中: http://localhost:${PORT}`);
});
