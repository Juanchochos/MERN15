import { INVALID_MOVE } from "boardgame.io/core";
import { DominoTile, shuffle, canPlayDomino, getHandScore } from "./domino-helper";


type Side = "left" | "right" | "center";

interface BoardEntry {
    domino: DominoTile;
    side: Side;
}

interface BoardEnds {
    left: number | null;
    right: number | null;
}

interface GameState {
    graveyard: DominoTile[]; 
    hands: Record<string, DominoTile[]>;
    board: BoardEntry[];
    boardEnds: BoardEnds; 
    passCount: number;
}

export const DominoGame = {
    name: "domino",
    minPlayers: 2,
    maxPlayers: 4,
    dominoType: 6,

    setup: ({ ctx }: { ctx: any }): GameState => {
        const graveyard: DominoTile[] = [];

        for (let i = 0; i <= ctx.dominoType; i++) {
            for (let j = i; j <= ctx.dominoType; j++) { 
                const tile = new DominoTile(i, j); 
                graveyard.push(tile);
            }
        }

        shuffle(graveyard);

        const hands: Record<string, DominoTile[]> = {};
        for (let i = 0; i < ctx.numPlayers; i++) {
            hands[i] = graveyard.splice(0, 7);
        }

        return {
            graveyard,
            hands,
            board: [],
            boardEnds: { left: null, right: null },
            passCount: 0,
        };
    },

    turn: {
        moveLimit: 1,
    },

    moves: {
        drawTile: ({ G, ctx }: { G: GameState; ctx: any }) => {
            if (G.graveyard.length === 0) return INVALID_MOVE;
            const tile_drawn = G.graveyard.pop()!;
            G.hands[ctx.currentPlayer].push(tile_drawn); 
        },

        pass: ({ G, ctx }: { G: GameState; ctx: any }) => {
            const { left, right } = G.boardEnds;
            if (
                left !== null &&
                right !== null &&
                canPlayDomino(left, right, G.hands[ctx.currentPlayer])
            ) {
                return INVALID_MOVE;
            }
            if (G.graveyard.length !== 0) return INVALID_MOVE;
            G.passCount += 1; 
        },

        playTile: ( 
            { G, ctx }: { G: GameState; ctx: any },
            tileIdx: number,
            end_played: Side
        ) => {
            const hand = G.hands[ctx.currentPlayer];
            if (tileIdx >= hand.length) return INVALID_MOVE;

            const tile_selected = hand[tileIdx];

            // First tile placed
            if (G.board.length === 0) {
                G.board.push({ domino: tile_selected, side: "center" });
                G.boardEnds.left = tile_selected.top;   
                G.boardEnds.right = tile_selected.bottom;
                G.hands[ctx.currentPlayer].splice(tileIdx, 1);
                return;
            }

            if (end_played !== "left" && end_played !== "right") return INVALID_MOVE;

            const board_end =
                end_played === "left" ? G.boardEnds.left : G.boardEnds.right;

            if (board_end === null) return INVALID_MOVE;
            if (!tile_selected.canPlayEnd(board_end)) return INVALID_MOVE;

            // Orient tile so the matching pip faces the board end
            if (tile_selected.top !== board_end) {
                tile_selected.flip();
            }

            G.board.push({ domino: tile_selected, side: end_played });

            if (end_played === "left") {
                G.boardEnds.left = tile_selected.bottom;
            } else {
                G.boardEnds.right = tile_selected.bottom;
            }

            G.hands[ctx.currentPlayer].splice(tileIdx, 1);
            G.passCount = 0; // BUG FIX: was `passCount` (undefined variable)
        },
    },

    endIf: ({ G, ctx }: { G: GameState; ctx: any }) => { 
        // Current player emptied their hand
        if (G.hands[ctx.currentPlayer].length === 0) {
            return { winner: String(ctx.currentPlayer) }; 
        }

        // All players passed consecutively → lowest score wins
        if (G.passCount >= ctx.numPlayers) {
            let minScore = Infinity;
            let winnerId = 0;

            for (let i = 0; i < ctx.numPlayers; i++) {
                const playerScore = getHandScore(G.hands[i]); 
                if (playerScore < minScore) {
                    minScore = playerScore;
                    winnerId = i; 
                }
            }

            return { winner: String(winnerId) };
        }
    },
};