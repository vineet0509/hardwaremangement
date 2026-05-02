import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Notification = ({ show, title, message, type = 'success', onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={24} />,
    error: <XCircle className="text-red-500" size={24} />,
    warning: <AlertCircle className="text-amber-500" size={24} />,
    info: <Info className="text-blue-500" size={24} />
  };

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      minWidth: '320px',
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
      border: `1px solid ${colors[type]}20`,
      borderLeft: `6px solid ${colors[type]}`,
      display: 'flex',
      alignItems: 'start',
      gap: '16px',
      animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ marginTop: '2px' }}>{icons[type]}</div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: '#1f2937' }}>{title}</h4>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>{message}</p>
      </div>
      <button onClick={onClose} style={{ 
        background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px'
      }} onMouseOver={e => e.target.style.background = '#f3f4f6'} onMouseOut={e => e.target.style.background = 'none'}>
        <X size={18} />
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default Notification;
