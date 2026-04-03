import { LobbyClient } from 'boardgame.io/client';


export class Lobby{
  lobby: LobbyClient

  constructor(domain: string){
    this.lobby = new LobbyClient({ server: domain });
  }

  async createMatch(numPlayers: number): Promise<string> {
    const { matchID } = await this.lobby.createMatch('domino', { numPlayers: numPlayers });
    return  matchID;
  }


  //Returns user credentials regarding the lobby. Store alogisde JWT.
  async joinMatch(matchID: string, playerID: string , firstName: string):  Promise<string>{
    const { playerCredentials } = await this.lobby.joinMatch(
      'domino', 
      matchID, 
      {
        playerID: playerID,
        playerName: firstName
      });

    return playerCredentials;
  }

}