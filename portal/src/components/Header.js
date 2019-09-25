import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

import {connect} from "react-redux"
import {getTabs} from "../actions/nav-actions"

import {
  GET_TABS
} from '../actions/action-types'

const mapStateToProps = state => ({
  tabs : state.nav.tabs,
  compilation_length : state.timestamp.compilation_data.length
})

function mapDispatchToProps(dispatch) {
    return({
        tabs: () => {dispatch(GET_TABS)}
    })
}

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
        <div>SCENE STAMP {this.props.compilation_length}</div>
        <div>
          {tabs}
        </div>
      </nav>
    );
  }
}


export default connect(mapStateToProps, {getTabs})(Header)

