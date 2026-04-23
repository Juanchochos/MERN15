import { INVALID_MOVE } from "boardgame.io/core";
import { shuffle, canPlayDomino, getHandScore } from "./domino-helper";

// Game state uses plain objects only — no class instances.
// boardgame.io serializes G as JSON; class methods are lost in transit.

type Tile = { top: number; bottom: number };
type Side = "left" | "right" | "center";

interface BoardEntry {
    domino: Tile;
    side: Side;
}

interface BoardEnds {
    left: number | null;
    right: number | null;
}

interface GameState {
    graveyard: Tile[];
    hands: Record<string, Tile[]>;
    board: BoardEntry[];
    boardEnds: BoardEnds;
    passCount: number;
}

export const DominoGame = {
    name: "domino",
    minPlayers: 2,
    maxPlayers: 4,

    setup: ({ ctx }: { ctx: any }): GameState => {
        const dominoType = 6;
        const tiles: Tile[] = [];

        for (let i = 0; i <= dominoType; i++) {
            for (let j = i; j <= dominoType; j++) {
                tiles.push({ top: i, bottom: j });
            }
        }

        const shuffled = shuffle(tiles);

        const hands: Record<string, Tile[]> = {};
        for (let i = 0; i < ctx.numPlayers; i++) {
            hands[i] = shuffled.splice(0, 7);
        }

        return {
            graveyard: shuffled,
            hands,
            board: [],
            boardEnds: { left: null, right: null },
            passCount: 0,
        };
    },

    moves: {
        drawTile: ({ G, ctx }: { G: GameState; ctx: any }) => {
            if (G.graveyard.length === 0) return INVALID_MOVE;
            const tile = G.graveyard.pop()!;
            G.hands[ctx.currentPlayer].push(tile);
        },

        pass: ({ G, ctx, events }: { G: GameState; ctx: any; events: any }) => {
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
            events.endTurn();
        },

        playTile: (
            { G, ctx, events }: { G: GameState; ctx: any; events: any },
            tileIdx: number,
            end_played: Side
        ) => {
            const hand = G.hands[ctx.currentPlayer];
            if (tileIdx >= hand.length) return INVALID_MOVE;

            const tile = hand[tileIdx];

            // First tile placed — always valid
            if (G.board.length === 0) {
                G.board.push({ domino: { ...tile }, side: "center" });
                G.boardEnds.left = tile.top;
                G.boardEnds.right = tile.bottom;
                hand.splice(tileIdx, 1);
                G.passCount = 0;
                events.endTurn();
                return;
            }

            if (end_played !== "left" && end_played !== "right") return INVALID_MOVE;

            const board_end = end_played === "left" ? G.boardEnds.left : G.boardEnds.right;
            if (board_end === null) return INVALID_MOVE;

            // Check if tile can match this end
            if (tile.top !== board_end && tile.bottom !== board_end) return INVALID_MOVE;

            // Orient so matching pip faces the chain end
            const oriented: Tile = tile.top === board_end
                ? { top: tile.top, bottom: tile.bottom }
                : { top: tile.bottom, bottom: tile.top };

            G.board.push({ domino: oriented, side: end_played });

            if (end_played === "left") {
                G.boardEnds.left = oriented.bottom;
            } else {
                G.boardEnds.right = oriented.bottom;
            }

            hand.splice(tileIdx, 1);
            G.passCount = 0;
            events.endTurn();
        },
    },

    endIf: ({ G, ctx }: { G: GameState; ctx: any }) => {
        if (G.hands[ctx.currentPlayer].length === 0) {
            return { winner: String(ctx.currentPlayer) };
        }
        if (G.passCount >= ctx.numPlayers) {
            let minScore = Infinity;
            let winnerId = 0;
            for (let i = 0; i < ctx.numPlayers; i++) {
                const score = getHandScore(G.hands[i]);
                if (score < minScore) {
                    minScore = score;
                    winnerId = i;
                }
            }
            return { winner: String(winnerId) };
        }
    },
};
