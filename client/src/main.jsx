// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// REMOVE THIS LINE IF IT EXISTS: import './index.css'; 
// The styles are correctly imported in App.jsx (App.css).


// This mounts the React app to the <div id="root"> element in public/index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);