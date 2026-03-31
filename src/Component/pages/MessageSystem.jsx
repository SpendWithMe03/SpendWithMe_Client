import { useState, useEffect, createContext, useContext } from 'react';

// Create a context for the message system
const MessageContext = createContext(null);

// Types of messages
export const MESSAGE_TYPES = {
  ERROR: 'error',
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  LOADING: 'loading',
};

// Message Provider component
export const MessageProvider = ({ children, defaultDuration = 3000 }) => {
  const [messages, setMessages] = useState([]);
  const [theme, setTheme] = useState(() => {
    // Check for saved theme preference
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    // Check system preference
    const systemPrefersDark = typeof window !== 'undefined' ? 
      window.matchMedia('(prefers-color-scheme: dark)').matches : false;
    
    return savedTheme || (systemPrefersDark ? 'dark' : 'light');
  });
  
  // Effect to handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Effect to apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
  
  const addMessage = (text, type = MESSAGE_TYPES.SUCCESS, duration = defaultDuration) => {
    const id = Date.now().toString();
    const newMessage = { id, text, type, duration };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Auto-remove all messages after their duration, including loading messages
    if (duration !== Infinity) {
      setTimeout(() => {
        removeMessage(id);
      }, duration);
    }
    
    return id;
  };
  
  const removeMessage = (id) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  };
  
  const updateMessage = (id, updates) => {
    setMessages(prev => prev.map(message => 
      message.id === id ? { ...message, ...updates } : message
    ));
    
    // If updating to a non-loading type and duration is set, auto-remove
    if (updates.type !== MESSAGE_TYPES.LOADING && updates.duration) {
      setTimeout(() => {
        removeMessage(id);
      }, updates.duration);
    }
  };
  
  const clearAllMessages = () => {
    setMessages([]);
  };
  
  return (
    <MessageContext.Provider value={{ 
      messages, 
      addMessage, 
      removeMessage, 
      updateMessage,
      clearAllMessages,
      theme,
      toggleTheme
    }}>
      {children}
      <MessageContainer />
      <MessageStyles />
    </MessageContext.Provider>
  );
};

// Hook to use the message system
export const useMessages = () => {
  const context = useContext(MessageContext);
  
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  
  const { 
    addMessage, 
    removeMessage, 
    updateMessage, 
    clearAllMessages,
    theme,
    toggleTheme
  } = context;
  
  return {
    // Show a success message
    showSuccess: (text, duration = 3000) => 
      addMessage(text, MESSAGE_TYPES.SUCCESS, duration),
    
    // Show an error message
    showError: (text, duration = 5000) => 
      addMessage(text, MESSAGE_TYPES.ERROR, duration),
    
    // Show an info message
    showInfo: (text, duration = 4000) => 
      addMessage(text, MESSAGE_TYPES.INFO, duration),
    
    // Show a warning message
    showWarning: (text, duration = 4500) => 
      addMessage(text, MESSAGE_TYPES.WARNING, duration),
    
    // Show a loading message (returns ID to update later)
    showLoading: (text = 'Loading...', duration = Infinity) => 
      addMessage(text, MESSAGE_TYPES.LOADING, duration),
    
    // Update any message
    updateMessage,
    
    // Convert loading message to other types
    finishLoading: (id, { type = MESSAGE_TYPES.SUCCESS, text, duration = 3000 }) => 
      updateMessage(id, { text, type, duration }),
    
    // Update loading to success
    updateLoadingToSuccess: (id, text, duration = 3000) => 
      updateMessage(id, { text, type: MESSAGE_TYPES.SUCCESS, duration }),
    
    // Update loading to error
    updateLoadingToError: (id, text, duration = 5000) => 
      updateMessage(id, { text, type: MESSAGE_TYPES.ERROR, duration }),
    
    // Remove a message manually
    removeMessage,
    
    // Clear all messages
    clearAllMessages,
    
    // Theme controls
    theme,
    toggleTheme,
    isDarkMode: theme === 'dark'
  };
};

// Message container component
const MessageContainer = () => {
  const { messages, removeMessage } = useContext(MessageContext);
  
  return (
    <div className="message-container">
      {messages.map(message => (
        <Message 
          key={message.id}
          message={message} 
          onClose={() => removeMessage(message.id)}
        />
      ))}
    </div>
  );
};

