// vision_chat.js

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const mime = require("mime-types");
const { OpenAI } = require("openai");

// OpenAIクライアント初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 画像をBase64に変換
function encodeImageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString("base64");
}

// Visionチャットを実行する関数
async function createVisionChat(question, imagePath, temperature = 1) {
  if (!fs.existsSync(imagePath)) {
    console.log("指定された画像ファイルが見つかりません。");
    return;
  }

  const base64Image = encodeImageToBase64(imagePath);
  const mimeType = mime.lookup(imagePath) || "image/jpeg";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: question },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: temperature,
      max_tokens: 300,
    });

    console.log("\n===============================");
    console.log("🧠 ChatGPTからの回答:");
    console.log("===============================\n");
    console.log(response.choices[0].message.content);

  } catch (error) {
    console.error("エラー:", error.message || error);
  }
}

// CLI入力用
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("画像ファイル名を入力してください: ", (imagePath) => {
  rl.question("画像について質問してください: ", (question) => {
    createVisionChat(question, imagePath);
    rl.close();
  });
});
