import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize theme from storage
const theme = localStorage.getItem('theme-storage');
if (theme) {
  const parsed = JSON.parse(theme);
  if (parsed.state?.theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);