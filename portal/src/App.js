import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import {Provider} from "react-redux"
import store from "./store"

//Components
import Header from "./components/Header"

//Pages
import Home from "./pages/Home";
import Login from "./pages/Login";

import "./App.css";



class Page extends React.Component {

  render() {
    return (
      <div >
        <div className="Page">
          <Route  exact path={this.props.path} component={this.props.component} />
          </div>
      </div>
      )
  }
}



class App extends React.Component {


  render() {

    return (
      <Provider store={store}>
    <div className="App">
      <Router>
        <Header />
        <Page exact path="/" component={Home} />
        <Page exact path="/login" component={Login} />
      </Router>
    </div>
    </Provider>
    );

  }  
}

export default App;
