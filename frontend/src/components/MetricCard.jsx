import React from 'react';

const MetricCard = ({ label, value, unit, type, note }) => {
  return (
    <div className="metric-card">
      <div className="metric-label">
        {label}
        {note && <span style={{ fontSize: '0.65rem', opacity: 0.6, marginLeft: '3px' }}>({note})</span>}
      </div>
      <div className={`metric-value ${type}`}>
        {value ? value.toFixed(2) : '---'}
        {value && <span style={{ fontSize: '0.9rem', marginLeft: '5px' }}>{unit}</span>}
      </div>
    </div>
  );
};

export default MetricCard;