// Individual message component
const Message = ({ message, onClose }) => {
  const { id, text, type, duration } = message;
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  
  // Handle animation and progress
  useEffect(() => {
    if (duration !== Infinity) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);
        
        // Start exit animation just before removal
        if (newProgress >= 95 && !isExiting) {
          setIsExiting(true);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
        }
      }, 16);
      
      return () => clearInterval(interval);
    }
  }, [duration, isExiting]);
  
  const getIcon = () => {
    switch (type) {
      case MESSAGE_TYPES.SUCCESS:
        return <div className="success-icon">✓</div>;
      case MESSAGE_TYPES.ERROR:
        return <div className="error-icon">✕</div>;
      case MESSAGE_TYPES.WARNING:
        return <div className="warning-icon">⚠</div>;
      case MESSAGE_TYPES.INFO:
        return <div className="info-icon">ℹ</div>;
      case MESSAGE_TYPES.LOADING:
        return <div className="loader"></div>;
      default:
        return null;
    }
  };
  
  return (
    <div className={`message message-${type} ${isExiting ? 'exiting' : ''}`}>
      <div className="message-content">
        {getIcon()}
        <div className="message-text">{text}</div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      {duration !== Infinity && (
        <div className="progress-bar">
          <div 
            className="progress-bar-inner" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}
    </div>
  );
};

// CSS for the message components
export const MessageStyles = () => (
  <style>{`
    :root {
      --success-color: #22c55e;
      --success-bg: rgba(240, 253, 244, 0.95);
      --success-icon-bg: #4ade80;
      --success-icon-color: #166534;
      
      --error-color: #ef4444;
      --error-bg: rgba(254, 242, 242, 0.95);
      --error-icon-bg: #fca5a5;
      --error-icon-color: #991b1b;
      
      --info-color: #3b82f6;
      --info-bg: rgba(239, 246, 255, 0.95);
      --info-icon-bg: #7dd3fc;
      --info-icon-color: #1d4ed8;
      
      --warning-color: #f97316;
      --warning-bg: rgba(255, 247, 237, 0.95);
      --warning-icon-bg: #fdba74;
      --warning-icon-color: #9a3412;
      
      --loading-color: #6366f1;
      --loading-bg: rgba(238, 242, 255, 0.95);
      
      --text-color: #1f2937;
      --close-btn-color: #6b7280;
      --progress-bg: rgba(0, 0, 0, 0.05);
    }
    
    .dark {
      --success-color: #22c55e;
      --success-bg: rgba(20, 33, 25, 0.95);
      --success-icon-bg: rgba(56, 161, 105, 0.3);
      --success-icon-color: #4ade80;
      
      --error-color: #ef4444;
      --error-bg: rgba(45, 20, 20, 0.95);
      --error-icon-bg: rgba(252, 165, 165, 0.3);
      --error-icon-color: #fca5a5;
      
      --info-color: #3b82f6;
      --info-bg: rgba(21, 32, 45, 0.95);
      --info-icon-bg: rgba(125, 211, 252, 0.3);
      --info-icon-color: #7dd3fc;
      
      --warning-color: #f97316;
      --warning-bg: rgba(40, 30, 20, 0.95);
      --warning-icon-bg: rgba(253, 186, 116, 0.3);
      --warning-icon-color: #fdba74;
      
      --loading-color: #6366f1;
      --loading-bg: rgba(30, 30, 60, 0.95);
      
      --text-color: #e5e7eb;
      --close-btn-color: #9ca3af;
      --progress-bg: rgba(255, 255, 255, 0.1);
    }
    
    .message-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      max-width: 400px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .message {
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      animation: slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      overflow: hidden;
      backdrop-filter: blur(12px);
      transition: all 0.3s ease;
      position: relative;
      border-left: 6px solid;
    }
    
    .message.exiting {
      animation: slide-out 0.5s forwards;
      opacity: 0;
      transform: translateX(100%);
    }
    
    @keyframes slide-in {
      from { transform: translateY(20px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
    
    @keyframes slide-out {
      from { transform: translateX(0) scale(1); opacity: 1; }
      to { transform: translateX(100%) scale(0.95); opacity: 0; }
    }
    
    .message-success { background-color: var(--success-bg); border-left-color: var(--success-color); }
    .message-error { background-color: var(--error-bg); border-left-color: var(--error-color); }
    .message-info { background-color: var(--info-bg); border-left-color: var(--info-color); }
    .message-warning { background-color: var(--warning-bg); border-left-color: var(--warning-color); }
    .message-loading { background-color: var(--loading-bg); border-left-color: var(--loading-color); }
    
    .message-content {
      display: flex;
      align-items: center;
      font-weight: 500;
      color: var(--text-color);
    }
    
    .message-text {
      margin: 0 12px;
      flex-grow: 1;
      line-height: 1.4;
    }
    
    .success-icon, .error-icon, .warning-icon, .info-icon {
      margin-right: 12px;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      flex-shrink: 0;
    }
    
    .success-icon { color: var(--success-icon-color); background-color: var(--success-icon-bg); }
    .error-icon { color: var(--error-icon-color); background-color: var(--error-icon-bg); }
    .warning-icon { color: var(--warning-icon-color); background-color: var(--warning-icon-bg); }
    .info-icon { color: var(--info-icon-color); background-color: var(--info-icon-bg); }
    
    .loader {
      width: 24px;
      height: 24px;
      margin-right: 12px;
      border: 3px solid var(--loading-color);
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.8s linear infinite;
      flex-shrink: 0;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: var(--close-btn-color);
      opacity: 0.7;
      transition: opacity 0.2s, transform 0.2s;
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border-radius: 50%;
      hover: transform(1.1);
    }
    
    .close-button:hover {
      opacity: 1;
      background-color: rgba(0,0,0,0.05);
      transform: scale(1.1);
    }
    
    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      width: 100%;
      background-color: var(--progress-bg);
      border-radius: 0 0 12px 12px;
      overflow: hidden;
    }
    
    .progress-bar-inner {
      height: 100%;
      transition: width 0.1s linear;
      border-radius: 0 0 12px 12px;
    }
    
    .message-success .progress-bar-inner { background-color: var(--success-color); }
    .message-error .progress-bar-inner { background-color: var(--error-color); }
    .message-info .progress-bar-inner { background-color: var(--info-color); }
    .message-warning .progress-bar-inner { background-color: var(--warning-color); }
    .message-loading .progress-bar-inner { background-color: var(--loading-color); }
    
    .message:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
    }
    
    @media (max-width: 640px) {
      .message-container {
        right: 12px;
        left: 12px;
        max-width: none;
      }
    }
  `}</style>
);

