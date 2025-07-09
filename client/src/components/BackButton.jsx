import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-feather';
import '../styles/BackButton.scss';

const BackButton = ({ className = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <button 
      className={`back-button ${className}`}
      onClick={handleBack}
      aria-label="Go back"
    >
      <ArrowLeft size={20} />
      <span>Back</span>
    </button>
  );
};

export default BackButton;