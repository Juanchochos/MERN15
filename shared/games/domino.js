import { INVALID_MOVE } from 'boardgame.io/core';
import {getHandScore, canPlayDomino, shuffle, DominoTile} from '../src/domino_helper'


export const DominoGame = {
    name: "domino",
    minPlayers: 2,
    maxPlayers: 4,
    domino_type: 6,


    setup: ({ctx}) => {
        const graveyard = [];
        for(let i = 0; i <= 6; i++){
            for(let j = 0; j <= 6; j++){
                tile = new DominoTile(i, j);
                graveyard.push(DominoTile);
                
            }
        }

        graveyard = shuffle(graveyard);

        const hands = {};
        for(let i = 0; i < ctx.numPlayers; i++){
            hands[i] = graveyard.splice(0, 7);
        }

        return {
            graveyard,
            hands,
            board: [],
            boardEnds: {left: null, right: null},
            passCount: 0 //If the whole board passes consecutively, game ends
        }
    },

    turn: {
        moveLimit: 1,
    },

    moves: {
        drawTile: ({G, ctx}) => {
            if(G.boneyard.length === 0) return INVALID_MOVE;
            var tile_drawn = G.boneyard.pop();
            hands[ctx.currentPlayer].push(tile_drawn)
        },

        pass: ({G, ctx}) => {
            if(canPlayDomino(G.boardEnds.left, G.boardEnds.right, G.hands[ctx.currentPlayer])) {
                return INVALID_MOVE;
            }
            if(G.boneyard.length != 0){
                return INVALID_MOVE;
            }
            passCount += 1;
        }, 

        playtile: ({G, ctx}, tileIdx, end_played, playerId) =>{
            hand = G.hands[ctx.currentPlayer];
            if(tileIdx >= hand.length) return INVALID_MOVE;
            tile_selected = hand[tileIdx];

            //If this is the first tile
            if(G.board.length === 0){
                G.board.push({domino: tile_selected, side: "center"});
                G.board.left = tile_selected.top;
                G.board.right = tile_selected.bottom;
                G.hands[ctx.currentPlayer].splice(tileIdx, 1);//Remove domino from player hand
                return true;
            }

            var board_end = null;
            if(end_played === "left"){
                board_end = G.board.left;
            }
            else if(end_played === "right"){
                board_end = G.board.right;
            } 
            else{return INVALID_MOVE;}

            if(!tile_selected.canPlayEnd(board_end)) return INVALID_MOVE;

            //We always want the top of the tile connecting to the end
            if(tile_selected.top != board_end){
                tile_selected.flip();
            }

            G.board.push({domino: tile_selected, side: end_played});

            if(end_played === "left"){
                G.board.left = tile_selected.bottom;
            }
            else if(end_played === "right"){
                G.board.right = tile_selected.bottom;
            } 

            G.hands[ctx.currentPlayer].splice(tileIdx, 1);
            passCount = 0;
        }
    },

    endif: ({G, ctx}) => {
        if(G.hands[ctx.currentPlayer].length === 0){
            return {winner: string(ctx.currentPlayer)};
        }
        let minScore = 100;
        let winnerId = 0;
        if(G.passCount >= ctx.numPlayers){
            for(let i = 0 ; i < ctx.numPlayers; i++){
                playerScore = getHandScore(G.hands[ctx.numPlayers]);
                if(playerScore < minScore){
                    winnerId = i;
                }

                minScore = playerScore;
            }

            return {winner: winnerId};
        }
    }

}