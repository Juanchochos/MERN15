import { useState } from 'react';
import { Lobby } from '../games/domino-lobby';

// LobbyPanel — temporary create/join UI.
// To move to a real CreatePage later:
//   1. Drop this component into CreatePage
//   2. Change onJoin to call navigate('/game', { state: session })
//   3. In GameRoomPage, read session from useLocation().state

import { SERVER_URL as SERVER } from './Path';

export interface LobbySession {
  matchID: string;
  playerID: string;
  credentials: string;
}

interface LobbyPanelProps {
  onJoin: (session: LobbySession) => void;
}

export function LobbyPanel({ onJoin }: LobbyPanelProps) {
  const [mode, setMode]             = useState<'1v1' | '2v2'>('1v1');
  const [joinInput, setJoinInput]   = useState('');
  const [pendingSession, setPending] = useState<LobbySession | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
      const lobby = new Lobby(SERVER);
      const numPlayers = mode === '1v1' ? 2 : 4;
      const matchID = await lobby.createMatch(numPlayers);
      const credentials = await lobby.joinMatch(matchID, '0', 'Player 0');
      // Don't navigate yet — show the match ID so the host can share it first
      setPending({ matchID, playerID: '0', credentials });
    } catch (e: any) {
      setError(e.message ?? 'Failed to create game');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    setLoading(true);
    setError('');
    try {
      const lobby = new Lobby(SERVER);
      const meta = await lobby.lobby.getMatch('domino', joinInput.trim());
      const taken = meta.players
        .filter((p: any) => p.name)
        .map((p: any) => String(p.id));
      const nextSlot = ['0', '1', '2', '3'].find(id => !taken.includes(id));
      if (!nextSlot) throw new Error('Match is full');
      const credentials = await lobby.joinMatch(joinInput.trim(), nextSlot, `Player ${nextSlot}`);
      onJoin({ matchID: joinInput.trim(), playerID: nextSlot, credentials });
    } catch (e: any) {
      setError(e.message ?? 'Failed to join game');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 12 }}>
        <span style={{ marginRight: 8 }}>Mode:</span>
        <button
          onClick={() => setMode('1v1')}
          style={{ fontWeight: mode === '1v1' ? 'bold' : 'normal', marginRight: 4 }}
        >1v1</button>
        <button
          onClick={() => setMode('2v2')}
          style={{ fontWeight: mode === '2v2' ? 'bold' : 'normal' }}
        >2v2</button>
      </div>

      {pendingSession ? (
        <div style={{ marginBottom: 16 }}>
          <p>Match ID: <strong style={{ fontSize: '1.2em', letterSpacing: 2 }}>{pendingSession.matchID}</strong></p>
          <p style={{ color: '#888', fontSize: '0.9em' }}>Share this with the other player, then click Enter Game.</p>
          <button onClick={() => onJoin(pendingSession)}>Enter Game</button>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <button onClick={handleCreate} disabled={loading}>Create Game</button>
        </div>
      )}

      {!pendingSession && (
        <div>
          <input
            placeholder="Enter Match ID to join"
            value={joinInput}
            onChange={e => setJoinInput(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <button onClick={handleJoin} disabled={loading || !joinInput.trim()}>Join</button>
        </div>
      )}

      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
    </div>
  );
}
