import React from "react";
import "./Live.css";
import { connect } from "react-redux";

class Live extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="live-container">
        <span>Live Stamper</span>
      </div>
    );
  }
}

export default connect(
  null,
  {}
)(Live);
