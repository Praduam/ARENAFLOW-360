import { useState, useEffect } from 'react';
import { Settings, X, Key, Check } from 'lucide-react';
import { aiService } from '../services/aiService';

export default function DeveloperSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [simState, setSimState] = useState(() => aiService.getState());
  const [apiKey, setApiKey] = useState(() => aiService.getState().apiKey);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const sub = aiService.subscribe((newState) => {
      setSimState(newState);
      setApiKey(newState.apiKey);
    });
    return sub;
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    aiService.updateApiKey(apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDensityChange = (sector, val) => {
    aiService.updateCrowdDensity(sector, parseInt(val));
  };

  const handleScoreChange = (type, val) => {
    const score = { ...simState.matchInfo.score };
    score[type] = parseInt(val) || 0;
    aiService.updateMatchScore(score.home, score.away, simState.matchInfo.time);
  };

  const handleTimeChange = (val) => {
    aiService.updateMatchScore(simState.matchInfo.score.home, simState.matchInfo.score.away, val);
  };

  return (
    <div className="settings-panel">
      <button 
        className="settings-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Developer Controls & API Key"
      >
        {isOpen ? <X size={22} /> : <Settings size={22} />}
      </button>

      {isOpen && (
        <div className="settings-modal" style={{ bottom: '65px', right: '0' }}>
          <div className="card-header-row" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={18} className="text-primary" />
              Developer Controls
            </h4>
            <span style={{ fontSize: '0.7rem', background: 'rgba(0, 240, 118, 0.15)', color: 'var(--primary-green)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
              LOCAL SIMULATOR
            </span>
          </div>

          {/* Gemini API Section */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem' }}>
              <Key size={14} style={{ color: 'var(--accent-blue)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Gemini API Key (Optional)</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
              Add your Google Gemini API Key to enable live, active GenAI query execution. Leaves blank to run on local simulation.
            </p>
            <form onSubmit={handleSaveKey} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="form-input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', flex: 1 }}
              />
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ padding: '0.4rem 0.75rem', width: 'auto', flexShrink: 0 }}
              >
                {isSaved ? <Check size={14} /> : 'Save'}
              </button>
            </form>
            {isSaved && (
              <span style={{ fontSize: '0.7rem', color: 'var(--primary-green)', marginTop: '0.25rem', display: 'block' }}>
                ✓ Key updated successfully
              </span>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.75rem' }}>
              Live Crowd Management Adjustments
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {Object.keys(simState.crowdLevels).map((sector) => (
                <div key={sector} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                    {sector}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={simState.crowdLevels[sector].density}
                      onChange={(e) => handleDensityChange(sector, e.target.value)}
                      style={{ width: '70px', accentColor: 'var(--primary-green)' }}
                    />
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold', width: '28px', textAlign: 'right' }}>
                      {simState.crowdLevels[sector].density}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Match Parameters Simulation
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>IND Score</label>
                <input 
                  type="number"
                  min="0"
                  value={simState.matchInfo.score.home}
                  onChange={(e) => handleScoreChange('home', e.target.value)}
                  className="form-input"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>PAK Score</label>
                <input 
                  type="number"
                  min="0"
                  value={simState.matchInfo.score.away}
                  onChange={(e) => handleScoreChange('away', e.target.value)}
                  className="form-input"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>Match Minute</label>
              <input 
                type="text"
                value={simState.matchInfo.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="form-input"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
