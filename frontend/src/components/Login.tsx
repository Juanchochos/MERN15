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

type AuthResponse = {
  error?: string;
  message?: string;
  requiresVerification?: boolean;
  accessToken?: string;
};

type AuthView = 'login' | 'loginVerify' | 'resetRequest' | 'resetVerify' | 'resetPassword';

function Login() {
  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = React.useState('');
  const [loginPassword, setPassword] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [resetPassword, setResetPassword] = React.useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = React.useState('');
  const [authView, setAuthView] = React.useState<AuthView>('login');
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
        sessionStorage.setItem('user_data', JSON.stringify(user));

        setMessage('');
        window.location.href = '/main';
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  async function parseAuthResponse(response: Response): Promise<AuthResponse | null> {
    const rawText = await response.text();

    if (!response.ok && !rawText.trim().startsWith("{")) {
      if (response.status === 404) {
        setMessage('API route not found. Restart the backend so the new password reset routes are loaded.');
        return null;
      }

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

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(buildPath('api/login'), {
        method: 'POST',
        body: JSON.stringify({ login: loginName, password: loginPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await parseAuthResponse(response);
      if (!res) {
        return;
      }

      if (res.error) {
        setAuthView('login');
        setVerificationCode('');
        setMessage(typeof res.error === 'string' ? res.error : 'Failed to send verification email');
        return;
      }

      if (res.accessToken) {
        setAuthView('login');
        setVerificationCode('');
        finishLogin(res.accessToken);
        return;
      }

      if (!res.requiresVerification) {
        setMessage('Login failed');
        return;
      }

      setAuthView('loginVerify');
      setVerificationCode('');
      setMessage('');
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

      const verifyRes = await parseAuthResponse(verifyResponse);
      if (!verifyRes) {
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

  async function doRequestPasswordReset(event: any): Promise<void> {
    event.preventDefault();

    if (!loginName.trim()) {
      setMessage('Username is required.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(buildPath('api/request-password-reset'), {
        method: 'POST',
        body: JSON.stringify({ login: loginName.trim() }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await parseAuthResponse(response);
      if (!res) {
        return;
      }

      if (res.error) {
        setMessage(typeof res.error === 'string' ? res.error : 'Unable to send password reset code.');
        return;
      }

      setAuthView('resetVerify');
      setVerificationCode('');
      setPassword('');
      setMessage(res.message ?? 'Password reset code sent.');
    }
    catch (error: any) {
      alert(error.toString());
    }
    finally {
      setIsSubmitting(false);
    }
  }

  async function doVerifyResetCode(event: any): Promise<void> {
    event.preventDefault();

    if (!verificationCode.trim()) {
      setMessage('Verification code is required.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(buildPath('api/verify-password-reset'), {
        method: 'POST',
        body: JSON.stringify({ login: loginName.trim(), code: verificationCode.trim() }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await parseAuthResponse(response);
      if (!res) {
        return;
      }

      if (res.error) {
        setMessage(typeof res.error === 'string' ? res.error : 'Verification failed');
        return;
      }

      setAuthView('resetPassword');
      setVerificationCode('');
      setResetPassword('');
      setResetPasswordConfirm('');
      setMessage(res.message ?? 'Code verified. Enter your new password.');
    }
    catch (error: any) {
      alert(error.toString());
    }
    finally {
      setIsSubmitting(false);
    }
  }

  async function doResetPassword(event: any): Promise<void> {
    event.preventDefault();

    if (!resetPassword.trim()) {
      setMessage('New password is required.');
      return;
    }

    if (resetPassword !== resetPasswordConfirm) {
      setMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(buildPath('api/reset-password'), {
        method: 'POST',
        body: JSON.stringify({ login: loginName.trim(), password: resetPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await parseAuthResponse(response);
      if (!res) {
        return;
      }

      if (res.error) {
        setMessage(typeof res.error === 'string' ? res.error : 'Password reset failed');
        return;
      }

      setAuthView('login');
      setPassword('');
      setVerificationCode('');
      setResetPassword('');
      setResetPasswordConfirm('');
      setMessage(res.message ?? 'Password reset successful. Please log in.');
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

  function handleSetResetPassword(e: any): void {
    setResetPassword(e.target.value);
  }

  function handleSetResetPasswordConfirm(e: any): void {
    setResetPasswordConfirm(e.target.value);
  }

  function showResetRequest(): void {
    setAuthView('resetRequest');
    setPassword('');
    setVerificationCode('');
    setResetPassword('');
    setResetPasswordConfirm('');
    setMessage('');
  }

  function handleBackToLogin(): void {
    setAuthView('login');
    setPassword('');
    setVerificationCode('');
    setResetPassword('');
    setResetPasswordConfirm('');
    setMessage('');
  }

  function renderLoginForm() {
    return (
      <>
        <div id="signUpMessage">
          <p id="signup">Don't have an account?</p>
          <Link to="/signup">Sign Up</Link>
        </div>
        <input type="text" id="loginName" placeholder="Username"
          value={loginName}
          onChange={handleSetLoginName} /><br />
        <input type="password" id="loginPassword" placeholder="Password"
          value={loginPassword}
          onChange={handleSetPassword} />
        <input type="submit" id="loginButton" className="buttons" value={isSubmitting ? "Sending..." : "Sign In"}
          onClick={doLogin}
          disabled={isSubmitting} />
        <button type="button" id="forgotPasswordLink" onClick={showResetRequest} disabled={isSubmitting}>
          Forgot Password?
        </button>
      </>
    );
  }

  function renderLoginVerificationForm() {
    return (
      <>
        <p id="verificationPrompt">Enter the 6-digit code we emailed to you.</p>
        <input type="text" id="verificationCode" placeholder="Verification Code"
          value={verificationCode}
          onChange={handleSetVerificationCode} />
        <div id="verificationActions">
          <input type="submit" id="verifyButton" className="buttons" value={isSubmitting ? "Verifying..." : "Verify Code"}
            onClick={doVerifyCode}
            disabled={isSubmitting} />
          <input type="button" id="backButton" className="buttons" value="Back"
            onClick={handleBackToLogin}
            disabled={isSubmitting} />
        </div>
      </>
    );
  }

  function renderResetRequestForm() {
    return (
      <>
        <p id="verificationPrompt">Enter your username and we&apos;ll email a 6-digit reset code to the address on file.</p>
        <input type="text" id="loginName" placeholder="Username"
          value={loginName}
          onChange={handleSetLoginName} />
        <div id="verificationActions">
          <input type="submit" className="buttons wideActionButton" value={isSubmitting ? "Sending..." : "Send Code"}
            onClick={doRequestPasswordReset}
            disabled={isSubmitting} />
          <input type="button" className="buttons" value="Back"
            onClick={handleBackToLogin}
            disabled={isSubmitting} />
        </div>
      </>
    );
  }

  function renderResetVerifyForm() {
    return (
      <>
        <p id="verificationPrompt">Enter the 6-digit password reset code sent to the email address for <strong>{loginName}</strong>.</p>
        <input type="text" id="verificationCode" placeholder="Reset Code"
          value={verificationCode}
          onChange={handleSetVerificationCode} />
        <div id="verificationActions">
          <input type="submit" className="buttons wideActionButton" value={isSubmitting ? "Verifying..." : "Verify Reset Code"}
            onClick={doVerifyResetCode}
            disabled={isSubmitting} />
          <input type="button" className="buttons" value="Back"
            onClick={showResetRequest}
            disabled={isSubmitting} />
        </div>
      </>
    );
  }

  function renderResetPasswordForm() {
    return (
      <>
        <p id="verificationPrompt">Choose a new password for <strong>{loginName}</strong>.</p>
        <input type="password" id="resetPassword" placeholder="New Password"
          value={resetPassword}
          onChange={handleSetResetPassword} />
        <input type="password" id="resetPasswordConfirm" placeholder="Confirm New Password"
          value={resetPasswordConfirm}
          onChange={handleSetResetPasswordConfirm} />
        <div id="verificationActions">
          <input type="submit" className="buttons wideActionButton" value={isSubmitting ? "Resetting..." : "Set New Password"}
            onClick={doResetPassword}
            disabled={isSubmitting} />
          <input type="button" className="buttons" value="Back"
            onClick={handleBackToLogin}
            disabled={isSubmitting} />
        </div>
      </>
    );
  }

  return (
    <div id="loginDiv">
      <span id="inner-title">Log In</span><br />
      {authView === 'login' && renderLoginForm()}
      {authView === 'loginVerify' && renderLoginVerificationForm()}
      {authView === 'resetRequest' && renderResetRequestForm()}
      {authView === 'resetVerify' && renderResetVerifyForm()}
      {authView === 'resetPassword' && renderResetPasswordForm()}
      <span id="loginResult">{message}</span>
    </div>
  );
};

export default Login;
