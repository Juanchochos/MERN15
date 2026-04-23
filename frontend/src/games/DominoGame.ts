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
    drawPending: boolean;
    drawScores: Record<string, number> | null;
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
            drawPending: false,
            drawScores: null,
        };
    },

    turn: {
        stages: {
            restart: {
                moves: {
                    restartGame: ({ G, ctx, events }: { G: GameState; ctx: any; events: any }) => {
                        const tiles: Tile[] = [];
                        for (let i = 0; i <= 6; i++)
                            for (let j = i; j <= 6; j++)
                                tiles.push({ top: i, bottom: j });
                        const shuffled = shuffle(tiles);
                        const hands: Record<string, Tile[]> = {};
                        for (let i = 0; i < ctx.numPlayers; i++)
                            hands[String(i)] = shuffled.splice(0, 7);
                        G.hands = hands;
                        G.graveyard = shuffled;
                        G.board = [];
                        G.boardEnds = { left: null, right: null };
                        G.passCount = 0;
                        G.drawPending = false;
                        G.drawScores = null;
                        events.endTurn();
                    },
                },
            },
        },
    },

    moves: {
        drawTile: ({ G, ctx }: { G: GameState; ctx: any }) => {
            if (G.drawPending) return INVALID_MOVE;
            if (G.graveyard.length === 0) return INVALID_MOVE;
            const tile = G.graveyard.pop()!;
            G.hands[ctx.currentPlayer].push(tile);
        },

        pass: ({ G, ctx, events }: { G: GameState; ctx: any; events: any }) => {
            if (G.drawPending) return INVALID_MOVE;
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

            if (G.passCount >= ctx.numPlayers) {
                const scores: Record<string, number> = {};
                for (let i = 0; i < ctx.numPlayers; i++)
                    scores[String(i)] = getHandScore(G.hands[String(i)]);
                const vals = Object.values(scores);
                const isDraw = vals.every(s => s === vals[0]);
                if (isDraw) {
                    G.drawPending = true;
                    G.drawScores = scores;
                    events.setActivePlayers({ value: { '0': 'restart' } });
                    return;
                }
            }

            events.endTurn();
        },

        playTile: (
            { G, ctx, events }: { G: GameState; ctx: any; events: any },
            tileIdx: number,
            end_played: Side
        ) => {
            if (G.drawPending) return INVALID_MOVE;
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

        debugForceWin: ({ ctx, events }: { ctx: any; events: any }) => {
            const scores: Record<string, number> = {};
            for (let i = 0; i < ctx.numPlayers; i++) scores[String(i)] = 15;
            scores[ctx.currentPlayer] = 0;
            events.endGame({ winner: String(ctx.currentPlayer), scores });
        },

        debugForceLoss: ({ ctx, events }: { ctx: any; events: any }) => {
            const otherId = ctx.playOrder.find((id: string) => id !== ctx.currentPlayer) ?? '1';
            const scores: Record<string, number> = {};
            for (let i = 0; i < ctx.numPlayers; i++) scores[String(i)] = 15;
            scores[String(otherId)] = 0;
            events.endGame({ winner: String(otherId), scores });
        },

    },

    endIf: ({ G, ctx }: { G: GameState; ctx: any }) => {
        if (G.drawPending) return undefined;

        const scores: Record<string, number> = {};
        for (let i = 0; i < ctx.numPlayers; i++)
            scores[String(i)] = getHandScore(G.hands[String(i)]);

        if (G.hands[ctx.currentPlayer].length === 0) {
            scores[ctx.currentPlayer] = 0;
            return { winner: String(ctx.currentPlayer), scores };
        }

        if (G.passCount >= ctx.numPlayers) {
            let minScore = Infinity;
            let winnerId = '0';
            for (let i = 0; i < ctx.numPlayers; i++) {
                if (scores[String(i)] < minScore) {
                    minScore = scores[String(i)];
                    winnerId = String(i);
                }
            }
            return { winner: winnerId, scores };
        }
    },
};
