import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Header from "./Header";
import Home from "./Home";
import Watch from "./Watch";

import "../node_modules/video-react/dist/video-react.css";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Route exact path="/" component={Home} />
        <Route exact path="/watch" component={Watch} />
      </Router>
    </div>
  );
}

export default App;
