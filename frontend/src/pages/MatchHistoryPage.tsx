import { useEffect, useState } from "react";
import PageHeader from '../components/PageHeader';
import MatchHistory from '../components/MatchHistory.tsx';
import { buildPath } from "../components/Path.tsx";
import { storeToken, retrieveToken } from "../tokenStorage.tsx";

type MatchRecord = {
  id: string;
  player: string;
  opponent: string;
  result: "Win" | "Loss";
};


async function getMatchHistory(): Promise<any> {
  try {
    const userData = JSON.parse(sessionStorage.getItem("user_data") || "{}");
    const userId = userData.id;

    if (!userId) throw new Error("No User ID found in session");
    const res = await fetch(buildPath(`api/fetch-match-history?userId=${userId}`), {
      method: 'GET',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + retrieveToken()
      }
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || `Server error: ${res.status}`);
    }

    if (result.accessToken) {
        storeToken(result); 
    }

    return result.data; 

  } catch (error) {
    console.error("Failed to fetch match history:", error);
    return []; 
  }
}

function getCurrentUserName() {
    var data;
    data = JSON.parse(sessionStorage.getItem('user_data') || '');
    return data.firstName + ' ' + data.lastName;
}

function convertMatchToRecord(match: any, currentUserName: string): MatchRecord {
  const firstName = currentUserName.split(" ")[0];
  const isWinner = match.winners.some((w: any) => w.name === firstName);
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
  const currentUserName = getCurrentUserName();

  useEffect(() => {
    async function loadHistory() {
      const matches = await getMatchHistory();
      if(!matches || matches.length === 0 ){
        return;
      }


      const converted = matches.map((m: any) =>
        convertMatchToRecord(m, currentUserName)
        // console.log("Players:"  + m.players[0].name + "and" +  m.players[1].name)
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
