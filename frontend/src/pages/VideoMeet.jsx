import React, { useEffect, useRef, useState } from 'react'
import '../styles/videoComponent.css'
import { Badge, IconButton, Button, TextField } from '@mui/material';
import { Await } from 'react-router-dom';

const server_url = "http://localhost:8080";

var connection = {}
const peerConfigConnections = {
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" }
  ]
}

export default function VideoMeetComponent() {

  // Refs
  var socketRef = useRef();
  var socketIdRef = useRef();       // Our socket ID
  var localVideoRef = useRef();      // Local video
  const videoRef = useRef([]);      // All video references


  // Device Availability
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();


  // Media Controls
  let [video, setVideo] = useState();    // Video on/off
  let [audio, setAudio] = useState();    // Mute/unmute
  let [screen, setScreen] = useState();  // Screen sharing


  // Modal
  let [showModal, setShowModal] = useState();


  // Chat
  let [message, setMessage] = useState();       // Current message
  let [newMessage, setNewMessage] = useState(0); // New message count
  let [messages, setMessages] = useState([]);   // All messages


  // User / Guest
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("")


  // Videos
  let [videos, setVideos] = useState([]); // All videos

  //basically checking chrome based browser
  // if (isChrome()===false) {

  // }
  const getPermission = async () => {

    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }
      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
      if (videoAvailable || audioAvailable) {
        //
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable
        })
        if (userMediaStream) {
          window.localStream = userMediaStream
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    getPermission();


  }, [])

  let getUserMediaSucess = ()=>{

  }
// User ke camera/mic ON/OFF state ke according naya stream lena ya tracks stop karna
  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSucess) // TODO: getUserMediaSucess
        .then((stream) = {})
        .catch((e) = console.log(e))
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop()
        })
      }
      catch (e) { }
    }
  }
  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video])

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    // connectToSocketServer();
  }

  return (
    <div>
      {
        askForUsername === true ?
          <div>
            <h2>Enter into lobby</h2>
            <TextField id="outlined-basic" label="Username" sx={{ bgcolor: 'background.paper' }} value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
            <Button variant="contained" onClick={connect}>Connect</Button>
            <div>
              <video ref={localVideoRef} autoPlay muted> </video>
            </div>
          </div> : <></>

      }

    </div>
  )

}

