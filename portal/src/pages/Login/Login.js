import React from 'react';
import { Redirect } from "react-router-dom";

import {connect} from 'react-redux'
import {loginWithCredentials} from "../../actions/authenticate-actions"

import './Login.css'


const mapStateToProps = state => ({
  attempting_login : state.authenticate.attempting_login,
  auth_token: state.authenticate.local_auth_token,
})

// Main app
class Login extends React.Component {
  constructor(props) {
    super(props);
      // Bindings
    this.state = {
      username:null,
      password:null
    }


  }

   handleUsernameChange(event) {
    this.setState({username: event.target.value});
  }

  handlePasswordChange(event) {
    this.setState({password: event.target.value});
  }


  handleSubmit(e) {
    e.preventDefault();
    this.props.loginWithCredentials(this.state)
  }

  render() {

    if(this.props.auth_token){
      return (<Redirect to={{ pathname: '/home', state: { from: this.props.location } }} />)
    }

   return (

    <div className='Modal'>
    <div className="title"> Scene Stamp </div>
    {this.props.attempting_login ? <div> Attempting login </div> : null }
      <form onSubmit= { this.handleSubmit.bind(this) }>
        <input type='text' name='username' value = {this.state.username} onChange={this.handleUsernameChange.bind(this)}  placeholder='username' required autocomplete='false'/>
        <br/>
        <input type='password' name='passowrd' value = {this.state.password} onChange={this.handlePasswordChange.bind(this)}  placeholder='password' required autocomplete='false'/>
        <br/>
        <button> Sign In</button>
      </form>
    </div>
    )
  }
}

export default connect(mapStateToProps, {loginWithCredentials})(Login)

