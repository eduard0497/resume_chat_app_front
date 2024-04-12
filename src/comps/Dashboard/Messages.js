import React, { useRef, useState, useEffect, useContext } from "react";
import MyContext from "../ContextProvider/ContextProvider";

function Messages() {
  const { getConversations } = useContext(MyContext);

  useEffect(() => {
    getConversations();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="messages_container">
      <Conversations />
      <SelectedConversation />
    </div>
  );
}

export default Messages;

const Conversations = () => {
  const {
    conversations,
    selectedConversationID,
    updateSelectedConversationMessagesAsRead_Select_Conversation,
  } = useContext(MyContext);

  const getLastMessageValues = (conversation, whatToGet) => {
    if (whatToGet === "sent_at") {
      let date_time = new Date(
        conversation.messages[conversation.messages.length - 1]["sent_at"]
      );
      let today = new Date();

      if (
        date_time.getDate() === today.getDate() &&
        date_time.getMonth() === today.getMonth() &&
        date_time.getFullYear() === today.getFullYear()
      ) {
        return date_time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        return date_time.toLocaleDateString();
      }
    } else {
      return conversation.messages[conversation.messages.length - 1][whatToGet];
    }
  };

  return (
    <div className="border_radius_15 padding_15 width_400 col_no_gap">
      {conversations.map((conversation) => {
        return (
          <div
            key={conversation.conversation_id}
            className={`border_radius_15 padding_15 row_with_gap pointer   ${
              selectedConversationID === conversation.conversation_id
                ? "selected"
                : ""
            }`}
            onClick={() =>
              updateSelectedConversationMessagesAsRead_Select_Conversation(
                conversation.conversation_id
              )
            }
          >
            <div>
              <img
                src="./default_profile_photo.jpg"
                alt="profile_photo"
                className="profile_photo"
              />
            </div>
            <div className="col_gap">
              <h3>{conversation.first_name + " " + conversation.last_name}</h3>
              {selectedConversationID !== conversation.conversation_id ? (
                <>
                  {conversation.messages.length === 1 &&
                  !conversation.messages[0].message_id ? (
                    <p>No Messages</p>
                  ) : (
                    <>
                      {conversation.messages[conversation.messages.length - 1]
                        .sender_id !== conversation.user_id ? (
                        <div className="row_space_between">
                          <p>
                            You:{" "}
                            {getLastMessageValues(
                              conversation,
                              "message_content"
                            )}
                          </p>
                          <p>{getLastMessageValues(conversation, "sent_at")}</p>
                        </div>
                      ) : (
                        <div className="row_space_between">
                          <p>
                            {getLastMessageValues(
                              conversation,
                              "message_content"
                            )}
                          </p>
                          <p>{getLastMessageValues(conversation, "sent_at")}</p>
                          {!getLastMessageValues(conversation, "is_read") ? (
                            <span>new message blink</span>
                          ) : null}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SelectedConversation = () => {
  const {
    socket,
    selectedConversationID,
    moveConversationToTop,
    updateConversationTemporaryMessages,
    messages,
    setmessages,
  } = useContext(MyContext);
  const [sendButtonLoading, setsendButtonLoading] = useState(false);

  //
  const [myID, setmyID] = useState(null);
  const [otherPartyID, setotherPartyID] = useState(null);
  const [messageToSend, setmessageToSend] = useState("");
  const messageContainerRef = useRef(null);

  useEffect(() => {
    const getMessages = async () => {
      if (!selectedConversationID) {
        return;
      } else {
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
      }
    };

    getMessages();
    // eslint-disable-next-line
  }, [selectedConversationID]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages, setmessages, socket]);

  const sendMessage = () => {
    if (!messageToSend) return;
    if (messageToSend.length > 200) {
      alert("Message too long");
      return;
    }
    setsendButtonLoading(true);

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
          setsendButtonLoading(false);
        } else {
          updateConversationTemporaryMessages(res.message_details);
          let newMessages = [...messages];
          newMessages.push(res.message_details);
          moveConversationToTop(selectedConversationID);
          setmessageToSend("");
          setmessages(newMessages);
          setsendButtonLoading(false);
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

  // const is_the_message_last_one = () => {

  // }

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
            <div
              key={message.id}
              className={`message ${
                message.sender_id === myID ? "sent" : "received"
              }`}
            >
              <p>{message.message_content}</p>
              <div className="messaging_container_messages_details">
                <p>
                  {message.sender_id !== otherPartyID &&
                  message.id === messages[messages.length - 1].id ? (
                    <>{message.is_read ? "read" : "Not Read"}</>
                  ) : null}
                </p>
                <p>
                  {new Date(message.sent_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
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
        {sendButtonLoading ? (
          <button>Loading...</button>
        ) : (
          <button onClick={sendMessage}>Send</button>
        )}
      </div>
    </div>
  );
};
