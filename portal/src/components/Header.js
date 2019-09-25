import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

import {connect} from "react-redux"
import {getTabs} from "../actions/nav-actions"
import {getCompilationData} from "../actions/timestamp-actions"

const mapStateToProps = state => ({
  tabs : state.nav.tabs,
  compilation_length : state.timestamp.compilation_data.length
})

class Header extends React.Component {

  componentWillMount(){
    this.props.getTabs();
  }

  render() {
    var tabs = [];
    for( var tab of this.props.tabs){
      tabs.push( 
        <div>
            <Link to={tab.path}>{tab.text}</Link>
        </div>
        )
    }

    return (
      <nav className="nav-container">
        <div>SCENE STAMP</div>
        <div> {this.props.compilation_length}</div>
        <div>
          {tabs}
        </div>
      </nav>
    );
  }
}


export default connect(mapStateToProps, {getTabs,getCompilationData})(Header)

