import React, { useState } from "react";
import { notify } from "../../functions/toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaRegUser, FaEraser } from "react-icons/fa6";

function Register({ toggle, handleLoading }) {
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
      notify({
        text: "All fields are required",
        error: true,
      });
      return;
    }

    if (password.length < 8) {
      notify({
        text: "Password must be at least 8 chars long",
        error: true,
      });
      return;
    }
    if (password.trim().length === 0 || password.includes(" ")) {
      notify({
        text: "Password may not contain spaces",
        error: true,
      });
      return;
    }
    if (password !== confirmPassword) {
      notify({
        text: "Passwords do not match!",
        error: true,
      });
      return;
    }
    handleLoading(true);
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
      notify({
        text: res.msg,
        error: true,
      });
    } else {
      notify({
        text: res.msg,
        success: true,
      });
      clearInputs();
    }
    handleLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      userRegister();
    }
  };

  return (
    <div className="container_with_shadow column width_500">
      <h1 className="center">Register</h1>
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
      <div className="center">
        <input
          type={isPasswordVisible ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setconfirmPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          className="width_100_per"
        />
        <span
          className="general_form_input_confirm_password_eye_icon"
          onClick={() => setisPasswordVisible(!isPasswordVisible)}
        >
          {!isPasswordVisible ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
        </span>
      </div>
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
        <button className="button_error" onClick={clearInputs}>
          <FaEraser />
          CLEAR
        </button>
        <button className="button_submit_navy_to_gray" onClick={userRegister}>
          <FaRegUser />
          REGISTER
        </button>
      </div>

      <span className="text_with_hyper_link">
        Have an account?{" "}
        <button className="hyper_link" onClick={toggle}>
          Login instead
        </button>{" "}
      </span>
    </div>
  );
}

export default Register;
