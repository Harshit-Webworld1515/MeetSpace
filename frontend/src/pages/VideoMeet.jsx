import React, { useEffect, useRef, useState } from 'react'
import '../styles/videoComponent.css'
import { Badge, IconButton, Button, TextField } from '@mui/material';
import { Await } from 'react-router-dom';
import io from "socket.io-client";


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
  let [video, setVideo] = useState([]);    // Video on/off
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

  let getUserMediaSucess = () => {

  }
  // User ke camera/mic ON/OFF state ke according naya stream lena ya tracks stop karna
  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSucess) // TODO: getUserMediaSucess
        .then((stream) => {})
        .catch((error) => console.log(error))
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop()
        })
      }
      catch (e) { console.log(e) }
    }
  }
  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video])

  let gotMessageFromServer = (formId, message) => {

  }

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, {//Socket ko React ref ke current mein store kar diya.
      secure: false
    })//client ko Socket.IO server se connect karta hai.

    let addMessage = () => {

    }
    socketRef.current.on('signal', gotMessageFromServer);
    socketRef.current.on("connect", () => {
      //current webpage ke URL ki information deta h--👇
      socketRef.current.emit("join_call", window.location.href)
      socketIdRef.current = socketRef.current.id//socketIdRef.current =undefine thi pehle
      socketRef.current.on("chat_message", addMessage)

      socketRef.current.on("user_left", (id) => {
        setVideo((videos) => {
          videos.filter((video) => {
            video.socketId !== id
          })
        })
      })
      socketRef.current.on("new_user_joined", (id, clients) => {

        clients.forEach((socketListId) => {
          connection[socketListId] = new RTCPeerConnection(peerConfigConnections)//maintain a separate RTCPeerConnection for each remote participant
          connection[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }))
            }
          }
          // Remote user ki stream jab mujhe receive ho, tab mujhe bata dena
          connection[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(video => video.
              socketId === socketListId);
            //"Video references ki array mein jao, har video ko 
            // dekho, jiska socketId hamare socketListId ke equal
            // ho, us video object ko mujhe de do."
            if (videoExists) {
              setVideo(videos => {
                const updatedVideos = videos.map(video =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              })

              //if = purane remote user ki stream update karo
              // else = naye remote user ka video object create karke add karo.
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true
              }
              setVideos(videos => {
                const updatedVideos = { ...videos, newVideo };
                videoRef.current = updatedVideos;
                return updatedVideos;
              })
            }
          }
          //Kya mere browser ke paas meri camera/mic ki stream available hai?
          if (window.localStream !== undefined && window.localStream !== null) {
            //.addStream= Is peer connection mein meri local media stream add kar do
            connection[socketListId].addStream(window.localStream);
          } else {
            // TODO BLACKSILENCE
            let blackSlience
          }
        })
        if (id === socketIdRef.current) {
          for (const id2 in connection) {
            if (id2 === socketIdRef.current) continue;//connection mera khud ka hai → skip.
            try {
              //Har remote user ke WebRTC connection mein meri local camera/mic stream daal do.”
              connection[id2].addStream(window.localStream);
            } catch (e) {
              //Agar stream add karte waqt issue aaye, to connection ka local description bana setting karke SDP signaling ke through doosre user ko bhejo.
              connection[id2].setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connection[id2].localDescription })
                  )
                }
                )
                .catch(e => console.log(e));
            }
          }
        }
      })
    })
  }

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  }
  let connect = () => {
    setAskForUsername(false);
    getMedia();
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

// Socket object particular client-server connection ko represent karta hai.
// |
// ├── id
// ├── emit()
// ├── on()
// ├── disconnect()
// └── ... 