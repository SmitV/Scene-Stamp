import React from 'react';

import {connect} from "react-redux"
//import {} from "../../actions/timestamp-actions"

import {ACCENT_1, ACCENT_2} from "../../color-scheme"
import './Timestamp.css'


const mapStateToProps = state => ({
  episode_data: state.timestamp.episode_data,
  character_data : state.timestamp.character_data,
  category_data: state.timestamp.category_data,

  linked_videos:state.video.linked_videos
})

class Timestamp extends React.Component {

	componentWillMount(){
	}

  	render() {

      var episode = this.props.episode_data.find(ep => {return ep.episode_id === this.props.timestamp.episode_id})

      if(this.props.timestamp == null || episode === undefined){
        return (<div> No Timestamp </div>)
      }

      var createAttribute = (color, text, key) => {
        return <div  key={key}className='attribute' style={{backgroundColor:color}}> <div className='attribute-text'>{text}</div></div>
      }

      var characters = []
      this.props.timestamp.characters.forEach( (timestamp_character_id, key) => {
        var matchCharacter = this.props.character_data.find(character => {return character.character_id === timestamp_character_id})
        if(matchCharacter !== undefined){
          characters.push(createAttribute(ACCENT_1, matchCharacter.character_name, key))        
        }
      })

      var categories = []
      this.props.timestamp.categories.forEach( (timestamp_category_id, key) => {
        var matchCategory = this.props.category_data.find(category => {return category.category_id === timestamp_category_id})
        if(matchCategory !== undefined){
          categories.push(createAttribute(ACCENT_2, matchCategory.category_name, this.props.timestamp.characters.length + key))        
        }
      })
      
      var date = new Date(null)
      date.setSeconds(this.props.timestamp.start_time)
      var time = date.toTimeString().slice(3,8);

      var isEpisodeLinkedOnServer = this.props.linked_videos.find(lv => lv === episode.episode_id) !== undefined

      var linkedStatus = (this.props.linked_videos.find(lv => lv === episode.episode_id) !== undefined ? <div className='linkedStatus' style={{backgroundColor:ACCENT_2}}> ON SERVER</div> : null)

      var createTimestamp = () => {
        return <div className='timestamp'>
        <div className='inner'>
            <div className='timestamp_title'>
              <div className='episodeName'>
                {episode.episode_name}
              </div>
               {linkedStatus}
            </div>
            <span className='start_time'>{time}</span>
             <div className='attributes'>
              {characters}{categories}
            </div>
          </div>
          </div>
      }


      return (createTimestamp())
  }
}

export default connect(mapStateToProps, {})(Timestamp)