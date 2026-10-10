import '../app.css'
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/landing.module.css";
import LoginIcon from '@mui/icons-material/Login';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';



export default function LandingPage() {
  let routeTo = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.landingPageContainer}>
      <nav>
        <div className={styles.logo}>
          <img
            src="/video_logo.png"
            alt="MeetSpace Logo"
          />
          <span>MeetSpace</span>
        </div>
        <button
          className={styles.menuButton}
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <CloseIcon /> : <MenuOutlinedIcon />}
        </button>
        <div className={`${styles.navlist} ${menuOpen ? styles.showMenu : ""}`}>
          <p onClick={() => {
            routeTo("/randomnew")
          }}>join as guest</p>
          <p onClick={() => {
            routeTo("/auth")
          }}>Register</p>
          <div onClick={() => {
            routeTo("/auth")
          }} role='button'>
            <p>
              <LoginIcon />
            </p>
          </div>
        </div>
      </nav>
      <div className={styles.landingMainContainer}>
        <div className={styles.heroText}>
          <h1><span style={{ color: "#ff9839" }}>Connect</span> with your Loved ones</h1>
          <p>
            Join our community and connect with your loved ones, no matter the distance, through MeetSpace.
          </p>
          <div role='button' >
            <Link to={"/auth"}>Get Started</Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <img src="/mobile.png" alt="" />
        </div>
      </div>
    </div>
  )
}
