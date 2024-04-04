import React, { useState, useEffect, useContext } from "react";
import MyContext from "../ContextProvider/ContextProvider";
import Settings from "./Settings";
import Friends from "./Friends";
import Messages from "./Messages";
import io from "socket.io-client";
import "./Dashboard.css";

function Dashboard({ changeLoginState }) {
  const {
    socket,
    setsocket,
    selectedConversationID,
    setselectedConversationID,
    mainTab,
    setmainTab,
  } = useContext(MyContext);
  //
  const [loading, setloading] = useState(false);
  const [connectionEstablished, setconnectionEstablished] = useState(false);
  //

  const pickmainTab = () => {
    switch (mainTab) {
      case "friends":
        return <Friends />;
      case "messages":
        return <Messages />;
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
      setsocket(newSocket);
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }

    return () => {
      if (newSocket) newSocket.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleConnectionEstablished = (data) => {
      console.log(data);
      setconnectionEstablished(true);
    };

    const handleError = (data) => {
      alert(data);
    };

    const handleNewFriendRequest = (data) => {
      alert(data);
    };

    const handleFriendRequestAccepted = (data) => {
      alert(data);
    };

    const handleReceiveMessage = (data) => {
      if (mainTab !== "messages") {
        alert(`New Message ${data.message_content}`);
      } else {
        if (selectedConversationID !== data.conversation_id) {
          alert(`New Message ${data.message_content}`);
        } else {
          console.log(data);
        }
      }
    };

    socket.on("connection_established", handleConnectionEstablished);
    socket.on("error", handleError);
    socket.on("new_friend_request", handleNewFriendRequest);
    socket.on("friend_request_accepted", handleFriendRequestAccepted);
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("connection_established", handleConnectionEstablished);
      socket.off("error", handleError);
      socket.off("new_friend_request", handleNewFriendRequest);
      socket.off("friend_request_accepted", handleFriendRequestAccepted);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, mainTab, selectedConversationID]);

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
        setmainTab={setmainTab}
        setselectedConversationID={setselectedConversationID}
      />
      <br />
      {pickmainTab()}
    </div>
  );
}

export default Dashboard;

const Navbar = ({
  changeLoginState,
  setmainTab,
  setselectedConversationID,
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
            setmainTab("friends");
            setselectedConversationID(null);
          }}
        >
          Friends
        </button>
        <button onClick={() => setmainTab("messages")}>Messages</button>
      </div>

      <div className="navbar_user_icon padding_10">
        <span>User Image</span>
        <div className="navbar_user_dropdown padding_15 border_radius_10">
          <button
            onClick={() => {
              setmainTab("settings");
              setselectedConversationID(null);
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
