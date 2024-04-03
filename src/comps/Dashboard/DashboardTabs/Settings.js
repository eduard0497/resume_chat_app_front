import React, { useState, useEffect } from "react";

const Settings = () => {
  const [loading, setloading] = useState(false);
  const [userInfo, setuserInfo] = useState([]);

  const getUserInfo = async () => {
    setloading(true);
    const req = await fetch(`${process.env.REACT_APP_BACK_END}/get-user-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: sessionStorage.getItem("token"),
      }),
    });
    const res = await req.json();
    if (!res.status) {
      console.log(res.msg);
      setloading(false);
    } else {
      setuserInfo(res.data);
      setloading(false);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const [updateInfoToggle, setupdateInfoToggle] = useState(false);
  const [first_nameToUpdate, setfirst_nameToUpdate] = useState("");
  const [last_nameToUpdate, setlast_nameToUpdate] = useState("");

  const updateUserInfo = async () => {
    if (!first_nameToUpdate || !last_nameToUpdate) return;
    setloading(true);
    const req = await fetch(
      `${process.env.REACT_APP_BACK_END}/update-user-info`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
          first_name: first_nameToUpdate,
          last_name: last_nameToUpdate,
        }),
      }
    );
    const res = await req.json();
    if (!res.status) {
      console.log(res.msg);
      setloading(false);
    } else {
      setupdateInfoToggle(false);
      setuserInfo(res.data);
      setloading(false);
    }
  };

  if (loading) return <div>LOADING...</div>;
  if (!userInfo.length) return <div>ERROR</div>;

  return (
    <div className="padding_15 border_radius_15">
      {updateInfoToggle ? (
        <div className="col_gap">
          <input
            type="text"
            placeholder="First Name"
            value={first_nameToUpdate}
            onChange={(e) => setfirst_nameToUpdate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={last_nameToUpdate}
            onChange={(e) => setlast_nameToUpdate(e.target.value)}
          />
          <div>
            <button
              onClick={() => {
                setfirst_nameToUpdate("");
                setlast_nameToUpdate("");
                setupdateInfoToggle(false);
              }}
            >
              Cancel
            </button>
            <button onClick={updateUserInfo}>Update User Info</button>
          </div>
        </div>
      ) : (
        <div className="col_gap">
          <h1>User Settings</h1>
          <h2>Your Username: {userInfo[0].username}</h2>
          <h2>First Name: {userInfo[0].first_name}</h2>
          <h2>Last Name: {userInfo[0].last_name}</h2>
          <h2>
            Member Since:{" "}
            {new Date(userInfo[0].account_created).toLocaleDateString()}
          </h2>
          <div>
            <button
              onClick={() => {
                setfirst_nameToUpdate(userInfo[0].first_name);
                setlast_nameToUpdate(userInfo[0].last_name);
                setupdateInfoToggle(true);
              }}
            >
              Edit Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;