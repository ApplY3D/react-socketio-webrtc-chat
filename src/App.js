import React from "react";
import Login from "./components/Login";
import Header from "./components/Header";
import Application from "./components/Application";

import { connect } from "react-redux";

function App({ joined }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isUsersOpen, setIsUsersOpen] = React.useState(false);

  if (!joined) {
    return (
      <div className="container">
        <Login />
      </div>
    );
  } else {
    return (
      <div className="container">
        <Header
          setIsMenuOpen={setIsMenuOpen}
          setIsUsersOpen={setIsUsersOpen}
          isMenuOpen={isMenuOpen}
          isUsersOpen={isUsersOpen}
        />
        <Application isMenuOpen={isMenuOpen} isUsersOpen={isUsersOpen} />
      </div>
    );
  }
}

const mapStateToProps = ({ joined }) => {
  return { joined };
};

export default connect(mapStateToProps)(App);
