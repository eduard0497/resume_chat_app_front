import React, { useState } from "react";
import { FaSignInAlt } from "react-icons/fa";
import { FaEraser } from "react-icons/fa6";
import { notify } from "../../functions/toast";
import BeatLoader from "react-spinners/BeatLoader";

const Submit_Button_Spinner_Color = "#282b30";

function Login({ toggle, changeLoginState }) {
  const [loading, setloading] = useState(false);
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");

  const clearInputs = () => {
    setusername("");
    setpassword("");
  };

  const userLogin = async () => {
    if (!username || !password) {
      notify({
        text: "Fields are required",
        error: true,
      });
      return;
    }
    setloading(true);
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
      notify({
        text: res.msg,
        error: true,
      });
      setloading(false);
    } else {
      sessionStorage.setItem("token", res.token);
      sessionStorage.setItem("username", res.userInfo.username);
      sessionStorage.setItem("first_name", res.userInfo.first_name);
      sessionStorage.setItem("last_name", res.userInfo.last_name);
      sessionStorage.setItem("user_since", res.userInfo.user_since);
      setloading(false);
      changeLoginState(true);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      userLogin();
    }
  };

  return (
    <div className="general_form">
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
        <button className="general_form_button_clear" onClick={clearInputs}>
          <FaEraser />
          CLEAR
        </button>
        {loading ? (
          <button className="general_form_button_spinner_anime">
            <BeatLoader color={Submit_Button_Spinner_Color} loading />
          </button>
        ) : (
          <button className="general_form_button_submit" onClick={userLogin}>
            <FaSignInAlt />
            LOGIN
          </button>
        )}
      </div>
      <span className="text_with_hyper_link">
        No account?{" "}
        <button className="hyper_link" onClick={toggle}>
          Register
        </button>{" "}
      </span>
    </div>
  );
}

export default Login;