// Theme toggle button component
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useMessages();
  
  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
      <style jsx>{`
        .theme-toggle {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          background-color: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          color: ${theme === 'dark' ? '#e2e8f0' : '#2d3748'};
          transition: all 0.3s ease;
        }
        
        .theme-toggle:hover {
          transform: rotate(15deg);
          background-color: ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
        }
      `}</style>
    </button>
  );
};

// Example usage component
export const MessageExample = () => {
  const { 
    showSuccess, 
    showError, 
    showInfo, 
    showWarning, 
    showLoading,
    updateLoadingToSuccess
  } = useMessages();
  
  const handleLoadingExample = () => {
    const id = showLoading('Processing your request...');
    setTimeout(() => {
      updateLoadingToSuccess(id, 'Successfully processed!');
    }, 2000);
  };
  
  return (
    <div className="example-buttons">
      <button onClick={() => showSuccess('Operation completed successfully!')}>
        Show Success
      </button>
      <button onClick={() => showError('An error occurred. Please try again.')}>
        Show Error
      </button>
      <button onClick={() => showInfo('New version available')}>
        Show Info
      </button>
      <button onClick={() => showWarning('Your session will expire soon')}>
        Show Warning
      </button>
      <button onClick={handleLoadingExample}>
        Show Loading
      </button>
      <ThemeToggle />
      
      <style jsx>{`
        .example-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 20px 0;
        }
        
        button {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          background-color: #4a5568;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        button:hover {
          background-color: #2d3748;
        }
        
        .dark button {
          background-color: #6b7280;
        }
        
        .dark button:hover {
          background-color: #4b5563;
        }
      `}</style>
    </div>
  );
};