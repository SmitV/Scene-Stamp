import React from "react";
import Scene from "./Scene";
import { Player } from "video-react";
import "./App.css";

export default class Home extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    var path = require("./videos/36693.mp4");
    return (
      <div className="content-container">
        <h2>Select Scenes</h2>
        <div>
          <input type="text" placeholder="Search Series..." />
          <input type="text" placeholder="Search Characters..." />
          <input type="text" placeholder="Search Categories..." />
        </div>
        <div className="scenes-container">
          <h3>Pick Scenes</h3>
          <div className="scenes-potential">
            <Scene episode="Episode 5 Season 1" />
            <Scene episode="Epside 1 Season 3" />
          </div>
          <div className="picked-header">
            <div>Current Video</div>
            <button>EXPORT</button>
          </div>
          <div className="scenes-picked" />
        </div>
        <div className="video-styles">
          <Player playsInline src={path} startTime={90} />
        </div>
      </div>
    );
  }
}
