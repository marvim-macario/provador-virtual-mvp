import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');
const glasses = document.getElementById('glasses');

const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

faceMesh.onResults((results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks.length > 0) {
    const keypoints = results.multiFaceLandmarks[0];
    const leftEye = keypoints[263];
    const rightEye = keypoints[33];

    const centerX = (leftEye.x + rightEye.x) / 2 * canvasElement.width;
    const centerY = (leftEye.y + rightEye.y) / 2 * canvasElement.height;
    const dist = Math.abs(leftEye.x - rightEye.x) * canvasElement.width;
    const width = dist * 2;
    const height = glasses.naturalHeight * (width / glasses.naturalWidth);

    canvasCtx.drawImage(glasses, centerX - width / 2, centerY - height / 2, width, height);
  }

  canvasCtx.restore();
});

const camera = new Camera(videoElement, {
  onFrame: async () => await faceMesh.send({ image: videoElement }),
  width: 640,
  height: 480
});

camera.start();
