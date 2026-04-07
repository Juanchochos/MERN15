import { Link } from "react-router-dom";

function SignUp() {

  return (
    <div id="loginDiv">
      <span id="inner-title">Sign Up</span><br />
	  <div id="signUpMessage">
		<p id="signup">Already have an account?</p>
		<Link to="/">Log in</Link>
	  </div>
      <input type="text" id="loginName" placeholder="Username" /><br />
      <input type="password" id="loginPassword" placeholder="Password" />
      <input type="submit" id="loginButton" className="buttons" value="Sign Up" />
      /* <span id="loginResult">{}</span> */
    </div>
  );
};

export default SignUp;