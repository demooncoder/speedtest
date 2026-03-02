import React from 'react';

function App() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#00a8ff', fontSize: '3rem' }}>⚡ SpeedTest Pro</h1>
      <p style={{ fontSize: '1.5rem', color: '#333' }}>Testing if React is working...</p>
      <button
        style={{
          padding: '20px 40px',
          fontSize: '1.2rem',
          backgroundColor: '#00a8ff',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer'
        }}
        onClick={() => alert('React is working!')}
      >
        Click Me to Test
      </button>
    </div>
  );
}

export default App;
