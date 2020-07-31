import React from "react";
import { connect } from "react-redux";
import * as actions from "../redux/actions";
import axios from "axios";

import socket from "../socket";

function Login({ dispatchSignIn, dispatchSetData, dispatchSetUserId, userId }) {
  const [nameValue, setNameValue] = React.useState("");
  const [roomId, setRoomId] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const getCurrentRoomId = () => {
    return roomId ? roomId : userId;
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSignIn();
    }
  };

  const handleSignIn = async () => {
    if (!nameValue) {
      return alert("Нельзя оставлять пустые поля");
    }
    try {
      if (loading) return;

      setLoading(true);

      await axios.post("/rooms", {
        roomId: getCurrentRoomId(),
        userName: nameValue,
        userId,
      });

      socket.emit("ROOM:JOIN", {
        roomId: getCurrentRoomId(),
        userName: nameValue,
      });

      const res = await axios.get(`/room/${getCurrentRoomId()}`);

      dispatchSetData(res.data);
      //setUsers(res.data.users);

      dispatchSignIn(nameValue);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const gotIdFromSocket = (id) => {
    dispatchSetUserId(id);
    setLoading(false);
  };

  React.useEffect(() => {
    socket.on("id", gotIdFromSocket);

    const path = window.location.pathname.split("/");
    if (path[1] === "room" && path[2]) {
      setRoomId(path[2]);
    } else {
      setRoomId("");
    }

    return () => socket.off("id", gotIdFromSocket);
  }, []);

  return (
    <div className="modal">
      <div className="users__head">
        <p className="u-mb-min">Enter your name:</p>
        <input
          onKeyDown={(e) => handleEnterKey(e)}
          value={nameValue}
          className="chat__text u-mb-med u-ta-c u-width-50"
          onChange={(e) => setNameValue(e.target.value)}
          type="text"
          name=""
          id=""
        />
        <br />
        <button disabled={loading} onClick={handleSignIn} className="btn">
          {loading && "Loading..."}
          {!loading && (roomId ? "Accept Invite" : "Create Room")}
        </button>
      </div>
    </div>
  );
}

const mapStateToProps = ({ userId }) => {
  return { userId };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchSignIn: (userName) =>
      dispatch({
        type: actions.ADD_NAME,
        payload: { userName },
      }),
    dispatchSetData: (data) => {
      dispatch({ type: actions.SET_DATA, payload: data });
    },
    dispatchSetUserId: (id) => {
      dispatch({ type: actions.SET_ID, payload: id });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
