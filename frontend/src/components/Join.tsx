import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lobby } from '../games/domino-lobby';

import { SERVER_URL as SERVER } from './Path';

function Join() {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleJoin() {
    const code = roomCode.trim();
    if (!code) return;

    setLoading(true);
    setError('');
    try {
      const userData = localStorage.getItem('user_data');
      const firstName = userData ? JSON.parse(userData).firstName : 'Player';

      const lobby = new Lobby(SERVER);
      const meta = await lobby.getMatch(code);

      const taken = meta.players
        .filter((p: any) => p.name)
        .map((p: any) => String(p.id));
      const nextSlot = ['0', '1', '2', '3'].find(id => !taken.includes(id));

      if (!nextSlot) throw new Error('Match is full');

      const credentials = await lobby.joinMatch(code, nextSlot, firstName);

      navigate('/Lobby', {
        state: { matchID: code, playerID: nextSlot, credentials, numPlayers: meta.players.length },
      });
    } catch (e: any) {
      setError(e.message ?? 'Failed to join game');
      setLoading(false);
    }
  }

  return (
    <div id="loginDiv">
      <span id="inner-title">Join Method</span><br />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* <input type="submit" id="roomButton" className="buttons" value="Random Match" /> */}
      {/* <div id="orBoxJoin"><h1 id="orH1Join">OR</h1></div> */}
      <div id="roomCode">
        <input
          type="text" id="roomName" placeholder="Room Code"
          value={roomCode}
          onChange={e => setRoomCode(e.target.value)}
        /><br />
        <input
          type="submit" id="room2Button" className="buttons" value={loading ? 'Joining...' : 'Join'}
          disabled={loading || !roomCode.trim()}
          onClick={handleJoin}
        />
      </div>
    </div>
  );
}

export default Join;
