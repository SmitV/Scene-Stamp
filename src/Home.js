import React from "react";
import Scene from "./Scene";
import Strip from "./Strip";
import { Player } from "video-react";
import video from "./videos/dobrik.mp4";
import "./App.css";

export default class Home extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    var categories = ["Funny", "Dramatic", "Inspirational", "Cool"];
    var characters = ["Jon", "Tyrion", "Dany", "Sansa", "Arya"];
    return (
      <div className="content-container">
        <h2>Select Scenes</h2>
        <div>
          <input type="text" placeholder="Search Video..." />
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
          <Player playsInline src={video} startTime={90} />
        </div>
        <div>
          <Strip title="Categories" elements={categories} />
          <Strip title="Characters" elements={characters} />
        </div>
      </div>
    );
  }
}
