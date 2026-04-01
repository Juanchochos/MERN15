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
        this.top = this.bottom;
        this.top = temp;
    }

    canPlay(left_end, right_end){
        if(left_end === this.top || left_end === this.bottom
            || right_end === this.top || left_end === this.bottom){
                return true;
            }
        return false;
    }


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