import React, { useState, useEffect, useContext } from "react";
import MyContext from "../ContextProvider/ContextProvider";
import Settings from "./Settings";
import Friends from "./Friends";
import Messages from "./Messages";
import io from "socket.io-client";
import { notify } from "../../functions/toast";
import LoadingScreen from "../LoadingScreen";

function Dashboard({ changeLoginState }) {
  const {
    socket,
    setsocket,
    updateConversationTemporaryMessages,
    markLastTempMessageInConversationsRead,
    // allMessagesReadByOtherParty,
    conversations,
    selectedConversationID,
    setselectedConversationID,
    mainTab,
    friendsTab,
    loadCurrentFriends,
    getMyPendingApprovalFriendRequests,
    setmainTab,
    messages,
    setmessages,
  } = useContext(MyContext);

  const [loading, setloading] = useState(false);
  const [connectionEstablished, setconnectionEstablished] = useState(false);

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
      setconnectionEstablished(true);
    };

    const handleError = (data) => {
      notify({
        text: data,
        error: true,
      });
    };

    const handleNewFriendRequest = (data) => {
      if (friendsTab === "pending_approval" && mainTab === "friends") {
        getMyPendingApprovalFriendRequests();
      } else {
        notify({
          text: data,
          success: true,
        });
      }
    };

    const handleFriendRequestAccepted = (data) => {
      if (mainTab === "friends" && friendsTab === "friends") {
        loadCurrentFriends();
      } else {
        notify({
          text: `${data.first_name} ${data.last_name} accepted your friend request`,
          success: true,
        });
      }
    };

    const handleReceiveMessage = ({ message_details }) => {
      if (mainTab !== "messages") {
        notify({
          text: `New Message ${message_details.message_content}`,
          success: true,
        });
      } else {
        updateConversationTemporaryMessages(message_details);

        //
        if (selectedConversationID === message_details.conversation_id) {
          markLastTempMessageInConversationsRead(
            message_details.conversation_id
          );
          socket.emit("i_read_the_message", { message_details });

          let copyOfMessages = [...messages];
          copyOfMessages.push(message_details);
          setmessages(copyOfMessages);
        }
      }
    };

    const handleOtherPartyReadMesssage = ({ message_details }) => {
      if (mainTab !== "messages") {
        notify({
          text: `New Message ${message_details.message_content}`,
          success: true,
        });
      } else {
        if (selectedConversationID !== message_details.conversation_id) {
          notify({
            text: `New Message ${message_details.message_content}`,
            success: true,
          });
        } else {
          let copyOfMessages = [...messages];
          let index = copyOfMessages.findIndex(
            (message) => message.id === message_details.id
          );
          copyOfMessages[index] = message_details;
          setmessages(copyOfMessages);
        }
      }
    };

    const handleMessagesHaveBeenReadByOtherParty = ({ conversation_id }) => {
      if (mainTab !== "messages") {
        console.log(
          `All messages at conversation ${conversation_id} have been read`
        );
      } else {
        if (selectedConversationID !== conversation_id) {
          console.log(
            `All messages at conversation ${conversation_id} have been read`
          );
        } else {
          // allMessagesReadByOtherParty(conversation_id);
          let copyOfMessages = [...messages];

          for (let i = 0; i < copyOfMessages.length; i++) {
            copyOfMessages[i].is_read = true;
          }
          setmessages(copyOfMessages);
        }
      }
    };

    socket.on("connection_established", handleConnectionEstablished);
    socket.on("error", handleError);
    socket.on("new_friend_request", handleNewFriendRequest);
    socket.on("friend_request_accepted", handleFriendRequestAccepted);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("other_party_read_message", handleOtherPartyReadMesssage);
    socket.on(
      "messages_have_been_read",
      handleMessagesHaveBeenReadByOtherParty
    );

    return () => {
      socket.off("connection_established", handleConnectionEstablished);
      socket.off("error", handleError);
      socket.off("new_friend_request", handleNewFriendRequest);
      socket.off("friend_request_accepted", handleFriendRequestAccepted);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("other_party_read_message", handleOtherPartyReadMesssage);
      socket.off(
        "messages_have_been_read",
        handleMessagesHaveBeenReadByOtherParty
      );
    };
  }, [
    socket,
    mainTab,
    friendsTab,
    getMyPendingApprovalFriendRequests,
    loadCurrentFriends,
    selectedConversationID,
    conversations,
    messages,
    setmessages,
    // allMessagesReadByOtherParty,
    updateConversationTemporaryMessages,
    markLastTempMessageInConversationsRead,
  ]);

  if (!socket) {
    return <LoadingScreen />;
  }

  if (!connectionEstablished) {
    return <LoadingScreen />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="dashboard_container">
      <Navbar
        changeLoginState={changeLoginState}
        setmainTab={setmainTab}
        setselectedConversationID={setselectedConversationID}
      />
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
    <div className="container_with_shadow row_space_around">
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
          className="button_submit_gray_to_navy"
        >
          Friends
        </button>
        <button
          onClick={() => setmainTab("messages")}
          className="button_submit_gray_to_navy"
        >
          Messages
        </button>
      </div>

      <div className="navbar_user_icon padding_10">
        <img
          src="./default_profile_photo.jpg"
          alt="profile"
          className="profile_photo"
        />
        <div className="navbar_user_dropdown">
          <button
            onClick={() => {
              setmainTab("settings");
              setselectedConversationID(null);
            }}
            className="button_submit_gray_to_navy"
          >
            Settings
          </button>
          <button onClick={logOut} className="button_error">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
