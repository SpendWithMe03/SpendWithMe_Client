import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { 
  Home, 
  BarChart2, 
  Wallet, 
  Users, 
  Menu, 
  X 
} from "lucide-react";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const navLinks = [
    { 
      path: '/Dashboard', 
      label: 'Dashboard', 
      icon: Home 
    },
    { 
      path: '/History', 
      label: 'History', 
      icon: BarChart2 
    },
    { 
      path: '/Budget', 
      label: 'Budget', 
      icon: Wallet 
    },
    { 
      path: '/Group', 
      label: 'Group', 
      icon: Users 
    }
  ];

  const isActive = (path) => 
    location.pathname === path 
      ? "bg-blue-100/70 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold ring-2 ring-blue-200 dark:ring-blue-800" 
      : "hover:bg-blue-50/50 text-gray-600 dark:hover:bg-blue-900/20 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400";

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className="relative w-full">
      {/* Mobile Header */}
      <div className="md:hidden mx-auto max-w-7xl flex justify-end">
        <button 
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="p-2 rounded-xl 
                    transition-all duration-300 
                    backdrop-blur-sm
                    hover:bg-blue-100/50 dark:hover:bg-blue-900/30
                    active:scale-90 transform"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? 
            <X className="text-blue-600 dark:text-blue-400 w-6 h-6 animate-spin-short" /> : 
            <Menu className="text-blue-600 dark:text-blue-400 w-6 h-6" />
          }
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block mx-auto">
        <ul className="flex justify-center space-x-1 lg:space-x-2 w-full p-4  dark:bg-gray-900/30 rounded-full ">
          {navLinks.map((link) => (
            <li key={link.path} className="px-2">
              <a 
                href={link.path}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-xl 
                  transition-all duration-300 group
                  ${isActive(link.path)}
                `}
              >
                <link.icon 
                  className={`
                    w-5 h-5 
                    ${location.pathname === link.path 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : 'text-gray-400 group-hover:text-blue-500 dark:text-gray-500 dark:group-hover:text-blue-400'}
                  `} 
                />
                <span className="text-sm">{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        ref={menuRef}
        className={`
          md:hidden fixed inset-y-0 left-0 w-64 h-screen
          bg-white/95 dark:bg-black/95 backdrop-blur-xl z-50 
          shadow-2xl rounded-r-3xl
          transform transition-transform duration-500 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-900/30">
            <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">
              Spendwithme
            </h1>
          </div>

          <ul className="space-y-2 p-4 bg-white dark:bg-black/95 backdrop-blur-xl flex-grow">
            {navLinks.map((link) => (
              <li key={link.path}>
                <a 
                  href={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    flex items-center space-x-4 px-4
                    text-base py-3 rounded-xl transition-all
                    ${isActive(link.path)}
                  `}
                >
                  <link.icon 
                    className={`
                      w-5 h-5 
                      ${location.pathname === link.path 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-gray-400 dark:text-gray-500'}
                    `} 
                  />
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;