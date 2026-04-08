import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { DominoGame } from '../games/DominoGame';
import Board from '../components/Board';
import PageHeader from '../components/PageHeader';
import type { PlayerConfig } from '../games/player-types';

const SERVER = import.meta.env.VITE_BGIO_SERVER_URL ?? 'http://localhost:5000';

const HAND_MAX_WIDTH = 450;
const HAND_HEIGHT    = 130;
const HAND_GAP       = 40;

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

const DominoClient = Client({
  game: DominoGame,
  board: BoardWrapper,
  multiplayer: SocketIO({ server: SERVER }),
  debug: false,
});

function GameRoomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state as { matchID: string; playerID: string; credentials: string } | null;

  useEffect(() => {
    if (!session) {
      navigate('/main', { replace: true });
    }
  }, []);

  if (!session) return null;

  return (
    <>
      <style>{`#gameRoomPage header[role="banner"] { margin-bottom: 0 !important; }`}</style>
      <div
        id="gameRoomPage"
        style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
      >
        <PageHeader warnOnLeave />
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
