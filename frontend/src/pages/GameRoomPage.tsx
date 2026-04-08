import { useState } from 'react';
import Board from '../components/Board';
import PageHeader from '../components/PageHeader';
import type { PlayerConfig } from '../games/player-types';

// ── Game mode ─────────────────────────────────────────────
const GAME_MODE: '1v1' | '2v2' = '1v1';

const PLAYER_CONFIGS: PlayerConfig[] = GAME_MODE === '2v2'
  ? [
      { playerID: '0', username: 'You',      team: 0 },
      { playerID: '1', username: 'Opponent', team: 1 },
    ]
  : [
      { playerID: '0', username: 'You',        team: 0 },
      { playerID: '1', username: 'Teammate',   team: 0 },
      { playerID: '2', username: 'Opponent 1', team: 1 },
      { playerID: '3', username: 'Opponent 2', team: 1 },
    ];

const LOCAL_PLAYER_ID = '0';

// ── Hand size — adjust these to resize the hand panels ────
const HAND_MAX_WIDTH = 450;  // px — max width of each hand panel
const HAND_HEIGHT    = 130;  // px — height of the top and bottom hand rows
const HAND_PADDING   = 12;   // px — inner padding inside each hand panel
// ──────────────────────────────────────────────────────────

const initialHands: Record<string, { top: number; bottom: number }[]> = {
  '0': [
    { top: 3, bottom: 5 }, { top: 6, bottom: 6 }, { top: 0, bottom: 2 },
    { top: 1, bottom: 4 }, { top: 2, bottom: 3 }, { top: 5, bottom: 0 }, { top: 4, bottom: 4 },
  ],
  '1': [
    { top: 1, bottom: 1 }, { top: 2, bottom: 6 }, { top: 0, bottom: 5 },
    { top: 3, bottom: 3 }, { top: 4, bottom: 6 }, { top: 1, bottom: 3 }, { top: 0, bottom: 4 },
  ],
  '2': [
    { top: 0, bottom: 6 }, { top: 2, bottom: 2 }, { top: 1, bottom: 5 },
    { top: 3, bottom: 6 }, { top: 0, bottom: 3 }, { top: 4, bottom: 5 }, { top: 1, bottom: 6 },
  ],
  '3': [
    { top: 0, bottom: 1 }, { top: 2, bottom: 4 }, { top: 3, bottom: 4 },
    { top: 5, bottom: 5 }, { top: 0, bottom: 0 }, { top: 2, bottom: 5 }, { top: 1, bottom: 2 },
  ],
};

