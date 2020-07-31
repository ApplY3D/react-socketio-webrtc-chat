import React from "react";
import groupLogo from "../media/group.svg";

import { connect } from "react-redux";

function Header({
  isMenuOpen,
  setIsMenuOpen,
  isUsersOpen,
  setIsUsersOpen,
  users,
}) {
  return (
    <header className="header">
      <div className="header__menu-wrap">
        <input
          id="header__menu-checkbox"
          className="header__menu-checkbox"
          type="checkbox"
          checked={isMenuOpen}
          onChange={(e) => setIsMenuOpen(e.target.checked)}
        />
        <label htmlFor="header__menu-checkbox" className="header__menu">
          <span className="header__menu-icon">&nbsp;</span>
        </label>
      </div>
      <div className="header__text">New chat</div>
      <div className="header__users-wrap">
        <input
          id="header__users-checkbox"
          className="header__users-checkbox"
          type="checkbox"
          checked={isUsersOpen}
          onChange={(e) => setIsUsersOpen(e.target.checked)}
        />
        <label htmlFor="header__users-checkbox" className="header__users">
          <img className="header__users-icon" src={groupLogo} alt="Users" />
        </label>
        <span className="header__user-count">{users.length || ""}</span>
      </div>
    </header>
  );
}

const mapStateToProps = ({ users }) => {
  return { users };
};

export default connect(mapStateToProps)(Header);
