import React from "react";
import Loading from "../components/Loading";

export default function Video({
  connected,
  PartnerVideo,
  rejectNewCall,
  userToCall,
  UserVideo,
}) {
  return (
    <div className="modal modal--fullscreen video-window">
      <div
        className={`video__partner-wrapper ${
          connected ? "" : "video__partner-wrapper--active"
        } `}
      >
        {!connected && (
          <>
            <h3 className="u-m-2rem video__status">Connecting...</h3>
            <Loading />
          </>
        )}
        {PartnerVideo || (
          <button
            className="btn btn--danger u-m-2rem"
            onClick={() => rejectNewCall(userToCall)}
          >
            Reject call
          </button>
        )}
      </div>
      {UserVideo}
    </div>
  );
}
