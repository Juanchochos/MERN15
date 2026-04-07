interface TileProps {
  top: number;
  bottom: number;
  hidden?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
}

function DominoTile({ top, bottom, hidden, onClick, isPlayable }: TileProps) {
  if (hidden) {
    return <div className="domino domino-hidden" />;
  }

  return (
    <div
      className={`domino ${isPlayable ? 'playable' : ''}`}
      onClick={onClick}
    >
      <div className="domino-half">
        <DotPattern count={top} />
      </div>
      <div className="domino-divider" />
      <div className="domino-half">
        <DotPattern count={bottom} />
      </div>
    </div>
  );
}

// Renders dots for a given value
function DotPattern({ count }: { count: number }) {
  const dotPositions: Record<number, string[]> = {
    0: [],
    1: ['center'],
    2: ['top-right', 'bottom-left'],
    3: ['top-right', 'center', 'bottom-left'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right'],
  };

  return (
    <div className="dot-grid">
      {(dotPositions[count] ?? []).map((pos, i) => (
        <span key={i} className={`pip pip-${pos}`} />
      ))}
    </div>
  );
}

export default DominoTile;