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

function Login() {

  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = React.useState('');
  const [loginPassword, setPassword] = React.useState('');

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();

    var obj = { login: loginName, password: loginPassword };
    var js = JSON.stringify(obj);

    try {
      const loginUrl = buildPath('api/login');
      const response = await fetch(loginUrl,
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

      if (res.error || !res.accessToken) {
        setMessage(typeof res.error === 'string' ? res.error : 'Login failed');
        return;
      }

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

  function handleSetLoginName(e: any): void {
    setLoginName(e.target.value);
  }

  function handleSetPassword(e: any): void {
    setPassword(e.target.value);
  }

  return (
    <div id="loginDiv">
      <span id="inner-title">log In</span><br />
	  <div id="signUpMessage">
		<p id="signup">Don't have an account?</p>
		<Link to="/signup">Sign Up</Link>
	  </div>
      <input type="text" id="loginName" placeholder="Username"
        onChange={handleSetLoginName} /><br />
      <input type="password" id="loginPassword" placeholder="Password"
        onChange={handleSetPassword} />
      <input type="submit" id="loginButton" className="buttons" value="Sign In"
        onClick={doLogin} />
      <span id="loginResult">{message}</span>
    </div>
  );
};

export default Login;