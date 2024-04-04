import React, { useState, useEffect } from "react";
import Messages from "./DashboardTabs/Messages";
import Friends from "./DashboardTabs/Friends";
import Settings from "./DashboardTabs/Settings";
import io from "socket.io-client";
import "./Dashboard.css";

function Dashboard({ changeLoginState }) {
  const [loading, setloading] = useState(false);

  const [socket, setsocket] = useState(null);
  const [connectionEstablished, setconnectionEstablished] = useState(false);

  //
  const [content, setcontent] = useState();
  const changeContent = (content) => {
    setcontent(content);
  };

  //
  const [selectedConversationID, setselectedConversationID] = useState(null);
  const updateSelectedConversation = (id) => {
    setselectedConversationID(id);
  };

  //
  const [friendsTab, setfriendsTab] = useState("");

  //
  const startMessaging = async (personID) => {
    const req = await fetch(
      `${process.env.REACT_APP_BACK_END}/start-messaging-from-friends-list`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
          personID,
        }),
      }
    );
    const res = await req.json();
    if (!res.status) {
      alert(res.msg);
    } else {
      updateSelectedConversation(res.data[0].id);
      setcontent("messages");
    }
  };

  const pickContent = () => {
    switch (content) {
      case "friends":
        return (
          <Friends
            friendsTab={friendsTab}
            setfriendsTab={setfriendsTab}
            startMessaging={startMessaging}
          />
        );
      case "messages":
        return (
          <Messages
            socket={socket}
            selectedConversationID={selectedConversationID}
            updateSelectedConversation={updateSelectedConversation}
          />
        );
      case "settings":
        return <Settings />;
      default:
        return null;
    }
  };

  useEffect(() => {
    let newSocket;
    try {
      setloading(true);

      newSocket = io.connect(process.env.REACT_APP_BACK_END, {
        query: {
          token: sessionStorage.getItem("token"),
        },
      });

      newSocket.on("connection_established", (data) => {
        console.log(data);
        setconnectionEstablished(true);
      });

      newSocket.on("error", (data) => {
        alert(data);
      });

      newSocket.on("new_friend_request", (data) => {
        alert(data);
      });

      newSocket.on("friend_request_accepted", (data) => {
        alert(data);
      });

      setsocket(newSocket);
    } catch (error) {
      console.log(newSocket);
      console.log(error);
    } finally {
      setloading(false);
    }

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  if (!socket) {
    return (
      <div>
        <h1>Unable to establish a connection</h1>
      </div>
    );
  }

  if (!connectionEstablished) {
    return (
      <div>
        <h1>Waiting to establish a connection</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="height_100">
      <Navbar
        changeLoginState={changeLoginState}
        changeContent={changeContent}
        updateSelectedConversation={updateSelectedConversation}
      />
      <br />
      {pickContent()}
    </div>
  );
}

export default Dashboard;

const Navbar = ({
  changeLoginState,
  changeContent,
  updateSelectedConversation,
}) => {
  const logOut = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("first_name");
    sessionStorage.removeItem("last_name");
    sessionStorage.removeItem("user_since");
    changeLoginState(false);
  };

  return (
    <div className="border_radius_15 row_space_around padding_10">
      <div>
        <h1>
          {sessionStorage.getItem("first_name") +
            " " +
            sessionStorage.getItem("last_name")}
        </h1>
      </div>
      <div className="row_with_gap">
        <button
          onClick={() => {
            changeContent("friends");
            updateSelectedConversation(null);
          }}
        >
          Friends
        </button>
        <button onClick={() => changeContent("messages")}>Messages</button>
      </div>

      <div className="navbar_user_icon padding_10">
        <span>User Image</span>
        <div className="navbar_user_dropdown padding_15 border_radius_10">
          <button
            onClick={() => {
              changeContent("settings");
              updateSelectedConversation(null);
            }}
          >
            Settings
          </button>
          <button onClick={logOut}>Log Out</button>
        </div>
      </div>
    </div>
  );
};
