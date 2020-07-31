import React from "react";

export default function IncomingCall({
  acceptCallAskStream,
  cancelCall,
  caller,
}) {
  return (
    <div className="modal modal--mini incoming-call">
      <h2>{caller.userName} is calling you</h2>
      <div className="incoming-call__buttons">
        <button className="btn u-m-2rem" onClick={() => acceptCallAskStream()}>
          Accept
        </button>
        <button
          className="btn btn--danger u-m-2rem"
          onClick={() => cancelCall()}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
