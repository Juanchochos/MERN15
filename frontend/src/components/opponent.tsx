function Opponent() {
  return (
    <div id="loginDiv">
      <span id="inner-title">Choose Opponents</span><br />
      <input type="submit" id="opponentButton" className="buttons" value="1v1" />
		  <div id="orBox">
			<h1 id="orH1">OR</h1>
		  </div>
      <input type="submit" id="opponent2Button" className="buttons" value="2v2" />
	  {/* <span id="loginResult">{}</span> */}
    </div>
  );
};
export default Opponent;