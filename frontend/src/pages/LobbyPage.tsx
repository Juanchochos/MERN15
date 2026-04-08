import PageHeader from '../components/PageHeader.tsx';
import Lobby from '../components/Lobby.tsx';

const LobbyPage = () =>
{

    return(
      <div>
        <PageHeader />
        <Lobby players={[
    { name: "Vern", isHost: true },
    { name: "Player 2", isHost: false }
  ]}
  isHost={true}
/>
      </div>
    );
};

export default LobbyPage;