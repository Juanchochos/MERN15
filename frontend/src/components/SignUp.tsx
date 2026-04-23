import React, { useState } from 'react';
import { buildPath } from './Path';
import { Link } from "react-router-dom";

type SignupResponse = {
  error?: string;
  message?: string;
  requiresVerification?: boolean;
  accessToken?: string;
  login?: string;
};

function SignUp() {

  const [message, setMessage] = useState('');
  const [signupName, setSignupName] = React.useState('');
  const [signupPassword, setSignupPassword] = React.useState('');
  const [signupFirstName, setSignupFirstName] = React.useState('');
  const [signupLastName, setSignupLastName] = React.useState('');
  const [signupEmail, setSignupEmail] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [authView, setAuthView] = React.useState<'signup' | 'verify'>('signup');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function redirectToLogin(): void {
    window.location.href = '/';
  }

  async function parseSignupResponse(response: Response): Promise<SignupResponse | null> {
    const rawText = await response.text();

    if (!response.ok && !rawText.trim().startsWith("{")) {
      setMessage(`Server error (${response.status}). Is the API running?`);
      return null;
    }

    try {
      return JSON.parse(rawText);
    } catch {
      setMessage("Unexpected response from server.");
      return null;
    }
  }

  async function doSignUp(event: any): Promise<void> {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage('');

    var obj = { login: signupName, password: signupPassword, firstName: signupFirstName, lastName: signupLastName, email: signupEmail };
    var js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('/api/register'),
        { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

      const res = await parseSignupResponse(response);
      if (!res) {
        return;
      }

      if (!response.ok || res.error) {
        if (response.status === 409) {
          setMessage(typeof res.error === "string" ? res.error : "User already exists.");
        } else if (response.status === 400) {
          setMessage(typeof res.error === "string" ? res.error : "Invalid signup data.");
        } else {
          setMessage(typeof res.error === "string" ? res.error : "Signup failed.");
        }
        return;
      }

      if (res.requiresVerification) {
        setAuthView('verify');
        setVerificationCode('');
        setMessage(res.message ?? 'Verification code sent to your email.');
        return;
      }

      if (!res.accessToken) {
        setMessage("Signup failed.");
        return;
      }

      redirectToLogin();
    }
    catch (error: any) {
      alert(error.toString());
      return;
    }
    finally {
      setIsSubmitting(false);
    }
  };

  async function doVerifySignup(event: any): Promise<void> {
    event.preventDefault();

    if (!verificationCode.trim()) {
      setMessage('Verification code is required.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(buildPath('/api/verify-signup'),
        {
          method: 'POST',
          body: JSON.stringify({ login: signupName.trim(), code: verificationCode.trim() }),
          headers: { 'Content-Type': 'application/json' }
        });

      const res = await parseSignupResponse(response);
      if (!res) {
        return;
      }

      if (res.error || !res.accessToken) {
        setMessage(typeof res.error === 'string' ? res.error : 'Verification failed.');
        return;
      }

      redirectToLogin();

    }
    catch (error: any) {
      alert(error.toString());
      return;
    }
    finally {
      setIsSubmitting(false);
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

  function handleSetVerificationCode(e: any): void {
    setVerificationCode(e.target.value);
  }

  function handleBackToSignup(): void {
    setAuthView('signup');
    setVerificationCode('');
    setMessage('');
  }

  function renderSignupForm() {
    return (
      <>
        <div id="signUpMessage">
          <p id="signup">Already have an account?</p>
          <Link to="/">Log in</Link>
        </div>
        <input type="text" id="signupName" placeholder="Username"
          value={signupName}
          onChange={handleSetSignupName} />
        <input type="password" id="signupPassword" placeholder="Password"
          value={signupPassword}
          onChange={handleSetPassword} />
        <input type="text" id="signupFirstName" placeholder="First Name"
          value={signupFirstName}
          onChange={handleSetFirstName} />
        <input type="text" id="signupLastName" placeholder="Last Name"
          value={signupLastName}
          onChange={handleSetLastName} />
        <input type="email" id="signupEmail" placeholder="Email"
          value={signupEmail}
          onChange={handleSetEmail} />
        <input type="submit" id="signupButton" className="buttons" value={isSubmitting ? "Sending..." : "Sign Up"}
          onClick={doSignUp}
          disabled={isSubmitting} />
      </>
    );
  }

  function renderVerificationForm() {
    return (
      <>
        <p id="verificationPrompt">Enter the 6-digit code we emailed to <strong>{signupEmail}</strong>.</p>
        <input type="text" id="verificationCode" placeholder="Verification Code"
          value={verificationCode}
          onChange={handleSetVerificationCode} />
        <div id="verificationActions">
          <input type="submit" className="buttons wideActionButton" value={isSubmitting ? "Verifying..." : "Verify Email"}
            onClick={doVerifySignup}
            disabled={isSubmitting} />
          <input type="button" className="buttons" value="Back"
            onClick={handleBackToSignup}
            disabled={isSubmitting} />
        </div>
      </>
    );
  }

  return (
    <div id="loginDiv">
      <span id="inner-title">Sign Up</span><br />
      {authView === 'signup' && renderSignupForm()}
      {authView === 'verify' && renderVerificationForm()}
      <span id="signupResult">{message}</span>
    </div>
  );
};

export default SignUp;
