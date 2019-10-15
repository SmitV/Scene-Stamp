import React from "react";
import { BrowserRouter as Router, Route ,Switch,Redirect} from "react-router-dom";

import {Provider} from "react-redux"
import store from "./store"

import {PRIMARY} from "./color-scheme"

//Pages
import Page from "./pages/Page"

import "./App.css";


class App extends React.Component {

  render() {

    return (
      <Provider store={store}>
        <div className="App">
          <Router>
            <Switch>
            <Page path="/linkToEpisode" />
            <Page path="/home" />
            <Page path="/login" />
            <Redirect to={{ pathname: '/home', state: { from: this.props.location } }} />
            </Switch>
          </Router>
        </div>
      </Provider>
    );

  }  
}

export default App;
