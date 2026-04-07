{/* const [players, setPlayers] = useState([]); Updates players array */}

{/*setPlayers(prev => [...prev, newPlayer]); When someone joins react will re render list */}

{/*<Lobby players={players} isHost={currentUser.id === hostId} /> Determines Host*/}


function Lobby({players, isHost}) {
  return (
  <div id="loginDiv">
	<span id="inner-title">Match Lobby</span><br />
	<div className="lobbyContainer">

		  <div className="lobbyContent">

			{/* Player List */}
			<div className="playerList">
			  <h2>Players in Lobby</h2>

			  <ul>
				{players.map((player, index) => (
				  <li key={index} className="playerItem">
					{player.name}
					{player.isHost && <span className="hostTag">Host</span>}
				  </li>
				))}
			  </ul>
			</div>

			{/* Start Button (Host Only) */}
			{isHost && (
				<input type="submit" id="lobbyButton" className="buttons" value="Start Game" />
			)}

		  </div>
		</div>
	</div>
  );
};
export default Lobby;