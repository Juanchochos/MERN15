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

type LoginResponse = {
  error?: string;
  message?: string;
  requiresVerification?: boolean;
  accessToken?: string;
};

function Login() {

  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = React.useState('');
  const [loginPassword, setPassword] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [requiresVerification, setRequiresVerification] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function finishLogin(accessToken: string): void {
    storeToken({ accessToken });

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
        window.location.href = '/create';
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage('');

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

      let res: LoginResponse;
      try {
        res = JSON.parse(rawText);
      } catch {
        setMessage("Unexpected response from server.");
        return;
      }

      if (res.error) {
        setRequiresVerification(false);
        setVerificationCode('');
        setMessage(typeof res.error === 'string' ? res.error : 'Failed to send verification email');
        return;
      }

      if (!res.requiresVerification) {
        setMessage('Login failed');
        return;
      }

      setRequiresVerification(true);
      setVerificationCode('');
      setMessage(typeof res.message === 'string' ? res.message : 'We emailed you a verification code.');
    }
    catch (error: any) {
      alert(error.toString());
    }
    finally {
      setIsSubmitting(false);
    }
  };

  async function doVerifyCode(event: any): Promise<void> {
    event.preventDefault();

    if (!verificationCode.trim()) {
      setMessage('Verification code is required.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const verifyResponse = await fetch(buildPath('api/verify-login'), {
        method: 'POST',
        body: JSON.stringify({ login: loginName, code: verificationCode.trim() }),
        headers: { 'Content-Type': 'application/json' }
      });

      const verifyText = await verifyResponse.text();

      if (!verifyResponse.ok && !verifyText.trim().startsWith("{")) {
        setMessage(`Server error (${verifyResponse.status}). Is the API running?`);
        return;
      }

      let verifyRes: LoginResponse;
      try {
        verifyRes = JSON.parse(verifyText);
      } catch {
        setMessage("Unexpected response from server.");
        return;
      }

      if (verifyRes.error || !verifyRes.accessToken) {
        setMessage(typeof verifyRes.error === 'string' ? verifyRes.error : 'Verification failed');
        return;
      }

      finishLogin(verifyRes.accessToken);
    }
    catch (error: any) {
      alert(error.toString());
    }
    finally {
      setIsSubmitting(false);
    }
  }

  function handleSetLoginName(e: any): void {
    setLoginName(e.target.value);
  }

  function handleSetPassword(e: any): void {
    setPassword(e.target.value);
  }

  function handleSetVerificationCode(e: any): void {
    setVerificationCode(e.target.value);
  }

  function handleBackToLogin(): void {
    setRequiresVerification(false);
    setVerificationCode('');
    setMessage('');
  }

  return (
    <div id="loginDiv">
      <span id="inner-title">Log In</span><br />
	  <div id="signUpMessage">
		<p id="signup">Don't have an account?</p>
		<Link to="/signup">Sign Up</Link>
	  </div>
      {!requiresVerification && (
        <>
          <input type="text" id="loginName" placeholder="Username"
            value={loginName}
            onChange={handleSetLoginName} /><br />
          <input type="password" id="loginPassword" placeholder="Password"
            value={loginPassword}
            onChange={handleSetPassword} />
          <input type="submit" id="loginButton" className="buttons" value={isSubmitting ? "Sending..." : "Sign In"}
            onClick={doLogin}
            disabled={isSubmitting} />
        </>
      )}
      {requiresVerification && (
        <>
          <p id="signup">Enter the 6-digit code we emailed to you.</p>
          <input type="text" id="verificationCode" placeholder="Verification Code"
            value={verificationCode}
            onChange={handleSetVerificationCode} />
          <input type="submit" id="loginButton" className="buttons" value={isSubmitting ? "Verifying..." : "Verify Code"}
            onClick={doVerifyCode}
            disabled={isSubmitting} />
          <input type="button" id="registerButton" className="buttons2" value="Back"
            onClick={handleBackToLogin}
            disabled={isSubmitting} />
        </>
      )}
      <span id="loginResult">{message}</span>
    </div>
  );
};

export default Login;
