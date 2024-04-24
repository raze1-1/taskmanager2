import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import store from "./redux/store";
import { setCredentials } from "./redux/slices/authSlice.js";

const userInfo = localStorage.getItem("userInfo");
if (userInfo) {
  // If user info exists, parse and set it as the initial user state
  store.dispatch(setCredentials(JSON.parse(userInfo)));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
