import React from "react";
import "./Strip.css";

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    e.preventDefault();
  }
  render() {
    return (
      <div className="strip-container">
        <h2>{this.props.title}</h2>
        <div className="strip-elements">
          {this.props.elements.map(element => (
            <button className="strip-element">{element}</button>
          ))}
        </div>
      </div>
    );
  }
}
