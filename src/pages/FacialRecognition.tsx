import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { toast } from "react-toastify";
import axios from "axios";
import API_BASE_URL from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dataURLtoFile } from "../api/user";
import { authHeader } from "../utils/authHeader";

const FacialRecognition = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef, setImgSrc]);

  const recapture = () => {
    setImgSrc(null);
  };

  const assessImageQuality = async () => {
    if (!imgSrc) {
      toast.error("No image captured to assess.");
      return;
    }
    
    // Instead of relying on user object, get token directly from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required. Please log in again.");
      navigate('/login');
      return;
    }

    // Create a filename that doesn't rely on user ID
    const timestamp = new Date().getTime();
    const imageFile = dataURLtoFile(imgSrc, `face_quality_${timestamp}.jpg`);
    if (!imageFile) {
      toast.error("Could not process captured image.");
      return;
    }

    setIsCheckingQuality(true);
    toast.info("Assessing image quality...");

    const formData = new FormData();
    formData.append('facePhoto', imageFile, imageFile.name);

    try {
      const assessmentUrl = `${API_BASE_URL}/api/images`;
      
      console.log(`Sending image quality assessment to: ${assessmentUrl}`);
      console.log("Image file:", imageFile);
      
      // Use token directly for authorization
      const response = await axios.post(assessmentUrl, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Backend response:", response.data);
      
      // Handle both object and string response formats
      const isImageValid = response.status === 200;

      if (isImageValid) {
        toast.success("Image quality accepted! Proceeding...");
        navigate('/'); 
      } else {
        let msg = "Unexpected error";

        if ("message" in response.data)
          msg = response.data.message
        
        toast.error(msg);
        recapture();
      }
    } catch (error: any) {
      console.error("Error assessing image quality:", error);
      
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        
        // More specific error handling
        if (error.response.status === 401) {
          toast.error("Authentication failed. Please log in again.");
          navigate('/login');
        } else {
          const err = typeof error.response.data === 'string' 
            ? error.response.data 
            : "Image quality assessment failed. Please try again.";
          
          toast.error(err);
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server. Please check your connection.");
      } else {
        console.error("Error message:", error.message);
        toast.error("An error occurred. Please try again.");
      }
      
      recapture();
    } finally {
      setIsCheckingQuality(false);
    }
  };

  const cancelCapture = () => {
    toast.info("Face capture skipped.");
    navigate("/");
  };

  const videoConstraints = {
    width: 480,
    height: 480,
    facingMode: "user"
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center relative flex flex-col items-center justify-center p-4"
      style={{ backgroundImage: "url('/images/stadiumbg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
      
      <div className="relative z-10 bg-slate-900/80 p-6 md:p-8 rounded-xl shadow-2xl text-center max-w-lg w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Face Photo Quality Check</h2>
        
        <div className="mb-6 w-full aspect-square max-w-sm mx-auto rounded-lg overflow-hidden border-2 border-lime-500/50 flex items-center justify-center bg-black">
          {imgSrc ? (
            <img src={imgSrc} alt="Captured face" className="object-contain w-full h-full" />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
              mirrored={true}
            />
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {imgSrc ? (
            <>
              <button
                onClick={recapture}
                disabled={isCheckingQuality}
                className="px-6 py-3 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition disabled:opacity-50"
              >
                Recapture
              </button>
              <button
                onClick={assessImageQuality}
                disabled={isCheckingQuality}
                className="px-6 py-3 rounded-md bg-lime-500 text-black hover:bg-lime-600 transition disabled:opacity-50"
              >
                {isCheckingQuality ? 'Checking...' : 'Submit for Quality Check'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={capture}
                className="px-6 py-3 rounded-md bg-lime-500 text-black hover:bg-lime-600 transition w-full sm:w-auto"
              >
                Capture Photo
              </button>
              <button
                onClick={cancelCapture}
                className="px-6 py-3 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition w-full sm:w-auto mt-2 sm:mt-0"
              >
                Skip for Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacialRecognition;
