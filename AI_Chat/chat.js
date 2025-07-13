// 👇 実行時に .env は読めないので、Node.jsの環境で渡すか、ここに直接書く
const apiKey = 'ここにAPIキーを直接書くか、Node.jsサーバー側で処理してね！';

const apiUrl = 'https://api.openai.com/v1/chat/completions';
const userInputEl = document.getElementById('userInput');
const chatContainer = document.getElementById('chatContainer');

let messages = [
    { role: 'system', content: 'あなたは親切な日本語アシスタントです。' }
];

const inputHistory = [];
let historyIndex = -1;

function appendMessage(text, sender) {
    const row = document.createElement('div');
    row.classList.add('messageRow', sender === 'user' ? 'userRow' : 'assistantRow');

    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.textContent = text;

    row.appendChild(msg);
    chatContainer.appendChild(row);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendToChatGPT() {
    const userInput = userInputEl.value.trim();
    if (!userInput) return;

    messages.push({ role: 'user', content: userInput });
    appendMessage(userInput, 'user');

    inputHistory.push(userInput);
    historyIndex = inputHistory.length;

    userInputEl.value = '';
    appendMessage('読み込み中...', 'assistant');

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages
            })
        });

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim() || '(返答なし)';
        messages.push({ role: 'assistant', content: reply });

        chatContainer.lastChild.remove();
        appendMessage(reply, 'assistant');
    } catch (error) {
        console.error(error);
        chatContainer.lastChild.remove();
        appendMessage('⚠️ エラーが発生しました。', 'assistant');
    }
}

function clearChat() {
    messages = [{ role: 'system', content: 'あなたは親切な日本語アシスタントです。' }];
    chatContainer.innerHTML = '';
    inputHistory.length = 0;
    historyIndex = -1;
}

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

userInputEl.addEventListener('keydown', (event) => {
    if (!isMobile && event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendToChatGPT();
    }

    if (event.key === 'ArrowUp') {
        if (historyIndex > 0) {
            historyIndex--;
            userInputEl.value = inputHistory[historyIndex];
            event.preventDefault();
        }
    }

    if (event.key === 'ArrowDown') {
        if (historyIndex < inputHistory.length - 1) {
            historyIndex++;
            userInputEl.value = inputHistory[historyIndex];
            event.preventDefault();
        } else {
            historyIndex = inputHistory.length;
            userInputEl.value = '';
            event.preventDefault();
        }
    }
});