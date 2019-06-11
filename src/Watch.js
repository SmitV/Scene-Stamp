import React from "react";
import { Player, ControlBar } from "video-react";
import "./Watch.css";

export default class Watch extends React.Component {
  constructor() {
    super();
    this.handleVideoLoad = this.handleVideoLoad.bind(this);
    this.state = {
      videoFileURL: "",
      videoFileObject: "",
      videoName: "",
      renderCategories: false
    };
  }
  handleVideoLoad(e) {
    let files = e.target.files;
    if (files.length === 1) {
      let file = files[0];
      console.log(file.name.substring(0, file.name.length - 4));
      this.setState({
        videoFileURL: URL.createObjectURL(file),
        videoFileObject: file,
        videoName: file.name
      });
    }
  }
  render() {
    return (
      <div className="watch-container">
        <form id="videoFile" className="watch-control">
          <input
            type="file"
            name="video"
            multiple="false"
            onChange={e => {
              this.handleVideoLoad(e);
            }}
          />
        </form>
        <Player ref="player" src={this.state.videoFileURL} />
      </div>
    );
  }
}
