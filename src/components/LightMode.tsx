import React from 'react';

const LightModeBackground: React.FC = () => {
  return (
    <div className="background-container" style={{ backgroundImage: 'url(assets/lightMode.jpg)', backgroundSize: 'cover' }}>
      <div className="overlay"></div>
    </div>
  );
};

export default LightModeBackground;