// import React from 'react';
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
    <div className="min-h-screen w-full flex flex-col">
      <style>
        {`
          .cart-container {
            width: 100%;
            min-height: 100vh;
            padding: clamp(1rem, 5vw, 3rem);
            padding-top: calc(var(--navbar-height) + clamp(2rem, 4vw, 3rem));
          }

          .cart-heading {
            color: white;
            text-align: center;
            margin-bottom: clamp(2rem, 4vw, 3rem);
            font-size: clamp(1.5rem, 3vw, 2rem);
            font-weight: 600;
          }

          .cart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
            gap: clamp(1rem, 3vw, 2rem);
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
          }

          .cart-card {
            background-color: rgba(0, 0, 0, 0.8);
            border-radius: var(--card-border-radius);
            padding: clamp(1rem, 3vw, 1.5rem);
            color: white;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .cart-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          }

          .match-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: clamp(0.5rem, 2vw, 1rem);
          }

          .team {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            flex: 1;
          }

          .team-name {
            font-size: clamp(0.75rem, 1.5vw, 0.875rem);
            text-align: center;
            font-weight: 500;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .team-logo {
            width: clamp(2.5rem, 8vw, 3rem);
            height: clamp(2.5rem, 8vw, 3rem);
            object-fit: contain;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.1);
            padding: 0.25rem;
          }

          .vs {
            font-size: clamp(1rem, 2vw, 1.2rem);
            font-weight: bold;
            color: rgba(255, 255, 255, 0.8);
            margin: 0 clamp(0.5rem, 2vw, 1rem);
          }

          .match-time {
            font-size: clamp(0.75rem, 1.5vw, 0.875rem);
            color: rgba(255, 255, 255, 0.7);
            text-align: center;
            margin-top: 0.5rem;
          }

          .button-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            margin-top: auto;
          }

          .cart-button {
            padding: clamp(0.5rem, 2vw, 0.75rem);
            border-radius: 0.5rem;
            font-weight: 600;
            font-size: clamp(0.75rem, 1.5vw, 0.875rem);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .purchase-button {
            background-color: #10B981;
            color: white;
          }

          .purchase-button:hover {
            background-color: #059669;
            transform: translateY(-2px);
          }

          .delete-button {
            background-color: #EF4444;
            color: white;
          }

          .delete-button:hover {
            background-color: #DC2626;
            transform: translateY(-2px);
          }

          .empty-cart {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - var(--navbar-height));
            text-align: center;
            color: white;
            padding: 2rem;
          }

          .empty-cart p {
            font-size: clamp(1.25rem, 2.5vw, 1.5rem);
            font-weight: 500;
            margin-bottom: 2rem;
          }

          .browse-tickets-button {
            background: #10B981;
            color: white;
            padding: clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem);
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: clamp(0.9rem, 1.5vw, 1.1rem);
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
            min-width: 200px;
            max-width: 300px;
            width: 100%;
          }

          .browse-tickets-button:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          @media (max-width: 640px) {
            .button-container {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="cart-container">
        <h1 className="cart-heading">Shopping Cart</h1>
        
            {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button 
              onClick={() => navigate('/ticketlist')}
              className="browse-tickets-button"
            >
              Browse Tickets
            </button>
          </div>
            ) : (
          <div className="cart-grid">
                {cartItems.map((match) => (
              <div key={match.id} className="cart-card">
                    <div className="match-info">
                      <div className="team">
                    <img 
                      src={match.homeTeam.logo} 
                      alt={`${match.homeTeam.name} logo`} 
                      className="team-logo"
                    />
                    <span className="team-name">{match.homeTeam.name}</span>
                      </div>
                      <span className="vs">VS</span>
                      <div className="team">
                    <img 
                      src={match.awayTeam.logo} 
                      alt={`${match.awayTeam.name} logo`} 
                      className="team-logo"
                    />
                    <span className="team-name">{match.awayTeam.name}</span>
                      </div>
                    </div>
                
                <p className="match-time">{formatMatchTime(match.date)}</p>
                
                    <div className="button-container">
                      <button 
                    className="cart-button purchase-button"
                        onClick={() => handlePurchase(match)}
                      >
                        Purchase
                      </button>
                      <button
                    className="cart-button delete-button"
                        onClick={() => removeFromCart(match.id)}
                      >
                    Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
  );
};

export default TicketCart;