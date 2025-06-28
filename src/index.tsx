import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

// Optimized error filtering - prevent extension errors from interfering
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('checkoutUrls') ||
    message.includes('feature_extension') ||
    message.includes('merchant-homepage') ||
    message.includes('background.js') ||
    message.includes('chrome-extension://')
  ) {
    return; // Silently ignore extension errors
  }
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('checkoutUrls') ||
    message.includes('feature_extension') ||
    message.includes('merchant-homepage') ||
    message.includes('background.js') ||
    message.includes('chrome-extension://')
  ) {
    return; // Silently ignore extension warnings
  }
  originalWarn.apply(console, args);
};

// Essential environment check
if (import.meta.env.DEV) {
  console.log('🔍 Environment:', {
    NODE_ENV: import.meta.env.MODE,
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Connected' : 'Missing',
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
  });
}

const rootElement = document.getElementById("app");
if (!rootElement) {
  console.error('🚨 Critical: Root element not found');
  throw new Error('Root element not found');
}

try {
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
  
  if (import.meta.env.DEV) {
    console.log('✅ App initialized successfully');
  }
  
} catch (error) {
  console.error('🚨 Critical: App failed to render:', error);
  
  // Show a fallback error message
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1 style="color: #dc2626;">App Failed to Load</h1>
      <p>There was an error starting the fitness app.</p>
      <p style="font-size: 14px; color: #666;">Check the browser console for details.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; background: #f97316; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
}