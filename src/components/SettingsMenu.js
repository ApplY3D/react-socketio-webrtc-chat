import React from "react";

export default function SettingsMenu({
  isMenuOpen,
  isSoundEnabled,
  setIsSoundEnabled,
}) {
  return (
    <div className={`menu ${isMenuOpen ? "menu--active" : ""}`}>
      <div className="menu__wrapper">
        <div className="menu__item">
          <h2>Settings</h2>
          <br />
        </div>
        <br />
        <div className="menu__item">
          <input
            checked={isSoundEnabled}
            className="checkbox"
            type="checkbox"
            id="switch"
            onChange={(e) => setIsSoundEnabled(e.target.checked)}
          />
          <label className="checkbox__label" htmlFor="switch">
            <span></span> Enable sound
          </label>
        </div>
      </div>
    </div>
  );
}
