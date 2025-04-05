import { useEffect, useState, useRef } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../api/api";
import { toast } from "react-toastify";

const Signup = () => {
  const [f_name, setFName] = useState("");
  const [l_name, setLName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCameraPopup, setShowCameraPopup] = useState(false);
  const [facingConsent, setFacingConsent] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Unable to access camera");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        console.log(canvas.toDataURL("image/jpeg"));
        
        return canvas.toDataURL("image/jpeg");
      }
    }
    return null;
  };

  const handleCaptureAndSubmit = async () => {
    const imageData = captureImage();
    if (imageData) {
      try {
        await axios.post(`${API_BASE_URL}/auth/store-face-variable`, {
          email,
          image: imageData,
        });
        toast.success("Facial image captured successfully!");
        stopCamera();
        setShowCameraPopup(false);
        await completeSignup();
      } catch (err) {
        console.error("Image processing error:", err);
        toast.error("Failed to process facial image");
      }
    }
  };

  const completeSignup = async () => {
    try {
      const isoBirthdate = new Date(birthdate + "T00:00:00Z");
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, {
        f_name,
        l_name,
        email,
        password,
        phone,
        birthdate: isoBirthdate,
      });

      const { jwt } = res.data;
      localStorage.setItem("token", jwt);
      login({ name: `${f_name} ${l_name}`, email });
      toast.success("Signed up successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Signup error", err.response?.data || err.message);
      toast.error("Signup failed!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (facingConsent) {
      setShowCameraPopup(true);
      setTimeout(() => startCamera(), 100);
    } else {
      await completeSignup();
    }
  };

  return (
    <div
      className="w-full min-h-screen flex justify-center items-center bg-cover bg-center pt-32 pb-8 px-4"
      style={{ backgroundImage: "url('/stadium.jpg')" }}
    >
      <div className="flex md:flex-row justify-center items-center gap-6 w-full max-w-5xl mx-auto ">
        <div className="bg-white bg-opacity-15 backdrop-blur-lg shadow-xl rounded-lg p-6 w-full max-w-[400px]">
          <div className="flex justify-center items-center mb-3">
            <img
              src="/mlogo.png"
              alt="Logo"
              className="h-12 w-auto object-contain self-center"
            />
          </div>

          <h2 className="text-center text-2xl font-bold text-white mb-4">
            Sign up
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First name"
                className="input-field"
                value={f_name}
                onChange={(e) => setFName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last name"
                className="input-field"
                value={l_name}
                onChange={(e) => setLName(e.target.value)}
                required
              />
            </div>

            <input
              type="email"
              placeholder="Email address"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="date"
              placeholder="Birthdate"
              className="input-field"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
            />

            <PhoneInput
              country={"us"}
              value={phone}
              onChange={(phone) => setPhone(phone)}
              inputStyle={{
                width: "100%",
                height: "40px",
                borderRadius: "20px",
                backgroundColor: "rgba(255,255,255,0.3)",
                color: "white",
                paddingLeft: "45px",
                border: "none",
                backdropFilter: "blur(8px)",
              }}
              buttonStyle={{
                borderRadius: "20px 0 0 20px",
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(255,255,255,0.5)",
              }}
              containerStyle={{
                borderRadius: "20px",
              }}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-white text-sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="text-[10px] text-white space-y-1">
              <label className="flex items-start gap-1.5">
                <input type="checkbox" className="mt-0.5" required />
                I consent to receive SMS, emails, updates, events, and promotions.
              </label>
              <label className="flex items-start gap-1.5">
                <input type="checkbox" className="mt-0.5" required />
                I agree to the <a href="#" className="underline">Terms</a> and{" "}
                <a href="#" className="underline">Privacy Policy</a>.
              </label>
              <label className="flex items-start gap-1.5">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={facingConsent}
                  onChange={(e) => setFacingConsent(e.target.checked)}
                />
                I consent to use Facial recognition
              </label>
            </div>

            <button
              type="submit"
              className="mt-3 w-full bg-white py-2 rounded-full shadow-lg text-base font-semibold"
            >
              Sign up
            </button>
          </form>
        </div>

        {showCameraPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Capture Facial Image (Required)</h3>
              <video ref={videoRef} className="w-full mb-4 rounded" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-4">
                <button
                  onClick={handleCaptureAndSubmit}
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Capture & Continue
                </button>
                <button
                  onClick={() => {
                    setShowCameraPopup(false);
                    setFacingConsent(false);
                    stopCamera();
                  }}
                  className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-[300px] p-6 bg-black bg-opacity-70 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-white mb-3 neon-text">
            Facial recognition
          </h3>
          <p className="text-sm text-gray-300">
            By signing up, you agree to the following terms:
          </p>
          <ul className="text-sm text-gray-300 list-disc list-inside mt-2 space-y-1">
            <li>Facial recognition is used solely for the following purposes:</li>
            <li>Identity verification and user authentication</li>
            <li>Ticket validation and access control</li>
            <li>Fraud prevention and enhanced security</li>
            <li>We do not use facial recognition for surveillance, behavioral analysis, or third-party advertising.</li>
            <li>You must provide explicit, informed, and verifiable consent before using the facial recognition feature. You may withdraw your consent at any time by disabling the feature or contacting us directly.</li>
          </ul>
          <p className="text-sm text-gray-300 mt-3">
            If you are willing to do Facial recognition please agree to click on the checkbox
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

// Add this CSS in your global stylesheet (e.g., index.css or a separate CSS file)
const neonStyles = `
  .neon-text {
    color: #fff;
    text-shadow:
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px #0ff,
      0 0 40px #0ff,
      0 0 80px #0ff;
  }
`;