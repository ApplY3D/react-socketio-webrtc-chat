import React from "react";

import { Provider } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createStore } from "redux";
import reducer from "./redux/reducer";

import App from "./App";

function ReduxProvider() {
  const store = createStore(reducer, composeWithDevTools());
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

export default ReduxProvider;
