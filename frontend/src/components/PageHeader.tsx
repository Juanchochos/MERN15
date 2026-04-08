import { useState } from "react";
import { useNavigate } from "react-router-dom";

function PageHeader({ warnOnLeave = false }: { warnOnLeave?: boolean }) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [showInstructions, setShowInstructions] = useState(false);
	const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
	const [leaveDestination, setLeaveDestination] = useState("/main");
	const navigate = useNavigate();

	function confirmLeave(destination: string) {
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
					<a href="/" id="link">Logout</a>
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
					<h2>Instructions</h2>
					<div className="modalScrollBody">
						<p>This is where the instructions and info will go.</p>
						<p>This is where the instructions and info will go.</p>
						<p>This is where the instructions and info will go.</p>
						<p>This is where the instructions and info will go.</p>
						<p>This is where the instructions and info will go.</p>
						<p>This is where the instructions and info will go.</p>
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
