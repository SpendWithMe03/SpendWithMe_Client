import { useState, useEffect } from 'react';
import { HandCoins } from 'lucide-react';

const LoadingPage = () => {
  const [loadingStage, setLoadingStage] = useState(0);
  const [theme, setTheme] = useState('light');
  
  const loadingStages = [
    'Loading your finances...',
    'Almost ready...',
    'Just a moment...',
    'Preparing your dashboard...'
  ];

  useEffect(() => {
    // Get theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Set theme based on localStorage or default to 'light'
    if (savedTheme) {
      setTheme(savedTheme);
      // Apply theme to document
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // If no theme in localStorage, check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    }
    
    // Set up loading stage timer
    const timer = setInterval(() => {
      setLoadingStage((prev) => (prev + 1) % loadingStages.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [loadingStages.length]);

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-slate-900 flex items-center justify-center z-50">
      <div className="text-center p-6">
        {/* Simple Logo */}
        <HandCoins className="w-16 h-16 text-blue-600 mx-auto mb-6" />
        
        {/* App Name */}
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          SpendWithMe
        </h1>
        
        {/* Loading Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {loadingStages[loadingStage]}
        </p>
        
        {/* Simple Loading Bar */}
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(loadingStage + 1) * 25}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;