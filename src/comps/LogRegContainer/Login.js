import React, { useState } from "react";

function Login({ handleLoading, changeLoginState }) {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");

  const clearInputs = () => {
    setusername("");
    setpassword("");
  };

  const userLogin = async () => {
    if (!username || !password) {
      alert("Either username or password were not provided");
      return;
    }

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
      alert(res.msg);
      handleLoading(false);
    } else {
      console.log(res);
      // sessionStorage.setItem("token", res.token);
      // sessionStorage.setItem("username", res.userInfo.username);
      // sessionStorage.setItem("first_name", res.userInfo.first_name);
      // sessionStorage.setItem("last_name", res.userInfo.last_name);
      // sessionStorage.setItem("user_since", res.userInfo.user_since);
      handleLoading(false);
      // changeLoginState(true);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      userLogin();
    }
  };

  return (
    <div className="col_gap border_radius_15 padding_20">
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setusername(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setpassword(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <div className="row_space_around">
        <button onClick={clearInputs}>CLEAR</button>
        <button onClick={userLogin}>LOGIN</button>
      </div>
    </div>
  );
}

export default Login;
