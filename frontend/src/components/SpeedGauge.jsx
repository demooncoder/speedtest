import React from 'react';

const SpeedGauge = ({ speed, label }) => {
  const isReady = label === 'Ready' && !speed;

  return (
    <div className="speed-gauge">
      <div className="gauge-display">
        <div className="gauge-circle">
          <div className="gauge-inner">
            {isReady ? (
              <>
                <div className="speed-value" style={{ fontSize: '2rem', opacity: 0.7 }}>
                  Ready
                </div>
                <div className="speed-unit">Click Start Test</div>
              </>
            ) : (
              <>
                <div className="speed-value">
                  {speed ? speed.toFixed(2) : '0.00'}
                </div>
                <div className="speed-unit">Mbps</div>
              </>
            )}
          </div>
        </div>
      </div>
      {label && !isReady && <div className="status-message">{label}</div>}
    </div>
  );
};

export default SpeedGauge;
