import { useState, useEffect, useRef } from 'react';
import { Send, Map, Compass, Bus, Sparkles, Globe, Volume2, Shield } from 'lucide-react';
import { aiService } from '../services/aiService';

export default function FanPortal() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Welcome to MetLife Stadium! I am ArenaFlow, your GenAI Match Day Companion. Ask me anything about directions, food locations, transport schedules, accessibility routes, or stadium guidelines.', time: '20:26' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [chatLanguage, setChatLanguage] = useState('English');
  const [isTyping, setIsTyping] = useState(false);
  
  const [selectedSector, setSelectedSector] = useState('Sector 100 (Lower Bowl)');
  const [simState, setSimState] = useState(aiService.getState());

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const sub = aiService.subscribe((newState) => {
      setSimState(newState);
    });
    return sub;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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
    } catch {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Sorry, I encountered an issue processing that query. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (query) => {
    handleSendMessage(query);
  };

  // Convert text-to-speech (simulated or HTML5 speech synthesis if available)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Strip markdown syntax
      const cleanText = text.replace(/[*#_\-`🚨]/gu, '');
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
    } else {
      alert('Speech synthesis is not supported on this browser.');
    }
  };

  const currentSectorData = simState.crowdLevels[selectedSector] || { level: 'Low', density: 0, color: '#22c55e' };

  const getSeatViewDescription = (sectorName) => {
    if (sectorName.includes('100')) {
      return 'Direct lower bowl views. Excellent closeness to the pitch. Elevators and accessible pathways are located directly behind Section 104 and 128.';
    }
    if (sectorName.includes('200')) {
      return 'Club-level views with excellent elevation. Enclosed concourse access. Refill water station and restrooms located within a 30m radius of Section 207.';
    }
    return 'Upper deck panoramic view of the entire field. Open air. Less crowded concourses. Escalators available behind Section 315.';
  };

  return (
    <div className="dashboard-grid">
      
      {/* Live Banner Info */}
      <div className="col-12">
        <div className="live-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="live-badge">
              <span className="typing-dot" style={{ background: '#fff', width: '8px', height: '8px', animation: 'none' }}></span>
              LIVE
            </span>
            <div className="match-teams">
              <span>{simState.matchInfo.teams.home}</span>
              <span className="match-score">{simState.matchInfo.score.home} - {simState.matchInfo.score.away}</span>
              <span>{simState.matchInfo.teams.away}</span>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
              • {simState.matchInfo.time}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Weather: <strong>{simState.matchInfo.weather}</strong></span>
            <span>Attendance: <strong>{simState.matchInfo.attendance.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Fan Assistant Column */}
      <div className="col-6">
        <div className="glass-card glow-blue" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header-row">
            <h3 className="card-title">
              <Sparkles size={20} style={{ color: 'var(--accent-blue)' }} />
              FIFA GenAI Companion
            </h3>
            
            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={15} style={{ color: 'var(--text-secondary)' }} />
              <select 
                value={chatLanguage} 
                onChange={(e) => setChatLanguage(e.target.value)}
                className="form-select"
                style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)' }}
              >
                <option value="English">English</option>
                <option value="Spanish">Español</option>
                <option value="French">Français</option>
                <option value="Arabic">العربية</option>
                <option value="German">Deutsch</option>
                <option value="Japanese">日本語</option>
                <option value="Portuguese">Português</option>
              </select>
            </div>
          </div>

          <div className="ai-chat-container">
            {/* Messages */}
            <div className="ai-chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`chat-bubble ${msg.sender} ${msg.error ? 'ai-error' : ''}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {/* Render basic bold formatting in markdown */}
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>')
                      }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <span>{msg.time}</span>
                    {msg.sender === 'ai' && !msg.error && (
                      <button onClick={() => speakText(msg.text)} className="tts-btn" title="Listen to response">
                        <Volume2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat-bubble ai">
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={() => handleSuggestionClick('Where are the accessible restrooms?')}>
                ♿ Restrooms
              </button>
              <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={() => handleSuggestionClick('How do I take the train back to Secaucus?')}>
                🚆 Secaucus Rail
              </button>
              <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={() => handleSuggestionClick('Is there vegan or kosher food?')}>
                🌱 Vegan Dining
              </button>
              <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={() => handleSuggestionClick('What is the stadium clear bag policy?')}>
                🎒 Bag Policy
              </button>
            </div>

            {/* Input Bar */}
            <div className="chat-input-bar">
              <input 
                type="text" 
                placeholder={`Ask in ${chatLanguage}... (e.g., 'elevator near section 100')`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={() => handleSendMessage()} disabled={isTyping} style={{ background: 'var(--accent-blue)' }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map and Seat Viewer Column */}
      <div className="col-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Map Explorer */}
        <div className="glass-card glow-green">
          <div className="card-header-row">
            <h3 className="card-title">
              <Map size={20} style={{ color: 'var(--primary-green)' }} />
              Interactive Stadium Explorer
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Click sectors to explore</span>
          </div>

          <div className="stadium-map-wrapper">
            {/* Custom SVG Stadium Layout */}
            <svg viewBox="0 0 400 300" className="stadium-svg-container">
              {/* Soccer Field Pitch */}
              <rect x="140" y="100" width="120" height="100" rx="4" fill="#1b4d3e" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <line x1="200" y1="100" x2="200" y2="200" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <circle cx="200" cy="150" r="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              
              {/* Sector 100 (Inner Ring) */}
              <path 
                d="M 120 70 L 280 70 A 90 90 0 0 1 280 230 L 120 230 A 90 90 0 0 1 120 70 Z" 
                className={`map-sector-path ${selectedSector === 'Sector 100 (Lower Bowl)' ? 'active' : ''}`}
                onClick={() => setSelectedSector('Sector 100 (Lower Bowl)')}
              />
              
              {/* Sector 200 (Middle Ring) */}
              <path 
                d="M 100 50 L 300 50 A 120 120 0 0 1 300 250 L 100 250 A 120 120 0 0 1 100 50 Z" 
                className={`map-sector-path ${selectedSector === 'Sector 200 (Club Level)' ? 'active' : ''}`}
                onClick={() => setSelectedSector('Sector 200 (Club Level)')}
                style={{ strokeDasharray: '4 2' }}
              />

              {/* Sector 300 (Outer Ring) */}
              <path 
                d="M 80 30 L 320 30 A 150 150 0 0 1 320 270 L 80 270 A 150 150 0 0 1 80 30 Z" 
                className={`map-sector-path ${selectedSector === 'Sector 300 (Upper Deck)' ? 'active' : ''}`}
                onClick={() => setSelectedSector('Sector 300 (Upper Deck)')}
              />

              {/* Labels */}
              <text x="200" y="85" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="bold">LOWER 100</text>
              <text x="200" y="60" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="bold">CLUB 200</text>
              <text x="200" y="42" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="bold">UPPER 300</text>

              {/* Transit Icons / Gates */}
              <circle cx="200" cy="18" r="7" fill="#ef4444" />
              <text x="200" y="21" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="bold">B</text>
              <text x="200" y="9" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">Transit Hub</text>

              <circle cx="360" cy="150" r="7" fill="#eab308" />
              <text x="360" y="153" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="bold">A</text>

              <circle cx="40" cy="150" r="7" fill="#22c55e" />
              <text x="40" y="153" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="bold">C</text>
            </svg>

            {/* Heatmap overlay dots */}
            <div className="heatmap-indicator" style={{ top: '15px', left: '46%', background: '#ef4444' }} onClick={() => setSelectedSector('Sector 200 (Club Level)')} title="Gate B Congestion">88%</div>
            <div className="heatmap-indicator" style={{ bottom: '15px', right: '40px', background: '#22c55e' }} onClick={() => setSelectedSector('Sector 300 (Upper Deck)')} title="Sector 300 Congestion">40%</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Selected Sector</span>
              <strong style={{ fontSize: '1rem', color: 'var(--accent-blue)' }}>{selectedSector}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Congestion Level</span>
              <span className={`badge ${currentSectorData.level === 'High' ? 'danger' : currentSectorData.level === 'Moderate' ? 'warning' : 'success'}`}>
                {currentSectorData.level} ({currentSectorData.density}%)
              </span>
            </div>
          </div>
        </div>

        {/* Seat view simulator */}
        <div className="glass-card glow-blue" style={{ flex: 1 }}>
          <div className="card-header-row" style={{ marginBottom: '0.75rem' }}>
            <h3 className="card-title">
              <Compass size={18} style={{ color: 'var(--accent-blue)' }} />
              GenAI Seat View & Accessibility Preview
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '140px', position: 'relative' }}>
              <img 
                src="/stadium_seat_view.png" 
                alt="Stadium pitch view"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '0.5rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={12} style={{ color: 'var(--primary-green)' }} />
                <span>Simulated View from Seat Section</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {getSeatViewDescription(selectedSector)}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent-blue)', borderRadius: '4px', border: '1px solid rgba(0, 210, 255, 0.2)' }}>
                  Elevator Access: 20m
                </span>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(0, 240, 118, 0.1)', color: 'var(--primary-green)', borderRadius: '4px', border: '1px solid rgba(0, 240, 118, 0.2)' }}>
                  Fountain: Nearby
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobility and transit stats */}
        <div className="glass-card glow-green">
          <div className="card-header-row" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">
              <Bus size={18} style={{ color: 'var(--primary-green)' }} />
              Real-time Mobility Tracker
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Secaucus Train Queue</span>
              <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>12 mins wait</strong>
              <span className="badge warning" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>High Load</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Shuttle S1 (Secaucus)</span>
              <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>4 mins away</strong>
              <span className="badge success" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>On Schedule</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Lot A Parking Space</span>
              <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>280 free</strong>
              <span className="badge warning" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>72% Full</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', background: 'rgba(255, 190, 0, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 190, 0, 0.2)', color: 'var(--accent-gold)' }}>
            <Shield size={14} style={{ flexShrink: 0 }} />
            <span>Due to secure perimeter, taxi/rideshare pickups are limited strictly to **Lot C** near Gate C.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
