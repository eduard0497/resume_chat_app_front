import React, { useState } from "react";

function Login({ handleLoading, changeLoginState }) {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");

  const clearInputs = () => {
    setusername("");
    setpassword("");
  };

  const userLogin = async () => {
    if (!username || !password) return;

    handleLoading(true);
    const req = await fetch(`${process.env.REACT_APP_BACK_END}/user-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    const res = await req.json();
    if (!res.status) {
      console.log(res.msg);
      handleLoading(false);
    } else {
      sessionStorage.setItem("token", res.data);
      handleLoading(false);
      changeLoginState(true);
    }
  };

  return (
    <div className="border add_padding col_gap">
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setusername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setpassword(e.target.value)}
      />
      <div className="row_space_around">
        <button onClick={clearInputs}>CLEAR</button>
        <button onClick={userLogin}>LOGIN</button>
      </div>
    </div>
  );
}

export default Login;
