import React from "react";
import Message from "./Message";
import VideoWrapper from "./VideoWrapper";
import { connect } from "react-redux";
import * as actions from "../redux/actions";

import moment from "moment";

import socket from "../socket";

function Application({
  isUsersOpen,
  isMenuOpen,
  userId,
  userName,
  messages,
  roomId,
  dispatchSendMessage,
  dispatchSetUsers,
}) {
  const messagesRef = React.useRef(null);
  const [message, setMesage] = React.useState("");

  const createSocketMessage = ({ userId, userName, message }) => {
    console.log(roomId);
    socket.emit("ROOM:NEW_MESSAGE", {
      userId,
      userName,
      text: message,
      roomId,
    });
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleMessage();
    }
  };

  const handleMessage = () => {
    if (!message) return;
    try {
      createSocketMessage({ userId, userName, message });
      dispatchSendMessage({
        userName,
        userId,
        text: message,
        time: moment().format("LTS"),
      });
      setMesage("");
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    socket.on("ROOM:NEW_MESSAGE", dispatchSendMessage);
    socket.on("ROOM:SET_USERS", dispatchSetUsers);
    return () => {
      socket.off("ROOM:NEW_MESSAGE", dispatchSendMessage);
      socket.on("ROOM:SET_USERS", dispatchSetUsers);
    };
  }, []);

  React.useEffect(() => {
    messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight);
  }, [messages]);

  return (
    <main className="application">
      <div className="chat">
        <div ref={messagesRef} className="chat__canvas">
          {messages.map((message, idx) => {
            return (
              <Message
                self={message.userId === userId}
                userName={message.userName}
                time={message.time}
                key={idx}
              >
                {message.text}
              </Message>
            );
          })}
        </div>
        <div className="chat__tools">
          <div className="chat__icons"></div>
          <textarea
            onKeyDown={(e) => handleEnterKey(e)}
            value={message}
            onChange={(e) => setMesage(e.target.value)}
            rows="2"
            className="chat__text"
          ></textarea>
          <button onClick={handleMessage} className="btn btn--chat">
            Send
          </button>
        </div>
      </div>
      <VideoWrapper isMenuOpen={isMenuOpen} isUsersOpen={isUsersOpen} />
    </main>
  );
}

const mapStateToProps = ({ userId, userName, messages, roomId }) => {
  return { userId, userName, messages, roomId };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchSendMessage: ({ userName, userId, text, time }) =>
      dispatch({
        type: actions.SEND_MESSAGE,
        payload: { userName, userId, text, time },
      }),
    dispatchSetUsers: (users) =>
      dispatch({
        type: actions.SET_USERS,
        payload: { users },
      }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Application);
