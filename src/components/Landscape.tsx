import React from 'react';

const Landscape: React.FC = () => {
  return (
    <div className="landscape">
      <div className="sun"></div>
      <div className="mountain mountain-1"></div>
      <div className="mountain mountain-2"></div>
      <div className="mountain mountain-3"></div>
      <div className="castle">
        <div className="castle-main">
          <div className="castle-top"></div>
          <div className="castle-window castle-window-1"></div>
          <div className="castle-window castle-window-2"></div>
          <div className="castle-window castle-window-3"></div>
          <div className="castle-window castle-window-4"></div>
          <div className="castle-door"></div>
          <div className="castle-tower castle-tower-left"></div>
          <div className="castle-tower castle-tower-right"></div>
        </div>
      </div>
      <div className="forest">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="tree" style={{ animationDelay: `${i * 0.2}s` }}></div>
        ))}
      </div>
      <div className="ground"></div>
    </div>
  );
};

export default Landscape;