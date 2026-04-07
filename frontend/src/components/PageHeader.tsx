import { useState } from "react";
import { Link } from "react-router-dom";

function PageHeader() {
	const [menuOpen, setMenuOpen] = useState(false);
   return(
   <header role = "banner">
   <div className = "containerHeader">
		<div className="HeaderWrapper">
				<div id = "titleHeader" className="headerUI">
				 	<img src="/img/domino.png" id="dominoIconSmall" alt="Domino Icon"></img>
					<h1 id="headerTitle">Dominoes</h1>
					</div>
				<div id = "helpLink" className="headerUI">
					 <img src="/img/helpIcon.png" id="Icon" alt="Domino Icon"></img>
					 <Link to="/" id="link">Help</Link>	 
					</div>
				<div id = "scoreLink" className="headerUI">
					 <img src="/img/starIcon.png" id="Icon" alt="Domino Icon"></img>
					 <Link to="/Lobby" id="link">Score</Link>	
					</div>	
				<div id = "settingsLink" className="headerUI">
					 <img src="/img/settingsIcon.png" id="Icon" alt="Domino Icon"></img>
					 <Link to="/Join" id="link">Settings</Link>
					</div>	
				<div id = "exitLink" className="headerUI">
					 <img src="/img/exitIcon.png" id="Icon" alt="Domino Icon"></img>
					 <Link to="/Opponent" id="link">Logout</Link>
					</div>
				<div id = "menu" className="headerUIMobile">
				    {/* RIGHT SIDE: Hamburger button (mobile only) */}
					<button 
					  className="menuButton" 
					  onClick={() => setMenuOpen(!menuOpen)}
					>
					  ☰
					</button>

					{/* DROPDOWN MENU */}
					{menuOpen && (
					  <div className="mobileMenu">
						<Link to="/help">Help</Link>
						<Link to="/score">Score</Link>
						<Link to="/settings">Settings</Link>
						<Link to="/">Logout</Link>
					  </div>
					)}
					<div id = "titleHeaderMobile" className="headerUIMobile">
						<img src="/img/domino.png" id="dominoIconSmall" alt="Domino Icon"></img>
						<h1 id="headerTitle">Dominoes</h1>
					</div>
				</div>
		 </div>
	</div>
	</header>
   );
};

export default PageHeader;