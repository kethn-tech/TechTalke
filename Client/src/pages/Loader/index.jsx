import React, { useState, useEffect } from "react";
import { MessageSquare, Server, Clock, Zap } from "lucide-react";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");
  const [tip, setTip] = useState(0);
  const [cycles, setCycles] = useState(0);

  const tips = [
    "Warming up the servers...",
    "Preparing your workspace...",
    "Almost there...",
    "Just a few more moments...",
  ];

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    const tipInterval = setInterval(() => {
      setTip((prev) => (prev + 1) % tips.length);
    }, 3000);

    // Progress bar that takes 30 seconds to complete
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCycles((c) => c + 1);
          return 0;
        }
        // Increment by small amount to reach 100 in 30 seconds
        // (100 / (30 * 1000 / 100)) ≈ 0.33 per 100ms
        return prev + 0.33;
      });
    }, 100);

    return () => {
      clearInterval(dotInterval);
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-indigo-900/20 animate-[pulse_4s_ease-in-out_infinite]" />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-purple-500/20 rounded-full w-2 h-2"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      <div className="max-w-lg w-full bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 relative">
        {/* Pulsing ring effect */}
        <div
          className="absolute inset-0 rounded-2xl animate-[pulse-ring_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
          style={{ border: "2px solid rgba(147, 51, 234, 0.5)" }}
        />

        {/* Main content */}
        <div className="relative">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <MessageSquare className="w-16 h-16 text-purple-500 animate-[float_3s_ease-in-out_infinite]" />
              <div className="absolute inset-0 animate-[glow_2s_ease-in-out_infinite]" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            Initializing Chat{dots}
          </h2>

          <div className="space-y-6 text-gray-300">
            <div className="flex items-start space-x-4 p-4 bg-purple-900/20 rounded-lg backdrop-blur-sm border border-purple-500/20 transform hover:scale-105 transition-transform duration-300">
              <Server className="w-6 h-6 text-purple-400 flex-shrink-0 animate-pulse" />
              <p className="text-sm">
                Our server is currently spinning up from sleep mode. This brief
                pause helps us optimize resources when the app isn't in use.
              </p>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-indigo-900/20 rounded-lg backdrop-blur-sm border border-indigo-500/20 transform hover:scale-105 transition-transform duration-300">
              <Clock className="w-6 h-6 text-indigo-400 flex-shrink-0 animate-pulse" />
              <p className="text-sm">
                {cycles === 0
                  ? "Hang tight for about 30-60 seconds while we prepare your personalized chat environment. We're working our magic!"
                  : "The server is taking longer than expected to start. Please continue waiting, we're doing our best to get you connected."}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold inline-block text-purple-400">
                    {Math.min(Math.round(progress), 100)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded-full bg-purple-900/30">
                <div
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                />
              </div>
            </div>
            <p className="text-purple-400/80 text-sm text-center mt-4 animate-pulse">
              {tips[tip]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
