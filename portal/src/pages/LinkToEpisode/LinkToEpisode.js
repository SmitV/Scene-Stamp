import React from 'react';
import { Redirect } from "react-router-dom";

import {getEpisodeData} from "../../actions/timestamp-actions"
import {getLinkedVideos, getUnlinkedVideos, resetLinkToEpisode, getLinkToEpisode} from "../../actions/video-actions"

import {connect} from 'react-redux'

import {PRIMARY, RED,GREEN} from '../../color-scheme'
import './LinkToEpisode.css'

const mapStateToProps = state => ({
  unlinked_videos: state.video.unlinked_videos,
  linked_videos : state.video.linked_videos,
  episode_data: state.timestamp.episode_data,
  link_to_episode:state.video.link_to_episode
})

// Main app
class LinkToEpisode extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      selectedUnlinkedName:null,
      selectedEpisodeId:null
    }
  } 

  updateUnlinkedVid(name){
    this.setState({
      selectedUnlinkedName : (this.state.selectedUnlinkedName === name ? null : name)
    })
  }

  updateSelectEpisodeId(id){
    this.setState({
      selectedEpisodeId : (this.state.selectedEpisodeId === id? null : id)
    })
  }

  makeNeededServerCalls(){
    console.log('make server calls need')
    this.props.getUnlinkedVideos();
    this.props.getLinkedVideos();
    this.props.getEpisodeData();

  }

  componentWillMount(){
    this.makeNeededServerCalls();
  }

  submit(){
    console.log('submit')
      this.props.getLinkToEpisode({
        unlinked_video : this.state.selectedUnlinkedName,
        episode_id : this.state.selectedEpisodeId
      })
  }

  reset(){
    this.props.resetLinkToEpisode().then(() => {
      this.makeNeededServerCalls();
    })
  }


  render() {

    if(this.props.link_to_episode){
      this.reset()
    }

    var unlinkedVideos = () => {
       return this.props.unlinked_videos.map(vid => createUnlinkedOption(vid))
    }

     var createUnlinkedOption = (uv) => {

      var classes = "option selectionOption"
      if(uv === this.state.selectedUnlinkedName) classes += ' selectedOption'

      return (
        <div className={classes} 
          onClick={() => this.updateUnlinkedVid(uv)} 
          style={(uv === this.state.selectedUnlinkedName ? {backgroundColor:PRIMARY } : {})} 
          >
          {uv}
          </div>)
    }

    var linkedVideos = () => {
       return this.props.episode_data.filter(ep => this.props.linked_videos.includes(ep.episode_id) === false).map(ep => createEpisodeOption(ep))
    }

    var createEpisodeOption = (ep) => {

      var classes = "option epOption selectionOption"
      if(ep.episode_id === this.state.selectedEpisodeId) classes += ' selectedOption'

      return(
      <div className={classes} onClick={() => this.updateSelectEpisodeId(ep.episode_id)} style={(ep.episode_id === this.state.selectedEpisodeId ? {backgroundColor:PRIMARY } : {})}>
        <div className="epName">{ep.episode_name}</div>
        {(ep.youtube_id !== null ? <a href = {'https://www.youtube.com/watch?v=' + ep.youtube_id} target="_blank" className="option epYoutubeLink" style={{backgroundColor:RED}}>Youtube Linked</a> : null)}
        </div>)
    }

    var createInfoMsg = (info) => {
      return (<div className="infoSection"><span>{info}</span></div>)
    }

    var createButton =() =>{
      return (this.state.selectedEpisodeId !== null && this.state.selectedUnlinkedName !== null ? 
        <button className="submitButton option enabled" style={{backgroundColor:GREEN}} onClick={() => this.submit()}> Link Episode </button> :
        <button className="submitButton option disabled"> Link Episode </button>)
    }


   return (

    <div className="linkToEpisode">
      <div className='main-container'>
        <div className="section">
          <div className="sectionTitle"> Unlinked Videos </div> 
          <br></br>
           {createInfoMsg('Select an Unlinked Video')}
          <div className='innerSection'>
            {unlinkedVideos()}
          </div>
        </div>
        <div className="section">
          <div className="sectionTitle"> Episodes </div>
          <br></br>
           {createInfoMsg('Select an Episode(these episodes are NOT on the video server)')}
          <div className='innerSection'>
          {linkedVideos()}
          </div>
        </div>
      </div>
      <center>{createButton()}</center>
    </div>
    )
  }
}

export default connect(mapStateToProps, {getLinkedVideos,getUnlinkedVideos,getEpisodeData,resetLinkToEpisode, getLinkToEpisode})(LinkToEpisode)

