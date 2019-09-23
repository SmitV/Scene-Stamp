import React from 'react';
import ReactDOM from 'react-dom';

// Main app
export default class Login extends React.Component {
  constructor(props) {
    super(props);
      // Bindings
  }

  handleSubmit(e) {
    e.preventDefault();
    return false;
  }
  render() {

    // const for React CSS transition declaration
    return <Modal onSubmit={ this.handleSubmit } key='modal'/>;
  }
}

// Modal
class Modal extends React.Component {
  render() {
    return <div className='Modal'>
              <form onSubmit= { this.props.onSubmit }>
                <Input type='text' name='username' placeholder='username' />
                <Input type='password' name='password' placeholder='password' />
                <button> Sign In</button>
              </form>
                <a href='#'>Lost your password ?</a>
           </div>
  }
}

// Generic input field
class Input extends React.Component {
  render() {
    return <div className='Input'>
        <input type={ this.props.type } name={ this.props.name } placeholder={ this.props.placeholder } required autocomplete='false'/>
        <label for={ this.props.name } ></label>
      </div>
  }

}

