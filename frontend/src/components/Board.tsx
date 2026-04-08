import { useState, useEffect, useRef } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import DominoTile from './DominoTile';
import HandPanel from './HandPanel';
import DropZone from './DropZone';
import type { DragData, DropData } from '../games/dnd-types';
import type { PlayerConfig } from '../games/player-types';

interface ExtendedBoardProps extends BoardProps {
  playerConfigs?: PlayerConfig[];
  handGap?: number;
  handHeight?: number;
}

function Board({
  G, ctx, moves, playerID,
  playerConfigs = [],
  handGap = 40,
  handHeight = 120,
}: ExtendedBoardProps) {
  const pid = playerID ?? '0';
  const myHand: any[] = G.hands[pid] ?? [];
  const isMyTurn = ctx.currentPlayer === pid;
  const boardIsEmpty = G.board.length === 0;

  const [localOrder, setLocalOrder] = useState<number[]>(() => myHand.map((_, i) => i));
  const [isDragging, setIsDragging] = useState(false);
  const [activeTile, setActiveTile] = useState<{ top: number; bottom: number } | null>(null);
  const prevHandLengthRef = useRef(myHand.length);

  useEffect(() => {
    const newLen = myHand.length;
    if (newLen > prevHandLengthRef.current) {
      // Tile was drawn — append new index to preserve existing order
      setLocalOrder(prev => [...prev, newLen - 1]);
    }
    prevHandLengthRef.current = newLen;
  }, [myHand.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as DragData;
    if (data?.type === 'HAND_TILE') setActiveTile(myHand[data.handIndex] ?? null);
    setIsDragging(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    setIsDragging(false);
    setActiveTile(null);
    const { active, over } = event;
    if (!over) return;

    const dragData = active.data.current as DragData;
    const dropData = over.data.current as DropData | undefined;

    if (dragData?.type === 'HAND_TILE' && dropData && 'zone' in dropData) {
      const playedIdx = dragData.handIndex;
      moves.playTile(playedIdx, dropData.zone === 'RIGHT_END' ? 'right' : 'left');
      setLocalOrder(prev =>
        prev.filter(i => i !== playedIdx).map(i => i > playedIdx ? i - 1 : i)
      );
      return;
    }

    if (active.id !== over.id) {
      const oldIdx = localOrder.findIndex(i => `tile-${i}` === active.id);
      const newIdx = localOrder.findIndex(i => `tile-${i}` === over.id);
      if (oldIdx !== -1 && newIdx !== -1) {
        setLocalOrder(prev => arrayMove(prev, oldIdx, newIdx));
      }
    }
  }

  const topPlayers    = playerConfigs.filter(p => p.team === 1);
  const bottomPlayers = playerConfigs.filter(p => p.team === 0);
  const hasConfigs    = playerConfigs.length > 0;

  const makeHandRowStyle = (count: number): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: count > 1 ? 'space-between' : 'center',
    height: handHeight,
    padding: '6px 24px',
    flexShrink: 0,
  });

  const renderHand = (config: PlayerConfig) => (
    <HandPanel
      key={config.playerID}
      config={config}
      tiles={G.hands[config.playerID] ?? []}
      isLocalPlayer={config.playerID === pid}
      isMyTurn={ctx.currentPlayer === config.playerID}
      boardEnds={G.boardEnds}
      localOrder={config.playerID === pid ? localOrder : undefined}
    />
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* ── Top: opponent hands ── */}
        <div style={makeHandRowStyle(hasConfigs ? topPlayers.length : 1)}>
          {hasConfigs
            ? topPlayers.map(c => renderHand(c))
            : <div style={{ color: '#F0DFD3', fontFamily: '"Exo", sans-serif' }}>
                {Object.entries(G.hands).filter(([p]) => p !== pid).map(([p, h]: [string, any]) => (
                  <span key={p} style={{ margin: '0 12px' }}>Player {p}: {h.length} tiles</span>
                ))}
              </div>
          }
        </div>

        {/* ── Middle: board ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>

          {!boardIsEmpty && (
            <div style={{ textAlign: 'center', color: 'var(--text)', fontSize: 13, marginBottom: 6, fontFamily: '"Exo", sans-serif' }}>
              Left: {G.boardEnds.left} &nbsp;|&nbsp; Right: {G.boardEnds.right}
            </div>
          )}

          {/* Chain + drop zones */}
          <style>{`
            @keyframes slideInLeft  { from { transform: translateX(-36px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideInRight { from { transform: translateX( 36px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          `}</style>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            overflowX: 'auto',
            padding: 16,
            minHeight: 100,
            borderRadius: 8,
          }}>
            {boardIsEmpty ? (
              /* Empty board: single centered drop zone, or hint text */
              isDragging
                ? <DropZone id="center" data={{ zone: 'CENTER' }} label="PLAY" isActive={true} />
                : <p style={{ color: '#aaa', margin: 0, fontFamily: '"Exo", sans-serif' }}>Drag a tile here to start</p>
            ) : (
              /* Board has tiles: left zone · chain · right zone */
              <>
                <DropZone id="left-end" data={{ zone: 'LEFT_END' }} label="LEFT" isActive={isDragging} />
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {G.board.map((entry: any, idx: number) => {
                    const isLast = idx === G.board.length - 1;
                    const anim = isLast
                      ? `${entry.side === 'right' ? 'slideInRight' : 'slideInLeft'} 0.25s ease`
                      : undefined;
                    return (
                      <div key={idx} style={{ animation: anim }}>
                        <DominoTile top={entry.domino.top} bottom={entry.domino.bottom} horizontal />
                      </div>
                    );
                  })}
                </div>
                <DropZone id="right-end" data={{ zone: 'RIGHT_END' }} label="RIGHT" isActive={isDragging} />
              </>
            )}
          </div>

          {/* Actions */}
          {isMyTurn && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
              <button onClick={() => moves.drawTile()} disabled={G.graveyard.length === 0} style={btnStyle}>
                Draw ({G.graveyard.length} left)
              </button>
              <button onClick={() => moves.pass()} disabled={G.graveyard.length > 0} style={btnStyle}>
                Pass
              </button>
            </div>
          )}

          {ctx.gameover && (
            <div style={gameoverStyle}>
              {ctx.gameover.winner === pid ? 'You Win!' : `Player ${ctx.gameover.winner} wins!`}
            </div>
          )}
        </div>

        {/* ── Bottom: my team ── */}
        <div style={makeHandRowStyle(hasConfigs ? bottomPlayers.length : 1)}>
          {hasConfigs
            ? bottomPlayers.map(c => renderHand(c))
            : renderHand({ playerID: pid, username: `Player ${pid}`, team: 0 })
          }
        </div>

      </div>

      <DragOverlay>
        {activeTile && <DominoTile top={activeTile.top} bottom={activeTile.bottom} />}
      </DragOverlay>
    </DndContext>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '8px 20px',
  fontSize: 15,
  fontFamily: '"Exo", sans-serif',
  borderRadius: 8,
  border: 'none',
  background: '#259506',
  color: 'white',
  cursor: 'pointer',
};

const gameoverStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 48,
  color: '#f5f0e8',
  zIndex: 200,
  fontFamily: '"Exo", sans-serif',
};

export default Board;
