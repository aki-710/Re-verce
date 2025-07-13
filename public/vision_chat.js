// vision_chat.js

import dotenv from 'dotenv';
import fs from 'fs';
import { OpenAI } from 'openai';
import readline from 'readline';

// .env から環境変数を読み込む
dotenv.config();

// OpenAI クライアントの初期化
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 画像を Base64 エンコードする関数
 * @param {string} imagePath
 * @returns {string}
 */
function encodeImage(imagePath) {
  return fs.readFileSync(imagePath, { encoding: 'base64' });
}

/**
 * Vision Chat を実行する関数
 * @param {string} question
 * @param {string} imagePath
 * @param {number} temperature
 * @returns {Promise<string>}
 */
async function createVisionChat(question, imagePath, temperature = 1) {
  if (!fs.existsSync(imagePath)) {
    return '指定された画像ファイルが見つかりません。';
  }

  try {
    const base64Image = encodeImage(imagePath);
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: question },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ];

    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature,
      max_tokens: 300,
    });

    return res.choices[0].message.content;
  } catch (err) {
    return `画像の処理中にエラーが発生しました: ${err.message}`;
  }
}

/**
 * メイン処理
 */
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const imagePath = await new Promise((resolve) =>
    rl.question('画像ファイル名を入力してください: ', resolve)
  );
  const question = await new Promise((resolve) =>
    rl.question('画像について質問してください: ', resolve)
  );
  rl.close();

  const response = await createVisionChat(question, imagePath);
  console.log('\n回答:');
  console.log(response);
}

// このスクリプトが直接実行されたときに main() を呼び出す
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
