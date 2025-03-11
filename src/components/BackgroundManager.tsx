import React from 'react';

interface BackgroundManagerProps {
  imagePath: string;
}

const BackgroundManager: React.FC<BackgroundManagerProps> = ({ imagePath }) => {
  return (
    <div className="background">
      <img
        src={imagePath}
        alt="Background"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />
    </div>
  );
};

export default BackgroundManager;