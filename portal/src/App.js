import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import {Provider} from "react-redux"
import store from "./store"

import {PRIMARY} from "./color-scheme"

//Pages
import Page from "./pages/Page"
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";

import "./App.css";


class App extends React.Component {

  render() {

    return (
      <Provider store={store}>
        <div className="App">
          <Router>
            <Page  path="/home" component={Home} />
            <Route path="/login" component={Login} />
          </Router>
        </div>
      </Provider>
    );

  }  
}

export default App;
