import React from "react";
import BeatLoader from "react-spinners/BeatLoader";

function LoadingScreen() {
  return (
    <div className="loading_entire_screen">
      <BeatLoader color="#7289da" loading margin={0} size={40} />
    </div>
  );
}

export default LoadingScreen;
