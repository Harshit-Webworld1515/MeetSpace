import { useEffect, useRef, useState } from 'react'
import { Badge, IconButton, Button, TextField } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import ChatIcon from '@mui/icons-material/Chat'
import { useNavigate } from "react-router-dom";

import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'

import io from "socket.io-client";
import styles from "../styles/videoComponent.module.css";


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
  let [showModal, setShowModal] = useState(true);


  // Chat
  let [message, setMessage] = useState("");       // Current message
  let [newMessages, setNewMessages] = useState(3); // New message count
  let [messages, setMessages] = useState([]);   // All messages


  // User / Guest
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("")


  // Videos
  let [videos, setVideos] = useState([]); // All videos

  //basically checking chrome based browser
  // if (isChrome()===false) {

  // }

  let routeTo = useNavigate();
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
  let getUserMediaSucess = (stream) => {
    try {
      // Purane stream ke saare tracks stop karo
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.log(error)
    }
    // Naye camera/mic stream ko current local stream banao
    window.localStream = stream
    // Apna camera video local video element mein dikhao
    localVideoRef.current.srcObject = stream;
    // Har existing peer connection ke saath naya local stream share karo
    for (const id in connection) {
      if (id === socketIdRef.current) continue;
      connection[id].addStream(window.localStream)
      // Stream add hone ke baad remote user ke liye SDP Offer banao
      connection[id].createOffer().then((description) => {
        console.log(description);
        // Offer ko local PeerConnection ka local description set karo
        connection[id].setLocalDescription(description)
          .then(() => {
            // SDP Offer ko Socket.IO signaling ke through remote user ko bhejo
            socketRef.current.emit("signal", id, JSON.stringify({
              "sdp": connection[id].localDescription
            }))
          })
          .catch(e => console.log(e))
      })
    }
    // Stream ke har track ke end hone par ye function chalega
    stream.getTracks().forEach(track => track.onended = () => {
      // UI/state mein audio aur video ko OFF karo
      setAudio(false);
      setVideo(false);
      try {
        // Current local stream ke saare tracks stop karo
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (error) {
        console.log(error);
      }

      // Camera ke badle black video aur mic ke badle silent audio stream banao
      let blackSilence = (...args) => new MediaStream([black(...args), silence()])
      // Black + silent stream ko current local stream banao
      window.localStream = blackSilence();
      // Local video element mein replacement stream dikhao
      localVideoRef.current.srcObject = window.localStream;
      // Replacement stream ko sabhi peer connections mein add karo
      for (const id in connection) {
        connection[id].addStream(window.localStream)
        // Replacement stream ke liye naya SDP Offer banao
        connection[id].createOffer().then((description) => {

          // New Offer ko local description set karo
          connection[id].setLocalDescription(description)
            .then(() => {
              // Updated SDP ko remote user ko signaling ke through bhejo
              socketRef.current.emit("signal", id, JSON.stringify({
                "sdp": connection[id].localDescription
              }))
            })
            .catch(e => console.log(e))
        })

      }
    });
  }
  // Fake silent audio track create karta hai
  let silence = () => {
    // Browser ka audio processing context create karo
    let ctx = new AudioContext()
    // Audio signal generate karne ke liye oscillator banao
    let oscillator = ctx.createOscillator()
    // Audio ko MediaStream ke form mein output karo
    let dst = oscillator.connect(ctx.createMediaStreamDestination())
    // Oscillator start karo
    oscillator.start()
    // AudioContext ko active karo
    ctx.resume()
    // Audio track ko disable karke silent track return karo
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }
  // Fake black video track create karta hai
  let black = ({
    width = 640,
    height = 480
  } = {}) => {
    // Black video ke liye canvas create karo
    let canvas = Object.assign(
      document.createElement("canvas"),
      { width, height }
    );
    // Canvas ko black color se fill karo
    canvas.getContext('2d').fillRect(0, 0, width, height);
    // Canvas ki output ko MediaStream mein convert karo
    let stream = canvas.captureStream();

    // Video track ko disable karke return karo
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
  }
  // User ke camera/mic ON/OFF state ke according naya stream lena ya tracks stop karna
  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSucess)
        .then((stream) => { })
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

  let gotMessageFromServer = (fromId, message) => {

    // 1. String ko JS object banao
    var signal = JSON.parse(message);
    // 2. Apne hi signal ko ignore karo
    if (fromId !== socketIdRef.current) {
      // 3. Agar SDP mila
      if (signal.sdp) {

        // a456 (new user) se aaya SDP,
        // b456 (existing user) ki connection mein remote description set karo.
        connection[fromId]
          .setRemoteDescription(
            new RTCSessionDescription(signal.sdp)
          )
          .then(() => {
            // 5. Agar received SDP offer hai
            if (signal.sdp.type === 'offer') {
              // 6. Us offer ka answer banao
              connection[fromId]
                .createAnswer()
                .then((description) => {
                  // 7. Apne answer ko local description banao
                  connection[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      // 8. Answer sender ko wapas bhejo
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connection[fromId].localDescription
                        })
                      );
                    });
                });
            }
          });
      }
      // 9. Agar ICE candidate mila//a456 = New User b456 = Existing User
      if (signal.ice) {// a456 → b456 ko ICE Candidate bhejta hai
        // a456 se mila ICE candidate, uski connection mein add karo.
        if (connection[fromId].remoteDescription) {
          connection[fromId]
            .addIceCandidate(
              new RTCIceCandidate(signal.ice)
            );
        }
      }
    }
  }

  let connectToSocketServer = () => {
    console.log("🔥 CONNECTING TO SOCKET SERVER");
    socketRef.current = io.connect(server_url, {//Socket ko React ref ke current mein store kar diya.
      secure: false
    })//client ko Socket.IO server se connect karta hai.

    let addMessage = (data, sender, socketIdSender) => {
      //bacend se jab bhi chat_message event aayega tab  ye function
      //  chalega aur message ko state mein add karega.
      setMessages((prevMessages) =>
        [...prevMessages,
        {
          sender: sender,
          data: data
        }
        ]);
      //Agar sender ka socketId mere socketId ke equal nahi hai, to newMessages ko increment karo.
      if (socketIdSender !== socketIdRef.current) {
        setNewMessages((prevCount) => prevCount + 1);
      }

    }
    //note:New user (a456) ne existing user (b456) ko signal bheja.
    // Ab b456 ke browser perspective se sender = a456 (fromId).
    socketRef.current.on('signal', gotMessageFromServer);
    socketRef.current.on("connect", () => {
      console.log("🔥 SOCKET CONNECTED:", socketRef.current.id);
      //current webpage ke URL ki information deta h--👇
      console.log("🔥 JOIN CALL EMIT:", window.location.href);
      socketRef.current.emit("join_call", window.location.href)
      socketIdRef.current = socketRef.current.id//socketIdRef.current =undefine thi pehle
      socketRef.current.on("chat_message", addMessage)

      socketRef.current.on("user_left", (id) => {
        setVideos((videos) => {
          return videos.filter((video) => {
            return video.socketId !== id;
          });
        });
      });
      socketRef.current.on("new_user_joined", (id, clients) => {

        console.log("🔥 NEW USER JOINED");
        console.log("id:", id);
        console.log("my socket:", socketIdRef.current);
        console.log("clients:", clients);
        clients.forEach((socketListId) => {
          connection[socketListId] = new RTCPeerConnection(peerConfigConnections)//maintain a separate RTCPeerConnection for each remote participant
          connection[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }))
            }
          }
          // Remote user ki stream jab mujhe receive ho, tab mujhe bata dena
          connection[socketListId].onaddstream = (event) => {
            console.log("🔥 ONADDSTREAM RUNNING");
            let videoExists = videoRef.current.find(video => video.
              socketId === socketListId);
            //"Video references ki array mein jao, har video ko 
            // dekho, jiska socketId hamare socketListId ke equal
            // ho, us video object ko mujhe de do."
            if (videoExists) {
              setVideos(videos => {
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
                const updatedVideos = [...videos, newVideo];
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
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            connection[socketListId].addStream(window.localStream)
          }
        })
        if (id === socketIdRef.current) {
          for (let id2 in connection) {
            if (id2 === socketIdRef.current) continue;//connection mera khud ka hai → skip.
            try {
              //Har remote user ke WebRTC connection mein meri local camera/mic stream daal do.”
              connection[id2].addStream(window.localStream);
            } catch (e) { }
            //Agar stream add karte waqt issue aaye, to connection ka local description bana setting karke SDP signaling ke through doosre user ko bhejo.
            console.log("🔥 CREATING OFFER FOR:", id2);
            connection[id2].createOffer().then((description) => {
              connection[id2].setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connection[id2].localDescription })//{    type: "offer",    sdp: "v=0\r\n..."}
                  )
                })
                .catch(e => console.log(e));
            })
          }
        }
      })
    })
  }

  let getMedia = () => {
    console.log("🔥 GET MEDIA CALLED");
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  }
  let connect = () => {
    console.log("🔥 CONNECT BUTTON CLICKED");
    setAskForUsername(false);
    getMedia();
  }

  let handleVideo = () => {
    setVideo(!video);
  }
  let handleAudio = () => {
    setAudio(!audio);
  }
  let getDisplayMediaSuccess = (stream) => {
    try {
      // Purane stream ke saare tracks stop karo
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.log(error)
    }
    window.localStream = stream
    localVideoRef.current.srcObject = stream;

    for (const id in connection) {
      if (id === socketIdRef.current) continue;
      connection[id].addStream(window.localStream);
      connection[id].createOffer().then((description) => {

        connection[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({
              "sdp": connection[id].localDescription
            }))
          })
          .catch(e => console.log(e))
      })
    }
    // Stream ke har track ke end hone par ye function chalega
    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false);
      try {
        // Current local stream ke saare tracks stop karo
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (error) {
        console.log(error);
      }

      // Camera ke badle black video aur mic ke badle silent audio stream banao
      let blackSilence = (...args) => new MediaStream([black(...args), silence()])
      // Black + silent stream ko current local stream banao
      window.localStream = blackSilence();
      // Local video element mein replacement stream dikhao
      localVideoRef.current.srcObject = window.localStream;
      getUserMedia();
    });
  }
  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => { })
          .catch((error) => console.log(error))
      }

    }
  }
  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  }
  let sendMessage = () => {
    socketRef.current.emit("chat_message", message, username);
    setMessage("");
  }

  let handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  }
  let handleEndCall = () => {
    try {
      // Current local stream ke saare tracks stop karo
      let tracks = localVideoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    } catch (error) {
      console.log(error);
    }
    routeTo("/home"); // Navigate to home page or handle error appropriately
  };

  return (
    <div>
      {
        askForUsername === true ?
          <div>
            <h2>Enter into lobby</h2>
            <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
            <Button variant="contained" onClick={connect}>Connect</Button>
            <div>
              <video ref={localVideoRef} autoPlay muted> </video>
            </div>
          </div> :
          <div className={styles.meetVideoContainer}>

            {showModal ?
              <div className={styles.chatRoom}>
                <div className={styles.chatContainer}>
                  <h2>chat</h2>
                  <div className={styles.chattingDisplay}>
                    {
                      messages.length === 0 ? <p>No messages yet</p> :
                        messages.map((item, index) => {
                          return (
                            <div key={index} className={styles.chatMessage}>
                              <p><strong>{item.sender}:</strong> {item.data}</p>
                            </div>
                          )
                        }
                        )
                    }
                  </div>
                  <div className={styles.chattingArea}>
                    <TextField
                      id="outlined-basic"
                      label="Enter in chat"
                      variant="outlined"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                    />
                    <Button variant="contained" color="primary" onClick={sendMessage}>
                      send
                    </Button>
                  </div>
                </div>

              </div> : <></>}
            <div className={styles.buttonContainers}>
              <IconButton sx={{ color: "white" }} onClick={handleVideo}>
                {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
              <IconButton sx={{ color: "red" }}
                onClick={handleEndCall}>
                <CallEndIcon />
              </IconButton>
              <IconButton sx={{ color: "white" }} onClick={handleAudio}>
                {audio === true ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
              {
                screenAvailable === true ?
                  <IconButton sx={{ color: "white" }} onClick={handleScreen}>
                    {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                  </IconButton> : <></>
              }
              <Badge badgeContent={newMessages} color='secondary' max={999} >
                <IconButton sx={{ color: "white" }} onClick={() => setShowModal(!showModal)}>
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>
            <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>


            <div className={styles.conferenceView}>
              {videos.map((video) => (

                <div key={video.socketId}>
                  {/* <h2>{video.socketId}</h2> */}
                  <video data-socket={video.socketId}
                    ref={ref => {
                      if (ref && video.stream) {
                        ref.srcObject = video.stream;
                      }
                    }}
                    autoPlay
                  >

                  </video>


                </div>


              ))
              }
            </div>
          </div>

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