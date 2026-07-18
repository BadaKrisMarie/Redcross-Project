import { useRef, useState, useCallback, useEffect } from 'react';
import * as faceapi from 'face-api.js';

// Liveness challenge sequence for enrollment
const STEPS = ['loading', 'detecting_face', 'turn_left', 'turn_right', 'blink', 'capturing', 'complete'];

// Thresholds tuned to be forgiving (less strict) per project requirements
const TURN_THRESHOLD = 0.12;       // how far nose must shift from eye-midpoint (normalized by face width)
const EAR_BLINK_THRESHOLD = 0.23;  // eye aspect ratio below this = eye considered closed
const BLINKS_REQUIRED = 2;
const HOLD_FRAMES_REQUIRED = 4;    // consecutive frames needed to confirm a turn (avoids false positives from jitter)

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

// Eye Aspect Ratio - standard formula using 6 landmark points per eye
function getEAR(eyePoints) {
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const vertical1 = dist(eyePoints[1], eyePoints[5]);
  const vertical2 = dist(eyePoints[2], eyePoints[4]);
  const horizontal = dist(eyePoints[0], eyePoints[3]);
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

export function useFaceLiveness({ onComplete } = {}) {
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const holdCounterRef = useRef(0);
  const blinkCountRef = useRef(0);
  const wasEyeClosedRef = useRef(false);
  const stepIndexRef = useRef(0);

  const [status, setStatus] = useState('loading'); // mirrors STEPS
  const [error, setError] = useState(null);
  const [descriptor, setDescriptor] = useState(null);

  const setStep = (step) => {
    stepIndexRef.current = STEPS.indexOf(step);
    holdCounterRef.current = 0;
    setStatus(step);
  };

  const start = useCallback(async () => {
    try {
      setError(null);
      setStep('loading');
      await loadModels();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      blinkCountRef.current = 0;
      wasEyeClosedRef.current = false;
      setStep('detecting_face');
      detectLoop();
    } catch (err) {
      setError('Hindi ma-access ang camera. Paki-check ang permissions.');
      console.error(err);
    }
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
  }, []);

  const detectLoop = useCallback(() => {
    const tick = async () => {
      const video = videoRef.current;
      if (!video || video.readyState !== 4) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const result = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!result) {
        // no face in frame, reset hold counter but keep current step
        holdCounterRef.current = 0;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const landmarks = result.landmarks;
      const nose = landmarks.getNose();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const jaw = landmarks.getJawOutline();

      const faceWidth = jaw[16].x - jaw[0].x;
      const eyeMidX = (leftEye[0].x + rightEye[3].x) / 2;
      const noseTipX = nose[3].x;
      const turnOffset = (noseTipX - eyeMidX) / faceWidth; // + = turned toward one side, - = other

      const currentStep = STEPS[stepIndexRef.current];

      if (currentStep === 'detecting_face') {
        holdCounterRef.current += 1;
        if (holdCounterRef.current >= HOLD_FRAMES_REQUIRED) setStep('turn_left');
      } else if (currentStep === 'turn_left') {
        // note: mirror video means "user's left" appears as negative offset on screen
        if (turnOffset < -TURN_THRESHOLD) {
          holdCounterRef.current += 1;
          if (holdCounterRef.current >= HOLD_FRAMES_REQUIRED) setStep('turn_right');
        } else {
          holdCounterRef.current = 0;
        }
      } else if (currentStep === 'turn_right') {
        if (turnOffset > TURN_THRESHOLD) {
          holdCounterRef.current += 1;
          if (holdCounterRef.current >= HOLD_FRAMES_REQUIRED) setStep('blink');
        } else {
          holdCounterRef.current = 0;
        }
      } else if (currentStep === 'blink') {
        const avgEAR = (getEAR(leftEye) + getEAR(rightEye)) / 2;
        const eyeClosed = avgEAR < EAR_BLINK_THRESHOLD;

        if (eyeClosed && !wasEyeClosedRef.current) {
          wasEyeClosedRef.current = true;
        } else if (!eyeClosed && wasEyeClosedRef.current) {
          wasEyeClosedRef.current = false;
          blinkCountRef.current += 1;
        }

        if (blinkCountRef.current >= BLINKS_REQUIRED) {
          setStep('capturing');
        }
      } else if (currentStep === 'capturing') {
        const finalDescriptor = Array.from(result.descriptor);
        setDescriptor(finalDescriptor);
        setStep('complete');
        stop();
        if (onComplete) onComplete(finalDescriptor);
        return; // stop the loop
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [onComplete, stop]);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, status, error, descriptor, start, stop };
}