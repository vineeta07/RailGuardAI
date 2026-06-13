import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.railguard.ai",
  appName: "RailGuard AI",
  webDir: "dist",
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,
      backgroundColor: "#0f172a",
      showSpinner: true,
      spinnerColor: "#1a56db",
    },
    StatusBar: {
      backgroundColor: "#0f172a",
      style: "DARK",
    },
  },
};

export default config;
