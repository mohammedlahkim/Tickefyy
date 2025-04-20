import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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

const TicketCart = () => {
  const { cart: cartItems, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatMatchTime = (utcDate: string) => {
    const date = new Date(utcDate);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handlePurchase = (match: Match) => {
    if (!user) {
      toast.error('Please log in to purchase tickets');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    navigate('/buy-ticket', { 
      state: { 
        match: {
          ...match,
          matchId: match.id
        }
      } 
    });
  };

  return (
    <>
      {/* Embed CSS within the component using a <style> tag */}
      <style>
        {`
          .container {
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            position: relative;
          }

          .background {
            width: 100%;
            height: 100%;
            background-image: url('https://images.unsplash.com/photo-1508098682722-8b9510c4e1b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80');
            background-size: cover;
            background-position: center;
            position: relative;
          }

          .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
          }

          .title {
            color: #fff;
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            max-width: 1000px;
            width: 100%;
          }

          .card {
            background-color: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            padding: 15px;
            color: #fff;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .match-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 10px;
          }

          .team {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
          }

          .team-logo {
            width: 40px;
            height: 40px;
            object-fit: contain;
            border-radius: 50%;
          }

          .vs {
            font-size: 1.2rem;
            font-weight: bold;
          }

          .time {
            font-size: 0.9rem;
            margin-bottom: 10px;
          }

          .button-container {
            display: flex;
            gap: 10px;
          }

          .purchase-button {
            background-color: #fff;
            color: #000;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s ease;
          }

          .purchase-button:hover {
            background-color: #f0f0f0;
            transform: translateY(-2px);
          }

          .delete-button {
            background-color: #ff4444;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s ease;
          }

          .delete-button:hover {
            background-color: #cc0000;
            transform: translateY(-2px);
          }
        `}
      </style>

      {/* JSX for the UI */}
      <div className="container">
        <div className="background">
          <div className="overlay">
            <h2 className="title">Tickets added to Cart</h2>
            {cartItems.length === 0 ? (
              <p className="text-white">Your cart is empty</p>
            ) : (
              <div className="grid">
                {cartItems.map((match) => (
                  <div key={match.id} className="card">
                    <div className="match-info">
                      <div className="team">
                        <img src={match.homeTeam.logo} alt={`${match.homeTeam.name} logo`} className="team-logo" />
                        <span>{match.homeTeam.name}</span>
                      </div>
                      <span className="vs">VS</span>
                      <div className="team">
                        <img src={match.awayTeam.logo} alt={`${match.awayTeam.name} logo`} className="team-logo" />
                        <span>{match.awayTeam.name}</span>
                      </div>
                    </div>
                    <p className="time">{formatMatchTime(match.date)}</p>
                    <div className="button-container">
                      <button 
                        className="purchase-button"
                        onClick={() => handlePurchase(match)}
                      >
                        Purchase
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => removeFromCart(match.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketCart;