import React, { useState, useRef, useEffect } from "react";
import Users from "./Users";
import Peer from "simple-peer";
import socket from "../socket";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import IncomingCall from "./IncomingCall";
import Video from "./Video";
import SettingsMenu from "./SettingsMenu";
import useAudio from "./Audio";

import callEndSound from "../media/reject.mp3";
import callingSound from "../media/call.mp3";

function VideoWrapper({ isUsersOpen, isMenuOpen, userId, userName }) {
  const [stream, setStream] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [receivingCall, setReceivingCall] = useState(false); // уведомление что нам звонят
  const [caller, setCaller] = useState(""); // тот кто звонит нам
  const [userToCall, setUserToCall] = useState(""); // кому звоним мы
  const [callerSignal, setCallerSignal] = useState(); // сигнал звонящего
  const [callAccepted, setCallAccepted] = useState(false); // звонок принят
  const [connected, setConnected] = useState(false); // это для ловли коннекта наших пиров (момент появления видео у обоих)
  const [currentPeer, setCurrentPeer] = useState({}); // возвращаем сюда работу функций с пирами
  const [isVideoWindowOpen, setIsVideoWindowOpen] = useState(false); // окно видеочата
  const [isSoundEnabled, setIsSoundEnabled] = useState(true); // для возможности отключить звуки
  const [isPeerClosed, setIsPeerClosed] = useState(false); // чтобы про зактырии не вызывать endCall(), который неправильне значение сохраняет, а отлавливать в useEffect

  const [isPlayingCallEndSound, toggleCallEndSound] = useAudio(callEndSound);
  const [isPlayingCallingSound, toggleCallingSound] = useAudio(
    callingSound,
    true
  );

  const userVideo = useRef(null);
  const partnerVideo = useRef(null);

  const toastError = (errorText, autoClose = 3000) => {
    toast.error(errorText, {
      position: "top-center",
      autoClose: autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const toastSuccess = (errorText, autoClose = 3000) => {
    toast.success(errorText, {
      position: "top-center",
      autoClose: autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const askUserForStream = async () => {
    return navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        setStream(stream);
        const tracks = [...stream.getTracks()];
        setTracks(tracks);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
        return stream;
      });
  };

  const disableStream = async () => {
    try {
      await tracks.forEach(function (track) {
        track.stop();
      });
      if (currentPeer.removeTrack) {
        tracks.map((track) => {
          currentPeer.removeTrack(track, stream);
        });
      }
      if (userVideo.current) {
        userVideo.current.srcObject = null;
      }
      setStream(null);
      setTracks([]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isPeerClosed) {
      endCall();
      setIsPeerClosed(false);
    }
  }, [isPeerClosed]);

  useEffect(() => {
    if (isSoundEnabled) {
      if (receivingCall) {
        toggleCallingSound(true);
      } else {
        toggleCallingSound(false);
      }
    } else {
      toggleCallingSound(false);
    }
  }, [receivingCall, isSoundEnabled]);

  useEffect(() => {
    if (userVideo.current && isVideoWindowOpen && stream) {
      userVideo.current.srcObject = stream;
    }
  }, [isVideoWindowOpen]);

  useEffect(() => {
    // нам звонят
    socket.on("CALL:RECEIVE", (data) => {
      if (data.from.userId === userToCall) {
        // если люди звонят друг другу одновременно говорим попробуйте позже
        toastError("Cross call. Try again later", 4000);
        setReceivingCall(false);
        destroyCall();
        socket.emit("CALL:CANCELED_BY_USER", {
          from: userId,
          to: data.from.userId,
          status: "cross-call",
        });
      } else if (connected || callAccepted) {
        // если человек уже с кем-то говорит, то показываем ему тост и эмитим отказ звонившему, сделано вместо уведомления ему
        socket.emit("CALL:CANCELED_BY_USER", {
          from: userId,
          to: data.from.userId,
          status: "busy",
        });
        return toastSuccess(`${data.from.userName} tried to call you!`, 5000);
      } else {
        setReceivingCall(true); // для рендера сообщения о том что нам звонят
        setCaller(data.from); // сетаем того, кто нам звонит
        setCallerSignal(data.signal); // записываем сигнал звонящего
      }
    });
    return () => {
      socket.off("CALL:RECEIVE");
    };
  }, [connected, callAccepted, userToCall, caller, currentPeer]);

  useEffect(() => {
    // наш звонок отменяют
    socket.on("CALL:CANCELED", ({ status }) => {
      endCall();
      if (status === "rejected") {
        toastError("Your call canceled 😢");
      } else if (status === "busy") {
        toastError("User is talking");
      } else if (status === "cross-call") {
        toastError("Cross call. Try again later", 4000);
      }
    });

    // человек позвонил а потом решил отменить звонок
    socket.on("CALL:REJECTED_BY_OWNER", (id) => {
      toastError("Initiator decided to end call", 4000);
      cancelCall(id);
      destroyCall();
    });

    return () => {
      socket.off("CALL:CANCELED");
      socket.off("CALL:REJECTED_BY_OWNER");
    };
  }, [currentPeer]); // текущий пир здесь чтобы можно было делать destroy когда отменяет звонящий

  const callPeerAskStream = async (id) => {
    try {
      const stream = await askUserForStream();
      callPeer(id, stream);
    } catch (error) {
      console.warn(`accept call ${error}`);
    }
  };

  const acceptCallAskStream = async () => {
    try {
      if (!stream) {
        const stream = await askUserForStream();
        acceptCall(stream);
      } else {
        acceptCall(stream);
      }
    } catch (error) {
      console.warn(`accept call ${error}`);
    }
  };

  // звоним человеку
  function callPeer(id, stream) {
    // создаем по конструктору пир, мы являемся инициатором звонка
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    setUserToCall(id);
    setIsVideoWindowOpen(true);

    // наш пир отправляет сигнал пиру
    peer.on("signal", (data) => {
      socket.emit("CALL:USER", {
        userToCall: id,
        signalData: data,
        from: { userId, userName },
      });
    });

    // ловим событие что подключаемся друг к другу (появляются видео)
    peer.on("connect", (stream) => {
      setConnected(true);
    });

    // стрим другого юзера
    peer.on("stream", (stream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    peer.on("close", () => {
      setIsPeerClosed(true); // сюда попадут оба пира
    });

    peer.on("error", (error) => console.warn(error));

    // отлавливаем что он принял звонок
    socket.on("CALL:ACCEPTED", (signal) => {
      setReceivingCall(false); // чтобы убрать уведомление о звонке, когда другой человек принимает раньше
      setCallAccepted(true); // отрисовываем компонент со стримом человека
      setUserToCall(""); // мы уже дозвонились
      peer.signal(signal); // принимает сигнал
    });

    setCurrentPeer(peer);
  }

  function acceptCall(stream) {
    setIsVideoWindowOpen(true);
    setCallAccepted(true); // для отрисовки видео человека который позвонил

    // мы пир, но не инициатор звонка
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    // сигналим, т.к каждый пир должен принять сигнал другого пира
    peer.on("signal", (data) => {
      if (data?.type !== "answer") return; // костыль, ибо часто первый запрос приходит такого типа: signal: { renegotiate: true }
      socket.emit("CALL:ACCEPTED_BY_USER", {
        signal: data,
        to: caller.userId,
      });
    });

    // ловим событие что подключаемся друг к другу  (появляются видео)
    peer.on("connect", (stream) => {
      setConnected(true);
    });

    //
    peer.on("stream", (stream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
      setReceivingCall(false);
    });

    peer.on("close", () => {
      setIsPeerClosed(true); // сюда попадут оба пира
    });

    peer.on("error", (error) => console.warn(error));

    peer.signal(callerSignal);

    setCurrentPeer(peer);
  }

  const destroyCall = () => {
    if (currentPeer?.destroy) {
      currentPeer.destroy();
    }

    if (isSoundEnabled) {
      toggleCallEndSound();
    }
  };

  const endCall = async () => {
    // если мы просто полоижили трубку
    try {
      await disableStream();
      setCaller("");
      setCallerSignal();
      setCallAccepted(false);
      setIsVideoWindowOpen(false);
      setCurrentPeer({});
      setUserToCall("");
      setConnected(false);
      setStream(null);
      socket.off("CALL:ACCEPTED");
    } catch (error) {
      console.log(error);
    }
  };

  // отменяет входящий звонок
  function cancelCall(id = caller.userId) {
    socket.emit("CALL:CANCELED_BY_USER", {
      from: userId,
      to: id,
      status: "rejected",
    });
    if (isSoundEnabled) {
      toggleCallEndSound();
    }
    setReceivingCall(false); // для рендера сообщения о том что нам звонят
    setCaller(""); // сетаем того, кто нам звонит
    setCallerSignal(); // записываем сигнал звонящего
  }

  // отменяем звонок, на который еще не ответили
  function rejectNewCall(id) {
    socket.emit("CALL:REJECTED_BY_USER_WHO_CALL", {
      to: id,
      from: userId,
    });
    currentPeer.destroy();
    setUserToCall("");
  }

  let UserVideo;
  if (stream) {
    UserVideo = (
      <video
        className="video video__self"
        playsInline
        muted
        ref={userVideo}
        autoPlay
      />
    );
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = (
      <>
        <video
          className={`video ${
            connected ? "video__partner" : "video__partner--hidden"
          }`} // чтобы рамка без видео не показывалась когда он коннектится
          playsInline
          ref={partnerVideo}
          autoPlay
        />
        <button className="btn btn--danger u-m-2rem" onClick={destroyCall}>
          End Call
        </button>
      </>
    );
  }

  return (
    <>
      <SettingsMenu
        isSoundEnabled={isSoundEnabled}
        setIsSoundEnabled={setIsSoundEnabled}
        isMenuOpen={isMenuOpen}
      />
      <Users callPeerAskStream={callPeerAskStream} isUsersOpen={isUsersOpen} />
      {isVideoWindowOpen && (
        <Video
          connected={connected}
          rejectNewCall={rejectNewCall}
          userToCall={userToCall}
          PartnerVideo={PartnerVideo}
          UserVideo={UserVideo}
        />
      )}
      {receivingCall && (
        <IncomingCall
          acceptCallAskStream={acceptCallAskStream}
          cancelCall={cancelCall}
          caller={caller}
        />
      )}
      <ToastContainer />
    </>
  );
}

const mapStateToProps = ({ userId, userName }) => {
  return { userId, userName };
};

export default connect(mapStateToProps)(VideoWrapper);
