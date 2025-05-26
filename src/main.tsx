
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("main.tsx starting");

try {
  const rootElement = document.getElementById("root");
  console.log("Root element found:", !!rootElement);
  
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  console.log("Creating React root...");
  const root = createRoot(rootElement);
  
  console.log("Rendering App component...");
  root.render(<App />);
  
  console.log("App rendered successfully");
} catch (error) {
  console.error("Error in main.tsx:", error);
  
  // Fallback error display
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: red;">Application Error</h1>
      <p>Failed to load the application. Please check the console for details.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${error}</pre>
    </div>
  `;
}
