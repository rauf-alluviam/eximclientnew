import React from 'react';

// Simple header component with inline styles instead of Tailwind classes
export const SimpleHeader = ({ bgColor, children }) => (
  <div style={{ 
    background: bgColor,
    padding: '12px 16px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white'
  }}>
    {children}
  </div>
);

// Simple card component with inline styles
export const SimpleCard = ({ bgColor, children }) => (
  <div style={{
    background: bgColor,
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    height: '100%'
  }}>
    {children}
  </div>
);
