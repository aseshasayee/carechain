// Modern chat UI for recruiter and candidate
// Usage: openChatUI(roomName, recipientName, recipientId)

let chatWS = null;
let chatRoomName = null;
let typingTimeout = null;
let isTyping = false;
let unreadCount = 0;
let chatBoxActive = false;

async function openChatUI(roomName, recipientName, recipientId) {
  chatRoomName = roomName;
  chatBoxActive = true;
  unreadCount = 0;
  // Remove any existing chat box
  let chatBox = document.getElementById('chat-ui-box');
  if (chatBox) chatBox.remove();

  // Create the chat room before loading messages or opening WebSocket
  try {
    await apiRequest('/api/chat/create-room/', {
      method: 'POST',
      body: { room_name: roomName, recipient_id: recipientId }
    });
  } catch (e) {
    // Ignore errors if room already exists
  }

  // Create chat box
  chatBox = document.createElement('div');
  chatBox.id = 'chat-ui-box';
  chatBox.innerHTML = `
    <div class="chat-ui-header">
      <span>Chat with ${recipientName} <span id="chat-ui-unread" style="display:none;background:#e53935;color:#fff;border-radius:8px;padding:2px 8px;font-size:0.9em;margin-left:8px;"></span></span>
      <button class="chat-ui-close" onclick="closeChatUI()">×</button>
    </div>
    <div id="chat-ui-messages" class="chat-ui-messages"></div>
    <div id="chat-ui-typing" style="padding:0 16px 8px 16px;color:#888;font-size:0.95em;display:none;">Typing...</div>
    <form id="chat-ui-form" class="chat-ui-form">
      <input id="chat-ui-input" autocomplete="off" placeholder="Type a message..." />
      <button>Send</button>
    </form>
  `;
  chatBox.className = 'chat-ui-container';
  document.body.appendChild(chatBox);

  // Style
  if (!document.getElementById('chat-ui-style')) {
    const style = document.createElement('style');
    style.id = 'chat-ui-style';
    style.textContent = `
      .chat-ui-container { position:fixed;bottom:24px;right:24px;width:350px;background:#fff;border-radius:10px;box-shadow:0 2px 16px rgba(0,0,0,0.18);z-index:2000;display:flex;flex-direction:column; }
      .chat-ui-header { background:#1976d2;color:#fff;padding:12px 16px;font-weight:600;display:flex;justify-content:space-between;align-items:center;border-radius:10px 10px 0 0; }
      .chat-ui-close { background:none;border:none;color:#fff;font-size:1.3em;cursor:pointer; }
      .chat-ui-messages { flex:1;overflow-y:auto;padding:12px;background:#f7f7fa; }
      .chat-ui-message { margin-bottom:10px;max-width:80%;word-break:break-word; }
      .chat-ui-message.me { background:#1976d2;color:#fff;align-self:flex-end;border-radius:16px 16px 2px 16px;padding:8px 14px; }
      .chat-ui-message.them { background:#e3e7ef;color:#222;align-self:flex-start;border-radius:16px 16px 16px 2px;padding:8px 14px; }
      .chat-ui-form { display:flex;padding:10px;border-top:1px solid #eee; }
      #chat-ui-input { flex:1;padding:8px 12px;border-radius:6px;border:1px solid #ccc;margin-right:8px; }
      #chat-ui-form button { background:#1976d2;color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer; }
    `;
    document.head.appendChild(style);
  }

  // Load chat history
  fetch(`http://127.0.0.1:8000/api/chat/${roomName}/messages/`, { credentials: 'include' })
    .then(r => r.json())
    .then(messages => {
      renderChatMessages(messages, recipientId);
      scrollChatToBottom();
    });

  // Open WebSocket with JWT token as query param
  if (chatWS) chatWS.close();
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const token = localStorage.getItem('access');
  const wsUrl = `${protocol}://${location.hostname}:8000/ws/chat/${roomName}/` + (token ? `?token=${token}` : '');
  chatWS = new WebSocket(wsUrl);
  chatWS.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.message && data.sender) {
      appendChatMessage(data, recipientId);
      scrollChatToBottom();
      if (!chatBoxActive) {
        unreadCount++;
        showUnreadBadge();
        playNotificationSound();
      }
    }
    if (data.typing && data.sender !== getMyId()) {
      showTypingIndicator();
    }
  };

  // Typing indicator
  document.getElementById('chat-ui-input').addEventListener('input', function() {
    if (!isTyping) {
      isTyping = true;
      sendTyping();
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => { isTyping = false; }, 1200);
  });

  // Send message
  document.getElementById('chat-ui-form').onsubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById('chat-ui-input');
    if (input.value.trim()) {
      // Always send recipient_id for backend participant logic
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      chatWS.send(JSON.stringify({ message: input.value, recipient_id: recipientId }));
      input.value = '';
      isTyping = false;
    }
  };

// Add missing appendChatMessage function
function appendChatMessage(data, recipientId) {
  const messagesDiv = document.getElementById('chat-ui-messages');
  if (!messagesDiv) return;
  const isMe = data.sender === getMyId() || data.sender_username === getMyId();
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-ui-message ' + (isMe ? 'me' : 'them');
  msgDiv.textContent = data.message || data.content;
  messagesDiv.appendChild(msgDiv);
}

// Add missing renderChatMessages function
function renderChatMessages(messages, recipientId) {
  const messagesDiv = document.getElementById('chat-ui-messages');
  if (!messagesDiv) return;
  messagesDiv.innerHTML = '';
  (messages || []).forEach(msg => {
    appendChatMessage(msg, recipientId);
  });
}

// Add missing scrollChatToBottom function
function scrollChatToBottom() {
  const messagesDiv = document.getElementById('chat-ui-messages');
  if (messagesDiv) {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}
}

function closeChatUI() {
  chatBoxActive = false;
  if (chatWS) chatWS.close();
  const chatBox = document.getElementById('chat-ui-box');
  if (chatBox) chatBox.remove();
}

function showTypingIndicator() {
  const typingDiv = document.getElementById('chat-ui-typing');
  if (typingDiv) {
    typingDiv.style.display = 'block';
    setTimeout(() => { typingDiv.style.display = 'none'; }, 1200);
  }
}

function sendTyping() {
  if (chatWS && chatWS.readyState === 1) {
    chatWS.send(JSON.stringify({ typing: true }));
  }
}

function showUnreadBadge() {
  const badge = document.getElementById('chat-ui-unread');
  if (badge) {
    badge.textContent = unreadCount > 0 ? unreadCount : '';
    badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
  }
}

function playNotificationSound() {
  const audio = document.createElement('audio');
  audio.src = 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3';
  audio.autoplay = true;
  audio.style.display = 'none';
  document.body.appendChild(audio);
  setTimeout(() => audio.remove(), 2000);
}

function getMyId() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id || user.username;
}
