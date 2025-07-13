const baseUrl = 'https://api.openai.com/v1'
 HEAD
const apiKey = import.meta.env.VITE_OPENAI_API_KEY // ← .envから読み込むならこれでOK

const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
}

const chatDiv = document.getElementById('chat')
const input = document.getElementById('messageInput')
const button = document.getElementById('sendBtn')

let messages = [
    {
        role: 'system',
        content: 'あなたは私の親友です。語尾に「だよん」「〜ね」などを使って、明るくフレンドリーに話してね。'
    }
]

// メッセージ表示用関数
function addMessage(role, content) {
    const msg = document.createElement('p')
    msg.textContent = `${role === 'user' ? 'あなた：' : 'AI*'} ${content}`
    msg.className = role
    chatDiv.appendChild(msg)
    chatDiv.scrollTop = chatDiv.scrollHeight
}

// 送信ボタンクリック時
button.addEventListener('click', async () => {
    const userMessage = input.value
    if (!userMessage) return

    // ユーザーメッセージを追加
    messages.push({ role: 'user', content: userMessage })
    addMessage('user', userMessage)
    input.value = ''

    const body = {
        model: 'gpt-3.5-turbo',
        messages: messages
    }

    try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })
        const data = await res.json()

        const aiReply = data.choices[0].message.content
        messages.push({ role: 'assistant', content: aiReply })
        addMessage('ai', aiReply)
    } catch (error) {
        console.error('API通信エラー:', error)
        addMessage('ai', '接続に失敗しちゃったみたい…🥲')
    }
})
