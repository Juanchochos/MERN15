import { useDroppable } from '@dnd-kit/core';
import type { DropData } from '../games/dnd-types';

interface DropZoneProps {
  id: string;
  data: DropData;
  label: string;
  isActive: boolean;
}

function DropZone({ id, data, label, isActive }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data });

  if (!isActive) return null;

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 56,
        height: 96,
        border: `3px dashed ${isOver ? '#259506' : '#aaa'}`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isOver ? '#259506' : '#aaa',
        fontSize: 11,
        fontFamily: '"Exo", sans-serif',
        background: isOver ? 'rgba(37,149,6,0.15)' : 'rgba(255,255,255,0.05)',
        transition: 'all 0.15s',
        flexShrink: 0,
        textAlign: 'center',
        letterSpacing: 1,
      }}
    >
      {label}
    </div>
  );
}

export default DropZone;
