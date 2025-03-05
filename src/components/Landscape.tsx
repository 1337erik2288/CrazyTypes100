import React from 'react';

const Landscape: React.FC = () => {
  const handleSunClick = () => {
    let clicks = 0;
    let lastClick = 0;

    return (e: React.MouseEvent) => {
      const time = new Date().getTime();
      if (time - lastClick > 500) {
        clicks = 1;
      } else {
        clicks++;
      }
      lastClick = time;

      if (clicks === 3) {
        console.log(` ________________________________________\n/ здесь должен был быть секретный       \\\n\\ коровий уровень                       /\n ----------------------------------------\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`);
        clicks = 0;
      }
    };
  };

  return (
    <div className="landscape">
      <div className="sun" onClick={handleSunClick()}></div>
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