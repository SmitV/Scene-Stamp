import React from 'react';
import ReactDOM from 'react-dom';

import {connect} from "react-redux"
import {getCompilationData} from "../actions/timestamp-actions"


const mapStateToProps = state => ({
  compilation_data : state.timestamp.compilation_data
})

class Home extends React.Component {

	componentWillMount(){
		this.props.getCompilationData()
	}

  render() {

  	var vids = [];
    for( var vid of this.props.compilation_data){
      vids.push( 
       <tr>
			<td>{vid.title}</td>
		    <td>{vid.views}</td>
		</tr>
        )
    }

    return (
       	<table>
		  <tr>
		    <th>Compilation Title</th>
		    <th>Views</th>
		  </tr>
		  {vids}
		</table>
    );
  }
}

export default connect(mapStateToProps, {getCompilationData})(Home)