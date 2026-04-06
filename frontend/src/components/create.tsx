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
      const response = await fetch(buildPath('api/login'),
        { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

      var res = JSON.parse(await response.text());

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
      <span id="inner-title">Options</span><br />
      <input type="submit" id="createButton" className="buttons" value="Create Game"
        onClick={doLogin} />
      <input type="submit" id="createButton" className="buttons" value="Join Game"
        onClick={doLogin} />
      <input type="submit" id="createButton" className="buttons" value="Shop"
        onClick={doLogin} />
      <span id="loginResult">{message}</span>
    </div>
  );
};

export default Login;