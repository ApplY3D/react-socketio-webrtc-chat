import React from "react";
import { URL } from "../constants";
import { CopyToClipboard } from "react-copy-to-clipboard";
import userPhoto from "../media/logo192.png";

import { connect } from "react-redux";

function Users({ isUsersOpen, roomId, users, userId, callPeerAskStream }) {
  const buttonRef = React.useRef(null);

  const textCopied = () => {
    buttonRef.current.textContent = "Copied!";
    setTimeout(() => {
      buttonRef.current.textContent = "Copy Invite Link";
    }, 2000);
  };

  const inviteURL = `${URL}/room/${roomId}`;

  return (
    <div className={`users ${isUsersOpen ? "users--active" : ""} `}>
      <div className="users__head users__head--shadow">
        <p className="u-mb-min">Copy link to invite:</p>
        <input
          className="chat__text u-mb-med u-ta-c"
          type="text"
          name=""
          id=""
          value={inviteURL}
          disabled
        />
        <br />
        <CopyToClipboard text={inviteURL} onCopy={textCopied}>
          <button ref={buttonRef} className="btn">
            Copy Invite Link
          </button>
        </CopyToClipboard>
      </div>
      <div className="users__people">
        {users.map((user, idx) => {
          return (
            <div key={idx} className="user">
              <img
                className="user__photo"
                src={`${user.photo || userPhoto}`}
                alt="avatar"
              />
              <div className="user__name">{user.userName}</div>

              {user.userId !== userId && (
                <button
                  className="btn"
                  key={`${idx}call`}
                  onClick={() => callPeerAskStream(user.userId)}
                >
                  Call
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const mapStateToProps = ({ users, roomId, userId }) => {
  return { users, roomId, userId };
};

export default connect(mapStateToProps)(Users);
