import GameRoom from '../components/GameRoom'

const GameRoomUI = () =>
{
    return(
        <div>
            <GameRoom 
                matchID="default-match"//TODO Figure out how to put matchid here
                playerID="0"//TODO Same goes for playerID
            />
        </div>
    );
}

export default GameRoomUI;