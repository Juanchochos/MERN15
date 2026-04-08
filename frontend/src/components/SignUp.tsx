import React, { useState } from 'react';
import { buildPath } from './Path';
import { storeToken } from '../tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { Link } from "react-router-dom";


interface JwtPaylod{
  userId: number;
  firstName : string;
  lastName : string;
  iat: any;
}

function SignUp() {

  const [message, setMessage] = useState('');
  const [signupName, setSignupName] = React.useState('');
  const [signupPassword, setSignupPassword] = React.useState('');
  const [signupFirstName, setSignupFirstName] = React.useState('');
  const [signupLastName, setSignupLastName] = React.useState('');
  const [signupEmail, setSignupEmail] = React.useState('');

  async function doSignUp(event: any): Promise<void> {
    event.preventDefault();

    var obj = { login: signupName, password: signupPassword, firstName: signupFirstName, lastName: signupLastName, email: signupEmail };
    var js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('/api/register'),
        { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

      const rawText = await response.text();

      if (!response.ok && !rawText.trim().startsWith("{")) {
        setMessage(`Server error (${response.status}). Is the API running?`);
        return;
      }

      let res: { error?: string; accessToken?: string };
      try {
        res = JSON.parse(rawText);
      } catch {
        setMessage("Unexpected response from server.");
        return;
      }

            // Handle 4xx/5xx JSON responses BEFORE decoding token
      if (!response.ok || res.error || !res.accessToken) {
        if (response.status === 409) {
          setMessage("User already exists.");
        } else if (response.status === 400) {
          setMessage(typeof res.error === "string" ? res.error : "Invalid signup data.");
        } else {
          setMessage(typeof res.error === "string" ? res.error : "Signup failed.");
        }
        return;
      }
      // Only decode once we know token exists
      const { accessToken } = res;
      storeToken(res);
      const decoded = jwtDecode<JwtPaylod>(accessToken);

      try {
        var ud = decoded;
        var userId = ud.userId;
        var firstName = ud.firstName;
        var lastName = ud.lastName;

        if (userId <= 0) {
          setMessage('User/Password combination incorrect');
        }
        else {
          var user = { firstName: firstName, lastName: lastName, id: userId }
          localStorage.setItem('user_data', JSON.stringify(user));

          setMessage('');
          window.location.href = '/cards';
        }
      }
      catch (e) {
        console.log(e);
        return;
      }
    }
    catch (error: any) {
      alert(error.toString());
      return;
    }
  };

  function handleSetSignupName(e: any): void {
    setSignupName(e.target.value);
  }

  function handleSetPassword(e: any): void {
    setSignupPassword(e.target.value);
  }

  function handleSetFirstName(e: any): void {
    setSignupFirstName(e.target.value);
  }

  function handleSetLastName(e: any): void {
    setSignupLastName(e.target.value);
  }

  function handleSetEmail(e: any): void {
    setSignupEmail(e.target.value);
  }

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
	  {/* <span id="loginResult">{}</span> */}
        {/* HIDDEN WILL FIX LATER TO AVOID CONFLICTS
      <input type="text" id="signupName" placeholder="Username"
        onChange={handleSetSignupName} />
      <input type="password" id="signupPassword" placeholder="Password"
        onChange={handleSetPassword} />
      <input type="text" id="signupFirstName" placeholder="First Name"
        onChange={handleSetFirstName} />
      <input type="text" id="signupLastName" placeholder="Last Name"
        onChange={handleSetLastName} />
      <input type="email" id="signupEmail" placeholder="Email"
        onChange={handleSetEmail} />
      <input type="submit" id="signupButton" className="buttons" value="Sign Up"
        onClick={doSignUp} />
      <span id="signupResult">{message}</span>
*/}
    </div>
  );
};

export default SignUp;