import '../app.css'
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className='landingPageContainer'>
      <nav>
        <div className='navHeader'>
          <h2>MeetSpace</h2>
        </div>
        <div className='navlist'>
          <p>join as guest</p>
          <p>Register</p>
          <div role='button'>
            <p>login</p>
          </div>
        </div>
      </nav>
      <div className="landingMainContainer">
        <div>
          <h1><span style={{ color: "#ff9839" }}>Connect</span> with your Loved ones</h1>
          <p>
            Join our community and connect with your loved ones, no matter the distance, through MeetSpace.
          </p>
          <div role='button' >
            <Link to={"/home"}>Get Started</Link>
          </div>
        </div>
        <div>
          <img src="/mobile.png" alt="" />
        </div>
      </div>
    </div>
  )
}
//css to jsx
//customize & pre made components of material ui