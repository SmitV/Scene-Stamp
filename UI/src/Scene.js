import React from "react";
import "./Scene.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faCheck } from "@fortawesome/free-solid-svg-icons";

export default class Header extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  secondsToMinutes(time) {
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
  }
  handleClick(e) {
    e.preventDefault();
  }
  render() {
    return (
      <div className="scene-container">
        <div>{this.props.episode}</div>
        <div>
          <div className="scene-start-time">
            Start Time: {this.secondsToMinutes(30)}
          </div>
          <div>
            <FontAwesomeIcon
              icon={faPlay}
              className="icon-play icons"
              onClick={this.handleClick}
            />
            <FontAwesomeIcon icon={faCheck} className="icon-check icons" />
          </div>
        </div>
      </div>
    );
  }
}
