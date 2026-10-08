import React from 'react'
import { Video } from "lucide-react";
import withAuth from '../utils/withAuth'
import { Button, IconButton, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom'
import RestoreIcon from '@mui/icons-material/Restore';
import '../App.css'
import {AuthContext} from "../contexts/AuthContext.jsx"


function HomeComponent() {

    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = React.useState("");

    const { getHistoryOfUser, addToUserHistory } = React.useContext(AuthContext);
    let handleJoinVideoCall = async () => {
       await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`)
    }
    return (
        <>
            <div className='navBar'>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Video size={24} />
                    <h2>MeetSpace</h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <IconButton onClick={() => navigate("/history")}>
                        <RestoreIcon />
                    </IconButton>
                    <p style={{ fontSize: "0.9rem" }}>History</p>
                    <Button onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/auth")
                    }}>
                        Logout
                    </Button>
                </div>
            </div>
            <div className="meetContainer">

                <div className="leftPanel">
                    <div>
                        <h2>Join Video Call and enjoy seamless communication</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <TextField
                                label="Enter Meeting Code"
                                value={meetingCode}
                                onChange={(e) => setMeetingCode(e.target.value)}
                            />
                            <Button variant="contained" onClick={handleJoinVideoCall}>Join</Button>
                        </div>
                    </div>
                </div>
                <div className="rightPanel">
                    <img alt="logo" srcSet="/logo3.png" />

                </div>
            </div>
        </>
    )
}

export default withAuth(HomeComponent) 