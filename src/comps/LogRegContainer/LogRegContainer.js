import React from "react";
import Login from "./Login";
import Register from "./Register";

function LogRegContainer({ handleLoading, changeLoginState }) {
  return (
    <div className="row_space_around">
      <Login
        handleLoading={handleLoading}
        changeLoginState={changeLoginState}
      />
      <Register />
    </div>
  );
}

export default LogRegContainer;
