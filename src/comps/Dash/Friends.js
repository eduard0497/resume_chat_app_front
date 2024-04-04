import React, { useState, useEffect, useContext } from "react";
import MyContext from "../ContextProvider/ContextProvider";

function Friends() {
  const { friendsTab, setfriendsTab } = useContext(MyContext);

  const [personToView, setpersonToView] = useState(null);

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
            setfriendsTab(data.setTab);
            setpersonToView(null);
          }}
        >
          {data.value}
        </button>
      );
    });
  };

  const renderCurrentView = () => {
    switch (friendsTab) {
      case "":
        return null;

      case "search":
        return <SearchPeople setpersonToView={setpersonToView} />;
      case "friends":
        return (
          <FriendsList
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
    <div className="row_space_between_flex_start height_90">
      <div className="flex_04 border_radius_15 padding_15 col_gap">
        {renderTabs()}
      </div>
      {friendsTab === "" ? null : (
        <div className="flex_1 border_radius_15 padding_15">
          {renderCurrentView()}
        </div>
      )}

      {personToView && (
        <div className="flex_03">
          <CurrentPerson personToView={personToView} />
        </div>
      )}
    </div>
  );
}

export default Friends;

const FriendsList = () => {
  const { setselectedConversationID, setmainTab } = useContext(MyContext);
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
    const req = await fetch(`${process.env.REACT_APP_BACK_END}/unfriend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: sessionStorage.getItem("token"),
        friendship_id: id,
      }),
    });
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
      setselectedConversationID(res.data[0].id);
      setmainTab("messages");
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!currentFriends.length) {
    return <div>No friends have been found</div>;
  }
  return (
    <div className="col_gap">
      {currentFriends.map((friend) => {
        return (
          <div
            key={friend.friendship_id}
            className="padding_15 border_radius_15 col_gap"
          >
            <h2>{friend.first_name + " " + friend.last_name}</h2>
            <div className="row_space_between">
              <h3>Username {friend.username}</h3>
              <h3>
                Member Since:{" "}
                {new Date(friend.account_created).toLocaleDateString()}
              </h3>
            </div>
            <div className="row_with_gap">
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

const SearchPeople = ({ setpersonToView }) => {
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
      setpersonToView(null);
      setloading(false);
    } else {
      setpersonToView(res.data[0]);
      setloading(false);
    }
  };

  return (
    <div className="row_with_gap">
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
    <div className="border_radius_15 col_gap padding_15">
      <h3>{personToView.first_name + " " + personToView.last_name}</h3>
      <div className="row_space_between">
        <p>{personToView.username}</p>
        <p>
          Member Since:{" "}
          {new Date(personToView.account_created).toLocaleDateString()}
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
