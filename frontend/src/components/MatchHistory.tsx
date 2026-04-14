type MatchRecord = {
  id: string;
  player: string;      // you
  opponent: string;    // enemy
  result: "Win" | "Loss";
};

type MatchHistoryProps = {
  matchID: string;
  history: MatchRecord[];
};

function MatchHistory({ matchID, history }: MatchHistoryProps) {
  // Only show last 5 games
  const lastFive = history.slice(-5).reverse();

  return (
    <div id="loginDiv">
      <span id="inner-title">Match History</span><br />

      <div className="lobbyContainer">
        <div className="lobbyContent">

          <div className="playerList">
            <h2>Last 5 Games</h2>

            <ul>
              {lastFive.map((match) => (
                <li key={match.id} className="playerItem">
                  <span>{match.player} vs {match.opponent}</span>

                  <span
                    style={{
                      marginLeft: "10px",
                      fontWeight: "bold",
                      color: match.result === "Win" ? "green" : "red"
                    }}
                  >
                    {match.result}
                  </span>
                </li>
              ))}
            </ul>

          </div>

        </div>
      </div>
    </div>
  );
}

export default MatchHistory;
