import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socketInstance = io("http://localhost:3000");
    setSocket(socketInstance);

    socketInstance.on('ai-message-response', (response) => {
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        timestamp: new Date().toLocaleTimeString(),
        sender: 'bot'
      };

      setMessages(prev => [...prev, botMessage]);
    });

    return () => socketInstance.disconnect();
  }, []);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      timestamp: new Date().toLocaleTimeString(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    socket.emit('ai-message', inputText);
    setInputText('');
  };

  const handleInputChange = (e) => setInputText(e.target.value);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white py-4 text-center shadow-md">
        <h1 className="text-xl font-bold">AI Chat</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">Start a conversation...</div>
        ) : (
          <div className="flex flex-col space-y-4">
           {messages.map((msg) => (
  <div
    key={msg.id}
    className={`max-w-[75%] px-4 py-3 rounded-xl shadow-md text-sm relative flex flex-col ${
      msg.sender === 'user'
        ? 'bg-blue-500 text-white self-end rounded-br-none'
        : 'bg-white text-gray-800 self-start rounded-bl-none'
    }`}
  >
    <p className="whitespace-pre-line">{msg.text}</p>
    <span className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-gray-400 text-left'}`}>
      {msg.timestamp}
    </span>
  </div>
))}

            <div ref={messagesEndRef}></div>
          </div>
        )}
      </main>

      <footer className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={inputText.trim() === ''}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
