import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { DominoGame } from '../games/DominoGame';
import { buildPath } from '../components/Path';
import  Board  from '../components/Board';

type GameRoomProps = {
    matchID: string;
    playerID: string;
    credentials?: string;
};

const DominoClient = Client({
    game: DominoGame,
    board: Board,
    multiplayer: SocketIO({ server: buildPath('') }),
    debug: false,
});

function GameRoom({ matchID, playerID, credentials }: GameRoomProps) {
    return (
        <DominoClient
            matchID={matchID}
            playerID={playerID}
            credentials={credentials}
        />
    );
}

export default GameRoom;