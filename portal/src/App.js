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

function App() {

  return (
  	<Provider store={store}>
    <div className="App">
      <Router>
      	<Header />
        <Route exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
      </Router>
    </div>
    </Provider>
  );
}

export default App;
