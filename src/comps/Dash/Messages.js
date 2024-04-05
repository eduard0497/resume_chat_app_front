import React, { useRef, useState, useEffect, useContext } from "react";
import MyContext from "../ContextProvider/ContextProvider";

function Messages() {
  const { socket, selectedConversationID } = useContext(MyContext);

  const [conversations, setconversations] = useState([]);
  console.log(conversations);

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

  // const markAllMessagesOfConversationAsRead = (conversationID) => {};

  useEffect(() => {
    socket.on("messages_have_been_read", (data) => {
      let conversationsCopy = conversations.map((conversation) => {
        if (conversation["conversation_id"] === data.conversation_id) {
          return {
            ...conversation,
            last_message_is_read: true,
          };
        }
        return conversation;
      });
      setconversations(conversationsCopy);
    });
  }, [socket, selectedConversationID, conversations]);

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
    <div className="height_90 row_space_between_flex_start flex_1">
      <Conversations conversations={conversations} />
      <SelectedConversation moveConversationToTop={moveConversationToTop} />
    </div>
  );
}

export default Messages;

const Conversations = ({ conversations }) => {
  const { selectedConversationID, setselectedConversationID } =
    useContext(MyContext);

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
              setselectedConversationID(conversation.conversation_id)
            }
          >
            <h3>{conversation.first_name + " " + conversation.last_name}</h3>
            {selectedConversationID !== conversation.conversation_id ? (
              <>
                {conversation.last_message_sender_id !==
                conversation.user_id ? (
                  <div>
                    <p>You: {conversation.last_message}</p>
                  </div>
                ) : (
                  <div className="row_space_between">
                    <p>{conversation.last_message}</p>
                    <p>
                      {new Date(
                        conversation.last_message_time
                      ).toLocaleDateString()}
                    </p>
                    {!conversation.last_message_is_read ? (
                      <span>new message blink</span>
                    ) : null}
                  </div>
                )}

                {/*  */}
                {/* {conversation.last_message_sender_id === conversation.user_id &&
                !conversation.last_message_is_read ? (
                  <div className="row_space_between">
                    <p>{conversation.last_message}</p>
                    <p>
                      {new Date(
                        conversation.last_message_time
                      ).toLocaleDateString()}
                    </p>
                  </div>
                ) : null} */}
              </>
            ) : null}

            {/* <p>{conversation.username}</p> */}
          </div>
        );
      })}
    </div>
  );
};

const SelectedConversation = ({ moveConversationToTop }) => {
  const { socket, selectedConversationID } = useContext(MyContext);
  //
  const [myID, setmyID] = useState(null);
  const [otherPartyID, setotherPartyID] = useState(null);
  const [messages, setmessages] = useState([]);
  const [messageToSend, setmessageToSend] = useState("");
  //
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
  }, [selectedConversationID]);

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
          console.log(res.msg);
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
            <div
              key={message.id}
              className={`message ${
                message.sender_id === myID ? "sent" : "received"
              }`}
            >
              <p>{message.message_content}</p>
              <div className="messaging_container_messages_details">
                <p>
                  {message.sender_id !== otherPartyID ? (
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

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
