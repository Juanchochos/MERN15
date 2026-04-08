import React from 'react';

interface TileProps {
  top: number;
  bottom: number;
  hidden?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  dragging?: boolean;
  horizontal?: boolean;   // landscape orientation for the board chain
}

const pipBase: React.CSSProperties = {
  position: 'absolute',
  width: 6,
  height: 6,
  background: '#1a1a1a',
  borderRadius: '50%',
};

const pipPositions: Record<string, React.CSSProperties> = {
  'center':       { top: '50%',   left: '50%',  transform: 'translate(-50%, -50%)' },
  'top-left':     { top: '8%',    left: '8%'    },
  'top-right':    { top: '8%',    right: '8%'   },
  'mid-left':     { top: '50%',   left: '8%',   transform: 'translateY(-50%)' },
  'mid-right':    { top: '50%',   right: '8%',  transform: 'translateY(-50%)' },
  'bottom-left':  { bottom: '8%', left: '8%'    },
  'bottom-right': { bottom: '8%', right: '8%'   },
};

const dotMap: Record<number, string[]> = {
  0: [],
  1: ['center'],
  2: ['top-right', 'bottom-left'],
  3: ['top-right', 'center', 'bottom-left'],
  4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
  6: ['top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right'],
};

function DotPattern({ count }: { count: number }) {
  return (
    <div style={{ position: 'relative', width: 27, height: 27 }}>
      {(dotMap[count] ?? []).map((pos, i) => (
        <span key={i} style={{ ...pipBase, ...pipPositions[pos] }} />
      ))}
    </div>
  );
}

const DominoTile = React.forwardRef<HTMLDivElement, TileProps>(
  ({ top, bottom, hidden, onClick, isPlayable, dragging, horizontal = false }, ref) => {
    const isHorizontal = horizontal;

    const tileStyle: React.CSSProperties = {
      display: 'inline-flex',
      flexDirection: isHorizontal ? 'row' : 'column',
      alignItems: 'center',
      width:  isHorizontal ? 77 : 38,
      height: isHorizontal ? 38 : 77,
      background: '#F5F0E8',
      border: `2px solid ${isPlayable ? '#259506' : '#222'}`,
      borderRadius: 6,
      userSelect: 'none',
      cursor: isPlayable ? 'grab' : 'default',
      flexShrink: 0,
      boxShadow: isPlayable ? '0 0 10px rgba(37,149,6,0.5)' : 'none',
      opacity: dragging ? 0.4 : 1,
      transition: 'box-shadow 0.15s',
    };

    const halfStyle: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    };

    const dividerStyle: React.CSSProperties = isHorizontal
      ? { width: 2, height: '80%', background: '#333', flexShrink: 0 }
      : { width: '80%', height: 2, background: '#333', flexShrink: 0 };

    // Hidden tile: plain off-white rectangle, no divider, no dots
    if (hidden) {
      return (
        <div ref={ref} style={{ ...tileStyle, cursor: 'default', borderColor: '#222', boxShadow: 'none' }} />
      );
    }

    return (
      <div ref={ref} style={tileStyle} onClick={onClick}>
        <div style={halfStyle}><DotPattern count={top} /></div>
        <div style={dividerStyle} />
        <div style={halfStyle}><DotPattern count={bottom} /></div>
      </div>
    );
  }
);

export default DominoTile;
