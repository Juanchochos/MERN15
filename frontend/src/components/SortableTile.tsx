import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DominoTile from './DominoTile';
import type { DragData } from '../games/dnd-types';

interface SortableTileProps {
  id: string;
  handIndex: number;
  top: number;
  bottom: number;
  isPlayable: boolean;
}

function SortableTile({ id, handIndex, top, bottom, isPlayable }: SortableTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'HAND_TILE', handIndex } satisfies DragData,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
    >
      <DominoTile
        top={top}
        bottom={bottom}
        isPlayable={isPlayable}
        dragging={isDragging}
      />
    </div>
  );
}

export default SortableTile;
