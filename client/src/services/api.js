const API_BASE = '/api';

export const api = {
  // Start study session
  startSession: async (payload) => {
    const res = await fetch(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to start session');
    return res.json();
  },

  // Record mood rating on Likert scale
  rateMood: async (sessionId, payload) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/rate-mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to record mood rating');
    return res.json();
  },

  // Send counter-demand on the negotiate wire
  sendCounter: async (sessionId, payload) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/counter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to evaluate demand');
    return res.json();
  },

  // Record round outcome
  recordRound: async (sessionId, payload) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/round`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to record round outcome');
    return res.json();
  },

  // Complete study session
  completeSession: async (sessionId) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to finalize session');
    return res.json();
  },

  // Get session details
  getSession: async (sessionId) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch session');
    return res.json();
  },

  // Get analytics summary
  getAnalyticsSummary: async () => {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch analytics');
    return res.json();
  },

  // Seed demo data
  seedDemoData: async () => {
    const res = await fetch(`${API_BASE}/analytics/seed-demo`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to seed demo data');
    return res.json();
  },

  getExportCsvUrl: () => `${API_BASE}/analytics/export/csv`
};
