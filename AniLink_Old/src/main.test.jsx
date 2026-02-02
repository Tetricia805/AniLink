// TEMPORARY TEST - Use this to verify React is working
// If this works, the issue is in App.jsx or one of its imports

import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.css';

function TestApp() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#22c55e', fontSize: '32px' }}>✅ AniLink Test</h1>
      <p style={{ fontSize: '18px', marginTop: '20px' }}>
        If you see this message, React is working correctly!
      </p>
      <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
        The issue is likely in the main App component or one of its imports.
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);

