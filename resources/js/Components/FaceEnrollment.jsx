import { useEffect } from 'react';
import { useFaceLiveness } from '../hooks/useFaceLiveness';
import axios from 'axios';

const STEP_LABELS = {
  loading: 'Naglo-load ng face detection...',
  detecting_face: 'Tumingin nang direkta sa camera',
  turn_left: 'Ibaling nang bahagya ang ulo sa KALIWA',
  turn_right: 'Ibaling nang bahagya ang ulo sa KANAN',
  blink: 'Kumurap nang dalawang beses',
  capturing: 'Kinukuha ang larawan...',
  complete: 'Tapos na! Naiscan ang mukha mo.',
};

const STEP_ORDER = ['detecting_face', 'turn_left', 'turn_right', 'blink', 'capturing'];

export default function FaceEnrollment({ userId, onSuccess, onCancel }) {
  const { videoRef, status, error, descriptor, start, stop } = useFaceLiveness({
    onComplete: async (finalDescriptor) => {
      try {
        await axios.post('/volunteer/face-enrollment', {
          user_id: userId,
          descriptor: finalDescriptor,
        });
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error('Failed to save face enrollment:', err);
      }
    },
  });

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStepPosition = STEP_ORDER.indexOf(status);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[480px] h-[360px] rounded-lg overflow-hidden border-2 border-red-600 bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]" // mirrored for natural selfie feel
          muted
          playsInline
        />
        {/* Oval face guide overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[220px] h-[280px] border-4 border-white/60 rounded-[50%]" />
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex gap-2">
        {STEP_ORDER.map((step, idx) => (
          <div
            key={step}
            className={`h-2 w-12 rounded-full transition-colors ${
              idx < currentStepPosition
                ? 'bg-green-500'
                : idx === currentStepPosition
                ? 'bg-red-600 animate-pulse'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <p className="text-lg font-semibold text-center">
        {error ? error : STEP_LABELS[status]}
      </p>

      {status === 'complete' && (
        <p className="text-green-600 font-medium">✓ Matagumpay na na-enroll ang mukha mo</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium"
        >
          Cancel
        </button>
        {error && (
          <button
            onClick={start}
            className="px-6 py-2 rounded-lg bg-black text-white font-medium"
          >
            Ulitin
          </button>
        )}
      </div>
    </div>
  );
}