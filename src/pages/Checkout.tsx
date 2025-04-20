import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';

// Simulated AuthComponent for demonstration
interface AuthComponentProps {
  children: React.ReactNode;
  onAuthSuccess: () => void;
}

const AuthComponent: React.FC<AuthComponentProps> = ({ children, onAuthSuccess }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user } = useAuth();

  // Use actual auth logic
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      onAuthSuccess();
    }
  }, [user, onAuthSuccess]);

  if (!isAuthenticated) {
    return (
      <div className="">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4 text-center">Please Log In</h2>
          <Link
            to="/login"
            className="block text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface Match {
  id: number;
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  date: string;
}

interface TicketDetails {
  seatNumber: string;
  VenueName: string;
  VenueCity: string;
  facePhoto: File | null;
}

interface User {
  token: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  // Add other context properties as needed
}

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { match }: { match?: Match } = location.state || {};
  const { ticketDetails }: { ticketDetails?: TicketDetails } = location.state || {};
  const [isAuthSuccess, setIsAuthSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState<'visa' | 'mastercard' | 'verve'>('visa');
  const { user } = useAuth() as AuthContextType;
  const { clearCart, removeFromCart } = useCart();

  const formatMatchTime = (utcDate: string) => {
    const date = new Date(utcDate);
    return date.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const defaultHomeTeam = 'BENIN';
  const defaultAwayTeam = 'SENEGAL';
  const defaultDate = 'N/A';
  const defaultLogo = 'https://via.placeholder.com/150?text=Team+Logo';
  const defaultSeatNumber = 'N/A';

  // Card validation functions
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCardNumber(e.target.value);
    if (value.replace(/\s/g, '').length <= 16) {
      setCardNumber(value);
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      const month = parseInt(v.substring(0, 2));
      if (month > 12) {
        return '12/' + v.substring(2, 4);
      }
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatExpiryDate(e.target.value);
    if (value.length <= 5) {
      setExpirationDate(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const validateForm = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      alert('Please enter a valid card number');
      return false;
    }

    if (!cardholderName || cardholderName.trim().length < 3) {
      alert('Please enter a valid cardholder name');
      return false;
    }

    if (!expirationDate || !expirationDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      alert('Please enter a valid expiration date (MM/YY)');
      return false;
    }

    if (!cvv || cvv.length !== 3) {
      alert('Please enter a valid CVV');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!user) {
      alert('Please log in to complete the purchase');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Create URLSearchParams for the request
      const params = new URLSearchParams();

      // Add match details from BuyTicket page
      params.append('homeTeamName', match?.homeTeam.name || '');
      params.append('awayTeamName', match?.awayTeam.name || '');
      params.append('matchDate', match?.date || '');
      
      // Add venue and seat details from BuyTicket page
      const seatNumber = parseInt(ticketDetails?.seatNumber || '0', 10);
      if (isNaN(seatNumber) || seatNumber <= 0) {
        throw new Error('Invalid seat number');
      }
      params.append('seatNumber', seatNumber.toString());
      params.append('VenueName', ticketDetails?.VenueName || '');
      params.append('VenueCity', ticketDetails?.VenueCity || '');
      
      // Add payment details from Checkout page
      params.append('cardType', selectedCardType.toUpperCase());
      params.append('cardNumber', cardNumber.replace(/\s/g, ''));
      params.append('cardHolderName', cardholderName);
      params.append('expirationDate', expirationDate);
      params.append('cvvCode', cvv);

      // Create the ticket and purchase
      const ticketResponse = await fetch('http://localhost:5001/api/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });

      if (!ticketResponse.ok) {
        const errorData = await ticketResponse.text();
        console.error('Server response:', errorData);
        throw new Error(errorData || 'Failed to create ticket');
      }

      const ticketData = await ticketResponse.json();
      console.log('Ticket created successfully:', ticketData);
      
      // Remove only the purchased ticket from the cart
      if (match?.id) {
        removeFromCart(match.id);
      }
      
      // Show success message and navigate to confirmation
      toast.success('Payment processed successfully!');
      navigate('/confirmation', { 
        state: { 
          match,
          ticketDetails: {
            ...ticketDetails,
            facePhoto: null // Don't pass the file to the next page
          },
          ticket: ticketData 
        } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Payment error:', error);
      alert('Payment failed: ' + errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AuthComponent onAuthSuccess={() => setIsAuthSuccess(true)}>
      <div className="">
        {/* Inline Styles */}
        <style>
          {`
            .input-field {
              width: 100%;
              padding: 12px;
              border: 1px solid #ccc;
              border-radius: 25px;
              background-color: rgba(255, 255, 255, 0.9);
              font-size: 16px;
              color: #333;
              outline: none;
              transition: border-color 0.3s ease;
            }

            .input-field:focus {
              border-color: #4a90e2;
              box-shadow: 0 0 5px rgba(74, 144, 226, 0.3);
            }

            .auth-button {
              width: 100%;
              padding: 12px;
              border-radius: 25px;
              font-size: 16px;
              font-weight: bold;
              border: none;
              cursor: pointer;
              transition: background-color 0.3s ease, transform 0.1s ease;
            }

            .auth-button:hover {
              transform: translateY(-2px);
            }

            .auth-button:active {
              transform: translateY(0);
            }

            .card-button {
              border: 1px solid #ccc;
              border-radius: 12px;
              padding: 8px;
              background: white;
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .card-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .toggle-switch {
              position: relative;
              display: inline-block;
              width: 40px;
              height: 20px;
            }

            .toggle-switch input {
              opacity: 0;
              width: 0;
              height: 0;
            }

            .slider {
              position: absolute;
              cursor: pointer;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: #ccc;
              transition: 0.4s;
              border-radius: 20px;
            }

            .slider:before {
              position: absolute;
              content: "";
              height: 16px;
              width: 16px;
              left: 2px;
              bottom: 2px;
              background-color: white;
              transition: 0.4s;
              border-radius: 50%;
            }

            input:checked + .slider {
              background-color: #4a90e2;
            }

            input:checked + .slider:before {
              transform: translateX(20px);
            }
          `}
        </style>

        {/* Background Section with Team Logos */}
        <div className="absolute inset-0 flex items-center justify-center opacity-80 mt-40 ">
          <div className="flex items-center space-x-6 bg-black bg-opacity-100 p-6 rounded-xl transform -translate-x-60">
            <img
              src={match?.homeTeam.logo || defaultLogo}
              alt={`${match?.homeTeam.name || defaultHomeTeam} Logo`}
              className="w-32 h-32 object-contain"
            />
            <span className="text-3xl font-bold text-green-400">VS</span>
            <img
              src={match?.awayTeam.logo || defaultLogo}
              alt={`${match?.awayTeam.name || defaultAwayTeam} Logo`}
              className="w-32 h-32 object-contain"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-start mt-12 z-10 px-4">
          {/* Left Section - Ticket Info */}
          <div className="w-full md:w-1/2 flex flex-col items-center mb-8 md:mb-0">
            <div className="bg-black bg-opacity-80 p-8 rounded-xl shadow-2xl text-center w-full max-w-md">
              <h2 className="text-3xl font-bold mb-3 text-white">
                {match
                  ? `${match.homeTeam.name.toUpperCase()} vs ${match.awayTeam.name.toUpperCase()}`
                  : `${defaultHomeTeam} vs ${defaultAwayTeam}`}
              </h2>
              <p className="text-lg mb-3 text-white">
                {match ? formatMatchTime(match.date) : defaultDate}
              </p>
              <p className="text-lg mb-3 text-white">
                <span className="font-semibold">Seat Number:</span> {ticketDetails?.seatNumber || defaultSeatNumber}
              </p>
              <p className="text-lg mb-3 text-white">
                <span className="font-semibold">Venue:</span> {ticketDetails?.VenueName || 'N/A'}
                {ticketDetails?.VenueCity && `, ${ticketDetails.VenueCity}`}
              </p>
              <p className="text-2xl font-semibold text-white">$160.00</p>
            </div>
          </div>

          {/* Right Section - Payment Form */}
          <div className="w-full md:w-1/2 md:pl-8">
            <div className="bg-black text-black bg-opacity-20 p-8 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-white bg-black bg-opacity-50 p-3 rounded-lg text-center">
                CHECKOUT
              </h2>
              <p className="text-sm text-gray-200 mb-6 text-center">
                Complete your purchase by providing your payment details
              </p>

              {/* Card Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-200">CARD TYPE</label>
                <div className="flex space-x-3">
                  <button 
                    className={`card-button flex-1 ${selectedCardType === 'visa' ? 'border-green-500 border-2' : ''}`}
                    onClick={() => setSelectedCardType('visa')}
                    type="button"
                  >
                    <div className="h-6 mx-auto text-blue-600 font-bold">VISA</div>
                  </button>
                  <button 
                    className={`card-button flex-1 ${selectedCardType === 'mastercard' ? 'border-green-500 border-2' : ''}`}
                    onClick={() => setSelectedCardType('mastercard')}
                    type="button"
                  >
                    <div className="h-6 mx-auto text-red-600 font-bold">MASTERCARD</div>
                  </button>
                  <button 
                    className={`card-button flex-1 ${selectedCardType === 'verve' ? 'border-green-500 border-2' : ''}`}
                    onClick={() => setSelectedCardType('verve')}
                    type="button"
                  >
                    <span className="text-gray-200 font-bold">VERVE</span>
                  </button>
                </div>
              </div>

              {/* Card Number */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-200">CARD NUMBER</label>
                <input
                  type="text"
                  placeholder="**** **** **** ****"
                  className="input-field"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  required
                />
              </div>

              {/* Cardholder Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-200">CARDHOLDER NAME</label>
                <input
                  type="text"
                  placeholder="Mohammed Lahkim"
                  className="input-field"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                  required
                />
              </div>

              {/* Expiry Date and CVV */}
              <div className="flex space-x-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2 text-gray-200">EXPIRATION DATE</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="input-field"
                    value={expirationDate}
                    onChange={handleExpiryDateChange}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2 text-gray-200">CVV CODE</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="***"
                      className="input-field"
                      value={cvv}
                      onChange={handleCvvChange}
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                className="auth-button bg-green-500 text-white hover:bg-green-600"
                disabled={!isAuthSuccess || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Pay $160.00'}
              </button>

              {/* Secure Payment Note */}
              <p className="text-xs text-gray-200 mt-4 text-center">
                Payments are secured and encrypted
              </p>
            </div>
          </div>
        </div>

        {/* Back to Cart Link */}
        <div className="text-center mt-8">
          <Link to="/cart" className="text-blue-400 font-semibold hover:underline">
            Back to Cart
          </Link>
        </div>
      </div>
    </AuthComponent>
  );
};

export default Checkout; 