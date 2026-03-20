import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('petrol_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({ odo: '', liters: '', price: '' });

  useEffect(() => {
    localStorage.setItem('petrol_logs', JSON.stringify(logs));
  }, [logs]);

  // NEW: Calculate days since last refill
  const getDaysSinceLast = () => {
    if (logs.length === 0) return 0;
    const lastDate = new Date(logs[0].timestamp);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
    return diffDays;
  };

  const getMonthlyStats = () => {
    const stats = {};
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!stats[monthYear]) stats[monthYear] = { totalSpent: 0, totalDist: 0 };
      stats[monthYear].totalSpent += parseFloat(log.price || 0);
      stats[monthYear].totalDist += parseFloat(log.distance || 0);
    });
    return Object.entries(stats);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentOdo = parseFloat(formData.odo);
    const lastEntry = logs[0];
    const distance = lastEntry ? currentOdo - lastEntry.odo : 0;
    
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      odo: currentOdo,
      liters: formData.liters,
      price: formData.price,
      distance: distance,
      avg: distance > 0 ? (distance / formData.liters).toFixed(2) : 0
    };

    setLogs([newLog, ...logs]);
    setFormData({ odo: '', liters: '', price: '' });
  };

  const deleteEntry = (id) => {
    if(window.confirm("Delete this log, Master?")) {
      setLogs(logs.filter(log => log.id !== id));
    }
  };

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <h1>Master Fuel</h1>
        <div className="status-pill">
          {getDaysSinceLast()} Days Since Last Refill
        </div>
      </header>

      <main className="content">
        {/* Quick Glance Dashboard */}
        <div className="dashboard-grid">
          <div className="dash-card">
            <small>Avg. Mileage</small>
            <p>{logs[0]?.avg || 0} <span>km/L</span></p>
          </div>
          <div className="dash-card">
            <small>Last Trip</small>
            <p>{logs[0]?.distance || 0} <span>km</span></p>
          </div>
        </div>

        {/* Monthly Reports */}
        <section>
          <h3>Monthly Reports</h3>
          <div className="report-grid">
            {getMonthlyStats().map(([month, data]) => (
              <div key={month} className="report-card">
                <h4>{month}</h4>
                <div className="report-details">
                  <div><small>Spent</small><p>₹{data.totalSpent}</p></div>
                  <div><small>Travel</small><p>{data.totalDist} km</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Form */}
        <form onSubmit={handleSubmit} className="fuel-form-card">
          <h3>Log New Refill</h3>
          <div className="input-row">
            <input type="number" placeholder="Odometer" value={formData.odo} onChange={(e) => setFormData({...formData, odo: e.target.value})} required />
            <input type="number" step="0.01" placeholder="Liters" value={formData.liters} onChange={(e) => setFormData({...formData, liters: e.target.value})} required />
          </div>
          <input type="number" placeholder="Cost (₹)" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
          <button type="submit" className="main-btn">Save Log</button>
        </form>

        {/* History with Delete functionality */}
        <section className="history-list">
          <h3>History</h3>
          {logs.map(log => (
            <div key={log.id} className="history-card" onDoubleClick={() => deleteEntry(log.id)}>
              <div className="info">
                <span className="date">{log.date}</span>
                <span className="odo">{log.odo} km</span>
              </div>
              <div className="stats">
                <span className="dist">+{log.distance} km</span>
                <span className="avg">{log.avg} km/L</span>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;