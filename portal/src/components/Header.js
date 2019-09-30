import React from "react";
import { withRouter } from "react-router"
import { Link } from "react-router-dom";
import "./Header.css";

import {connect} from "react-redux"
import {logout} from "../actions/authenticate-actions"

const mapStateToProps = state => ({
  compilation_length : state.timestamp.compilation_data.length
})


class Header extends React.Component {

  constructor() {
    super();
    this.state = {
      public:[
      '/login'],
      tabs : [{
        path: '/home',
        text: 'Home'
      }],
      actions: [{
        text:'Logout',
        action: this.logout
      }]
    }
  }

  logout() {
    this.props.logout()
  }

  render() {
    
    if(this.state.public.includes(this.props.location.pathname)){
      return null
    }

    var tabs = [];
    for( var tab of this.state.tabs){
      tabs.push( 
        <div>
            <Link to={tab.path}>{tab.text}</Link>
        </div>
        )
    }

    for( var action of this.state.actions){
      tabs.push( 
        <div onClick={action.action.bind(this)}>
            {action.text}
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


export default connect(mapStateToProps, {logout})(withRouter(Header))

