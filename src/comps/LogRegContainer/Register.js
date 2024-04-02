import React, { useState } from "react";

function Register() {
  const [loading, setloading] = useState(false);
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [first_name, setfirst_name] = useState("");
  const [last_name, setlast_name] = useState("");

  const [isPasswordVisible, setisPasswordVisible] = useState(false);

  const clearInputs = () => {
    setusername("");
    setpassword("");
    setconfirmPassword("");
    setfirst_name("");
    setlast_name("");
  };

  const userRegister = async () => {
    if (
      !username ||
      !password ||
      !confirmPassword ||
      !first_name ||
      !last_name
    ) {
      alert("Fields may not be empty");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 chars long");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
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
      alert(res.msg);
    } else {
      alert(res.msg);
      clearInputs();
    }
    setloading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      userRegister();
    }
  };

  return (
    <div className="col_gap border add_padding">
      <h1>Register</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setusername(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <input
        type={isPasswordVisible ? "text" : "password"}
        placeholder="Password"
        value={password}
        onChange={(e) => setpassword(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <input
        type={isPasswordVisible ? "text" : "password"}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setconfirmPassword(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <button onClick={() => setisPasswordVisible(!isPasswordVisible)}>
        see password
      </button>
      <input
        type="text"
        placeholder="First Name"
        value={first_name}
        onChange={(e) => setfirst_name(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={last_name}
        onChange={(e) => setlast_name(e.target.value)}
        onKeyDown={handleKeyPress}
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
