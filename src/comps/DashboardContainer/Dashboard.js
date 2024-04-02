import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";

function Dashboard({ changeLoginState }) {
  //
  const [socket, setsocket] = useState(null);
  //
  const [content, setcontent] = useState("");
  const changeContent = (content) => {
    setcontent(content);
  };

  //
  const [selectedConversationID, setselectedConversationID] = useState(null);
  const updateSelectedConversation = (id) => {
    setselectedConversationID(id);
  };

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
      console.log(res.msg);
    } else {
      updateSelectedConversation(res.data[0].id);
      setcontent("messages");
    }
  };

  const pickContent = () => {
    switch (content) {
      case "friends":
        return <Friends startMessaging={startMessaging} />;
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

  //
  useEffect(() => {
    let newSocket;
    try {
      newSocket = io.connect(process.env.REACT_APP_BACK_END, {
        query: {
          token: sessionStorage.getItem("token"),
        },
      });

      newSocket.on("error", (data) => {
        console.log(data);
      });

      newSocket.on("connection_established", (data) => {
        console.log(data);
      });

      setsocket(newSocket);
    } catch (error) {
      console.log(newSocket);
    }

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  if (!socket) return <p>Unable to establish a connection</p>;
  return (
    <div className="add_padding">
      <Navbar
        changeLoginState={changeLoginState}
        changeContent={changeContent}
      />
      <br />
      {pickContent()}
    </div>
  );
}

export default Dashboard;

//
const Navbar = ({ changeLoginState, changeContent }) => {
  const logOut = () => {
    sessionStorage.removeItem("token");
    changeLoginState(false);
  };

  return (
    <div className="row_space_around border add_padding">
      <div>
        <h1>Logo</h1>
      </div>
      <div className="row_with_gap">
        <button onClick={() => changeContent("friends")}>Friends</button>
        <button onClick={() => changeContent("messages")}>Messages</button>
        <button onClick={() => changeContent("settings")}>Settings</button>
      </div>
      <div>
        <button onClick={logOut}>Log Out</button>
      </div>
    </div>
  );
};

// Frieds
const Friends = ({ startMessaging }) => {
  const [personToView, setpersonToView] = useState(null);
  const changePersonToView = (person) => {
    setpersonToView(person);
  };

  const [currentView, setcurrentView] = useState("");

  const renderTabs = () => {
    let tmpArray = [
      {
        setTab: "search",
        value: "Search...",
      },
      {
        setTab: "friends",
        value: "All Friends",
      },
      {
        setTab: "my_requests",
        value: "My Requests",
      },
      {
        setTab: "pending_approval",
        value: "Pending Approval",
      },
    ];

    return tmpArray.map((data, index) => {
      return (
        <button
          key={index}
          onClick={() => {
            setcurrentView(data.setTab);
            setpersonToView(null);
          }}
        >
          {data.value}
        </button>
      );
    });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "":
        return (
          <div className="center_flex height_100">
            <h1>Pick a tab</h1>
          </div>
        );
      case "search":
        return <SearchPeople changePersonToView={changePersonToView} />;
      case "friends":
        return (
          <FriendsList
            startMessaging={startMessaging}
            // switchToMessagesAndSpecificConversation={
            //   switchToMessagesAndSpecificConversation
            // }
          />
        );
      case "my_requests":
        return <MyRequests />;
      case "pending_approval":
        return <PendingMyApproval />;
      default:
        return null;
    }
  };

  return (
    <div className="row_space_between">
      <div className="flex_04 border add_padding col_gap">{renderTabs()}</div>
      <div className="flex_1 border add_padding">{renderCurrentView()}</div>
      {personToView && (
        <div className="flex_03">
          <CurrentPerson personToView={personToView} />
        </div>
      )}
    </div>
  );
};

const FriendsList = (
  { startMessaging } /* switchToMessagesAndSpecificConversation */
) => {
  const [loading, setloading] = useState(false);

  const [currentFriends, setcurrentFriends] = useState([]);

  const loadFriends = async () => {
    setloading(true);
    const req = await fetch(
      `${process.env.REACT_APP_BACK_END}/load-current-friends`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
        }),
      }
    );
    const res = await req.json();
    if (!res.status) {
      console.log(res.msg);
      setloading(false);
    } else {
      setcurrentFriends(res.data);
      setloading(false);
    }
  };

  const unfriend = async (id) => {
    const req = await fetch(
      `${process.env.REACT_APP_BACK_END}/load-current-friends`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
          friendship_id: id,
        }),
      }
    );
    const res = await req.json();
    if (!res.status) {
      console.log(res.msg);
    } else {
      let newCurrentFriends = currentFriends.filter(
        (friend) => friend.friendship_id !== id
      );
      setcurrentFriends(newCurrentFriends);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <div className="row_with_wrap">
      {currentFriends.map((friend) => {
        return (
          <div key={friend.friendship_id} className="add_padding border">
            <h2>{friend.first_name + " " + friend.last_name}</h2>
            <div className="row_space_between">
              <h3>{friend.username}</h3>
              <h3>
                Member Since:{" "}
                {new Date(friend.account_created).toLocaleDateString()}
              </h3>
            </div>
            <div>
              <button onClick={() => startMessaging(friend.user_id)}>
                Message
              </button>
              <button onClick={() => unfriend(friend.friendship_id)}>
                Delete Friend
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SearchPeople = ({ changePersonToView }) => {
  const [loading, setloading] = useState(false);
  const [usernameToSearch, setusernameToSearch] = useState("");

  const search = async () => {
    if (!usernameToSearch) return;
    setloading(true);
    const req = await fetch(`${process.env.REACT_APP_BACK_END}/search-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: sessionStorage.getItem("token"),
        username: usernameToSearch,
      }),
    });
    const res = await req.json();
    if (!res.data.length || !res.status) {
      changePersonToView(null);
      setloading(false);
    } else {
      changePersonToView(res.data[0]);
      setloading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Username to search..."
        value={usernameToSearch}
        onChange={(e) => setusernameToSearch(e.target.value)}
      />
      {loading ? (
        <button>Loading...</button>
      ) : (
        <button onClick={search}>Search</button>
      )}
    </div>
  );
};

const CurrentPerson = ({ personToView }) => {
  const [loading, setloading] = useState(false);

  const sendFriendRequest = async () => {
    setloading(true);
    const req = await fetch(
      `${process.env.REACT_APP_BACK_END}/send-friend-request`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
          personID: personToView.user_id,
        }),
      }
    );
    const res = await req.json();
    if (!res.status) {
      console.log(res.msg);
      setloading(false);
    } else {
      Object.assign(personToView, res.data[0]);
      setloading(false);
    }
    // socket.emit("send_friend_request", {
    //   requestorToken: sessionStorage.getItem("token"),
    //   receiver: personToView.user_id,
    // });
  };

  const acceptFriendRequest = async () => {
    setloading(true);
    const req = await fetch(
      `${process.env.REACT_APP_BACK_END}/accept-friend-request`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
          requestID: personToView.friendship_id,
        }),
      }
    );
    const res = await req.json();
    if (!res.status) {
      console.log(res.msg);
      setloading(false);
    } else {
      personToView.status = res.data[0].status;
      setloading(false);
    }
  };

  const rejectFriendRequest = async () => {
    setloading(true);
    const req = await fetch(
      `${process.env.REACT_APP_BACK_END}/reject-friend-request`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
          requestID: personToView.friendship_id,
        }),
      }
    );
    const res = await req.json();
    if (!res.status) {
      console.log(res.msg);
      setloading(false);
    } else {
      personToView.friendship_id = null;
      personToView.friendship_recipient = null;
      personToView.friendship_requestor = null;
      personToView.status = null;
      console.log(personToView);
      setloading(false);
    }
  };

  const renderBasedOnFriendshipStatus = () => {
    switch (personToView.status) {
      case null:
        return <button onClick={sendFriendRequest}>Send Friend Request</button>;
      case "pending":
        if (personToView.user_id === personToView.friendship_recipient) {
          return <div>Request Pending</div>;
        } else if (personToView.user_id === personToView.friendship_requestor) {
          return (
            <div>
              <button onClick={acceptFriendRequest}>Accept</button>
              <button onClick={rejectFriendRequest}>Reject</button>
            </div>
          );
        }
        break;
      case "accepted":
        return <div>You are friends</div>;
      default:
        return <div>Error...</div>;
    }
  };

  if (!personToView) return <div>None to display!</div>;
  if (loading) return <div>Loading...</div>;
  return (
    <div className="border col_gap add_padding">
      <h3>{personToView.first_name + " " + personToView.last_name}</h3>
      <div className="row_space_between">
        <p>{personToView.username}</p>
        <p>
          Since: {new Date(personToView.account_created).toLocaleDateString()}
        </p>
      </div>

      {loading ? <div>Loading...</div> : renderBasedOnFriendshipStatus()}
    </div>
  );
};

const MyRequests = () => {
  const [requests, setrequests] = useState([]);

  const getRequests = async () => {
    const req = await fetch(
      `${process.env.REACT_APP_BACK_END}/get-my-friend-requests`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
        }),
      }
    );
    const res = await req.json();
    setrequests(res.data);
  };

  useEffect(() => {
    getRequests();
  }, []);

  return (
    <div className="row_with_gap">
      {requests.map((request) => {
        return (
          <div key={request.request_id} className="add_padding border">
            <h2>{request.first_name + " " + request.last_name}</h2>
            <div className="row_space_between">
              <p>{request.username}</p>
              <p>{new Date(request.account_created).toLocaleDateString()}</p>
            </div>
            <p>Waiting for user to approve or decline</p>
          </div>
        );
      })}
    </div>
  );
};

const PendingMyApproval = () => {
  const [requests, setrequests] = useState([]);

  const getRequests = async () => {
    const req = await fetch(
      `${process.env.REACT_APP_BACK_END}/get-pending-approval-friend-requests`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
        }),
      }
    );
    const res = await req.json();
    setrequests(res.data);
  };

  const acceptFriendRequest = async (requestID) => {
    const req = await fetch(
      `${process.env.REACT_APP_BACK_END}/accept-friend-request`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
          requestID,
        }),
      }
    );
    const res = await req.json();
    if (!res.status) {
      console.log(res.msg);
    } else {
      getRequests();
    }
  };

  const rejectFriendRequest = async (requestID) => {
    const req = await fetch(
      `${process.env.REACT_APP_BACK_END}/reject-friend-request`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
          requestID,
        }),
      }
    );
    const res = await req.json();
    if (!res.status) {
      console.log(res.msg);
    } else {
      getRequests();
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  return (
    <div className="row_with_gap">
      {requests.map((request) => {
        return (
          <div key={request.request_id} className="add_padding border">
            <h2>{request.first_name + " " + request.last_name}</h2>
            <div className="row_space_between">
              <p>{request.username}</p>
              <p>{new Date(request.account_created).toLocaleDateString()}</p>
            </div>
            <div className="row_space_between">
              <button onClick={() => rejectFriendRequest(request.request_id)}>
                Reject
              </button>
              <button onClick={() => acceptFriendRequest(request.request_id)}>
                Accept
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Settings
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
    <div className="add_padding border">
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
      )}
    </div>
  );
};

//
const Messages = ({
  selectedConversationID,
  updateSelectedConversation,
  socket,
}) => {
  const [conversations, setconversations] = useState([]);

  const getConversations = async () => {
    const req = await fetch(
      `${process.env.REACT_APP_BACK_END}/get-current-user-conversations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionStorage.getItem("token"),
        }),
      }
    );
    const res = await req.json();
    if (!res.status) {
      console.log(res.msg);
    } else {
      setconversations(res.data);
    }
  };

  console.log(conversations);
  useEffect(() => {
    getConversations();
  }, []);

  const moveConversationToTop = (conversationID) => {
    const copyArray = [...conversations];
    const index = copyArray.findIndex(
      (obj) => obj.conversation_id === conversationID
    );

    if (index === -1) {
      return;
    }

    const objectToMove = copyArray.splice(index, 1)[0];

    copyArray.unshift(objectToMove);

    setconversations(copyArray);
  };

  return (
    <div className="row_space_between">
      <Conversations
        conversations={conversations}
        selectedConversationID={selectedConversationID}
        updateSelectedConversation={updateSelectedConversation}
      />
      <SelectedConversation
        selectedConversationID={selectedConversationID}
        moveConversationToTop={moveConversationToTop}
        socket={socket}
      />
    </div>
  );
};

const Conversations = ({
  conversations,
  selectedConversationID,
  updateSelectedConversation,
}) => {
  return (
    <div className="border add_padding flex_03 col_no_gap">
      {conversations.map((conversation) => {
        return (
          <div
            key={conversation.conversation_id}
            className={`border add_padding pointer ${
              selectedConversationID === conversation.conversation_id
                ? "selected"
                : ""
            }`}
            onClick={() =>
              updateSelectedConversation(conversation.conversation_id)
            }
          >
            <h3>{conversation.first_name + " " + conversation.last_name}</h3>
            <p>{conversation.username}</p>
          </div>
        );
      })}
    </div>
  );
};

const SelectedConversation = ({
  selectedConversationID,
  moveConversationToTop,
  socket,
}) => {
  //
  const [myID, setmyID] = useState(null);
  const [otherPartyID, setotherPartyID] = useState(null);
  const [messages, setmessages] = useState([]);
  const [messageToSend, setmessageToSend] = useState("");
  //
  const messageContainerRef = useRef(null);

  useEffect(() => {
    const getMessages = async () => {
      const req = await fetch(
        `${process.env.REACT_APP_BACK_END}/get-conversation-messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: sessionStorage.getItem("token"),
            conversationID: selectedConversationID,
          }),
        }
      );
      const res = await req.json();
      if (!res.status) {
        console.log(res.msg);
      } else {
        setmyID(res.myID);
        setotherPartyID(res.otherPartyID);
        setmessages(res.messages);
      }
    };

    getMessages();
  }, [selectedConversationID]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (data.conversation_id !== selectedConversationID) {
        console.log("text ekav vor es conversation-i mej chi");
        moveConversationToTop(data.conversation_id);
      } else {
        moveConversationToTop(data.conversation_id);
        setmessages((prevMessages) => [...prevMessages, data]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [selectedConversationID, moveConversationToTop, socket]);

  const sendMessage = () => {
    if (!messageToSend) return;

    socket.emit(
      "send_message",
      {
        senderID: myID,
        otherPartyID,
        conversationID: selectedConversationID,
        message: messageToSend,
      },
      (res) => {
        if (!res.status) {
          console.log(res.msg);
        } else {
          let newMessages = [...messages];
          newMessages.push({
            id: messages.length > 0 ? messages[messages.length - 1].id + 1 : 1,
            conversation_id: selectedConversationID,
            sender_id: myID,
            message_content: messageToSend,
            sent_at: new Date(),
            is_read: false,
          });
          moveConversationToTop(selectedConversationID);
          setmessageToSend("");
          setmessages(newMessages);
        }
      }
    );
  };

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!selectedConversationID)
    return (
      <div className="border add_padding flex_1">
        <h1>No conversation selected</h1>
      </div>
    );

  return (
    <div className="messaging_container">
      <div className="messaging_container_messages" ref={messageContainerRef}>
        {messages.map((message) => {
          return (
            <p
              key={message.id}
              className={`message ${
                message.sender_id === myID ? "sent" : "received"
              }`}
            >
              {message.message_content}
              <span>{new Date(message.sent_at).toLocaleTimeString()}</span>
            </p>
          );
        })}
      </div>
      <div>
        <input
          type="text"
          placeholder="Message..."
          value={messageToSend}
          onChange={(e) => setmessageToSend(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
