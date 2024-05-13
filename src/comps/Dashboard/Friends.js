import React, { useState, useEffect, useContext } from "react";
import MyContext from "../ContextProvider/ContextProvider";
import BeatLoader from "react-spinners/BeatLoader";

const Submit_Button_Spinner_Color = "#282b30";

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
          className="button_submit_gray_to_navy"
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
    <div className="row_with_gap flex_Start height_90_per">
      <div className="container_with_shadow flex_04 column">{renderTabs()}</div>
      {friendsTab === "" ? null : (
        <div className="container_with_shadow flex_1">
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

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      search();
    }
  };

  return (
    <div className="row_with_gap">
      <input
        type="text"
        placeholder="Username to search..."
        value={usernameToSearch}
        onChange={(e) => setusernameToSearch(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      {loading ? (
        <button className="button_spinner">
          <BeatLoader color={Submit_Button_Spinner_Color} loading />
        </button>
      ) : (
        <button className="button_submit_gray_to_navy" onClick={search}>
          Search
        </button>
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
        return (
          <button
            onClick={sendFriendRequest}
            className="button_submit_navy_to_gray"
          >
            Send Friend Request
          </button>
        );
      case "pending":
        if (personToView.user_id === personToView.friendship_recipient) {
          return <div>Request Pending</div>;
        } else if (personToView.user_id === personToView.friendship_requestor) {
          return (
            <div>
              <button
                onClick={acceptFriendRequest}
                className="button_submit_navy_to_gray"
              >
                Accept
              </button>
              <button onClick={rejectFriendRequest} className="button_error">
                Reject
              </button>
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
    <div className="container_with_shadow column width_400">
      <div className="row_with_gap">
        <img
          src="./default_profile_photo.jpg"
          alt="profile_photo"
          className="profile_photo"
        />
        <h2>{personToView.first_name + " " + personToView.last_name}</h2>
      </div>
      <p>Username: {" " + personToView.username}</p>
      <p>
        Member Since:{" "}
        {new Date(personToView.account_created).toLocaleDateString()}
      </p>

      {loading ? <div>Loading...</div> : renderBasedOnFriendshipStatus()}
    </div>
  );
};

const FriendsList = () => {
  const {
    setselectedConversationID,
    setmainTab,
    currentFriends,
    loadCurrentFriends,
    unfriend,
  } = useContext(MyContext);
  // eslint-disable-next-line
  const [loading, setloading] = useState(false);

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
    loadCurrentFriends();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!currentFriends.length) {
    return <div>No friends have been found</div>;
  }
  return (
    <div className="row_with_wrap">
      {currentFriends.map((friend) => {
        return (
          <div
            key={friend.friendship_id}
            className="container_with_shadow column"
          >
            <div className="row_with_gap">
              <img
                src="./default_profile_photo.jpg"
                alt="profile_photo"
                className="profile_photo"
              />
              <h2>{friend.first_name + " " + friend.last_name}</h2>
            </div>
            <h3>Username:{" " + friend.username}</h3>
            <h3>
              Member Since:{" "}
              {new Date(friend.account_created).toLocaleDateString()}
            </h3>

            <div className="row_with_gap">
              <button
                onClick={() => startMessaging(friend.user_id)}
                className="button_submit_navy_to_gray"
              >
                Message
              </button>
              <button
                onClick={() => unfriend(friend.friendship_id)}
                className="button_error"
              >
                Delete Friend
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MyRequests = () => {
  const { mySentFriendRequests, getMySentFriendRequests } =
    useContext(MyContext);

  useEffect(() => {
    getMySentFriendRequests();
    // eslint-disable-next-line
  }, []);

  if (!mySentFriendRequests.length) {
    return (
      <div>
        <h2>No Pending requests</h2>
      </div>
    );
  }

  return (
    <div className="row_with_gap">
      {mySentFriendRequests.map((request) => {
        return (
          <div
            key={request.request_id}
            className="container_with_shadow column"
          >
            <div className="row_with_gap">
              <img
                src="./default_profile_photo.jpg"
                alt="profile_photo"
                className="profile_photo"
              />
              <h2>{request.first_name + " " + request.last_name}</h2>
            </div>

            <p>Username: {" " + request.username}</p>
            <p>
              Member Since:{" "}
              {" " + new Date(request.account_created).toLocaleDateString()}
            </p>
            <p>Waiting for user to approve or decline</p>
          </div>
        );
      })}
    </div>
  );
};

const PendingMyApproval = () => {
  const {
    myPendingApprovalFriendRequests,
    getMyPendingApprovalFriendRequests,
  } = useContext(MyContext);

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
      getMyPendingApprovalFriendRequests();
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
      getMyPendingApprovalFriendRequests();
    }
  };

  useEffect(() => {
    getMyPendingApprovalFriendRequests();
    // eslint-disable-next-line
  }, []);

  if (!myPendingApprovalFriendRequests.length) {
    return (
      <div>
        <h2>No Pending requests</h2>
      </div>
    );
  }

  return (
    <div className="row_with_gap">
      {myPendingApprovalFriendRequests.map((request) => {
        return (
          <div
            key={request.request_id}
            className="container_with_shadow column"
          >
            <div className="row_with_gap">
              <img
                src="./default_profile_photo.jpg"
                alt="profile_photo"
                className="profile_photo"
              />
              <h2>{request.first_name + " " + request.last_name}</h2>
            </div>

            <p>Username: {" " + request.username}</p>
            <p>
              Member Since:{" "}
              {" " + new Date(request.account_created).toLocaleDateString()}
            </p>
            <div className="row_space_around">
              <button
                onClick={() => rejectFriendRequest(request.request_id)}
                className="button_error"
              >
                Reject
              </button>
              <button
                onClick={() => acceptFriendRequest(request.request_id)}
                className="button_submit_navy_to_gray"
              >
                Accept
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
