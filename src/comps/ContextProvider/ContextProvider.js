import React, { useState, createContext } from "react";

const MyContext = createContext();

export const ContextProvider = ({ children }) => {
  const [socket, setsocket] = useState(null);

  // main screen
  const [mainTab, setmainTab] = useState("");

  // friends
  const [friendsTab, setfriendsTab] = useState("");

  const [currentFriends, setcurrentFriends] = useState([]);
  const loadCurrentFriends = async () => {
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
    } else {
      setcurrentFriends(res.data);
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

  const [mySentFriendRequests, setmySentFriendRequests] = useState([]);
  const getMySentFriendRequests = async () => {
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
    setmySentFriendRequests(res.data);
  };

  const [myPendingApprovalFriendRequests, setmyPendingApprovalFriendRequests] =
    useState([]);
  const getMyPendingApprovalFriendRequests = async () => {
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
    setmyPendingApprovalFriendRequests(res.data);
  };

  // messages
  const [selectedConversationID, setselectedConversationID] = useState(null);
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

  const [messages, setmessages] = useState([]);

  return (
    <MyContext.Provider
      value={{
        socket,
        setsocket,
        selectedConversationID,
        setselectedConversationID,
        mainTab,
        setmainTab,
        friendsTab,
        setfriendsTab,
        currentFriends,
        loadCurrentFriends,
        unfriend,
        mySentFriendRequests,
        getMySentFriendRequests,
        myPendingApprovalFriendRequests,
        getMyPendingApprovalFriendRequests,
        conversations,
        setconversations,
        getConversations,
        moveConversationToTop,
        messages,
        setmessages,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export default MyContext;
