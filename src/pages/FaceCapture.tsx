import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useAuth } from '../context/AuthContext'; // To get user ID
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../api/api'; // Your API base URL
import { toast } from 'react-toastify';
import { authHeader } from '../utils/authHeader'; // For potential auth needs
import { dataURLtoFile } from '../api/user'; // Reuse the helper

const FaceCapture = () => {
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

  const handleImageQualityCheck = async () => {
    if (!imgSrc || !user || !user.id) {
      toast.error("Cannot check image quality. Missing image or user data.");
      return;
    }

    const imageFile = dataURLtoFile(imgSrc, `face_capture_${user.id}.jpg`);
    if (!imageFile) {
      toast.error("Could not process captured image.");
      return;
    }

    setIsCheckingQuality(true);
    toast.info("Assessing image quality...");

    const formData = new FormData();
    formData.append('facePhoto', imageFile, imageFile.name);

    try {
      // Assuming your backend endpoint for assessment is structured like this
      // Replace with the actual endpoint if different
      const assessmentUrl = `${API_BASE_URL}/api/v1/users/${user.id}/assess_image_quality`;
      
      // Make the POST request to your Spring Boot backend
      // Note: Adjust headers if needed, though authHeader might not be necessary for this specific call
      const response = await axios.post(assessmentUrl, formData, {
        headers: {
           ...authHeader(), // Include if your Spring Boot endpoint needs authentication
          'Content-Type': 'multipart/form-data',
        },
      });

      // Assuming the Spring Boot controller returns the FastAPI response directly
      const { is_image_valid } = response.data; 

      if (is_image_valid === true) {
        toast.success("Image quality accepted!");
        // Navigate to the next step after successful validation
        // Example: navigate('/dashboard') or navigate('/')
        navigate('/'); 
      } else {
        toast.error("Face photo quality is not sufficient. Please recapture your face.");
        recapture(); // Go back to capture mode
      }
    } catch (error: any) {
      console.error("Error assessing image quality:", error.response?.data || error.message);
      toast.error("An error occurred during image quality assessment. Please try again.");
      recapture(); // Go back to capture mode on error
    } finally {
      setIsCheckingQuality(false);
    }
  };

  // Video constraints for webcam
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
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Face Photo Capture</h2>
        
        <div className="mb-6 w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden border-2 border-lime-500/50 flex items-center justify-center">
          {imgSrc ? (
            <img src={imgSrc} alt="Captured face" className="object-cover w-full h-full" />
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
                onClick={handleImageQualityCheck}
                disabled={isCheckingQuality}
                className="px-6 py-3 rounded-md bg-lime-500 text-black hover:bg-lime-600 transition disabled:opacity-50"
              >
                {isCheckingQuality ? 'Checking...' : 'Check Quality & Continue'}
              </button>
            </>
          ) : (
            <button
              onClick={capture}
              className="px-6 py-3 rounded-md bg-lime-500 text-black hover:bg-lime-600 transition w-full sm:w-auto"
            >
              Capture Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceCapture; 