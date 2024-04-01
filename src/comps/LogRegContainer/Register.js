import React, { useState } from "react";

function Register() {
  const [loading, setloading] = useState(false);
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [first_name, setfirst_name] = useState("");
  const [last_name, setlast_name] = useState("");

  const clearInputs = () => {
    setusername("");
    setpassword("");
    setfirst_name("");
    setlast_name("");
  };

  const userRegister = async () => {
    if (!username || !password || !first_name || !last_name) return;
    if (password.length < 8) {
      console.log("Password must be at least 8 chars long");
      return;
    }
    setloading(true);
    const req = await fetch(`${process.env.REACT_APP_BACK_END}/register-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        first_name,
        last_name,
      }),
    });
    const res = await req.json();
    if (!res.status) {
      console.log(res.msg);
    } else {
      clearInputs();
      console.log(res.msg);
    }
    setloading(false);
  };

  return (
    <div className="col_gap border add_padding">
      <h1>Register</h1>
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
      <input
        type="text"
        placeholder="First Name"
        value={first_name}
        onChange={(e) => setfirst_name(e.target.value)}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={last_name}
        onChange={(e) => setlast_name(e.target.value)}
      />
      <div className="row_space_around">
        <button onClick={clearInputs}>CLEAR</button>
        {loading ? (
          <button>Loading...</button>
        ) : (
          <button onClick={userRegister}>REGISTER</button>
        )}
      </div>
    </div>
  );
}

export default Register;
