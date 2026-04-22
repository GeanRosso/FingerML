import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!window.Hands || !window.Camera) {
      setError("MediaPipe scripts not found. Check index.html.");
      return;
    }

    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      if (!isModelLoaded) setIsModelLoaded(true);

      const canvasCtx = canvasRef.current.getContext('2d');
      const videoElement = videoRef.current;

      canvasRef.current.width = videoElement.videoWidth;
      canvasRef.current.height = videoElement.videoHeight;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          window.drawConnectors(canvasCtx, landmarks, window.Hands.HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 5
          });
          window.drawLandmarks(canvasCtx, landmarks, {
            color: '#FF0000',
            lineWidth: 2
          });
        }
      }
      canvasCtx.restore();
    });

   
    if (videoRef.current) {
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  return (
    <div className="vision-container">
      <h1>Binary Hand Vision</h1>
      <p className="status">
        {isModelLoaded ? "AI ON!!!!!" : " Loading Brain..."}
      </p>

      {error && <p className="error-msg">{error}</p>}

      <div className="video-stack">
        <video ref={videoRef} className="input-video" playsInline />
        <canvas ref={canvasRef} className="output-canvas" />
      </div>
    </div>
  );
}

export default App;