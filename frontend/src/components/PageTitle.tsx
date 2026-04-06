import { Link } from "react-router-dom";

function PageTitle()
{
   return(
   <header role = "banner">
   <div className = "containerHeader">
	<div className="titleWrapper">
	 <img src="/img/domino.png" id="dominoIcon" alt="Domino Icon"></img>
     <h1 id="title">Dominoes</h1>
	 </div>
	</div>
	</header>
   );
};

export default PageTitle;