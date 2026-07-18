import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

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

function getEAR(eyePoints) {
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const vertical1 = dist(eyePoints[1], eyePoints[5]);
  const vertical2 = dist(eyePoints[2], eyePoints[4]);
  const horizontal = dist(eyePoints[0], eyePoints[3]);
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

// How close a match needs to be to count as "same person".
// face-api.js uses Euclidean distance - lower = more similar. 0.5-0.6 is the typical safe range.
const MATCH_THRESHOLD = 0.5;
const STABLE_FRAMES_REQUIRED = 10; // ~ half a second of steady, well-aligned face before auto-capture
const EAR_ALIVE_THRESHOLD = 0.23; // used as a lightweight passive liveness signal (natural blink at some point)

export default function FaceAttendanceCapture({ userId, mode = 'time_in', onSuccess }) {
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const stableCounterRef = useRef(0);
  const sawBlinkRef = useRef(false);
  const wasEyeClosedRef = useRef(false);
  const referenceDescriptorRef = useRef(null);
  const processingRef = useRef(false);

  const [phase, setPhase] = useState('loading'); // loading | scanning | matching | success | failed | no_face
  const [message, setMessage] = useState('Naghahanda...');

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
  }, []);

  const submitAttendance = useCallback(
    async (descriptor) => {
      processingRef.current = true;
      setPhase('matching');
      setMessage('Kina-kumpirma ang pagkakakilanlan...');
      try {
        const { data } = await axios.post('/volunteer/attendance/face-verify', {
          user_id: userId,
          mode, // 'time_in' or 'time_out'
          descriptor: Array.from(descriptor),
        });
        setPhase('success');
        setMessage('Verified! Naitala ang iyong attendance.');
        stop();
        if (onSuccess) onSuccess(data);
      } catch (err) {
        setPhase('failed');
        setMessage(
          err.response?.status === 401
            ? 'Hindi tumugma ang mukha. Subukan ulit.'
            : 'May error, subukan ulit.'
        );
        // allow retry after a short pause
        setTimeout(() => {
          processingRef.current = false;
          stableCounterRef.current = 0;
          sawBlinkRef.current = false;
          setPhase('scanning');
          setMessage('Iposisyon ang mukha sa loob ng frame');
        }, 2000);
      }
    },
    [userId, mode, stop, onSuccess]
  );

  const detectLoop = useCallback(() => {
    const tick = async () => {
      if (processingRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

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
        stableCounterRef.current = 0;
        setPhase('no_face');
        setMessage('Walang nakikitang mukha. Umayos sa loob ng frame.');
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // passive liveness signal: has the person blinked naturally at least once?
      const leftEye = result.landmarks.getLeftEye();
      const rightEye = result.landmarks.getRightEye();
      const avgEAR = (getEAR(leftEye) + getEAR(rightEye)) / 2;
      const eyeClosed = avgEAR < EAR_ALIVE_THRESHOLD;
      if (eyeClosed) wasEyeClosedRef.current = true;
      if (!eyeClosed && wasEyeClosedRef.current) sawBlinkRef.current = true;

      // is the face reasonably large/centered (i.e. user positioned themselves properly)?
      const box = result.detection.box;
      const videoArea = video.videoWidth * video.videoHeight;
      const faceArea = box.width * box.height;
      const faceRatio = faceArea / videoArea;
      const wellPositioned = faceRatio > 0.08 && faceRatio < 0.6;

      if (wellPositioned) {
        stableCounterRef.current += 1;
        setPhase('scanning');
        setMessage('Huwag gumalaw...');
      } else {
        stableCounterRef.current = 0;
        setPhase('scanning');
        setMessage('Ilapit o layuan nang kaunti ang mukha');
      }

      if (stableCounterRef.current >= STABLE_FRAMES_REQUIRED) {
        // auto-capture, no button press needed - mirrors GCash-style verification
        submitAttendance(result.descriptor);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [submitAttendance]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: 'user' },
        });
        if (!isMounted) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setPhase('scanning');
        setMessage('Iposisyon ang mukha sa loob ng frame');
        detectLoop();
      } catch (err) {
        setPhase('failed');
        setMessage('Hindi ma-access ang camera.');
        console.error(err);
      }
    })();

    return () => {
      isMounted = false;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[480px] h-[360px] rounded-lg overflow-hidden border-2 border-red-600 bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]"
          muted
          playsInline
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-[220px] h-[280px] border-4 rounded-[50%] transition-colors ${
              phase === 'success'
                ? 'border-green-500'
                : phase === 'failed'
                ? 'border-red-500'
                : 'border-white/60'
            }`}
          />
        </div>
      </div>
      <p className="text-base font-medium text-center">{message}</p>
    </div>
  );
}
