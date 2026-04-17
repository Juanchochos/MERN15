import { LobbyClient } from 'boardgame.io/client';

export class Lobby {
  lobby: LobbyClient;

  constructor(domain: string) {
    this.lobby = new LobbyClient({ server: domain });
  }

  async createMatch(numPlayers: number): Promise<string> {
    const { matchID } = await this.lobby.createMatch('domino', { numPlayers });
    return matchID;
  }

  // Returns user credentials regarding the lobby. Store alongside JWT.
  async joinMatch(matchID: string, playerID: string, firstName: string): Promise<string> {
    const { playerCredentials } = await this.lobby.joinMatch('domino', matchID, {
      playerID,
      playerName: firstName,
    });
    return playerCredentials;
  }

  async getMatch(matchID: string): Promise<any> {
    return this.lobby.getMatch('domino', matchID);
  }

  // Host calls this to signal all pollers to navigate to /game.
  async markStarted(matchID: string, credentials: string): Promise<void> {
    await this.lobby.updatePlayer('domino', matchID, {
      playerID: '0',
      credentials,
      data: { started: true },
    });
  }
}
