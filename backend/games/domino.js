import { INVALID_MOVE } from "boardgame.io/dist/cjs/core.js";
import { shuffle, canPlayDomino, getHandScore, findFirstPlayer } from "../src/domino-helper.js";

// All state uses plain { top, bottom } objects — no class instances.
// boardgame.io requires G to be fully JSON-serializable.

function canPlayEnd(tile, end) {
    return tile.top === end || tile.bottom === end;
}

export const DominoGame = {
    name: "domino",
    minPlayers: 2,
    maxPlayers: 4,

    setup: ({ ctx }) => {
        const dominoType = 6;
        const tiles = [];
        const players = {};
  
        // Initialize slots based on the number of players in the match
        for (let i = 0; i < ctx.numPlayers; i++) {
            players[i] = {
                name: "", 
                connected: false
            };
        }

        for (let i = 0; i <= dominoType; i++) {
            for (let j = i; j <= dominoType; j++) {
                tiles.push({ top: i, bottom: j });
            }
        }

        const shuffled = shuffle(tiles);

        const hands = {};
        for (let i = 0; i < ctx.numPlayers; i++) {
            hands[i] = shuffled.splice(0, 7);
        }

        return {
            players,
            graveyard: shuffled,
            hands,
            board: [],
            boardEnds: { left: null, right: null },
            passCount: 0,
        };
    },

    // Hide other players' hands and graveyard contents
    playerView({ G, playerID }) {
        const hands = {};
        for (const pid in G.hands) {
            if (pid === playerID) {
                hands[pid] = G.hands[pid];
            } else {
                hands[pid] = G.hands[pid].map(() => ({ hidden: true }));
            }
        }
        return {
            ...G,
            hands,
            graveyard: G.graveyard.map(() => ({ hidden: true })),
            graveyardCount: G.graveyard.length,
        };
    },

    turn: {
        order: {
            first: ({ G, ctx }) => findFirstPlayer(G.hands, ctx.numPlayers),
            next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers,
        },
        moveLimit: 1,
    },

    moves: {
        drawTile: ({ G, ctx }) => {
            if (G.graveyard.length === 0) return INVALID_MOVE;
            const tile = G.graveyard.pop();
            G.hands[ctx.currentPlayer].push(tile);
        },

        pass: ({ G, ctx }) => {
            const { left, right } = G.boardEnds;
            if (left !== null && right !== null &&
                canPlayDomino(left, right, G.hands[ctx.currentPlayer])) {
                return INVALID_MOVE;
            }
            if (G.graveyard.length !== 0) return INVALID_MOVE;
            G.passCount += 1;
        },

        playTile: ({ G, ctx }, tileIdx, end_played) => {
            const hand = G.hands[ctx.currentPlayer];
            if (tileIdx >= hand.length) return INVALID_MOVE;

            const tile = hand[tileIdx];

            // First tile placed
            if (G.board.length === 0) {
                G.board.push({ domino: { ...tile }, side: "center" });
                G.boardEnds.left = tile.top;
                G.boardEnds.right = tile.bottom;
                hand.splice(tileIdx, 1);
                G.passCount = 0;
                return;
            }

            if (end_played !== "left" && end_played !== "right") return INVALID_MOVE;

            const board_end = end_played === "left" ? G.boardEnds.left : G.boardEnds.right;
            if (board_end === null) return INVALID_MOVE;
            if (!canPlayEnd(tile, board_end)) return INVALID_MOVE;

            // Orient so the matching pip faces the chain end
            const oriented = tile.top === board_end
                ? { top: tile.top, bottom: tile.bottom }
                : { top: tile.bottom, bottom: tile.top };


            if (end_played === "left") {
                G.boardEnds.left = oriented.bottom;
                G.board.unshift({ domino: oriented, side: end_played });
            } else {
                G.boardEnds.right = oriented.bottom;
                G.board.push({ domino: oriented, side: end_played });
            }

            hand.splice(tileIdx, 1);
            G.passCount = 0;
        },
    },

    onPlayerJoin: (G, ctx, playerID) => {
        if (ctx.metadata[playerID]) {
            const playerName = ctx.metadata[playerID].name;
    
            if (G.players[playerID]) {
                G.players[playerID].name = playerName;
                console.log(`Successfully mapped ${playerName} to slot ${playerID}`);
            }
        } else {
            console.warn(`No metadata found for player ${playerID}.`);
        }
    },

    onPlayerLeave: (G, ctx, playerID) => {
        console.log(`Player ${playerID} left.`);
        if (G.players[playerID]) {
            G.players[playerID].connected = false;
        }
    },

    endIf: ({ G, ctx }) => {
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
