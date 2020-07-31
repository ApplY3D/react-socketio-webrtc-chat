import React from "react";
import ReactDOM from "react-dom";
import "./scss/index.scss";
import "react-toastify/dist/ReactToastify.css";

import ReduxProvider from "./ReduxProvider";

ReactDOM.render(
  <ReduxProvider />,

  document.getElementById("root")
);
