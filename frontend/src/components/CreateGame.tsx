import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lobby } from '../games/domino-lobby';

import { SERVER_URL as SERVER } from './Path';

function Create() {
  const [step, setStep] = useState<'options' | 'modeSelection'>('options');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleModeSelect(mode: '1v1' | '2v2') {
    setLoading(true);
    setError('');
    try {
      const userData = sessionStorage.getItem('user_data');
      const firstName = userData ? JSON.parse(userData).firstName : 'Host';
      const numPlayers = mode === '1v1' ? 2 : 4;

      const lobby = new Lobby(SERVER);
      const matchID = await lobby.createMatch(numPlayers);
      const credentials = await lobby.joinMatch(matchID, '0', firstName);

      navigate('/Lobby', { state: { matchID, playerID: '0', credentials, numPlayers } });
    } catch (e: any) {
      setError(e.message ?? 'Failed to create game');
      setLoading(false);
    }
  }

  if (step === 'modeSelection') {
    
  return (
    <>
      {step === 'modeSelection' && (
         <button
        onClick={() => { setStep('options'); setError(''); }}
        style={{
          alignSelf: 'flex-start',
          marginLeft: 24,
          marginTop: 5,
          background: 'none',
          border: 'none',
          color: '#F0DFD3',
          fontSize: 20,
          cursor: 'pointer',
          fontFamily: '"Exo", sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ← Back
      </button>
      )}

      {step === 'modeSelection' ? (
        <div id="loginDiv">
          <span id="inner-title">Choose Opponents</span><br />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <input
            type="submit" id="opponentButton" className="buttons"
            value={loading ? 'Creating...' : '1v1'}
            disabled={loading}
            onClick={() => handleModeSelect('1v1')}
          />
          <div id="orBox">
            <h1 id="orH1">OR</h1>
          </div>
          <input
            type="submit" id="opponent2Button" className="buttons"
            value={loading ? 'Creating...' : '2v2'}
            disabled={loading}
            onClick={() => handleModeSelect('2v2')}
          />
        </div>
      ) : (
        <div id="loginDiv">
          <span id="inner-title">Options</span><br />
          <input type="submit" id="createButton" className="buttons" value="Create Game"
            onClick={() => setStep('modeSelection')} />
          <input type="submit" id="createButton" className="buttons" value="Join Game"
            onClick={() => navigate('/Join')} />
        </div>
      )}
    </>
  );
}

  return (
    <div id="loginDiv">
      <span id="inner-title">Options</span><br />
      <input type="submit" id="createButton" className="buttons" value="Create Game"
        onClick={() => setStep('modeSelection')} />
      <input type="submit" id="createButton" className="buttons" value="Join Game"
        onClick={() => navigate('/Join')} />
      {/* <input type="submit" id="createButton" className="buttons" value="Shop" /> */}
    </div>
  );
}

export default Create;
