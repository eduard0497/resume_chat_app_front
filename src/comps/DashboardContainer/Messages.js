import React, { useState, useEffect } from "react";
import io from "socket.io-client";

function Messages({ conversationIDtoView, updateConversationIdToView }) {
  //
  const [socket, setsocket] = useState(null);
  //
  const [currentUserID, setcurrentUserID] = useState(null);
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
      setcurrentUserID(null);
    } else {
      setconversations(res.conversations);
      setcurrentUserID(res.current_user_id);
    }
  };

  useEffect(() => {
    const newSocket = io.connect(process.env.REACT_APP_BACK_END, {
      query: {
        token: sessionStorage.getItem("token"),
      },
    });

    newSocket?.on("error", (data) => {
      console.log(data);
    });

    newSocket?.on("connection_established", (data) => {
      console.log(data);
    });

    newSocket?.on("receive_message", (data) => {
      console.log(data);
    });

    if (newSocket) {
      setsocket(newSocket);
    }
    getConversations();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [currentUserID]);

  if (!currentUserID) return <div>Loading.....</div>;

  return (
    <div className="row_space_between">
      <Conversations
        conversations={conversations}
        conversationIDtoView={conversationIDtoView}
        updateConversationIdToView={updateConversationIdToView}
        socket={socket}
      />
      <SelectedConversation
        currentUserID={currentUserID}
        conversationIDtoView={conversationIDtoView}
        socket={socket}
      />
    </div>
  );
}

export default Messages;

const Conversations = ({
  conversations,
  conversationIDtoView,
  updateConversationIdToView,
  // socket,
}) => {
  return (
    <div className="border add_padding flex_03 col_no_gap">
      {conversations.map((conversation) => {
        return (
          <div
            key={conversation.conversation_id}
            className={`border add_padding pointer ${
              conversationIDtoView === conversation.conversation_id
                ? "selected"
                : ""
            }`}
            onClick={() =>
              updateConversationIdToView(conversation.conversation_id)
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
  currentUserID,
  conversationIDtoView,
  socket,
}) => {
  const [otherPartyID, setotherPartyID] = useState(null);
  const [messages, setmessages] = useState([]);
  const [messageToSend, setmessageToSend] = useState("");

  const sendMessage = () => {
    if (!messageToSend) return;

    socket.emit("send_message", {
      senderID: currentUserID,
      otherPartyID,
      conversationID: conversationIDtoView,
      message: messageToSend,
    });
    let newMessages = [...messages];
    newMessages.push({
      id: messages.length > 0 ? messages[messages.length - 1].id + 1 : 1,
      conversation_id: 2,
      message_content: messageToSend,
      send_at: new Date(),
      is_read: false,
    });
    setmessageToSend("");
    setmessages(newMessages);
  };

  useEffect(() => {
    const getMessages = async () => {
      const req = await fetch(
        `${process.env.REACT_APP_BACK_END}/get-conversation-messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: sessionStorage.getItem("token"),
            conversationID: conversationIDtoView,
          }),
        }
      );
      const res = await req.json();
      if (!res.status) {
        console.log(res.msg);
      } else {
        setotherPartyID(res.otherPartyID);
        setmessages(res.messages);
      }
    };
    getMessages();
  }, [conversationIDtoView]);

  if (!conversationIDtoView)
    return (
      <div className="border add_padding flex_1">
        <h1>No conversation selected</h1>
      </div>
    );

  return (
    <div className="messaging_container">
      <div className="messaging_container_messages">
        {messages.map((message) => {
          return (
            <p
              key={message.id}
              className={`message ${
                message.sender_id !== currentUserID ? "sent" : "received"
              }`}
            >
              {message.message_content}
            </p>
          );
        })}
        {/* <p className="message sent">
          Text 1Text 1Text 1Text 1Text 1Text 1Text 1Text 1Text 1
        </p>
        <p className="message sent">Text 2</p>
        <p className="message received">Text 1</p>
        <p className="message received">Text 2</p>
        <p className="message sent">Text 1</p>
        <p className="message received">
          Text 1Text 1Text 1Text 1Text 1Text 1Text 1Text 1Text 1
        </p>
        <p className="message received">Text 2</p>
        <p className="message sent">Text 1</p>
        <p className="message received">Text 2</p>
        <p className="message sent">Text 1</p>
        <p className="message sent">Text 2</p> */}
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
