import React from 'react'

import { connect } from 'react-redux'

import Compilation_List from '../../components/Compilation_List/Compilation_List'
import Timestamp_List from '../../components/Timestamp_List/Timestamp_List'

import './Home.css'

class Home extends React.Component {
  render () {
    return (<div className="Home">
        <Compilation_List /><br/>
        <div className='timestampList'>
        <Timestamp_List />
        </div>
    </div>)
  }
}

export default connect(
  null,
  {}
)(Home)
