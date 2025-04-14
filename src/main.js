import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const startButton = document.getElementById('startButton');
const modal = document.getElementById('modal');
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
    canvasCtx.lineWidth = 0.5;
    canvasCtx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    canvasCtx.fillStyle = '#00ffff';
    canvasCtx.shadowBlur = 10;
    canvasCtx.shadowColor = '#00ffff';

    //Desenhar pontos
    for (let i = 0; i < landmarks.length; i++) {
      const x = landmarks[i].x * canvasElement.width;
      const y = landmarks[i].y * canvasElement.height;

      canvasCtx.beginPath();
      canvasCtx.arc(x, y, 2, 0, 2 * Math.PI);
      canvasCtx.fill();
    }

    // Desenhar linhas entre landmarks próximos (exemplo básico para olhos)
    const pairs = [
      [33, 133], // olho esquerdo
      [362, 263], // olho direito
      [1, 199], // centro testa ao queixo
      [234, 454], // lateral do rosto
    ];

    for (let [start, end] of pairs) {
      const x1 = landmarks[start].x * canvasElement.width;
      const y1 = landmarks[start].y * canvasElement.height;
      const x2 = landmarks[end].x * canvasElement.width;
      const y2 = landmarks[end].y * canvasElement.height;

      canvasCtx.beginPath();
      canvasCtx.moveTo(x1, y1);
      canvasCtx.lineTo(x2, y2);
      canvasCtx.stroke();
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