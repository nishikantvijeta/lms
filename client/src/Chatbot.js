import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);
  const hasWelcomedRef = useRef(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Show welcome message when chat opens (only once)
    if (isOpen && !hasWelcomedRef.current) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Hi there! How can I assist you today?' },
      ]);
      hasWelcomedRef.current = true;
    }
  }, [isOpen]);

  useEffect(() => {
    // Hide welcome bubble after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcomeBubble(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async (userMessage) => {
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const res = await fetch('https://lms-server-r3mf.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: data.reply || 'hello response from bot.' },
      ]);
    } catch (error) {
      console.error('Error calling backend:', error);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Sorry, something went wrong on the server.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-1 right-4 w-11/12 max-w-sm h-[400px] sm:h-[500px] flex flex-col bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="bg-blue-600 text-white p-3 text-lg font-semibold rounded-t-lg">
            Chat with AI
          </div>

          <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 text-sm ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && <span className="w-6 h-6">🤖</span>}
                <div
                  className={`p-2 rounded-lg max-w-[80%] ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && <span className="w-6 h-6" >👤</span>}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>🤖</span>
                <div className="flex space-x-1 animate-pulse">
                  <span className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex border-t border-gray-300">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="bg-red-600 text-white px-4 hover:bg-red-700 transition"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Welcome Bubble (styled with Tailwind) */}
      {showWelcomeBubble && !isOpen && (
        <div className="fixed bottom-[120px] right-6 z-50">
          <div className="bg-white text-sm text-gray-700 border border-gray-300 shadow-md px-4 py-2 rounded-xl animate-fade-in">
            👋 Hi! Need help?
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-12 right-4 z-50 bg-blue-600 text-white w-20 h-20 rounded-full shadow-lg text-2xl flex items-center justify-center hover:bg-blue-700 transition"
      >
        💬
      </button>
    </>
  );
}
