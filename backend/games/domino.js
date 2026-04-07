import { INVALID_MOVE } from  "boardgame.io/dist/cjs/core.js";
import { DominoTile, findFirstPlayer, shuffle, canPlayDomino, getHandScore } from "../src/domino-helper.js";

export const DominoGame = {
    name: "domino",
    minPlayers: 2,
    maxPlayers: 4,
    dominoType: 6,

    setup: ({ ctx }) => {
        const graveyard = [];

        for (let i = 0; i <= ctx.dominoType; i++) {
            for (let j = i; j <= ctx.dominoType; j++) { 
                const tile = new DominoTile(i, j); 
                graveyard.push(tile);
            }
        }

        let shuffled = shuffle(graveyard);

        const hands = {};
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


    // Hide other players' hands
    playerView({ G, ctx, playerID }) {
        const sanitized = {G, hands: {} };
        for (const pid in G.hands) {
        if (pid === playerID) {
            sanitized.hands[pid] = G.hands[pid];
        } else {
            // Other players only see tile COUNT
            sanitized.hands[pid] = G.hands[pid].map(() => ({ hidden: true }));
        }
        }
        // Also hide boneyard contents
        sanitized.boneyard = G.boneyard.map(() => ({ hidden: true }));
        sanitized.boneyardCount = G.boneyard.length;
        return sanitized;
    },

    turn: {
         order: {
            first: ({ G, ctx }) => findFirstPlayer(G.hands, ctx.numPlayers),

            next: ({ G, ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers,
        },
        moveLimit: 1,
    },

    moves: {
        drawTile: ({ G, ctx }) => {
            if (G.graveyard.length === 0) return INVALID_MOVE;
            const tile_drawn = G.graveyard.pop();
            G.hands[ctx.currentPlayer].push(tile_drawn); 
        },

        pass: ({ G, ctx }) => {
            const { left, right } = G.boardEnds;
            if ( left !== null && right !== null && 
                canPlayDomino(left, right, G.hands[ctx.currentPlayer])) {
                return INVALID_MOVE;
            }
            if (G.graveyard.length !== 0) return INVALID_MOVE;
            G.passCount += 1; 
        },

        playTile: ({ G, ctx }, tileIdx, end_played) => { 
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

            const board_end = end_played === "left" ? G.boardEnds.left : G.boardEnds.right;

            if (board_end === null) return INVALID_MOVE;
            if (!tile_selected.canPlayEnd(board_end)) return INVALID_MOVE;

            // Orient tile so the matching top faces the board end
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
            G.passCount = 0; 
        },
    },

    endIf: ({ G, ctx }) => { 
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