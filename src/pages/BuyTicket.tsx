import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMatchById } from '../utils/matchDataService';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';

interface Match {
  matchId: number;
  homeTeam: { name: string; logo: string };
  awayTeam: { name: string; logo: string };
  date: string;
  venue?: {
    name: string;
    city: string;
  };
}

interface VenueDetails {
  name: string;
  city: string;
}

interface UserProfile {
  hasImage: boolean;
}

const BuyTicket: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { match }: { match?: Match } = location.state || {};
  const webcamRef = useRef<Webcam>(null);
  const [formData, setFormData] = useState({
    homeTeamName: '',
    awayTeamName: '',
    matchDate: '',
    seatNumber: '',
    VenueName: '',
    VenueCity: '',
  });
  const [venueDetails, setVenueDetails] = useState<VenueDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [facePhoto, setFacePhoto] = useState<File | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);

  // Separate function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setUserProfile(null);
        return;
      }

      const response = await fetch('http://localhost:5001/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const profile = await response.json();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!match) {
      navigate('/cart');
      return;
    }

    // Get full match details from cache
    const fullMatchDetails = getMatchById(match.matchId);
    
    const formattedDate = new Date(match.date).toISOString().slice(0, 16);
    setFormData({
      homeTeamName: match.homeTeam.name || '',
      awayTeamName: match.awayTeam.name || '',
      matchDate: formattedDate || '',
      seatNumber: '',
      VenueName: fullMatchDetails?.fixture?.venue?.name || '',
      VenueCity: fullMatchDetails?.fixture?.venue?.city || '',
    });

    if (fullMatchDetails?.fixture?.venue) {
      setVenueDetails({
        name: fullMatchDetails.fixture.venue.name || '',
        city: fullMatchDetails.fixture.venue.city || ''
      });
    }
  }, [match, user, navigate, location]);

  // Effect to fetch profile when face capture modal is shown
  useEffect(() => {
    if (showFaceCapture) {
      fetchUserProfile();
    }
  }, [showFaceCapture]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Add validation for seat number
    if (name === 'seatNumber' && parseInt(value) < 1) {
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCapturePhoto = async () => {
    if (!webcamRef.current) {
      toast.error('Webcam not available.');
      return;
    }
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) {
      toast.error('Failed to capture photo.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      navigate('/login');
      return;
    }

    setIsCheckingQuality(true);
    try {
      const base64Response = await fetch(screenshot);
      const blob = await base64Response.blob();
      const file = new File([blob], 'facePhoto.jpg', { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('facePhoto', file);

      const response = await fetch('http://localhost:5001/api/images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.status === 200) {
          setFacePhoto(file);
          toast.success('Face photo accepted!');
          setShowFaceCapture(false);
          proceedToCheckout();
      } else {
        // Handle specific error messages from the backend
        let msg = "Unexpected error";
        
        if ("message" in data)
          msg = data.message;
        
        toast.error(msg);
      }
    } catch (error) {
      console.error('Error validating face photo:', error);
      toast.error('An unexpected error occured');
    } finally {
      setIsCheckingQuality(false);
    }
  };

  const getFaceStatusMessage = () => {
    if (!user) {
      return {
        text: "Unable to verify face image. Please log in again.",
        color: "text-red-500"
      };
    }
    if (!userProfile) {
      return {
        text: "Unable to verify face image status.",
        color: "text-red-500"
      };
    }
    return userProfile.hasImage
      ? {
          text: "You already have a face image. For a better experience, you can capture another.",
          color: "text-green-500"
        }
      : {
          text: "Please capture your face image for a better experience.",
          color: "text-red-500"
        };
  };

  const handleSkip = () => {
    setShowFaceCapture(false);
    proceedToCheckout();
  };

  const handleProceed = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (!formData.seatNumber || parseInt(formData.seatNumber) < 1) {
      setError('Please enter a valid seat number');
      setLoading(false);
      return;
    }

    // Show face capture modal and fetch latest profile data
    setShowFaceCapture(true);
    setLoading(false);
  };

  const proceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        match: { ...match, date: formData.matchDate },
        ticketDetails: {
          seatNumber: formData.seatNumber,
          VenueName: formData.VenueName,
          VenueCity: formData.VenueCity,
          facePhoto
        },
      },
    });
  };

  return (
    <>
      <style>
        {`
          .modal-container { animation: fadeIn 0.3s ease-out; }
          .modal-content { background: linear-gradient(135deg, #ffffff, #e6f0fa); border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); font-family: 'Roboto', sans-serif; transform: scale(1); transition: transform 0.2s ease; }
          .modal-content:hover { transform: scale(1.02); }
          .modal-title { font-size: 1.5rem; font-weight: 700; color: #1a3c34; }
          .close-button { background: #ff6b6b; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: bold; transition: background 0.2s ease; }
          .close-button:hover { background: #ff4d4d; }
          .capture-button { background: #28a745; color: white; font-weight: 600; padding: 8px 16px; border-radius: 12px; transition: transform 0.2s ease, background 0.2s ease; }
          .capture-button:hover { background: #218838; transform: translateY(-2px); }
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        `}
      </style>
      
      <div
        className="w-full min-h-screen flex justify-center items-center bg-cover bg-center pt-24 pb-12 px-4"
        style={{ backgroundImage: "url('/stadium.jpg')" }}
      >
        <div className="auth-container">
          <div className="flex justify-center">
            <img src="/mlogo.png" alt="Logo" className="h-16 w-auto object-contain" />
          </div>
          <h2 className="text-center text-2xl font-bold text-white">Buy Ticket</h2>
          <p className="text-center text-white">
            Back to <Link to="/cart" className="text-blue-400 font-semibold">Cart</Link>
          </p>
          <div className="text-center my-2 text-white">MATCH DETAILS</div>
          <div className="space-y-3 w-full text-white">
            <div>
              <label className="block text-sm font-medium mb-1">HOME TEAM</label>
              <p className="input-field bg-gray-200">{formData.homeTeamName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">AWAY TEAM</label>
              <p className="input-field bg-gray-200">{formData.awayTeamName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">MATCH DATE</label>
              <p className="input-field bg-gray-200">
                {formData.matchDate ? new Date(formData.matchDate).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">VENUE NAME</label>
              <p className="input-field bg-gray-200">{formData.VenueName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">VENUE CITY</label>
              <p className="input-field bg-gray-200">{formData.VenueCity || 'N/A'}</p>
            </div>
          </div>
          <div className="text-center my-2 text-white">ENTER SEAT NUMBER</div>
          <form onSubmit={handleProceed}>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <input
              type="number"
              name="seatNumber"
              value={formData.seatNumber}
              onChange={handleInputChange}
              placeholder="Seat Number (e.g., 42)"
              className="input-field"
              min="1"
              required
            />
            <button
              type="submit"
              disabled={loading || !formData.seatNumber || parseInt(formData.seatNumber) < 1}
              className="auth-button bg-white text-black shadow-xl w-full"
            >
              {loading ? 'Proceeding...' : 'Proceed to Checkout'}
            </button>
          </form>
        </div>
      </div>

      {showFaceCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900/80 p-6 md:p-8 rounded-xl shadow-2xl text-center max-w-4xl w-full mx-4">
            <div className="flex gap-8">
              {/* Left side - Camera */}
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Face Photo Capture</h2>
                <div className="mb-6 w-full aspect-square max-w-sm mx-auto rounded-lg overflow-hidden border-2 border-lime-500/50 flex items-center justify-center bg-black">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 480,
                      height: 480,
                      facingMode: "user"
                    }}
                    className="w-full h-full object-cover"
                    mirrored={true}
                  />
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleSkip}
                    className="px-6 py-3 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition"
                    disabled={isCheckingQuality}
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleCapturePhoto}
                    className="px-6 py-3 rounded-md bg-lime-500 text-black hover:bg-lime-600 transition"
                    disabled={isCheckingQuality}
                  >
                    {isCheckingQuality ? 'Checking...' : 'Capture Photo'}
                  </button>
                </div>
              </div>

              {/* Right side - Status Message */}
              <div className="flex-1 flex items-center">
                <div className="bg-white/10 p-6 rounded-lg w-full">
                  <h3 className="text-xl font-semibold text-white mb-4">Face Image Status</h3>
                  <p className={`text-lg leading-relaxed ${getFaceStatusMessage().color}`}>
                    {getFaceStatusMessage().text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BuyTicket; 
