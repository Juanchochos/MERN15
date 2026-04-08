import { useRef, useEffect } from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import DominoTile from './DominoTile';
import SortableTile from './SortableTile';
import type { PlayerConfig } from '../games/player-types';

interface HandPanelProps {
  config: PlayerConfig;
  tiles: any[];
  isLocalPlayer: boolean;
  isMyTurn: boolean;
  boardEnds: { left: number | null; right: number | null };
  localOrder?: number[];
}

function canPlayTile(tile: any, boardEnds: { left: number | null; right: number | null }): boolean {
  const { left, right } = boardEnds;
  if (left === null || right === null) return true;
  return tile.top === left || tile.bottom === left || tile.top === right || tile.bottom === right;
}

function HandPanel({
  config,
  tiles,
  isLocalPlayer,
  isMyTurn,
  boardEnds,
  localOrder,
}: HandPanelProps) {
  const padding = 12;
  const sortableIds = (localOrder ?? []).map(i => `tile-${i}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to reveal a newly drawn tile on the right
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
  }, [localOrder?.length]);

  const panelStyle: React.CSSProperties = {
    maxWidth: 500,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    backgroundImage: 'url("/img/WoodGrain.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: '2px solid #000',
    borderRadius: 12,
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const usernameStyle: React.CSSProperties = {
    fontFamily: '"Exo", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 1,
    color: '#F0DFD3',
    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
    whiteSpace: 'nowrap',
    padding: `4px ${padding}px`,
    flexShrink: 0,
  };

  const scrollContainerStyle: React.CSSProperties = {
    display: 'flex',
    overflowX: 'auto',
    overflowY: 'hidden',
    flex: 1,
    minWidth: 0,
    scrollbarColor: '#259506 rgba(0,0,0,0.2)',
    scrollbarWidth: 'thin',
  };

  const tileInnerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: `0 ${padding}px`,
    boxSizing: 'border-box',
    margin: '0 auto',
  };

  return (
    <div style={panelStyle}>
      <div style={usernameStyle}>{config.username}{isMyTurn ? ' ●' : ''}</div>
      <div ref={scrollRef} className="hand-scroll" style={scrollContainerStyle}>
        <style>{`
          .hand-scroll::-webkit-scrollbar { height: 6px; }
          .hand-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 3px; margin: 0 8px; }
          .hand-scroll::-webkit-scrollbar-thumb { background: #259506; border-radius: 3px; }
        `}</style>
        <div style={tileInnerStyle}>
          {isLocalPlayer && localOrder ? (
            <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
              {localOrder.map(tileIdx => {
                const tile = tiles[tileIdx];
                if (!tile) return null;
                const id = `tile-${tileIdx}`;
                return (
                  <SortableTile
                    key={id}
                    id={id}
                    handIndex={tileIdx}
                    top={tile.top}
                    bottom={tile.bottom}
                    isPlayable={isMyTurn && canPlayTile(tile, boardEnds)}
                  />
                );
              })}
            </SortableContext>
          ) : (
            tiles.map((_, idx) => (
              <DominoTile key={idx} top={0} bottom={0} hidden />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default HandPanel;
