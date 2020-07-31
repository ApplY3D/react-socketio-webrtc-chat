import React from "react";
import userPhoto from "../media/logo192.png";

export default function Message({
  children,
  self,
  userName,
  time,
  photo = userPhoto,
}) {
  return (
    <div className={`message ${self ? "message--self" : ""}`}>
      {!self && (
        <div className="message__user">
          <img className="message__photo" src={photo} alt={userName} />
        </div>
      )}
      <div className="message__text">
        {!self && <div className="message__name">{userName}</div>}
        {children}
      </div>
      <div className="message__time">{time}</div>
    </div>
  );
}
