// Minimal chat UI and WebSocket logic for recruiter-candidate messaging
// Assumes roomName is a unique string for recruiter-candidate pair (e.g., 'recruiter_1_candidate_2')

function openChat(roomName, candidateName) {
  let chatBox = document.getElementById('chat-box');
  if (!chatBox) {
    chatBox = document.createElement('div');
    chatBox.id = 'chat-box';
    chatBox.innerHTML = `
      <div class="chat-header">Chat with ${candidateName || 'candidate'} <button onclick="closeChat()">×</button></div>
      <div id="chat-messages" class="chat-messages"></div>
      <form id="chat-form"><input id="chat-input" autocomplete="off" placeholder="Type a message..." /><button>Send</button></form>
    `;
    chatBox.style = 'position:fixed;bottom:24px;right:24px;width:320px;background:#fff;border:1px solid #ccc;z-index:2000;box-shadow:0 2px 8px rgba(0,0,0,0.2);border-radius:8px;';
    document.body.appendChild(chatBox);
  }
  let ws = window.currentChatWS;
  if (ws) ws.close();
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${protocol}://${location.hostname}:8000/ws/chat/${roomName}/`);
  window.currentChatWS = ws;
  ws.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const msgDiv = document.createElement('div');
    msgDiv.textContent = `${data.sender}: ${data.message}`;
    document.getElementById('chat-messages').appendChild(msgDiv);
  };
  ws.onclose = function() {
    // Optionally show disconnected
  };
  document.getElementById('chat-form').onsubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    if (input.value.trim()) {
      ws.send(JSON.stringify({ message: input.value }));
      input.value = '';
    }
  };
}

function closeChat() {
  if (window.currentChatWS) window.currentChatWS.close();
  const chatBox = document.getElementById('chat-box');
  if (chatBox) chatBox.remove();
}
