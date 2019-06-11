import React from "react";
import { Link } from "react-router-dom";
import "./Nav.css";

export default class Header extends React.Component {
  render() {
    return (
      <nav className="nav-container">
        <div>SCENE STAMP</div>
        <div>
          <div>
            <Link to="/">Home</Link>
          </div>
          <div>
            <Link to="/watch">Watch</Link>
          </div>
        </div>
      </nav>
    );
  }
}
