import { buildPath } from './components/Path';


interface MatchList{
    matches: Match[];
}

interface Match {
    matchID: string;
    players: { id: number; name?: string }[];
    createdAt?: number;
    winner?: number //will be represented by playerID
}


export async function fetchMatches() {
    const res = await fetch(buildPath('games/domino/'));

    if (!res.ok) {
        throw new Error("Fetch Error: " + res.statusText);
    }

    const data = await res.json();

    return data as MatchList; 
}

export async function createMatch(numPlayers: number, playerName: string) {
    const res = await fetch(buildPath('games/domino/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numPlayers }),
    });

    if (!res.ok) {
        throw new Error("Fetch Error: " + res.statusText);
    }

    const { matchID } = await res.json();

    await joinMatch(matchID, playerName, 0);//Player game id will be zero because this is first to join
}

//Returns the player game id and the player credentials
export async function joinMatch(matchID: string, playerName: string , playerID?: number) {
    const body: any = { playerName };

    if (playerID !== undefined) {
        body.playerID = playerID;
    }

    const res = await fetch(buildPath( `games/domino/${matchID}/join`),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }
    );

    if (!res.ok) {
        throw new Error("Fetch Error: " + res.statusText);
    }

    const { pid, playerCredentials } = await res.json();

    return { pid, playerCredentials }
}

//Returns a match interface representing the match data
export async function getMatchData(matchID: number): Promise<Match>{
    const res = await fetch(buildPath(`games/domino/${matchID}`), 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }
    );

    if (!res.ok) {
        throw new Error("Fetch Error: " + res.statusText);
    }

    const data = await res.json();

    return data as Match;
}

//Will join the next available match or creates one if none available
export async function quickJoin(numPlayers: number, playerName: string) {
    const matches: MatchList = await fetchMatches();

    for(const match of matches.matches){
        const playerGameID = is_available(match);
        if(match.players.length < numPlayers && playerGameID != -1){
            return await joinMatch(match.matchID, playerName, playerGameID);
        }
    }

    return await createMatch(numPlayers, playerName);
}

//Checks if a match is available to join
function is_available(match: Match): number{
    for(const player of match.players){
        if(!player.name){
            return player.id;
        }
    }

    return -1;
}