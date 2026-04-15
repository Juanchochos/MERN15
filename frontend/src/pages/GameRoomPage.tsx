import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { DominoGame } from '../games/DominoGame';
import Board from '../components/Board';
import PageHeader from '../components/PageHeader';
import type { PlayerConfig } from '../games/player-types';
import { Lobby } from '../games/domino-lobby';

import { SERVER_URL as SERVER } from '../components/Path';

const HAND_MAX_WIDTH = 450;
const HAND_HEIGHT    = 130;
const HAND_GAP       = 40;
const lobby = new Lobby(SERVER);


const BoardWrapper = (props: any) => {
  // props.playerConfigs comes from the DominoClient usage above
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
  game: DominoGame,
  board: BoardWrapper,
  multiplayer: SocketIO({ server: SERVER }),
  debug: false,
});


function GameRoomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state as { matchID: string; playerID: string; credentials: string } | null;

  // 1. Create state to hold the actual array of configs
  const [playerConfigs, setPlayerConfigs] = useState<PlayerConfig[] | null>(null);

  useEffect(() => {
    if (!session) {
      navigate('/main', { replace: true });
      return;
    }

    // 2. Fetch data here, safely
    async function initRoom() {
      try {
        const meta = await lobby.getMatch(session.matchID);
        const configs = meta.players.map((p: any) => ({
          playerID: String(p.id),
          username: p.name ?? `Player ${p.id}`,
          team: (Number(p.id) % 2 === Number(session.playerID) % 2) ? 0 : 1,
        }));
        setPlayerConfigs(configs);
      } catch (err) {
        console.error("Lobby Fetch Error:", err);
      }
    }

    initRoom();
  }, [session, navigate]);

  // 3. Show a loader until playerConfigs is an ARRAY
  if (!session || !playerConfigs) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading match data...</div>;
  }

  return (
    <div id="gameRoomPage" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <PageHeader warnOnLeave />
      <div style={{ flex: 1 }}>
        <DominoClient
          matchID={session.matchID}
          playerID={session.playerID}
          credentials={session.credentials}
          // Pass the ALREADY FETCHED configs here
          playerConfigs={playerConfigs} 
        />
      </div>
    </div>
  );
}

export default GameRoomPage;
