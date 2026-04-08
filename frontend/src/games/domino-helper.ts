// Class to represent a single domino tile
export class DominoTile {
    top: number;
    bottom: number;

    constructor(top: number, bottom: number) {
        this.top = top;
        this.bottom = bottom;
    }

    isDouble(): boolean {
        return this.top === this.bottom;
    }

    toString(): string {
        return `[${this.top}|${this.bottom}]`;
    }

    flip(): void {
        const temp = this.bottom;
        this.bottom = this.top; 
        this.top = temp;
    }

    canPlay(left_end: number, right_end: number): boolean {
        return (
            left_end === this.top ||
            left_end === this.bottom ||
            right_end === this.top ||
            right_end === this.bottom
        );
    }

    canPlayEnd(end_value: number): boolean {
        return this.top === end_value || this.bottom === end_value;
    }
}

// Shuffles an array in place (Fisher-Yates)
export function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Checks if a player can play at least one domino in their hand.
// Accepts plain { top, bottom } objects — no class methods required.
export function canPlayDomino(
    left_end: number,
    right_end: number,
    hand: { top: number; bottom: number }[]
): boolean {
    return hand.some(t =>
        t.top === left_end || t.bottom === left_end ||
        t.top === right_end || t.bottom === right_end
    );
}

export function getHandScore(hand: { top: number; bottom: number }[]): number {
    return hand.reduce((score, t) => score + t.top + t.bottom, 0);
}