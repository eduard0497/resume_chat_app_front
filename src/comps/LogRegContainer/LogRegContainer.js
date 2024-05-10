import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

function LogRegContainer({ handleLoading, changeLoginState }) {
  const [viewToggle, setviewToggle] = useState(false);

  const toggle = () => {
    setviewToggle(!viewToggle);
  };

  return (
    <div className="log_reg_container ">
      {viewToggle ? (
        <Login
          toggle={toggle}
          handleLoading={handleLoading}
          changeLoginState={changeLoginState}
        />
      ) : (
        <Register toggle={toggle} handleLoading={handleLoading} />
      )}
    </div>
  );
}

export default LogRegContainer;
