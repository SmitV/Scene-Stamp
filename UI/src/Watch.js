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
    this.handleSubmitSeries = this.handleSubmitSeries.bind(this);
    this.handleSubmitEpisode = this.handleSubmitEpisode.bind(this);
    this.handleEpisodeSelect = this.handleEpisodeSelect.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      videoFileURL: "",
      videoFileObject: "",
      videoName: "",
      renderQueryData: false,
      seriesOptions: [{ series_name: "Select Series" }],
      episodeOptions: [{ episode_name: "Select Episode" }],
      modalOpen: false,
      seriesFlag: true,
      currSeriesId: -1,
      episode_num: "",
      episode_name: "",
      series_name: "",
      air_date: "",
      season_num: ""
    };
  }
  componentDidMount() {
    this.queryForSeries();
  }
  handleChange(evt) {
    // check it out: we get the evt.target.name (which will be either "email" or "password")
    // and use it to target the key on our `state` object with the same name, using bracket syntax
    this.setState({ [evt.target.name]: evt.target.value });
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
  handleSubmitSeries() {
    let seriesData = this.state.seriesOptions;
    fetch(
      "https://scene-stamp-server.herokuapp.com/newSeries?series_name=" +
        this.state.series_name
    )
      .then(res => res.json())
      .then(data => seriesData.push(data))
      .then(data =>
        this.setState({
          seriesOptions: seriesData,
          modalOpen: false,
          seriesName: ""
        })
      )
      .catch(err => console.log(err));
  }
  handleSubmitEpisode() {
    let episodeData = this.state.episodeOptions;
    let currQuery = this.state.episode_name;
    if (this.state.episode_num.length != "") {
      currQuery += "&episode=" + this.state.episode_num;
    }
    if (this.state.season_num.length != "") {
      currQuery += "&season=" + this.state.season_num;
    }
    if (this.state.air_date.length != "") {
      currQuery += "&episode=" + this.state.air_date;
    }
    fetch(
      "https://scene-stamp-server.herokuapp.com/newEpisode?series_id=" +
        this.state.currSeriesId +
        "&episode_name=" +
        this.state.series_name +
        currQuery
    )
      .then(res => res.json())
      .then(data => episodeData.push(data))
      .then(data =>
        this.setState({
          episodeOptions: episodeData,
          modalOpen: false,
          episode_num: "",
          season_num: "",
          episode_name: "",
          air_date: ""
        })
      )
      .catch(err => console.log(err));
  }
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
                    <input
                      onChange={this.handleChange}
                      name="series_name"
                      placeholder="Enter Series Name.."
                    />
                    <div className="watch-modal-margin">
                      <button
                        className="watch-series-submit"
                        onClick={this.handleSubmitSeries}
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
                    <input
                      onChange={this.handleChange}
                      name="episode_name"
                      placeholder="Enter Episode Name..*"
                    />
                    <input
                      onChange={this.handleChange}
                      name="episode_num"
                      placeholder="Enter Episode Number.."
                    />
                    <input
                      onChange={this.handleChange}
                      name="season_num"
                      placeholder="Enter Season Number.."
                    />
                    <input
                      onChange={this.handleChange}
                      name="air_date"
                      placeholder="Enter Air Date.."
                    />
                    <div className="watch-modal-margin">
                      <button
                        className="watch-series-submit"
                        onClick={this.handleSubmitEpisode}
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
