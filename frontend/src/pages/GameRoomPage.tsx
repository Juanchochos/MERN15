import { useEffect, useState, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import type { PlayerConfig } from '../games/player-types';
import { Lobby } from '../games/domino-lobby';
import { SERVER_URL as SERVER } from '../components/Path';

import { DominoGame } from '../games/DominoGame'; // ← load normally

const HAND_MAX_WIDTH = 450;
const HAND_HEIGHT = 130;
const HAND_GAP = 40;

const lobby = new Lobby(SERVER);

// Lazy-load Board (React component)
const Board = lazy(() => import('../components/Board'));

// Lazy-load boardgame.io Client + SocketIO
async function loadBoardgameIO() {
  const react = await import('boardgame.io/react');
  const multiplayer = await import('boardgame.io/multiplayer');
  return {
    Client: react.Client,
    SocketIO: multiplayer.SocketIO
  };
}

function GameRoomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  //const session = location.state as { matchID: string; playerID: string; credentials: string } | null;
  const query = new URLSearchParams(location.search);
  
  const session = (location.state as any) || {
    matchID: query.get('matchID'),
    playerID: query.get('playerID'),
    credentials: query.get('credentials'),
  };

  //const [playerConfigs, setPlayerConfigs] = useState<PlayerConfig[] | null>(null);
  const [playerConfigs, setPlayerConfigs] = useState<PlayerConfig[] | null>(null);
  const [bgio, setBGIO] = useState<any>(null);

  // Load boardgame.io + SocketIO
  useEffect(() => {
    loadBoardgameIO().then(setBGIO);
  }, []);

  // Load match data
  useEffect(() => {
    if (!session.matchID || !session.playerID) {
      navigate('/main', { replace: true });
      return;
    }

    async function initRoom() {
      if (!session) return;

      try {
        const meta = await lobby.getMatch(session.matchID);
        const configs = meta.players.map((p: any) => ({
          playerID: String(p.id),
          username: p.name ?? `Player ${p.id}`,
          team:
            Number(p.id) % 2 === Number(session.playerID) % 2
              ? 0
              : 1,
        }));
        setPlayerConfigs(configs);
      } catch (err) {
        console.error('Lobby Fetch Error:', err);
      }
    }

    initRoom();
  }, [session, navigate]);

  if (!session || !playerConfigs || !bgio) {
    return (
      <div style={{ color: 'white', padding: '20px' }}>
        Loading match data…
      </div>
    );
  }

  const { Client, SocketIO } = bgio;

  const BoardWrapper = (props: any) => {
    if (!props.playerConfigs) return null;

    return (
      <Board
        {...props}
        playerConfigs={props.playerConfigs}
        handMaxWidth={HAND_MAX_WIDTH}
        handHeight={HAND_HEIGHT}
        handGap={HAND_GAP}
      />
    );
  };

  const DominoClient = Client({
    game: DominoGame, // ← works perfectly
    board: BoardWrapper,
    multiplayer: SocketIO({ server: SERVER }),
    debug: false,
  });

  return (
    <div
      id="gameRoomPage"
      style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
    >
      <PageHeader warnOnLeave />

      <div style={{ flex: 1 }}>
        <Suspense fallback={null}>
          <DominoClient
            matchID={session.matchID}
            playerID={session.playerID}
            credentials={session.credentials}
            playerConfigs={playerConfigs}
          />
        </Suspense>
      </div>
    </div>
  );
}

export default GameRoomPage;
