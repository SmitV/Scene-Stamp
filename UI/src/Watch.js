import React from "react";
import { Player, ControlBar } from "video-react";
import "./Watch.css";
import Scene from "./Scene";

export default class Watch extends React.Component {
  constructor() {
    super();
    this.handleVideoLoad = this.handleVideoLoad.bind(this);
    this.handleOnSelect = this.handleOnSelect.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEpisodeSelect = this.handleEpisodeSelect.bind(this);
    this.state = {
      videoFileURL: "",
      videoFileObject: "",
      videoName: "",
      renderQueryData: false,
      seriesOptions: [{ series_name: "Select Series" }],
      episodeOptions: [{ episode_name: "Select Episode" }],
      modalOpen: false,
      seriesFlag: true,
      currSeriesId: -1
    };
  }
  componentDidMount() {
    this.queryForSeries();
  }
  handleVideoLoad(e) {
    let files = e.target.files;
    if (files.length === 1) {
      let file = files[0];
      this.setState({
        videoFileURL: URL.createObjectURL(file),
        videoFileObject: file,
        videoName: file.name
      });
    }
  }
  handleOnSelect(e) {
    if (e.target.value == "Create New Series") {
      this.displayModal(e.target.value);
    } else {
      const data = this.state.seriesOptions;
      for (var elem in data) {
        if (data[elem].series_name == e.target.value) {
          this.setState({ currSeriesId: data[elem].series_id });
          this.queryForEpisodes(data[elem].series_id);
          break;
        }
      }
    }
  }
  handleClose() {
    this.setState({ modalOpen: false });
  }
  handleEpisodeSelect(e) {
    if (e.target.value == "Create New Episode") {
      this.displayModal(e.target.value);
    }
  }
  handleSubmit(e) {}
  displayModal(type) {
    console.log("hello");
    if (type == "Create New Series") {
      this.setState({ modalOpen: true, seriesFlag: true });
    } else {
      this.setState({ modalOpen: true, seriesFlag: false });
    }
  }
  queryForSeries() {
    fetch("https://scene-stamp-server.herokuapp.com/getSeriesData")
      .then(response => response.json())
      .then(data => this.prependAppendSeries(data));
  }
  queryForEpisodes(id) {
    fetch(
      "https://scene-stamp-server.herokuapp.com/getEpisodeDataFromSeries?series_ids=" +
        id
    )
      .then(response => response.json())
      .then(data => this.prependAppendEpisodes(data));
  }

  // 50519
  prependAppendEpisodes(data) {
    data.unshift({ episode_name: "Create New Episode" });
    data.unshift({ episode_name: "Select Episode" });
    this.setState({ episodeOptions: data });
  }

  prependAppendSeries(data) {
    data.unshift({ series_name: "Create New Series" });
    data.unshift({ series_name: "Select Series" });
    this.setState({ seriesOptions: data });
  }
  render() {
    return (
      <div className="watch-container">
        {this.state.modalOpen ? (
          <div className="watch-modal">
            <div className="modal-content">
              {this.state.seriesFlag ? (
                <div>
                  <span className="close" onClick={this.handleClose}>
                    &times;
                  </span>
                  <div>
                    <input placeholder="Enter Series Name.." />
                    <div className="watch-modal-margin">
                      <button
                        className="watch-series-submit"
                        onClick={this.onSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="close" onClick={this.handleClose}>
                    &times;
                  </span>
                  <div className="watch-modal-episodes">
                    <input placeholder="Enter Episode Name..*" />
                    <input placeholder="Enter Episode Number.." />
                    <input placeholder="Enter Season Number.." />
                    <input placeholder="Enter Air Date.." />
                    <div className="watch-modal-margin">
                      <button
                        className="watch-series-submit"
                        onClick={this.onSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
        <div className="watch-elements-container">
          <select onChange={this.handleOnSelect}>
            {this.state.seriesOptions.map(element => (
              <option className="watch-element">{element.series_name}</option>
            ))}
          </select>
          <select onChange={this.handleEpisodeSelect}>
            {this.state.episodeOptions.map(element => (
              <option className="watch-element">{element.episode_name}</option>
            ))}
          </select>
        </div>
        <div className="video">
          <Player ref="player" src={this.state.videoFileURL} />
        </div>
        <div className="watch-scenes">
          <Scene episode="Episode 5 Season 1" />
          <Scene episode="Epside 1 Season 3" />
        </div>
      </div>
    );
  }
}
