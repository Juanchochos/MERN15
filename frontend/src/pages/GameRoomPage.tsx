import { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { DominoGame } from '../games/DominoGame';
import Board from '../components/Board';
import PageHeader from '../components/PageHeader';
import { LobbyPanel } from '../components/LobbyPanel';
import type { LobbySession } from '../components/LobbyPanel';
import type { PlayerConfig } from '../games/player-types';

const SERVER = import.meta.env.VITE_BGIO_SERVER_URL ?? 'http://localhost:5000';

// ── Layout constants ──────────────────────────────────────────
const HAND_MAX_WIDTH = 450;
const HAND_HEIGHT    = 130;
const HAND_GAP       = 40;
// ─────────────────────────────────────────────────────────────

// Arranges players so the local player is always at the bottom (team 0).
// 1v1:  bottom = local, top = opponent
// 2v2:  teams (0,2) vs (1,3) — classic domino seating
function derivePlayerConfigs(myID: string, numPlayers: number): PlayerConfig[] {
  if (numPlayers === 2) {
    const other = myID === '0' ? '1' : '0';
    return [
      { playerID: myID,  username: 'You',      team: 0 },
      { playerID: other, username: 'Opponent', team: 1 },
    ];
  }
  return (['0', '1', '2', '3'] as const).map(id => ({
    playerID: id,
    username: id === myID ? 'You' : `Player ${id}`,
    team: (Number(id) % 2 === Number(myID) % 2) ? 0 : 1,
  }));
}

// BoardWrapper: injects extra layout props that boardgame.io's Client doesn't pass.
const BoardWrapper = (props: any) => {
  const configs = derivePlayerConfigs(props.playerID ?? '0', props.ctx.numPlayers);
  return (
    <Board
      {...props}
      playerConfigs={configs}
      handMaxWidth={HAND_MAX_WIDTH}
      handHeight={HAND_HEIGHT}
      handGap={HAND_GAP}
    />
  );
};

// Created outside the component so it's stable and never remounts mid-game.
const DominoClient = Client({
  game: DominoGame,
  board: BoardWrapper,
  multiplayer: SocketIO({ server: SERVER }),
  debug: false,
});

function GameRoomPage() {
  const [session, setSession] = useState<LobbySession | null>(null);

  if (!session) {
    return (
      <div>
        <PageHeader />
        <LobbyPanel onJoin={setSession} />
      </div>
    );
  }

  return (
    <>
      <style>{`#gameRoomPage header[role="banner"] { margin-bottom: 0 !important; }`}</style>
      <div
        id="gameRoomPage"
        style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
      >
        <PageHeader />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <DominoClient
            matchID={session.matchID}
            playerID={session.playerID}
            credentials={session.credentials}
          />
        </div>
      </div>
    </>
  );
}

export default GameRoomPage;
