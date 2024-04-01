import React, { useState, useEffect } from "react";

function Friends({ switchToMessagesAndSpecificConversation }) {
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
            switchToMessagesAndSpecificConversation={
              switchToMessagesAndSpecificConversation
            }
          />
        );
      case "my_requests":
        return <div>My Requests</div>;
      case "pending_approval":
        return <div>Pending Approval</div>;
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
}

export default Friends;

const FriendsList = ({ switchToMessagesAndSpecificConversation }) => {
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
      switchToMessagesAndSpecificConversation(res.data[0].id);
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
