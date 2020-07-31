import React, { useState, useEffect } from "react";

const useAudio = (url) => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);
  const [replay, setReplay] = useState(false);

  const toggle = (isReplay) => {
    audio.currentTime = 0;
    if (typeof isReplay === "boolean") {
      if (isReplay) {
        setReplay(true);
        setPlaying(true);
      } else {
        setReplay(false);
        setPlaying(false);
      }
    } else {
      setReplay(false);
      setPlaying(!playing);
    }
  };

  useEffect(() => {
    playing ? audio.play() : audio.pause();
    if (!playing && replay) {
      audio.currentTime = 0;
      setPlaying(true);
    }
  }, [playing]);

  useEffect(() => {
    audio.addEventListener("ended", () => setPlaying(false));
    return () => {
      audio.removeEventListener("ended", () => setPlaying(false));
    };
  }, []);

  return [playing, toggle];
};

export default useAudio;
