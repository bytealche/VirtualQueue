import React from 'react';

const QRCode = ({ value, size }) => {
  const displaySize = size || 150;
  
  return (
    <div 
      style={{ 
        width: displaySize, 
        height: displaySize,
        border: '2px solid #d1d5db',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        borderRadius: '8px',
        flexDirection: 'column',
        padding: '10px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ 
        fontSize: '12px', 
        fontWeight: 'bold', 
        marginBottom: '8px', 
        color: '#4f46e5' 
      }}>
        QR CODE
      </div>
      <div style={{ 
        fontSize: '10px', 
        fontFamily: 'monospace',
        wordBreak: 'break-all',
        textAlign: 'center',
        color: '#6b7280',
        maxWidth: '100%'
      }}>
        {value || 'N/A'}
      </div>
      <div style={{
        width: '80%',
        height: '80%',
        border: '1px solid #e5e7eb',
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{
          width: '60%',
          height: '60%',
          background: 'linear-gradient(45deg, #4f46e5 25%, transparent 25%, transparent 75%, #4f46e5 75%, #4f46e5), linear-gradient(45deg, #4f46e5 25%, transparent 25%, transparent 75%, #4f46e5 75%, #4f46e5)',
          backgroundSize: '10px 10px',
          backgroundPosition: '0 0, 5px 5px'
        }}></div>
      </div>
    </div>
  );
};

export default QRCode;