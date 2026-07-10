import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Send, Radio, UserCheck, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { aiService } from '../services/aiService';

// Mock chart data for crowd entry levels over the day
const trafficHistory = [
  { time: '17:00', entryRate: 1500, GateB: 800 },
  { time: '17:30', entryRate: 3200, GateB: 1200 },
  { time: '18:00', entryRate: 5800, GateB: 2400 },
  { time: '18:30', entryRate: 8900, GateB: 4500 },
  { time: '19:00', entryRate: 12000, GateB: 7200 },
  { time: '19:30', entryRate: 14500, GateB: 9800 },
  { time: '20:00', entryRate: 6400, GateB: 4200 },
  { time: '20:30', entryRate: 1800, GateB: 1100 }
];

export default function StaffPortal() {
  const [simState, setSimState] = useState(aiService.getState());
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dispatchDraft, setDispatchDraft] = useState('');
  
  // Incident Form state
  const [newCategory, setNewCategory] = useState('Maintenance');
  const [newSector, setNewSector] = useState('Sector 100 (Lower Bowl)');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');

  // Operational Oracle AI
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleResponse, setOracleResponse] = useState('');
  const [oracleLoading, setOracleLoading] = useState(false);

  useEffect(() => {
    const sub = aiService.subscribe((newState) => {
      setSimState(newState);
    });
    return sub;
  }, []);

  const handleCreateIncident = (e) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    aiService.addIncident({
      category: newCategory,
      sector: newSector,
      description: newDesc,
      priority: newPriority
    });

    setNewDesc('');
  };

  const handleUpdateStatus = (id, status, assigned) => {
    aiService.updateIncidentStatus(id, status, assigned);
  };

  const handleTriggerDispatchAI = (inc) => {
    setSelectedIncident(inc);
    const draft = aiService.generateDispatchDraft(inc);
    setDispatchDraft(draft);
  };

  const handleAskOracle = async (e) => {
    e.preventDefault();
    if (!oracleQuery.trim()) return;

    setOracleLoading(true);
    try {
      const resp = await aiService.getStaffAIResponse(oracleQuery);
      setOracleResponse(resp);
    } catch {
      setOracleResponse('Failed to contact AI Oracle. Please try again.');
    } finally {
      setOracleLoading(false);
    }
  };

  const activeIncidents = simState.incidents.filter(inc => inc.status !== 'Resolved');
  const totalOpenIncidents = activeIncidents.length;
  const criticalIncidents = activeIncidents.filter(inc => inc.priority === 'High').length;

  return (
    <div className="dashboard-grid">
      
      {/* Metrics Row */}
      <div className="col-12">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          
          <div className="glass-card glow-green" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Match Attendance</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <strong style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--primary-green)' }}>
                {simState.matchInfo.attendance.toLocaleString()}
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 82,500</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-green)' }}></span>
              <span>Stadium Capacity at 99.9%</span>
            </div>
          </div>

          <div className="glass-card glow-blue" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Active Incidents</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <strong style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--accent-blue)' }}>
                {totalOpenIncidents}
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>open tickets</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--accent-red)', marginTop: '0.5rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-red)' }}></span>
              <span>{criticalIncidents} High Priority Critical Alert(s)</span>
            </div>
          </div>

          <div className="glass-card glow-green" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Active Volunteers</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <strong style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--primary-green)' }}>
                {simState.volunteers.length}
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>checked-in</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              <UserCheck size={12} style={{ color: 'var(--primary-green)' }} />
              <span>All volunteer zones staffed</span>
            </div>
          </div>

          <div className="glass-card glow-blue" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Gate B Congestion</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <strong style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--accent-red)' }}>
                {simState.crowdLevels['Gate B (Transit Hub)'].density}%
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>density</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--accent-red)', marginTop: '0.5rem' }}>
              <ShieldAlert size={12} style={{ color: 'var(--accent-red)' }} />
              <span>Critical warning trigger threshold: 85%</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Incident Log */}
      <div className="col-8">
        <div className="glass-card glow-blue" style={{ height: '100%' }}>
          <div className="card-header-row">
            <h3 className="card-title">
              <ShieldAlert size={20} style={{ color: 'var(--accent-blue)' }} />
              Live Operations Incident Tracker
            </h3>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255, 46, 85, 0.1)', color: 'var(--accent-red)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255, 46, 85, 0.2)' }}>
              Real-time Feed
            </span>
          </div>

          <div className="table-wrapper" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Details</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Dispatcher Actions</th>
                </tr>
              </thead>
              <tbody>
                {simState.incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{inc.id}</td>
                    <td>
                      <span className={`badge ${inc.category === 'Medical' ? 'danger' : inc.category === 'Maintenance' ? 'warning' : 'info'}`}>
                        {inc.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{inc.sector}</td>
                    <td style={{ fontSize: '0.8rem', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={inc.description}>
                      {inc.description}
                    </td>
                    <td>
                      <span style={{ 
                        color: inc.priority === 'High' ? 'var(--accent-red)' : inc.priority === 'Medium' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        fontWeight: 'bold'
                      }}>
                        {inc.priority}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={inc.status} 
                        onChange={(e) => handleUpdateStatus(inc.id, e.target.value, inc.assignedTo)}
                        className="form-select"
                        style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem', width: 'auto', background: 'rgba(255,255,255,0.05)' }}
                      >
                        <option value="Open">Open</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        className="btn-secondary" 
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={() => handleTriggerDispatchAI(inc)}
                      >
                        <Sparkles size={11} style={{ color: 'var(--primary-green)' }} />
                        GenAI Dispatch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Incident & Dispatch Preview Column */}
      <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* GenAI Smart Dispatch Engine */}
        <div className="glass-card glow-green">
          <div className="card-header-row">
            <h3 className="card-title">
              <Radio size={18} style={{ color: 'var(--primary-green)' }} />
              GenAI Smart Dispatcher
            </h3>
          </div>
          
          {selectedIncident ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Incident: <strong>{selectedIncident.id}</strong></span>
                <span>Priority: <strong style={{ color: selectedIncident.priority === 'High' ? 'var(--accent-red)' : '#fff' }}>{selectedIncident.priority}</strong></span>
              </div>
              <div className="dispatch-draft-container">
                <div className="dispatch-draft-title">Draft Dispatch Script (Generated)</div>
                {dispatchDraft}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                <select 
                  className="form-select" 
                  style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                  onChange={(e) => handleUpdateStatus(selectedIncident.id, 'Dispatched', e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Assign Crew...</option>
                  <option value="Volunteer Team A">Volunteer Team A (Gate A)</option>
                  <option value="Volunteer Team B">Volunteer Team B (Sect 300)</option>
                  <option value="First Aid Patrol 1">First Aid Patrol 1</option>
                  <option value="First Aid Station 2">First Aid Station 2</option>
                  <option value="Security Detail C">Security Detail C</option>
                </select>
                <button 
                  className="btn-primary" 
                  style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                  onClick={() => {
                    alert(`Radio transmission sent:\n\n${dispatchDraft}`);
                    handleUpdateStatus(selectedIncident.id, 'Dispatched');
                    setSelectedIncident(null);
                  }}
                >
                  <Radio size={12} />
                  Transmit
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
              <Radio size={28} style={{ strokeWidth: '1.5px', marginBottom: '0.5rem', color: 'var(--text-muted)' }} />
              <p style={{ fontSize: '0.8rem' }}>Click "GenAI Dispatch" on any incident ticket to automatically draft a radio transmission order.</p>
            </div>
          )}
        </div>

        {/* Report New Incident Form */}
        <div className="glass-card glow-blue">
          <div className="card-header-row" style={{ marginBottom: '0.75rem' }}>
            <h3 className="card-title">
              <Plus size={18} style={{ color: 'var(--accent-blue)' }} />
              Log New Incident ticket
            </h3>
          </div>

          <form onSubmit={handleCreateIncident}>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.7rem' }}>Category</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="form-select" style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                <option value="Maintenance">Maintenance / Cleaning</option>
                <option value="Medical">Medical Aid</option>
                <option value="Ticketing">Ticketing / Gate Tech</option>
                <option value="Security">Security Assistance</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.7rem' }}>Stadium Location</label>
              <select value={newSector} onChange={(e) => setNewSector(e.target.value)} className="form-select" style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                {Object.keys(simState.crowdLevels).map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.7rem' }}>Severity Level</label>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="form-select" style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                <option value="Low">Low Priority (Routine)</option>
                <option value="Medium">Medium Priority (Urgent)</option>
                <option value="High">High Priority (Emergency)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.7rem' }}>Description Details</label>
              <input 
                type="text" 
                placeholder="e.g. Broken turnstile barrier, spill, chest pain" 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="form-input" 
                style={{ padding: '0.4rem', fontSize: '0.8rem' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
              <Plus size={14} />
              Add Ticket
            </button>
          </form>
        </div>

      </div>

      {/* Analytics Flow Chart */}
      <div className="col-8">
        <div className="glass-card glow-green">
          <div className="card-header-row" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">
              <Sparkles size={20} style={{ color: 'var(--primary-green)' }} />
              Real-time Traffic & Transit Entry Rates
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Arrivals vs Gate B Load (Fans/hour)
            </span>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntry" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-green)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary-green)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGateB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-red)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0d111d', 
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.75rem'
                  }} 
                />
                <Area type="monotone" dataKey="entryRate" stroke="var(--primary-green)" fillOpacity={1} fill="url(#colorEntry)" name="Total Entry Rate" />
                <Area type="monotone" dataKey="GateB" stroke="var(--accent-red)" fillOpacity={1} fill="url(#colorGateB)" name="Gate B Congestion" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Control Tower AI Oracle */}
      <div className="col-4">
        <div className="glass-card glow-blue" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header-row" style={{ marginBottom: '0.75rem' }}>
            <h3 className="card-title">
              <BookOpen size={18} style={{ color: 'var(--accent-blue)' }} />
              Operations AI Oracle
            </h3>
          </div>

          <form onSubmit={handleAskOracle} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Query protocol (e.g. 'lightning', 'spill protocol')"
              value={oracleQuery}
              onChange={(e) => setOracleQuery(e.target.value)}
              className="form-input"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.4rem 0.75rem' }} disabled={oracleLoading}>
              <Send size={14} />
            </button>
          </form>

          <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', lineHeight: '1.4', maxHeight: '180px' }}>
            {oracleLoading ? (
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
                <span className="typing-dot" style={{ background: '#fff' }}></span>
                <span className="typing-dot" style={{ background: '#fff' }}></span>
                <span className="typing-dot" style={{ background: '#fff' }}></span>
              </div>
            ) : oracleResponse ? (
              <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{
                __html: oracleResponse
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/### (.*?)\n/g, '<h4 style="color: var(--accent-blue); margin-bottom: 0.5rem;">$1</h4>')
                  .replace(/- (.*?)\n/g, '<li style="margin-left: 10px; margin-bottom: 0.25rem;">$1</li>')
              }} />
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Ask operations guidelines. Try asking about *lightning protocol*, *Code Red*, or *spill cleaning SLAs*.</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
