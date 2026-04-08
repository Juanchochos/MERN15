type Player = {
  name: string;
  isHost: boolean;
};

type LobbyProps = {
  matchID: string;
  players: Player[];
  isHost: boolean;
  isFull: boolean;
  onStart: () => void;
};

function Lobby({ matchID, players, isHost, isFull, onStart }: LobbyProps) {
  return (
    <div id="loginDiv">
      <span id="inner-title">Match Lobby</span><br />

      <div className="lobbyContainer">
        <div className="lobbyContent">

          {/* Room code */}
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <span style={{ fontSize: 13, opacity: 0.7 }}>Room Code</span><br />
            <strong style={{ fontSize: 22, letterSpacing: 3 }}>{matchID}</strong>
          </div>

          {/* Player list */}
          <div className="playerList">
            <h2>Players in Lobby</h2>
            <ul>
              {players.map((player, index) => (
                <li key={index} className="playerItem">
                  {player.name}
                  {player.isHost && <span className="hostTag"> (Host)</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Host: Start Game when full; Non-host: waiting message */}
          {isHost ? (
            <input
              type="submit" id="lobbyButton" className="buttons"
              value={isFull ? 'Start Game' : 'Waiting for players...'}
              disabled={!isFull}
              onClick={onStart}
            />
          ) : (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>Waiting for host to start...</p>
          )}

        </div>
      </div>
    </div>
  );
}

export default Lobby;
