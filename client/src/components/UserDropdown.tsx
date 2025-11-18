import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user.email || 'user@example.com';
  const initials = userEmail.substring(0, 2).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="user-dropdown-trigger"
      >
        <div className="user-avatar">{initials}</div>
        <svg
          className={`user-dropdown-arrow ${isOpen ? 'rotate' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="user-dropdown-header">
            <div className="user-dropdown-email">{userEmail}</div>
          </div>

          <div className="user-dropdown-divider"></div>

          <button
            onClick={() => {
              navigate('/dashboard');
              setIsOpen(false);
            }}
            className="user-dropdown-item"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M13 14H3C2.44772 14 2 13.5523 2 13V6C2 5.44772 2.44772 5 3 5H13C13.5523 5 14 5.44772 14 6V13C14 13.5523 13.5523 14 13 14Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M6 8H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6 11H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 5V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Dashboard
          </button>

          <button
            onClick={toggleTheme}
            className="user-dropdown-item"
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 1V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 14V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M15 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M2 8H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12.5 3.5L11.8 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4.2 11.8L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12.5 12.5L11.8 11.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4.2 4.2L3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14 8.5C13.3 10.9 11 12.7 8.3 12.7C5 12.7 2.3 10 2.3 6.7C2.3 4.5 3.5 2.6 5.3 1.6C3.2 2.1 1.5 4 1.5 6.3C1.5 9.2 3.8 11.5 6.7 11.5C9 11.5 10.9 10.1 11.7 8.1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="user-dropdown-divider"></div>

          <button onClick={handleLogout} className="user-dropdown-item danger">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path d="M11 11L14 8L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;