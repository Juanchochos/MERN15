import { useState } from "react";
import { useNavigate } from "react-router-dom";


function doLogout(event:any) : void
{
	event.preventDefault();
    sessionStorage.removeItem('user_data');
    window.location.href = '/';
};    

function PageHeader({ warnOnLeave = false }: { warnOnLeave?: boolean }) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [showInstructions, setShowInstructions] = useState(false);
	const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
	const [leaveDestination, setLeaveDestination] = useState("/main");
	const navigate = useNavigate();

	function confirmLeave(destination: string) {setShowInstructions
		if (warnOnLeave) {
			setLeaveDestination(destination);
			setShowLeaveConfirm(true);
			setMenuOpen(false);
		} else {
			navigate(destination);
		}
	}

	return (
		<>
		<header role="banner">
		<div className="containerHeader">
			<div className="HeaderWrapper">
				<div id="titleHeader" className="headerUI" onClick={() => confirmLeave("/main")} style={{ cursor: "pointer" }}>
					<img src="/img/domino.png" id="dominoIconSmall" alt="Domino Icon" />
					<h1 id="headerTitle">Dominoes</h1>
				</div>
				<div id="helpLink" className="headerUI">
					<img src="/img/helpIcon.png" id="Icon" alt="Help Icon" />
					<button id="link" onClick={() => setShowInstructions(true)}>Help</button>
				</div>
				<div id="scoreLink" className="headerUI">
					<img src="/img/starIcon.png" id="Icon" alt="Match History Icon" />
					<button id="link" onClick={() => confirmLeave("/match-history")}>History</button>
				</div>
				<div id="exitLink" className="headerUI">
					<img src="/img/exitIcon.png" id="Icon" alt="Logout Icon" />
					<button onClick={doLogout} id="link">Logout</button>
				</div>
				<div id="menu" className="headerUIMobile">
					<button
					  className="menuButton"
					  onClick={() => setMenuOpen(!menuOpen)}
					>
					  ☰
					</button>
					{menuOpen && (
					  <div className="mobileMenu">
						<button onClick={() => { setShowInstructions(true); setMenuOpen(false); }}>Help</button>
						<button onClick={() => confirmLeave("/match-history")}>Match History</button>
						<a href="/">Logout</a>
					  </div>
					)}
					<div id="titleHeaderMobile" className="headerUIMobile">
						<img src="/img/domino.png" id="dominoIconSmall" alt="Domino Icon" />
						<h1 id="headerTitle">Dominoes</h1>
					</div>
				</div>
			</div>
		</div>
		</header>

		{/* Instructions Modal */}
		{showInstructions && (
			<div className="modalOverlay" onClick={() => setShowInstructions(false)}>
				<div className="modalContent" onClick={e => e.stopPropagation()}>
					<h2>How to Play</h2>
					<div className="modalScrollBody">
						<p>To start the game, the player with the highest double will start.</p>
						<p>On your turn, you must play a domino that matches the number of dots on one of the open dominos on the board</p>
						<p>You win the game by being the first person to get rid of all their dominos.</p>
						<h3>Classic</h3>
						<p>You may only play one domino per turn.</p>
						<p>When a player can't play dominoes, they must draw a domino and pass their turn.</p>
						<p>If no dominoes available, they just pass.</p>
						<p>There a a total of 28 dominoes when playing 6's so count the dominoes to help against your opponent!</p>
					</div>
					<button className="modalButton" onClick={() => setShowInstructions(false)}>Close</button>
				</div>
			</div>
		)}

		{/* Leave Confirm Modal */}
		{showLeaveConfirm && (
			<div className="modalOverlay">
				<div className="modalContent">
					<p>Are you sure you want to leave? This will end your current game.</p>
					<div className="modalActions">
						<button className="modalButton" onClick={() => setShowLeaveConfirm(false)}>Stay</button>
						<button className="modalButton modalButtonDanger" onClick={() => { setShowLeaveConfirm(false); navigate(leaveDestination); }}>Leave</button>
					</div>
				</div>
			</div>
		)}
		</>
	);
}

export default PageHeader;
