import React from "react";
import { withRouter } from "react-router"
import { Link } from "react-router-dom";

import "./Header.css";
import {ACCENT_1} from "../../color-scheme"

import {connect} from "react-redux"
import {logout} from "../../actions/authenticate-actions"

const mapStateToProps = state => ({
})


export class Header extends React.Component {

  constructor() {
    super();
    this.state = {
      noHeader:[
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
    
    if(this.state.noHeader.includes(this.props.location.pathname)){
      return null
    }

    var tabs = [];
    this.state.tabs.forEach((tab, index) => {
      tabs.push( 
        <div key={index} >
            <Link to={tab.path}>{tab.text}</Link>
        </div>
        )
    })

    this.state.actions.forEach((action, index)=>{
      tabs.push( 
        <div key={this.state.tabs.length + index} onClick={action.action.bind(this)}>
            <div className='actionHeader'>{action.text}</div>
        </div>
        )
    })

    return (
      <nav id="mainNavBar" className="nav-container">
        <div id="navBarTitle">SCENE STAMP</div>
        <div id="navBarHeaders" style={{backgroundColor:ACCENT_1 }}>
          {tabs}
        </div>
      </nav>
    );
  }
}


export default connect(mapStateToProps, {logout})(withRouter(Header))

