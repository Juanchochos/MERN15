import PageHeader from '../components/PageHeader.tsx';
import Create from '../components/CreateGame.tsx';

const CreatePage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <PageHeader />
      <Create />
    </div>
  );
};

export default CreatePage;