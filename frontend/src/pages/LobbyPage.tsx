import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.tsx';
import LobbyView from '../components/Lobby.tsx';
import { Lobby } from '../games/domino-lobby';

const SERVER = import.meta.env.VITE_BGIO_SERVER_URL ?? 'http://localhost:5000';

interface SessionState {
  matchID: string;
  playerID: string;
  credentials: string;
  numPlayers: number;
}

const LobbyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state as SessionState | null;

  const [players, setPlayers] = useState<{ name: string; isHost: boolean }[]>([]);
  const lobbyRef = useRef(new Lobby(SERVER));

  useEffect(() => {
    if (!session) {
      navigate('/main', { replace: true });
      return;
    }

    const { matchID, playerID, credentials, numPlayers } = session;
    const isHost = playerID === '0';

    async function poll() {
      try {
        const meta = await lobbyRef.current.getMatch(matchID);

        setPlayers(meta.players.map((p: any) => ({
          name: p.name ?? '(waiting...)',
          isHost: String(p.id) === '0',
        })));

        if (!isHost && meta.players[0]?.data?.started === true) {
          navigate('/game', { state: { matchID, playerID, credentials, numPlayers } });
        }
      } catch {
        // ignore transient poll errors
      }
    }

    poll();
    const interval = setInterval(poll, 2500);
    return () => clearInterval(interval);
  }, []);

  if (!session) return null;

  const { matchID, playerID, credentials, numPlayers } = session;
  const isHost = playerID === '0';
  const isFull = players.filter(p => p.name !== '(waiting...)').length >= numPlayers;

  async function handleStart() {
    try {
      await lobbyRef.current.markStarted(matchID, credentials);
      navigate('/game', { state: { matchID, playerID, credentials, numPlayers } });
    } catch (e: any) {
      console.error('Failed to start game:', e);
    }
  }

  return (
    <div>
      <PageHeader />
      <LobbyView
        matchID={matchID}
        players={players}
        isHost={isHost}
        isFull={isFull}
        onStart={handleStart}
      />
    </div>
  );
};

export default LobbyPage;
