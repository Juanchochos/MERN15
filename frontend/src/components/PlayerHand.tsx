import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTile from './SortableTile';

interface Tile {
  top: number;
  bottom: number;
  canPlay?: (left: number, right: number) => boolean;
}

interface PlayerHandProps {
  tiles: Tile[];
  isMyTurn: boolean;
  boardEnds: { left: number | null; right: number | null };
  localOrder: number[];
}

function canPlayTile(tile: Tile, boardEnds: { left: number | null; right: number | null }): boolean {
  const { left, right } = boardEnds;
  if (left === null || right === null) return true;
  return tile.top === left || tile.bottom === left || tile.top === right || tile.bottom === right;
}

function PlayerHand({ tiles, isMyTurn, boardEnds, localOrder }: PlayerHandProps) {
  const sortableIds = localOrder.map(i => `tile-${i}`);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        padding: '12px 20px',
        backgroundImage: 'url("/img/WoodGrain.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderTop: '4px solid #CFAC94',
        zIndex: 100,
        boxSizing: 'border-box',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
        {localOrder.map((tileIdx) => {
          const tile = tiles[tileIdx];
          if (!tile) return null;
          return (
            <SortableTile
              key={`tile-${tileIdx}`}
              id={`tile-${tileIdx}`}
              handIndex={tileIdx}
              top={tile.top}
              bottom={tile.bottom}
              isPlayable={isMyTurn && canPlayTile(tile, boardEnds)}
            />
          );
        })}
      </SortableContext>
    </div>
  );
}

export default PlayerHand;
