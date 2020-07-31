import React from "react";

export default function Input() {
  return (
    <div className="users__head">
      <p className="u-mb-min">Copy link to invite:</p>
      <input
        className="chat__text u-mb-med"
        type="text"
        name=""
        id=""
        value={roomId}
      />
      <br />
      <button className="users__button">Invite friends</button>
    </div>
  );
}
