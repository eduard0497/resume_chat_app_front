import React, { useState } from "react";
import Friends from "./Friends";
import Messages from "./Messages";
import Settings from "./Settings";

function DashboardContainer({ changeLoginState }) {
  const [content, setcontent] = useState("");
  const changeContent = (content) => {
    setcontent(content);
  };

  const [conversationIDtoView, setconversationIDtoView] = useState(null);
  const updateConversationIdToView = (conversationID) => {
    setconversationIDtoView(conversationID);
  };
  const switchToMessagesAndSpecificConversation = (conversationID) => {
    updateConversationIdToView(conversationID);
    setcontent("messages");
  };

  const pickContent = () => {
    switch (content) {
      case "friends":
        return (
          <Friends
            switchToMessagesAndSpecificConversation={
              switchToMessagesAndSpecificConversation
            }
          />
        );
      case "messages":
        return (
          <Messages
            conversationIDtoView={conversationIDtoView}
            updateConversationIdToView={updateConversationIdToView}
          />
        );
      case "settings":
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="add_padding">
      <Navbar
        changeLoginState={changeLoginState}
        changeContent={changeContent}
      />
      <br />
      <br />
      {pickContent()}
    </div>
  );
}

export default DashboardContainer;

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
