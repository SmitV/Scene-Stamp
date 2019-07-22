import React from "react";
import { Player, ControlBar } from "video-react";
import "./Watch.css";

export default class Watch extends React.Component {
  constructor() {
    super();
    this.handleOnSelect = this.handleOnSelect.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmitSeries = this.handleSubmitSeries.bind(this);
    this.handleSubmitEpisode = this.handleSubmitEpisode.bind(this);
    this.handleEpisodeSelect = this.handleEpisodeSelect.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleTimeSelect = this.handleTimeSelect.bind(this);
    this.handleNewCategory = this.handleNewCategory.bind(this);
    this.handleNewChar = this.handleNewChar.bind(this);
    this.handleSubmitChar = this.handleSubmitChar.bind(this);
    this.handleSubmitCategory = this.handleSubmitCategory.bind(this);
    this.handleAddModalClose = this.handleAddModalClose.bind(this);
    this.handleCategorySelect = this.handleCategorySelect.bind(this);
    this.handleCharSelect = this.handleCharSelect.bind(this);
    this.updateTimestamp = this.updateTimestamp.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.load = this.load.bind(this);
    this.seek = this.seek.bind(this);
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
      currEpisodeId: -1,
      episode_num: "",
      episode_name: "",
      series_name: "",
      air_date: "",
      season_num: "",
      char_name: "",
      category_name: "",
      timestamps: [],
      categoryModal: false,
      charModal: false,
      characters: [],
      categories: [],
      selected_category: [],
      selected_character: [],
      selected_stamp: "",
      time: 0,
      charMap: {},
      catMap: {},
    };
  }
  componentDidMount() {
    this.queryForCategories();
    this.queryForSeries();
    this.player.subscribeToStateChange(this.handleStateChange.bind(this));
  }
  newTimestamp(time, id) {
    fetch(
      "https://scene-stamp-server.herokuapp.com/newTimestamp?start_time=" +
        time + "&episode_id=" + id
    )
    .then(resp => resp.json())
    .then(data => this.addTimestamp(data));
  }
  addTimestamp(timestamp) {
    timestamp["categories"] = [];
    timestamp["characters"] = [];
    let times = this.state.timestamps;
    times.push(timestamp);
    this.setState({timestamps: times});
  }
  updateTimestamp() {
    let data = this.state.timestamps;
    let id = 0;
    let characters = "";
    let categories = "";
    for(var timestamp in data) {
      if(data[timestamp].start_time == this.state.selected_stamp) {
        id = data[timestamp].timestamp_id;
      }
    }
    if(this.state.selected_character.length > 0) {
      for(var char in this.state.selected_character) {
        if(char != 0) {
          characters += ',';
        }
        characters += this.state.selected_character[char];
      }
    }
    if(this.state.selected_category.length > 0) {
      for(var cat in this.state.selected_category) {
        if(cat != 0) {
          categories += ',';
        }
        categories += this.state.selected_category[cat];
      }
    }
    let clear = "";
    if(categories == "") {
      clear += "&clearCategories=true";
    }
    if(characters == "") {
      clear += "&clearCharacters=true";
    }
    fetch(
      "https://scene-stamp-server.herokuapp.com/updateTimestamp?timestamp_id=" +
        id + "&character_ids=" + characters + "&category_ids=" + categories + clear
    )
    .then(resp => resp.json())
    .then(data => this.replaceEntry(data));
  }
  replaceEntry(entry) {
    let data = this.state.timestamps;
    for(var key in data) {
      if(data[key].timestamp_id == entry.timestamp_id[0]) {
        if(entry.hasOwnProperty("category_ids"))
          data[key].categories = entry.category_ids;
        else
          data[key].categories = [];
        if(entry.hasOwnProperty("character_ids"))
          data[key].characters = entry.character_ids;
        else
          data[key].characters = [];
      }
    }
    this.setState({timestamps: data});
  }
  handleStateChange(state) {
    // copy player state to this component's state
    this.setState({
      player: state
    });
  }
  play() {
    this.player.play();
  }

  pause() {
    this.player.pause();
  }

  load() {
    this.player.load();
  }

  seek(seconds) {
    this.player.seek(seconds);
  }
  handleCategorySelect(e) {
    let temp = this.state.selected_category;
    if(this.state.selected_category.includes(this.state.catMap[e.target.textContent])) {
        var index = temp.indexOf(this.state.catMap[e.target.textContent]);
        if (index > -1) {
          temp.splice(index, 1);
        }        
      } else {
        temp.push(this.state.catMap[e.target.textContent]);
    }
    this.setState({selected_category: temp});
  }
  handleCharSelect(e) {
    let temp = this.state.selected_character;
    if(this.state.selected_character.includes(this.state.charMap[e.target.textContent])) {
        var index = temp.indexOf(this.state.charMap[e.target.textContent]);
        if (index > -1) {
          temp.splice(index, 1);
        }        
      } else {
        temp.push(this.state.charMap[e.target.textContent]);
    }
    this.setState({selected_character: temp});
  }
  handleChange(evt) {
    // check it out: we get the evt.target.name (which will bmmme either "email" or "password")
    // and use it to target the key on our `state` object with the same name, using bracket syntax
    this.setState({ [evt.target.name]: evt.target.value });
  }
  handleTimeSelect(e) {
    this.setState({selected_stamp: e.target.textContent});
    let timestamp_data = {};
    for(var i in this.state.timestamps) {
      if(this.state.timestamps[i].start_time == e.target.textContent) {
        timestamp_data = this.state.timestamps[i];
      }
    }
    let cats = [];
    let chars = [];
    if(timestamp_data.hasOwnProperty('timestamp_id')) {
      if(timestamp_data.categories.length > 0) {
        for(var currCat in timestamp_data.categories) {
          for(var cat in this.state.categories) {
            if(timestamp_data.categories[currCat] == this.state.categories[cat].category_id) {
              cats.push(this.state.categories[cat].category_id);
            }
          }
        }
      }

      this.setState({selected_category: cats});

      if(timestamp_data.characters.length > 0) {
        for(var currChar in timestamp_data.characters) {
          for(var char in this.state.characters) {
            if(timestamp_data.characters[currChar] == this.state.characters[char].character_id) {
              chars.push(this.state.characters[char].character_id);
            }
          }
        }
      }
      this.setState({selected_character: chars});
    }
    this.seek(parseInt(e.target.textContent));
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
  handleAddModalClose() {
    this.setState({categoryModal: false, charModal: false});
  }
  handleEpisodeSelect(e) {
    if (e.target.value == "Create New Episode") {
      this.displayModal(e.target.value);
    } else {
      for(let curr in this.state.episodeOptions) {
          if(this.state.episodeOptions[curr].episode_name == e.target.value) {
            const path = require("./videos/" + this.state.episodeOptions[curr].episode_id + ".mp4");
            this.setState({videoFileURL: path, currEpisodeId: this.state.episodeOptions[curr].episode_id});
            this.player.load();
            let t = this;
            window.addEventListener("keydown", function(e) {
              if(e.keyCode === 67) {
                let currTime = Math.round(document.getElementsByClassName("video-react-video")[0].currentTime);
                t.newTimestamp(currTime, t.state.currEpisodeId);
              }
            });
            fetch(
              "https://scene-stamp-server.herokuapp.com/getTimestampData?episode_ids=" + 
              this.state.episodeOptions[curr].episode_id
            )
            .then(resp => resp.json())
            .then(data => this.setState({timestamps: data}));
          }
      }
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
  handleSubmitChar() {
    fetch(
      "https://scene-stamp-server.herokuapp.com/newCharacter?character_name=" +
        this.state.char_name + "&series_id=" + this.state.currSeriesId
    )
    .then(response => response.json())
    .then(data => this.addCharacter(data))
    .then(this.setState({category_name: ""}))
    .then(this.handleAddModalClose())
  }
  addCharacter(char) {
    let data = this.state.characters;
    data.push(char);
    let cMap = this.state.charMap;
    cMap[char.character_name] = char.character_id;
    this.setState({characters: data, charMap: cMap});
  }
  addCategory(category) {
    let data = this.state.categories;
    data.push(category);
    let cMap = this.state.catMap;
    cMap[category.category_name] = category.category_id;
    this.setState({categories: data, catMap: cMap});
  }
  handleSubmitCategory() {
    fetch(
      "https://scene-stamp-server.herokuapp.com/newCategory?category_name=" +
        this.state.category_name
    )
    .then(response => response.json())
    .then(data => this.addCategory(data))
    .then(this.setState({category_name: ""}))
    .then(this.handleAddModalClose());
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
  handleNewChar(e) {
    this.setState({charModal: true});
  }
  handleNewCategory(e) {
    this.setState({categoryModal: true});
  }
  displayModal(type) {
    if (type == "Create New Series") {
      this.setState({ modalOpen: true, seriesFlag: true });
    } else {
      this.setState({ modalOpen: true, seriesFlag: false });
    }
  }
  queryForSeries() {
    fetch("https://scene-stamp-server.herokuapp.com/getSeriesData")
      .then(response => response.json())
      .then(data => this.prependAppendSeries(data))
  }
  queryForEpisodes(id) {
    fetch(
      "https://scene-stamp-server.herokuapp.com/getEpisodeData?series_ids=" +
        id
    )
      .then(response => response.json())
      .then(data => this.prependAppendEpisodes(data))
      .then(this.getCharacterData(id))
  }
  queryForCategories() {
    fetch("https://scene-stamp-server.herokuapp.com/getCategoryData")
      .then(response => response.json())
      .then(data => this.createCatMap(data));
  }
  createCatMap(data) {
    let cMap = {};
    for(var i in data) {
      cMap[data[i].category_name] = data[i].category_id;
    }
    this.setState({categories: data, catMap: cMap});
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
  getCharacterData(id) {
    fetch('https://scene-stamp-server.herokuapp.com/getCharacterData?series_ids=' + id)
      .then(response => response.json())
      .then(data => this.createCharMap(data));
  }
  createCharMap(data) {
    let cMap = {};
    for(var i in data) {
      cMap[data[i].character_name] = data[i].character_id;
    }
    this.setState({ characters: data, charMap: cMap });
  }
  render() {
    return (
      <div className="watch-container" on>
        {this.state.categoryModal ? (
          <div className="watch-modal">
            <div className="modal-content"> 
              <div>
                  <span className="close" onClick={this.handleAddModalClose}>
                    &times;
                  </span>
                  <div>
                    <input
                      onChange={this.handleChange}
                      name="category_name"
                      placeholder="Enter Category.."
                    />
                    <div className="watch-modal-margin">
                      <button
                        className="watch-series-submit"
                        onClick={this.handleSubmitCategory}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ): null
        }
        {this.state.charModal ? (
          <div className="watch-modal">
            <div className="modal-content"> 
              <div>
                  <span className="close" onClick={this.handleAddModalClose}>
                    &times;
                  </span>
                  <div>
                    <input
                      onChange={this.handleChange}
                      name="char_name"
                      placeholder="Enter Character Name.."
                    />
                    <div className="watch-modal-margin">
                      <button
                        className="watch-series-submit"
                        onClick={this.handleSubmitChar}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ): null
        }
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
              <option className="watch-element" value={element.id}>{element.episode_name}</option>
            ))}
          </select>
        </div>
        <div className="video">
        <Player
          ref={player => {
            this.player = player;
          }}
          autoPlay
        >
          <source src={this.state.videoFileURL} />
          <ControlBar autoHide={false} />
        </Player>
        </div>
        <ul className="watch-scenes">
          {this.state.timestamps.map(element => (
              <li onClick={(e) => this.handleTimeSelect(e)} className={this.state.selected_stamp == element.start_time ? "selected" : ""}>
                <span>{element.start_time}</span>
              </li>
          ))}
        </ul>
        <div className="watch-settings">
            <button onClick={this.handleNewChar}>+ New Character</button>
            <ul className="watch-strip">
              {this.state.characters.map(element => (
                <button onClick={(e) => this.handleCharSelect(e)} className={this.state.selected_character.includes(element.character_id) ? "selected" : ""}>
                  <span>{element.character_name}</span>
                </button>
              ))}
            </ul>
            <button onClick={this.handleNewCategory}>+ New Category</button>
            <ul className="watch-strip">
              {this.state.categories.map(element => (
                <button onClick={(e) => this.handleCategorySelect(e)} className={this.state.selected_category.includes(element.category_id) ? "selected" : ""}>
                  <span>{element.category_name}</span>
                </button>
              ))}
            </ul>
            <button onClick={this.updateTimestamp} className="watch-save">SAVE</button>
        </div>
      </div>
    );
  }
}
