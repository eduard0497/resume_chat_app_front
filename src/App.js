import React, { useState, useEffect } from "react";
import LogRegContainer from "./comps/LogRegContainer/LogRegContainer";
import Dashboard from "./comps/Dashboard/Dashboard";
import { ContextProvider } from "./comps/ContextProvider/ContextProvider";
import LoadingScreen from "./comps/LoadingScreen";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [loading, setloading] = useState(true);
  const handleLoading = (bool) => {
    setloading(bool);
  };
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const changeLoginState = (bool) => {
    setisLoggedIn(bool);
  };

  const checkToken = async () => {
    setloading(true);
    if (sessionStorage.getItem("token")) {
      const req = await fetch(`${process.env.REACT_APP_BACK_END}/check-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
        }),
      });
      const res = await req.json();
      if (!res.status) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("first_name");
        sessionStorage.removeItem("last_name");
        sessionStorage.removeItem("user_since");
        setisLoggedIn(false);
        setloading(false);
        alert(res.msg);
      } else {
        setisLoggedIn(true);
        setloading(false);
      }
    } else {
      setisLoggedIn(false);
      setloading(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <>
      <div>
        <ToastContainer />
      </div>
      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="screen">
          {isLoggedIn ? (
            <ContextProvider>
              <Dashboard changeLoginState={changeLoginState} />
            </ContextProvider>
          ) : (
            <LogRegContainer
              handleLoading={handleLoading}
              changeLoginState={changeLoginState}
            />
          )}
        </div>
      )}
    </>
  );
}

export default App;
