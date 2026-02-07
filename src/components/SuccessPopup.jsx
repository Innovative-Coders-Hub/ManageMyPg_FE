import React, { useEffect } from "react";
import Confetti from "react-confetti";

export default function SuccessPopup({ onClose }) {
const [size, setSize] = React.useState({
  width: window.innerWidth,
  height: window.innerHeight,
});


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Confetti */}
      <Confetti width={size.width} height={size.height} numberOfPieces={250} />

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-xl p-8 max-w-md text-center animate-scaleIn">
        <div className="text-5xl mb-3">🎉</div>

        <h2 className="text-2xl font-extrabold text-gray-800">
          Congratulations!
        </h2>

        <p className="mt-3 text-gray-600">
          Your account has been created successfully.
          <br />
          Please wait while we verify your profile for approval.
        </p>

        <div className="mt-6 text-sm text-gray-500">
          Redirecting you shortly…
        </div>
      </div>
    </div>
  );
}
