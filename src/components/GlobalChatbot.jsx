import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Volume2, Globe, HelpCircle } from 'lucide-react';
import { aiService } from '../services/aiService';

export default function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your global ArenaFlow AI Assistant. Ask me anything about today\'s match, stadium navigation, food options, or operational guidelines.', time: '20:43' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatLanguage, setChatLanguage] = useState('English');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    if (!textToSend) setInputValue('');

    const newMsg = {
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const aiResponse = await aiService.getFanAIResponse(text, chatLanguage);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: aiResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'I encountered an error querying the GenAI engine. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const cleanText = text.replace(/[*#_\-`🚨]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const langCodes = {
        'English': 'en-US',
        'Spanish': 'es-ES',
        'French': 'fr-FR',
        'Arabic': 'ar-SA',
        'German': 'de-DE',
        'Japanese': 'ja-JP',
        'Portuguese': 'pt-PT'
      };
      utterance.lang = langCodes[chatLanguage] || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 250 }}>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50px',
          background: 'linear-gradient(135deg, var(--accent-blue) 0%, #0284c7 100%)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0, 210, 255, 0.4)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        title="ArenaFlow Assistant"
        className="settings-toggle-btn"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '68px',
            right: '0',
            width: '360px',
            height: '480px',
            background: '#0d111d',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slide-in 0.25s cubic-bezier(0, 0, 0.2, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-green)' }}></div>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-green)', animation: 'pulse-red 2s infinite' }}></div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ArenaFlow AI Portal
                  <Sparkles size={12} style={{ color: 'var(--accent-blue)' }} />
                </h4>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Powered by Gemini LLM</span>
              </div>
            </div>

            {/* Language Selector */}
            <select
              value={chatLanguage}
              onChange={(e) => setChatLanguage(e.target.value)}
              className="form-select"
              style={{
                width: 'auto',
                fontSize: '0.75rem',
                padding: '0.2rem 0.4rem',
                margin: 0,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
              }}
            >
              <option value="English">EN</option>
              <option value="Spanish">ES</option>
              <option value="French">FR</option>
              <option value="Arabic">AR</option>
              <option value="German">DE</option>
              <option value="Japanese">JA</option>
              <option value="Portuguese">PT</option>
            </select>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${msg.sender} ${msg.error ? 'ai-error' : ''}`}
                style={{
                  maxWidth: '85%',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} dangerouslySetInnerHTML={{
                      __html: line
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>')
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                  <span>{msg.time}</span>
                  {msg.sender === 'ai' && !msg.error && (
                    <button onClick={() => speakText(msg.text)} className="tts-btn" style={{ padding: '2px' }}>
                      <Volume2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble ai" style={{ alignSelf: 'flex-start' }}>
                <div className="typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips */}
          <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.35rem', overflowX: 'auto', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={() => handleSendMessage('Who is leading the match?')}>
              ⚽ Score Status
            </button>
            <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={() => handleSendMessage('Where is the nearest vegan food?')}>
              🌱 Vegan Food
            </button>
            <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={() => handleSendMessage('Is parking Lot A full?')}>
              🚗 Parking
            </button>
          </div>

          {/* Input Area */}
          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)' }}>
            <div className="chat-input-bar">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                style={{ fontSize: '0.85rem' }}
              />
              <button onClick={() => handleSendMessage()} disabled={isTyping}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
