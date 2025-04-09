
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.25459dc25c3b498d99b162e0a75dbcca',
  appName: 'Task Tracker',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://25459dc2-5c3b-498d-99b1-62e0a75dbcca.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: "always",
    allowsLinkPreview: false,
    scrollEnabled: true,
    webViewDecelerationSpeed: 'normal'
  }
};

export default config;
