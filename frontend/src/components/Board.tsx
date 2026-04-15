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
import { canPlayTile } from '../games/domino-helper';
import type { DragData, DropData } from '../games/dnd-types';
import type { PlayerConfig } from '../games/player-types';
import { buildPath } from './Path';
import { storeToken, retrieveToken } from '../tokenStorage';
import { useNavigate } from 'react-router-dom';


/**
 * Updates the match history record in the database.
 * * @param {String} userId - The user Id of the player who played this game 
 * * @param {Object[]} players - An array of all participating players.
 * @param {string}   players[].name - The display name of the player.
 * * @param {Object[]} winners - An array of the winning players.
 * @param {string}   winners[].name - The display name of the player.
 * * @param {Object[]} losers - An array of the losing players.
 * @param {string}   losers[].name - The display name of the player.
 ** @param {Date}   timeFinished - DateTime object representing when the game finished.
 */
async function updateMatchHistory(userId: String, players: Array<object>, winners: Array<object>, losers: Array<object>, timeFinished: Date){
  try {
    const payload = {
      userId, 
      players,
      winners,
      losers,
      timeFinished,
    };

    const response = await fetch(buildPath('/api/add-match-history'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${retrieveToken()}`
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update match history');
    }

    if (result.accessToken) {
      storeToken(result.accessToken);
    }

    console.log('Match history updated:', result.message);

  } catch (error) {
    console.error('Error in updateMatchHistory:', error);

    console.error('Could not update Match History');
  }
}

interface ExtendedBoardProps extends BoardProps {
  playerConfigs?: PlayerConfig[];
  handGap?: number;
  handHeight?: number;
}

function Board({
  G, ctx, moves, playerID,
  playerConfigs = [],
  handHeight = 120,
}: ExtendedBoardProps) {
  const navigate = useNavigate();
  const pid = playerID ?? '0';
  const myHand: any[] = G.hands[pid] ?? [];
  const isMyTurn = ctx.currentPlayer === pid;
  const boardIsEmpty = G.board.length === 0;

  const [localOrder, setLocalOrder] = useState<number[]>(() => myHand.map((_, i) => i));
  const [isDragging, setIsDragging] = useState(false);
  const [activeTile, setActiveTile] = useState<{ top: number; bottom: number } | null>(null);
  const [newTileIdx, setNewTileIdx] = useState<number | null>(null);
  const prevHandLengthRef = useRef(myHand.length);

  useEffect(() => {
    const newLen = myHand.length;
    const prevLen = prevHandLengthRef.current;

    if (prevLen === 0 && newLen > 0) {
      // Initial hand arrived from server — populate full order
      setLocalOrder(myHand.map((_, i) => i));
    } else if (newLen > prevLen) {
      // Single tile drawn — append the new index and animate it in
      const drawnIdx = newLen - 1;
      setLocalOrder(prev => [...prev, drawnIdx]);
      setNewTileIdx(drawnIdx);
      setTimeout(() => setNewTileIdx(null), 400);
    }
    prevHandLengthRef.current = newLen;
  }, [myHand.length]);

  useEffect(() => {
    if (!ctx.gameover) return;

    const winner = ctx.gameover.winner;
    const timeFinished = new Date();

    const players = playerConfigs.length > 0
      ? playerConfigs.map(p => ({ name: p.username }))
      : ctx.playOrder.map(id => ({ name: `Player ${id}` }));

    const winners = playerConfigs.length > 0
      ? playerConfigs.filter(p => p.playerID === winner).map(p => ({ name: p.username }))
      : [{ name: `Player ${winner}` }];

    const losers = playerConfigs.length > 0
      ? playerConfigs.filter(p => p.playerID !== winner).map(p => ({ name: p.username }))
      : ctx.playOrder.filter(id => id !== winner).map(id => ({ name: `Player ${id}` }));

    const user = JSON.parse(sessionStorage.getItem('user_data') || '');
    const userId = user.id;

    console.log(players, winners, losers, userId, timeFinished);
    updateMatchHistory(userId, players, winners, losers, timeFinished);
}, [ctx.gameover]);


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
      const tile = myHand[playedIdx];
      const end = dropData.zone === 'RIGHT_END' ? 'right' : 'left';

      if (!canPlayTile(tile, G.boardEnds, end, boardIsEmpty)) {
        return;
      }

      moves.playTile(playedIdx, end);

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
      newTileIndex={config.playerID === pid ? newTileIdx : undefined}
    />
  );

  // Split the board into left plays and right plays
  const centerIdx = G.board.findIndex((e: any) => e.side === 'center');
  const leftTiles  = G.board.slice(0, centerIdx).reverse(); // played on left end
  const centerTile = G.board[centerIdx];
  const rightTiles = G.board.slice(centerIdx + 1);      

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

          {/* Scroll container */}
          <div style={{ overflowX: 'auto', minHeight: 100, borderRadius: 8 }}>
            {/* Centering wrapper: fills full width so justify-content centers when chain is short;
                grows beyond 100% when chain overflows so scroll reveals both ends */}
            <div style={{ display: 'flex', justifyContent: 'center', minWidth: '100%' }}>
            {/* Content row: flex-shrink:0 prevents compression; padding adds breathing room */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
              padding: 16,
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
                      ? `${entry.side === 'left' ? 'slideInLeft' : 'slideInRight'} 0.25s ease`
                      : undefined;
                    const top_dots = entry.side === 'left'  ? entry.domino.bottom: entry.domino.top;
                    const bottom_dots = entry.side === 'left' ? entry.domino.top: entry.domino.bottom;
                    return (
                      <div key={idx} style={{ animation: anim }}>
                        <DominoTile top={top_dots} bottom={bottom_dots} horizontal />
                      </div>
                    );
                  })}
                </div>
                <DropZone id="right-end" data={{ zone: 'RIGHT_END' }} label="RIGHT" isActive={isDragging} />
              </>
            )}
            </div> {/* end content row */}
            </div> {/* end centering wrapper */}
          </div> {/* end scroll container */}

          {/* Actions — always visible, disabled when not your turn */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
            <button
              onClick={() => moves.drawTile()}
              disabled={!isMyTurn || G.graveyard.length === 0}
              style={btnStyle(!isMyTurn || G.graveyard.length === 0)}
            >
              Draw ({G.graveyard.length} left)
            </button>
            <button
              onClick={() => moves.pass()}
              disabled={!isMyTurn || G.graveyard.length > 0}
              style={btnStyle(!isMyTurn || G.graveyard.length > 0)}
            >
              Pass
            </button>
          </div>

          {ctx.gameover && (
            <div style={gameoverStyle}>
              {ctx.gameover.winner === pid ? 'You Win!' : `Player ${ctx.gameover.winner} wins!`}
              <br/>
              <button
                onClick={() => navigate('/main', { replace: true })}
                style={btnStyle(false)}
              >
                Return to home
              </button>
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

      <DragOverlay dropAnimation={null}>
        {activeTile && <DominoTile top={activeTile.top} bottom={activeTile.bottom} />}
      </DragOverlay>
    </DndContext>
  );
}

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '8px 20px',
    fontSize: 15,
    fontFamily: '"Exo", sans-serif',
    borderRadius: 8,
    border: 'none',
    background: disabled ? '#555' : '#259506',
    color: disabled ? '#999' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s, color 0.2s',
  };
}

const gameoverStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.85)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
  justifyContent: 'center',
  fontSize: 48,
  color: '#f5f0e8',
  zIndex: 200,
  fontFamily: '"Exo", sans-serif',
};

export default Board;
