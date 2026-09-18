import React, { useRef, useState } from 'react'
import '../styles/videoComponent.css'

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
  let [username, setUsername] = useState("");


  // Videos
  let [videos, setVideos] = useState([]); // All videos

  //basically checking chrome based browser
  // if (isChrome()===false) {

  // }

  return (
    <div>
      {
        askForUsername===true?
        <div>

        </div>:<></>
      }

    </div>
  )
}