function GameRoomPage() {
  const [hands, setHands] = useState(initialHands);
  const [board, setBoard] = useState<{ domino: { top: number; bottom: number }; side: string }[]>([]);
  const [boardEnds, setBoardEnds] = useState<{ left: number | null; right: number | null }>({ left: null, right: null });
  const [graveyard, setGraveyard] = useState<{ top: number; bottom: number }[]>([
    { top: 0, bottom: 0 }, { top: 0, bottom: 1 }, { top: 0, bottom: 6 },
    { top: 1, bottom: 2 }, { top: 1, bottom: 5 }, { top: 1, bottom: 6 },
    { top: 2, bottom: 2 }, { top: 2, bottom: 5 }, { top: 3, bottom: 6 },
    { top: 5, bottom: 6 }, { top: 6, bottom: 6 },
  ]);

  const mockMoves = {
    playTile: (idx: number, end: string) => {
      const tile = hands[LOCAL_PLAYER_ID][idx];
      if (!tile) return;

      // First tile — always valid, left pip becomes left end, right pip becomes right end
      if (board.length === 0) {
        console.log(`%cPlaced [${tile.top}|${tile.bottom}] as first tile  →  left:${tile.top} right:${tile.bottom}`, 'color:#259506;font-weight:bold');
        setBoard(prev => [...prev, { domino: tile, side: 'center' }]);
        setBoardEnds({ left: tile.top, right: tile.bottom });
        setHands(prev => ({ ...prev, [LOCAL_PLAYER_ID]: prev[LOCAL_PLAYER_ID].filter((_, i) => i !== idx) }));
        return;
      }

      if (end === 'left') {
        // LEFT placement: tile's RIGHT pip (bottom) must face the chain (match left board end)
        // → if bottom matches: store as-is, new left = top
        // → if top matches:    flip tile,   new left = bottom
        const matchingPip = boardEnds.left!;
        if (tile.bottom === matchingPip) {
          console.log(`%cPlaced [${tile.top}|${tile.bottom}] on LEFT  →  new left:${tile.top}`, 'color:#259506;font-weight:bold');
          setBoard(prev => [...prev, { domino: { top: tile.top, bottom: tile.bottom }, side: 'left' }]);
          setBoardEnds(prev => ({ ...prev, left: tile.top }));
        } else if (tile.top === matchingPip) {
          console.log(`%cPlaced [${tile.top}|${tile.bottom}] flipped on LEFT  →  new left:${tile.bottom}`, 'color:#259506;font-weight:bold');
          setBoard(prev => [...prev, { domino: { top: tile.bottom, bottom: tile.top }, side: 'left' }]);
          setBoardEnds(prev => ({ ...prev, left: tile.bottom }));
        } else {
          console.log(`%c✗ Invalid: [${tile.top}|${tile.bottom}] neither pip matches left end (${boardEnds.left})`, 'color:red;font-weight:bold');
          return;
        }
      } else {
        // RIGHT placement: tile's LEFT pip (top) must face the chain (match right board end)
        // → if top matches:    store as-is, new right = bottom
        // → if bottom matches: flip tile,   new right = top
        const matchingPip = boardEnds.right!;
        if (tile.top === matchingPip) {
          console.log(`%cPlaced [${tile.top}|${tile.bottom}] on RIGHT  →  new right:${tile.bottom}`, 'color:#259506;font-weight:bold');
          setBoard(prev => [...prev, { domino: { top: tile.top, bottom: tile.bottom }, side: 'right' }]);
          setBoardEnds(prev => ({ ...prev, right: tile.bottom }));
        } else if (tile.bottom === matchingPip) {
          console.log(`%cPlaced [${tile.top}|${tile.bottom}] flipped on RIGHT  →  new right:${tile.top}`, 'color:#259506;font-weight:bold');
          setBoard(prev => [...prev, { domino: { top: tile.bottom, bottom: tile.top }, side: 'right' }]);
          setBoardEnds(prev => ({ ...prev, right: tile.top }));
        } else {
          console.log(`%c✗ Invalid: [${tile.top}|${tile.bottom}] neither pip matches right end (${boardEnds.right})`, 'color:red;font-weight:bold');
          return;
        }
      }

      setHands(prev => ({ ...prev, [LOCAL_PLAYER_ID]: prev[LOCAL_PLAYER_ID].filter((_, i) => i !== idx) }));
    },
    drawTile: () => {
      if (graveyard.length === 0) return;
      const tile = graveyard[graveyard.length - 1];
      console.log(`%cDrew [${tile.top}|${tile.bottom}]  (${graveyard.length - 1} remaining)`, 'color:#4a9eff;font-weight:bold');
      setGraveyard(prev => prev.slice(0, -1));
      setHands(prev => ({ ...prev, [LOCAL_PLAYER_ID]: [...prev[LOCAL_PLAYER_ID], tile] }));
    },
    pass:     () => console.log('pass'),
  };

  const G = {
    hands,
    board,
    boardEnds,
    graveyard,
    passCount: 0,
  };

  const ctx = {
    currentPlayer: LOCAL_PLAYER_ID,
    numPlayers: PLAYER_CONFIGS.length,
    gameover: null,
  };

  return (
    // Override the header's 10% margin-bottom from main.css so it doesn't gap the game layout
    <>
      <style>{`#gameRoomPage header[role="banner"] { margin-bottom: 0 !important; }`}</style>
      <div id="gameRoomPage" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <PageHeader />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Board
            G={G as any}
            ctx={ctx as any}
            moves={mockMoves as any}
            playerID={LOCAL_PLAYER_ID}
            playerConfigs={PLAYER_CONFIGS}
            handPadding={HAND_PADDING}
            handMaxWidth={HAND_MAX_WIDTH}
            handHeight={HAND_HEIGHT}
            handGap={40}
          />
        </div>
      </div>
    </>
  );
}

export default GameRoomPage;
