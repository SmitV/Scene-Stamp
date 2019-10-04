import React from 'react';

import {connect} from "react-redux"
import {getCompilationData, newCompilation} from "../actions/timestamp-actions"


const mapStateToProps = state => ({
  compilation_data : state.timestamp.compilation_data
})

class Home extends React.Component {

	componentWillMount(){
		if(this.props.compilation_data.length === 0) this.props.getCompilationData()
	}

	createNewCompilation(e) {
		e.preventDefault();
		this.props.newCompilation();
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
    	<div>
       	<table>
		  <tr>
		    <th>Compilation Title</th>
		    <th>Views</th>
		  </tr>
		  {vids}
		</table>
		<button onClick={this.createNewCompilation.bind(this)}>New Compilation</button>
		</div>
    );
  }
}

export default connect(mapStateToProps, {getCompilationData, newCompilation})(Home)