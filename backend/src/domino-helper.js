//Class to represent a single domino tile
export class DominoTile {
    constructor(top, bottom) {
        this.top = top;
        this.bottom = bottom;
    }

    isDouble(){
        return this.top == this.bottom;
    }

    toString(){
        return `[${this.top}|${this.bottom}]`
    }

    flip(){
        var temp = this.bottom;
        this.bottom = this.top;
        this.top = temp;
    }

    //Checks both end values and returns if tile can be played at all
    canPlay(left_end, right_end){
        return (
            left_end === this.top || 
            left_end === this.bottom || 
            right_end === this.top || 
            right_end === this.bottom
        );
    }

    //Takes in the value at one end and returns boolean if this tile can be played there
    canPlayEnd(end_value){
        if(this.top === end_value || this.bottom == end_value){
            return true;
        }
        return false;
    }
}

//Shuffles the graveyard
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

//Checks if a player can play at least one domino in their hand
export function canPlayDomino(left_end, right_end, hand){
    for(let i = 0; i < hand.length; i++){
        const t = hand[i];
        if(t.top === left_end || t.bottom === left_end ||
           t.top === right_end || t.bottom === right_end){
            return true;
        }
    }
    return false;
}

export function getHandScore(hand){
    let score = 0;

    for(let i = 0; i < hand.length; i++){
        score += hand[i].top + hand[i].bottom;
    }

    return score;
}

//Player with highest double goes first, if no doubles, then highest single tile goes first
export function findFirstPlayer(hands, numPlayers){
    let max_dub = -1;
    let max_single = -1;
    let first_player = 0;
    for(let i = 0; i < numPlayers; i++){
        let hand = hands[i];
        for(let j = 0; j < hand.length; j++){
            const t = hand[j];
            if(t.top === t.bottom){
                if(t.top > max_dub){
                    max_dub = t.top;
                    first_player = i;
                }
            } else if(max_dub === -1) {
                if(t.top + t.bottom > max_single){
                    max_single = t.top + t.bottom;
                    first_player = i;
                }
            }
        }
    }
    return first_player;
}