import { useEffect, useState } from "react";
import ExtensionPopup from "@/components/extension-popup";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  // Check for dark mode preference
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-darker p-4">
        <ExtensionPopup darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </div>
  );
}
