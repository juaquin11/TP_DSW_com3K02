// src/components/Logo/Logo.jsx
import React from 'react';

const Logo = ({ width = '32px', height = '32px' }) => {
  return (
    <img 
      src="/logo.svg" 
      alt="FoodApp Logo"
      style={{ width: width, height: height }} 
    />
  );
};

export default Logo;