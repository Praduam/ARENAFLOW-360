import { useState, useEffect, useCallback } from 'react';
import { UserCheck, Languages, CheckSquare, Sparkles, Volume2, ShieldAlert } from 'lucide-react';
import { aiService } from '../services/aiService';

export default function VolunteerPortal() {
  // Volunteer Checkin Form
  const [volName, setVolName] = useState('');
  const [volRole, setVolRole] = useState('Language Assistant (ES/EN)');
  const [volGate, setVolGate] = useState('Gate A');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentVolId, setCurrentVolId] = useState(null);

  // Translation Panel state
  const [inputText, setInputText] = useState('Welcome to MetLife Stadium! Please show your digital ticket.');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [translationResult, setTranslationResult] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Shift Checklist items
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Collect green volunteer identification vest and radio/headset', done: true },
    { id: 2, text: 'Report to Sector/Gate supervisor for area orientation briefing', done: true },
    { id: 3, text: 'Verify closest ADA wheelchair-accessible ramps & elevators', done: false },
    { id: 4, text: 'Check clear-bag container bins for reference sizes', done: false },
    { id: 5, text: 'Inspect Sector ticket scanning stanchion line speeds', done: false }
  ]);



  const handleCheckin = (e) => {
    e.preventDefault();
    if (!volName.trim()) return;

    const newVol = aiService.checkinVolunteer({
      name: volName,
      role: volRole,
      gate: volGate
    });

    setCurrentVolId(newVol.id);
    setIsCheckedIn(true);
    setVolName('');
  };

  const handleChecklistToggle = (id) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) return { ...item, done: !item.done };
      return item;
    }));
  };

  const handleTranslatePhrase = useCallback((phrase) => {
    if (!phrase.trim()) return;
    setIsTranslating(true);
    
    // Simulate translation time
    setTimeout(() => {
      const result = aiService.getTranslation(phrase, targetLang);
      setTranslationResult(result);
      setIsTranslating(false);
    }, 400);
  }, [targetLang]);

  const handleTranslate = () => {
    handleTranslatePhrase(inputText);
  };

  // Run initial translation on mount / load
  useEffect(() => {
    handleTranslatePhrase(inputText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLang]);

  const speakTranslation = () => {
    if (!translationResult) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translationResult);
      const langCodes = {
        'English': 'en-US',
        'Spanish': 'es-ES',
        'French': 'fr-FR',
        'Arabic': 'ar-SA',
        'German': 'de-DE',
        'Japanese': 'ja-JP',
        'Portuguese': 'pt-PT'
      };
      utterance.lang = langCodes[targetLang] || 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech Synthesis not supported by this browser.');
    }
  };

  return (
    <div className="dashboard-grid">
      
      {/* Checkin / Shift Hub */}
      <div className="col-4">
        {isCheckedIn ? (
          <div className="glass-card glow-green" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="card-header-row" style={{ marginBottom: '1rem' }}>
                <h3 className="card-title" style={{ color: 'var(--primary-green)' }}>
                  <UserCheck size={20} />
                  Duty Checked-In
                </h3>
                <span className="badge success">Active Shift</span>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ID Reference:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{currentVolId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Station Assignment:</span>
                  <strong>{volGate}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Assigned Role:</span>
                  <strong>{volRole}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Your Entry Clearance Pass (QR Code)</span>
                {/* Simulated QR Code using CSS */}
                <div className="qr-scanner-container">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} style={{ width: '9px', height: '9px', background: Math.random() > 0.4 ? '#000' : '#fff' }}></div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              className="btn-secondary" 
              style={{ marginTop: '1.5rem', width: '100%' }}
              onClick={() => {
                setIsCheckedIn(false);
                setCurrentVolId(null);
              }}
            >
              Sign Out of Shift
            </button>
          </div>
        ) : (
          <div className="glass-card glow-blue" style={{ height: '100%' }}>
            <div className="card-header-row" style={{ marginBottom: '1rem' }}>
              <h3 className="card-title">
                <UserCheck size={20} style={{ color: 'var(--accent-blue)' }} />
                Volunteer Duty Check-In
              </h3>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Checked-in volunteers appear instantly in the Stadium Operations Control Center registry, allowing deployment staff to direct you.
            </p>

            <form onSubmit={handleCheckin}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Diego Ramirez"
                  value={volName}
                  onChange={(e) => setVolName(e.target.value)}
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Assigned Duty Role</label>
                <select value={volRole} onChange={(e) => setVolRole(e.target.value)} className="form-select">
                  <option value="Language Assistant (ES/EN)">Language Assistant (ES/EN)</option>
                  <option value="Language Assistant (FR/EN)">Language Assistant (FR/EN)</option>
                  <option value="Accessibility Usher">Accessibility Usher</option>
                  <option value="Gate Gatekeeper">Gate Greeter & Security Guide</option>
                  <option value="First Aid Assistant">First Aid Standby</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Gate/Sector Location</label>
                <select value={volGate} onChange={(e) => setVolGate(e.target.value)} className="form-select">
                  <option value="Gate A">Gate A (Main Entry)</option>
                  <option value="Gate B">Gate B (Transit Hub)</option>
                  <option value="Gate C">Gate C (West Gates)</option>
                  <option value="Gate D">Gate D (VIP & Accessible)</option>
                  <option value="Sector 100">Sector 100 (Lower Bowl)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">
                Confirm Duty Check-in
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Multilingual Translator Hub */}
      <div className="col-8">
        <div className="glass-card glow-green" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header-row" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">
              <Languages size={20} style={{ color: 'var(--primary-green)' }} />
              GenAI Multilingual Translation Toolkit
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assist international visitors instantly</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', flex: 1 }}>
            
            {/* Input area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Target Translation Language</label>
                <select 
                  value={targetLang} 
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="form-select"
                >
                  <option value="English">English (English)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Arabic">Arabic (العربية)</option>
                  <option value="Japanese">Japanese (日本語)</option>
                  <option value="Portuguese">Portuguese (Português)</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 1, margin: 0, display: 'flex', flexDirection: 'column' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>English Greeting / Statement</label>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="form-textarea"
                  style={{ flex: 1, minHeight: '120px' }}
                  placeholder="Type anything to translate..."
                />
              </div>

              <button className="btn-primary" onClick={handleTranslate} disabled={isTranslating}>
                <Sparkles size={16} />
                {isTranslating ? 'Translating...' : 'GenAI Translate'}
              </button>
            </div>

            {/* Output and presets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {targetLang} Translation
                </span>
                
                <div style={{ flex: 1, fontSize: '1rem', fontWeight: '500', color: '#fff', wordBreak: 'break-word', whiteSpace: 'pre-wrap', direction: targetLang === 'Arabic' ? 'rtl' : 'ltr' }}>
                  {translationResult}
                </div>

                {translationResult && (
                  <button 
                    onClick={speakTranslation} 
                    className="btn-secondary" 
                    style={{ marginTop: '1rem', width: 'fit-content', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  >
                    <Volume2 size={14} style={{ color: 'var(--accent-blue)' }} />
                    Play Audio Out Loud
                  </button>
                )}
              </div>

              {/* Presets */}
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>
                  Quick Preset Phrases
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem', justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    onClick={() => {
                      const phrase = 'Welcome to MetLife Stadium! Please show your digital ticket.';
                      setInputText(phrase);
                      handleTranslatePhrase(phrase);
                    }}
                  >
                    👋 "Welcome to MetLife Stadium! Please show..."
                  </button>
                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem', justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    onClick={() => {
                      const phrase = 'The nearest accessible restroom is down the concourse near Section 104.';
                      setInputText(phrase);
                      handleTranslatePhrase(phrase);
                    }}
                  >
                    ♿ "The nearest accessible restroom is down..."
                  </button>
                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem', justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    onClick={() => {
                      const phrase = 'In case of emergency, please follow me to the nearest exit stairs.';
                      setInputText(phrase);
                      handleTranslatePhrase(phrase);
                    }}
                  >
                    🚨 "In case of emergency, please follow..."
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Duty Guidelines Checklist */}
      <div className="col-12">
        <div className="glass-card glow-blue">
          <div className="card-header-row" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">
              <CheckSquare size={20} style={{ color: 'var(--accent-blue)' }} />
              Active Shift Task Checklist
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Perform periodic checks during shift</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {checklist.map(item => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem', cursor: 'pointer', color: item.done ? 'var(--text-secondary)' : '#fff' }}>
                    <input 
                      type="checkbox" 
                      checked={item.done} 
                      onChange={() => handleChecklistToggle(item.id)}
                      style={{ marginTop: '0.2rem', accentColor: 'var(--accent-blue)' }}
                    />
                    <span style={{ textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255, 46, 85, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 46, 85, 0.15)', height: 'fit-content' }}>
              <ShieldAlert size={24} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#fff', display: 'block', marginBottom: '0.25rem' }}>Emergency Dispatch Channel</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  If you encounter a medical or security crisis, do not attempt to resolve it yourself. Tune your radio to Channel 9 and speak directly to dispatch, or log the incident ticket directly via the staff portal terminal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
