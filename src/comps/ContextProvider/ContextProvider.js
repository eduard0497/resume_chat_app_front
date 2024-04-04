import React, { useState, createContext } from "react";

const MyContext = createContext();

export const ContextProvider = ({ children }) => {
  const [socket, setsocket] = useState(null);
  const [selectedConversationID, setselectedConversationID] = useState(null);

  //

  const [mainTab, setmainTab] = useState("");
  const [friendsTab, setfriendsTab] = useState("");

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
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export default MyContext;
