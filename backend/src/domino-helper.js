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
        if(hand[i].canPlay(left_end, right_end)){
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
    let max_dub = 0
    let max_single = 0
    let first_player = 0
    for(let i = 0; i < numPlayers; i++){
        let hand = hands[i];
        for(let j = 0; j < hand.length; j++){
            if(hand[j].isDouble){
                if(hand[j].top > max_dub){
                    max_dub = hand[j].top;
                    first_player = i;
                }
            }
            else{
                if(hand[j].top + hand[j].bottom > max_single){
                    max_single = hand[j].top + hand[j].bottom;
                    first_player = i;
                }
            }
        }
    }

    return first_player;
}