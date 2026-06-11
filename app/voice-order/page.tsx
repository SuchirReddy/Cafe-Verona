"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Loader2, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceOrderPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = "en-US";

        recog.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recog.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          if (event.error !== 'no-speech') {
            toast.error("Microphone error. Please check permissions.");
          }
        };

        recog.onend = () => {
          setIsListening(false);
          if (transcript.trim()) {
            processVoiceOrder(transcript);
          }
        };

        setRecognition(recog);
      } else {
        setIsSupported(false);
      }
    }
  }, [transcript]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setAiResponse("");
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting recognition", e);
      }
    }
  };

  const processVoiceOrder = (text: string) => {
    setIsProcessing(true);
    // Simulate AI processing delay
    setTimeout(() => {
      setAiResponse(`I heard you say: "${text}". \n\n[AI ordering integration placeholder: In the future, this will connect to Gemini to parse your order, extract items, quantities, and special requests, and automatically add them to your cart!]`);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-3xl mx-auto flex flex-col items-center">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
          <Sparkles size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-coffee-900 mb-4 tracking-tight">
          AI Voice Ordering
        </h1>
        <p className="text-lg text-coffee-600">
          Try our experimental voice assistant. Just tap the mic and tell us what you'd like to order.
        </p>
      </div>

      {!isSupported ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl flex items-start gap-4">
          <AlertCircle className="shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-1">Browser Not Supported</h3>
            <p className="text-sm">Your browser does not support the Web Speech API. Please try using Google Chrome, Edge, or Safari.</p>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-8">
          {/* Mic Button */}
          <button
            onClick={toggleListening}
            className={`relative flex items-center justify-center w-32 h-32 rounded-full shadow-2xl transition-all duration-300 ${
              isListening 
                ? "bg-red-500 text-white scale-110 shadow-red-500/50" 
                : "bg-coffee-800 text-cream hover:bg-coffee-900 hover:scale-105"
            }`}
          >
            {isListening && (
              <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"></span>
            )}
            {isListening ? <MicOff size={48} /> : <Mic size={48} />}
          </button>

          <p className={`font-medium ${isListening ? "text-red-500 animate-pulse" : "text-coffee-500"}`}>
            {isListening ? "Listening... Tap to stop" : "Tap the microphone to speak"}
          </p>

          {/* Transcript & Response Area */}
          <div className="w-full space-y-4">
            {transcript && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-coffee-200 rounded-tr-sm ml-auto max-w-[85%]">
                <p className="text-coffee-900 text-lg">"{transcript}"</p>
              </div>
            )}

            {isProcessing && (
              <div className="bg-coffee-50 p-6 rounded-3xl shadow-sm border border-coffee-200 rounded-tl-sm mr-auto max-w-[85%] flex items-center gap-3">
                <Loader2 className="animate-spin text-coffee-500" />
                <p className="text-coffee-600">AI is thinking...</p>
              </div>
            )}

            {aiResponse && !isProcessing && (
              <div className="bg-coffee-800 p-6 rounded-3xl shadow-sm border border-coffee-900 rounded-tl-sm mr-auto max-w-[85%] text-cream">
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{aiResponse}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-16 text-center">
        <Link href="/menu" className="text-coffee-600 font-medium hover:text-coffee-900 underline underline-offset-4">
          Return to standard menu
        </Link>
      </div>
    </div>
  );
}
