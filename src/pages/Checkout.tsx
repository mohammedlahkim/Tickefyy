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

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      onAuthSuccess();
    }
  }, [user, onAuthSuccess]);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 min-h-screen">
        <div className="bg-black bg-opacity-80 p-8 rounded-xl shadow-2xl w-full max-w-md mx-4 border border-gray-800 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">Please Log In</h2>
          <Link
            to="/login"
            className="block w-full max-w-xs py-3 px-4 text-center bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-all duration-200 transform hover:translate-y-[-2px] hover:shadow-lg"
          >
            Log In
          </Link>
          <p className="mt-4 text-gray-400 text-sm text-center">
            Please log in to complete your purchase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      {children}
    </div>
  );
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
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <style>
          {`
            .checkout-container {
              width: 100%;
              height: calc(100vh - var(--navbar-height));
              max-width: 1536px;
              margin: 0 auto;
              padding: clamp(1rem, 2vw, 1.5rem);
              display: flex;
              flex-direction: column;
              gap: clamp(1rem, 2vw, 1.5rem);
            }

            .match-preview {
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: clamp(0.5rem, 1.5vw, 1rem);
              background: rgba(0, 0, 0, 0.8);
              border-radius: var(--card-border-radius);
              backdrop-filter: blur(8px);
              border: 1px solid rgba(255, 255, 255, 0.1);
              flex-shrink: 0;
            }

            .match-teams {
              display: flex;
              align-items: center;
              gap: clamp(1rem, 4vw, 2rem);
            }

            .team-logo {
              width: clamp(2.5rem, 8vw, 4rem);
              height: clamp(2.5rem, 8vw, 4rem);
              object-fit: contain;
            }

            .vs-text {
              font-size: clamp(1.25rem, 3vw, 1.75rem);
              font-weight: bold;
              color: #10B981;
            }

            .checkout-content {
              display: grid;
              grid-template-columns: 1fr;
              gap: clamp(1rem, 2vw, 1.5rem);
              flex: 1;
              min-height: 0;
              overflow: hidden;
            }

            @media (min-width: 768px) {
              .checkout-content {
                grid-template-columns: 1fr 1fr;
              }
            }

            .ticket-info, .payment-form {
              background: rgba(0, 0, 0, 0.8);
              border-radius: var(--card-border-radius);
              padding: clamp(1rem, 2vw, 1.5rem);
              color: white;
              backdrop-filter: blur(8px);
              border: 1px solid rgba(255, 255, 255, 0.1);
              overflow-y: auto;
              scrollbar-width: thin;
              scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
            }

            .ticket-info::-webkit-scrollbar,
            .payment-form::-webkit-scrollbar {
              width: 6px;
            }

            .ticket-info::-webkit-scrollbar-thumb,
            .payment-form::-webkit-scrollbar-thumb {
              background-color: rgba(255, 255, 255, 0.2);
              border-radius: 3px;
            }

            .ticket-header, .form-header {
              font-size: clamp(1.1rem, 2.5vw, 1.25rem);
              font-weight: bold;
              margin-bottom: clamp(0.75rem, 2vw, 1rem);
              text-align: center;
            }

            .ticket-details {
              display: flex;
              flex-direction: column;
              gap: 0.75rem;
            }

            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.5rem 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .detail-label {
              color: rgba(255, 255, 255, 0.7);
              font-size: clamp(0.8rem, 1.5vw, 0.9rem);
            }

            .detail-value {
              font-weight: 500;
              font-size: clamp(0.8rem, 1.5vw, 0.9rem);
            }

            .card-types {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 0.5rem;
              margin-bottom: 1rem;
            }

            .card-type-button {
              position: relative;
              padding: clamp(0.75rem, 2vw, 1rem);
              border-radius: 0.75rem;
              font-weight: 700;
              font-size: clamp(0.9rem, 1.5vw, 1.1rem);
              letter-spacing: 0.5px;
              transition: all 0.2s ease;
              border: none;
              cursor: pointer;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 3.5rem;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .card-type-button::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              opacity: 0;
              transition: opacity 0.2s ease;
            }

            .card-type-button:hover::before {
              opacity: 1;
            }

            /* Visa Card Style */
            .card-type-button.visa {
              background: linear-gradient(135deg, #1A1F71 0%, #2B3190 100%);
              color: white;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            .card-type-button.visa.selected {
              background: white;
              color: #1A1F71;
              text-shadow: none;
              border: 2px solid #1A1F71;
            }

            /* Mastercard Style */
            .card-type-button.mastercard {
              background: linear-gradient(135deg, #EB001B 0%, #FF5F00 50%, #F79E1B 100%);
              color: white;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            .card-type-button.mastercard.selected {
              background: white;
              color: #EB001B;
              text-shadow: none;
              border: 2px solid #EB001B;
            }

            /* Verve Card Style */
            .card-type-button.verve {
              background: linear-gradient(135deg, #2D3092 0%, #4CAF50 100%);
              color: white;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            .card-type-button.verve.selected {
              background: white;
              color: #2D3092;
              text-shadow: none;
              border: 2px solid #2D3092;
            }

            /* Selected States */
            .card-type-button.selected {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }

            /* Hover Effects */
            .card-type-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
              opacity: 0.95;
            }

            /* Active State */
            .card-type-button:active {
              transform: translateY(0);
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .form-group {
              margin-bottom: 1rem;
            }

            .form-label {
              display: block;
              color: white;
              margin-bottom: 0.25rem;
              font-size: clamp(0.8rem, 1.5vw, 0.9rem);
            }

            .form-input {
              width: 100%;
              padding: clamp(0.75rem, 2vw, 1rem);
              border-radius: 0.5rem;
              border: 1px solid rgba(255, 255, 255, 0.2);
              background: rgba(255, 255, 255, 0.1);
              color: white;
              font-size: clamp(0.8rem, 1.5vw, 0.9rem);
              transition: all 0.2s ease;
            }

            .form-input::placeholder {
              color: rgba(255, 255, 255, 0.6);
              opacity: 1;
            }

            .form-input:focus {
              border-color: #10B981;
              outline: none;
            }

            .form-input:focus::placeholder {
              color: rgba(255, 255, 255, 0.4);
            }

            .form-row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1rem;
            }

            .submit-button {
              width: 100%;
              padding: clamp(0.5rem, 1.5vw, 0.75rem);
              border-radius: 0.5rem;
              background: #10B981;
              color: white;
              font-weight: 600;
              font-size: clamp(0.8rem, 1.5vw, 0.9rem);
              transition: all 0.2s ease;
              margin-top: 1rem;
            }

            .submit-button:hover:not(:disabled) {
              background: #059669;
              transform: translateY(-2px);
            }

            .submit-button:disabled {
              opacity: 0.7;
              cursor: not-allowed;
            }

            .back-link {
              display: inline-block;
              color: #60A5FA;
              text-decoration: none;
              font-size: clamp(0.8rem, 1.5vw, 0.9rem);
              transition: color 0.2s ease;
              margin-top: 0.75rem;
            }

            .back-link:hover {
              color: #3B82F6;
            }

            @media (max-width: 640px) {
              .form-row {
                grid-template-columns: 1fr;
              }
            }

            @media (max-height: 700px) {
              .checkout-container {
                gap: 0.75rem;
              }

              .match-preview {
                padding: 0.5rem;
              }

              .team-logo {
                width: clamp(2rem, 6vw, 3rem);
                height: clamp(2rem, 6vw, 3rem);
              }

              .form-group {
                margin-bottom: 0.75rem;
              }
            }
          `}
        </style>

        <div className="checkout-container">
          <div className="match-preview">
            <div className="match-teams">
            <img
              src={match?.homeTeam.logo || defaultLogo}
              alt={`${match?.homeTeam.name || defaultHomeTeam} Logo`}
                className="team-logo"
            />
              <span className="vs-text">VS</span>
            <img
              src={match?.awayTeam.logo || defaultLogo}
              alt={`${match?.awayTeam.name || defaultAwayTeam} Logo`}
                className="team-logo"
            />
          </div>
        </div>

          <div className="checkout-content">
            <div className="ticket-info">
              <h2 className="ticket-header">Ticket Details</h2>
              <div className="ticket-details">
                <div className="detail-row">
                  <span className="detail-label">Match</span>
                  <span className="detail-value">
                    {match ? `${match.homeTeam.name} vs ${match.awayTeam.name}` : `${defaultHomeTeam} vs ${defaultAwayTeam}`}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">
                {match ? formatMatchTime(match.date) : defaultDate}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Seat</span>
                  <span className="detail-value">
                    {ticketDetails?.seatNumber || defaultSeatNumber}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Venue</span>
                  <span className="detail-value">
                    {ticketDetails?.VenueName || 'N/A'}
                {ticketDetails?.VenueCity && `, ${ticketDetails.VenueCity}`}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Price</span>
                  <span className="detail-value">$160.00</span>
                </div>
              </div>
          </div>

            <div className="payment-form">
              <h2 className="form-header">Payment Details</h2>
              
              <div className="card-types">
                  <button 
                  className={`card-type-button visa ${selectedCardType === 'visa' ? 'selected' : ''}`}
                    onClick={() => setSelectedCardType('visa')}
                    type="button"
                  >
                  VISA
                  </button>
                  <button 
                  className={`card-type-button mastercard ${selectedCardType === 'mastercard' ? 'selected' : ''}`}
                    onClick={() => setSelectedCardType('mastercard')}
                    type="button"
                  >
                  MASTERCARD
                  </button>
                  <button 
                  className={`card-type-button verve ${selectedCardType === 'verve' ? 'selected' : ''}`}
                    onClick={() => setSelectedCardType('verve')}
                    type="button"
                  >
                  VERVE
                  </button>
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  placeholder="**** **** **** ****"
                  className="form-input"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Mohammed Lahkim"
                  className="form-input"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Expiration Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="form-input"
                    value={expirationDate}
                    onChange={handleExpiryDateChange}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV Code</label>
                    <input
                      type="password"
                      placeholder="***"
                    className="form-input"
                      value={cvv}
                      onChange={handleCvvChange}
                      maxLength={3}
                      required
                    />
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="submit-button"
                disabled={!isAuthSuccess || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Pay $160.00'}
              </button>
          </div>
        </div>

          <Link to="/cart" className="back-link">
            ← Back to Cart
          </Link>
        </div>
      </div>
    </AuthComponent>
  );
};

export default Checkout;