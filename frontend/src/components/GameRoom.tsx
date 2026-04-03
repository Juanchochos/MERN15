import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { DominoGame } from '../games/DominoGame';
import { buildPath } from './Path';
import board from './Board';

type GameRoomProps = {
    matchID: string;
    playerID: string;
    credentials?: string;
};

const DominoClient = Client({
    game: DominoGame,
    board: board,
    multiplayer: SocketIO({ server: buildPath('') }),
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