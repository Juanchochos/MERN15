import type { BoardProps } from 'boardgame.io/react';
import DominoTile from './DominoTile';
// import PlayerHand from './PlayerHand';

function Board({ G, ctx, moves, playerID }: BoardProps) {
  const myHand = G.hands[playerID!] ?? [];
  const isMyTurn = ctx.currentPlayer === playerID;

  function handlePlayTile(tileId: string, end: 'left' | 'right') {
    moves.playTile(tileId, end);
  }

  function handleDraw() {
    moves.drawTile();
  }

  function handlePass() {
    moves.passTurn();
  }

  return (
    <div id="gameBoard">
      {/* Game chain — scrollable horizontal strip */}
      <div id="chainArea">
        {G.chain.length === 0 ? (
          <p className="chainEmpty">No tiles played yet</p>
        ) : (
          <div id="dominoChain">
            {G.chain.map((tile: any, idx: number) => (
              <DominoTile
                key={idx}
                top ={tile.left}
                bottom ={tile.right}
                hidden={tile.hidden}
              />
            ))}
          </div>
        )}
      </div>

      {/* Opponent tile counts */}
      <div id="opponents">
        {Object.entries(G.hands)
          .filter(([pid]) => pid !== playerID)
          .map(([pid, hand]: [string, any]) => (
            <div key={pid} className="opponentInfo">
              Player {pid}: {(hand as any[]).length} tiles
              {ctx.currentPlayer === pid && ' ← Their turn'}
            </div>
          ))}
      </div>

      {/* Player's own hand */}
      {/* <PlayerHand
        tiles={myHand}
        isMyTurn={isMyTurn}
        leftEnd={G.leftEnd}
        rightEnd={G.rightEnd}
        onPlayLeft={(id) => handlePlayTile(id, 'left')}
        onPlayRight={(id) => handlePlayTile(id, 'right')}
      /> */}

      {/* Actions */}
      {isMyTurn && (
        <div id="actionButtons">
          <button onClick={handleDraw} disabled={G.boneyardCount === 0}>
            Draw ({G.boneyardCount} left)
          </button>
          <button onClick={handlePass} disabled={G.}>Pass</button>
        </div>
      )}

      {/* Win/loss overlay */}
      {ctx.gameover && (
        <div id="gameoverOverlay">
          {ctx.gameover.winner === playerID
            ? 'You Win!'
            : `Player ${ctx.gameover.winner} wins!`}
          {ctx.gameover.reason === 'blocked' && ' (Blocked game)'}
        </div>
      )}
    </div>
  );
}

export default Board;