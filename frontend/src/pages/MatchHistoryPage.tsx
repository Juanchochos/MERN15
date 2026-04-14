import { useEffect, useState } from "react";
import PageHeader from '../components/PageHeader';
import MatchHistory from '../components/MatchHistory.tsx';

type MatchRecord = {
  id: string;
  player: string;
  opponent: string;
  result: "Win" | "Loss";
};

function convertMatchToRecord(match: any, currentUserName: string): MatchRecord {
  const isWinner = match.winners.some((w: any) => w.name === currentUserName);
  const opponent = isWinner
    ? match.losers[0]?.name
    : match.winners[0]?.name;

  return {
    id: match._id,
    player: currentUserName,
    opponent: opponent || "Unknown",
    result: isWinner ? "Win" : "Loss"
  };
}

function MatchHistoryPage() {
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const currentUserName = "Player Zero"; // Replace with logged-in user

  useEffect(() => {
    async function loadHistory() {
      const res = await fetch(`/api/history/${currentUserName}`);
      const matches = await res.json();

      const converted = matches.map((m: any) =>
        convertMatchToRecord(m, currentUserName)
      );

      setHistory(converted);
    }

    loadHistory();
  }, []);

  return (
    <div>
      <PageHeader />

      <MatchHistory
        matchID="abc123"
        history={history}
      />
    </div>
  );
}

export default MatchHistoryPage;
