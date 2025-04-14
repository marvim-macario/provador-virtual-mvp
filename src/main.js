import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const startButton = document.getElementById('startButton');
const modal = document.getElementById('modal');
const container = document.getElementById('container');
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');
const instructions = document.getElementById('instructions');
const progressBar = document.getElementById('progressBar');

let detectionCount = 0;
let phase = 0;
const steps = [
  'Centralize o rosto',
  'Vire levemente para a direita',
  'Agora para a esquerda',
  'Incline levemente para cima',
  'Incline para baixo',
  'Captura completa!'
];

let capturedLandmarks = null;
let cameraInstance = null;

const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

faceMesh.onResults((results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks.length > 0) {
    detectionCount++;

    if (detectionCount % 100 === 0 && phase < steps.length - 1) {
      phase++;
    }

    instructions.innerText = steps[phase];
    progressBar.style.width = `${(phase / (steps.length - 1)) * 100}%`;

    const landmarks = results.multiFaceLandmarks[0];
    const faceImage = canvasElement.toDataURL('image/jpeg')

    canvasCtx.lineWidth = 0.5;
    canvasCtx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    canvasCtx.fillStyle = '#00ffff';
    canvasCtx.shadowBlur = 10;
    canvasCtx.shadowColor = '#00ffff';

    for (let i = 0; i < landmarks.length; i++) {
      const x = landmarks[i].x * canvasElement.width;
      const y = landmarks[i].y * canvasElement.height;

      canvasCtx.beginPath();
      canvasCtx.arc(x, y, 2, 0, 2 * Math.PI);
      canvasCtx.fill();
    }

    if (phase === steps.length - 1) {
      capturedLandmarks = landmarks;
      if (cameraInstance) {
        cameraInstance.stop(); // só para se estiver iniciado
      }
      modal.style.display = 'none';
      startButton.style.display = 'block';
     
      // Aqui você pode enviar para o backend com fetch/AJAX se desejar.
    }
    

  }


  canvasCtx.restore();
});

startButton.addEventListener('click', () => {
        startButton.style.display = 'none';
        modal.style.display = 'flex';

        const camera = new Camera(videoElement, {
          onFrame: async () => {
            await faceMesh.send({ image: videoElement });
          },
          width: 640,
          height: 480,
        });

        camera.start();
      });