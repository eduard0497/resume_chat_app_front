import React, { useRef, useState, useEffect } from "react";

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
    <div className="height_90 row_space_between_flex_start">
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

export default Messages;

const Conversations = ({
  conversations,
  selectedConversationID,
  updateSelectedConversation,
}) => {
  return (
    <div className="border_radius_15 padding_15 flex_03 col_no_gap">
      {conversations.map((conversation) => {
        return (
          <div
            key={conversation.conversation_id}
            className={`border_radius_15 padding_15 pointer ${
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
        alert("You have a new message");
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

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!messageToSend) return;
    if (messageToSend.length > 200) {
      alert("Message too long");
      return;
    }

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

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      sendMessage();
    } else if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      const textArea = event.target;
      const value = textArea.value;
      const selectionStart = textArea.selectionStart;
      const selectionEnd = textArea.selectionEnd;

      setmessageToSend(
        value.substring(0, selectionStart) +
          "\n" +
          value.substring(selectionEnd)
      );
      textArea.selectionStart = selectionStart + 1;
      textArea.selectionEnd = selectionStart + 1;
    }
  };

  if (!selectedConversationID)
    return (
      <div className="border_radius_15 padding_15 flex_1">
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
      <div className="row_space_around">
        <textarea
          placeholder="Message..."
          value={messageToSend}
          onChange={(e) => setmessageToSend(e.target.value)}
          onKeyDown={handleKeyPress}
        ></textarea>

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
