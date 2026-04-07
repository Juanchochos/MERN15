function Join() {
  return (
    <div id="loginDiv">
      <span id="inner-title">Join Method</span><br />
      <input type="submit" id="roomButton" className="buttons" value="Random Match" />
		<div id="orBoxJoin">
			<h1 id="orH1Join">OR</h1>
		</div>
		<div id="roomCode">
		  <input type="text" id="roomName" placeholder="Room Code" /><br />
		  <input type="submit" id="room2Button" className="buttons" value="Join" />
		</div>
	  {/* <span id="loginResult">{}</span> */}
    </div>
  );
};
export default Join;