import React from "react"
import "../App.css"
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HowTo from "./HowTo";

function HowToPopup(props) {

  return (props.trigger) ? (
    <div className="popup-page">
        <div className="popup-container">
            <button className="popup-button"
                onClick={() => props.setTrigger(false)}> 
                <CloseRoundedIcon/>
                { props.children }
            </button>
            <HowTo/>
        </div>
    </div>
  ) : "";

}

export default HowToPopup