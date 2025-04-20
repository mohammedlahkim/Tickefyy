import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { getMatchData, getMatchById, Match } from '../utils/matchDataService';

// Use the Match interface from matchDataService
type SimpleMatch = {
  id: number;
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  league: {
    name: string;
  };
  date: string;
};

const TicketList = () => {
  const [matches, setMatches] = useState<SimpleMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const { addToCart, cart } = useCart();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [matchesPerPage] = useState(12);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const data = await getMatchData();
        if (data && data.response && Array.isArray(data.response)) {
          const formattedMatches = data.response.map((match: Match): SimpleMatch => ({
            id: match.fixture.id,
            homeTeam: {
              name: match.teams.home.name,
              logo: match.teams.home.logo,
            },
            awayTeam: {
              name: match.teams.away.name,
              logo: match.teams.away.logo,
            },
            league: {
              name: match.league.name,
            },
            date: match.fixture.date,
          }));
          setMatches(formattedMatches);
          setError(null);
        } else {
          setError('No matches available');
        }
      } catch (err) {
        setError('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  // Get current matches for pagination
  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = matches.slice(indexOfFirstMatch, indexOfLastMatch);
  const totalPages = Math.ceil(matches.length / matchesPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleShowDetails = async (matchId: number) => {
    setDetailsLoading(true);
    const details = getMatchById(matchId);
    setSelectedMatch(details);
    setDetailsLoading(false);
  };

  const handleAddToCart = (match: SimpleMatch) => {
    if (cart.some((item) => item.id === match.id)) {
      toast.info('Match already in cart!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    addToCart(match);
    toast.success(`${match.homeTeam.name} vs ${match.awayTeam.name} added to cart!`, {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const handlePurchase = (match: Match) => {
    const matchForCart: SimpleMatch = {
      id: match.fixture.id,
      homeTeam: {
        name: match.teams.home.name,
        logo: match.teams.home.logo,
      },
      awayTeam: {
        name: match.teams.away.name,
        logo: match.teams.away.logo,
      },
      league: {
        name: match.league.name,
      },
      date: match.fixture.date,
    };

    handleAddToCart(matchForCart);
  };

  const formatMatchTime = (utcDate: string) => {
    const date = new Date(utcDate);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="text-white text-center">Loading matches...</div>;
  if (error) return <div className="text-white text-center">Error: {error}</div>;

  return (
    <>
      <style>
        {`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.75);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
          }

          .modal-content {
            background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
            color: white;
            padding: 1rem;
            border-radius: 0.75rem;
            width: 90%;
            max-width: 500px;
            position: relative;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .close-button {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: rgba(255, 0, 0, 0.8);
            color: white;
            border: none;
            border-radius: 50%;
            width: 1.5rem;
            height: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
          }

          .close-button:hover {
            background: red;
            transform: scale(1.1);
          }

          .match-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 0.5rem;
          }

          .team-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
          }

          .team-logo {
            width: 60px;
            height: 60px;
            object-fit: contain;
            transition: transform 0.2s;
          }

          .team-logo:hover {
            transform: scale(1.1);
          }

          .team-name {
            font-size: 1rem;
            font-weight: bold;
            text-align: center;
          }

          .vs-badge {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.75rem;
            background: rgba(0, 255, 0, 0.1);
            border-radius: 0.5rem;
            font-weight: bold;
          }

          .match-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.5rem;
          }

          .detail-item {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
          }

          .detail-label {
            color: #888;
            font-size: 0.8rem;
          }

          .detail-value {
            color: white;
            font-size: 1rem;
          }

          .ticket-section {
            background: rgba(0, 0, 0, 0.2);
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-bottom: 0.75rem;
          }

          .price-tag {
            font-size: 1.5rem;
            font-weight: bold;
            color: #4CAF50;
            text-align: center;
            margin: 0.75rem 0;
          }

          .add-to-cart-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.25rem;
          }

          .add-to-cart-btn:hover {
            background: #45a049;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }

          .add-to-cart-btn:active {
            transform: translateY(0);
          }

          .league-badge {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 0.25rem;
            margin-bottom: 0.75rem;
          }

          .league-logo {
            width: 20px;
            height: 20px;
            object-fit: contain;
          }

          .match-card {
            transition: transform 0.2s ease-in-out;
            height: 240px; /* Significantly increased height for much larger cards */
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            box-sizing: border-box;
          }

          .match-card:hover {
            transform: scale(1.05);
          }

          .match-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-auto-rows: 240px; /* Match the increased card height */
            gap: 0.75rem;
            align-content: start; /* Align items to the top */
          }

          .teams-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            flex: none;
            height: 120px; /* Increased to fit larger card */
            overflow: hidden;
          }

          .team-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            height: 100%;
            overflow: hidden;
          }

          .vs-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-left: 0.125rem;
            margin-right: 0.125rem;
            height: 100%;
            flex: none;
          }

          .buttons-section {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            flex: none;
            height: 70px; /* Increased for larger buttons */
          }

          @media (max-height: 900px) {
            .match-card {
              height: 180px;
            }
            .match-grid {
              grid-auto-rows: 180px;
            }
            .teams-section {
              height: 90px;
            }
            .buttons-section {
              height: 52px;
            }
            .team-container img {
              width: 36px;
              height: 36px;
              margin-bottom: 0.25rem;
            }
            .team-container span {
              font-size: 11px;
            }
            .vs-container span:first-child {
              font-size: 0.875rem;
            }
            .vs-container span:last-child {
              font-size: 11px;
            }
            .buttons-section button {
              padding: 0.25rem 0.5rem;
              font-size: 12px;
            }
            .buttons-section svg {
              width: 16px;
              height: 16px;
            }
            .league-info span {
              font-size: 12px;
            }
          }
        `}
      </style>

      <div
        className="fixed inset-0 flex flex-col bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1508098682722-8b9510c4e1b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        <div className="flex-1 flex flex-col items-center pt-24 px-4">
          <div className="w-full max-w-7xl">
            {matches.length === 0 && (
              <div className="text-white text-center text-lg">No matches available</div>
            )}
            
            {/* Matches Grid - Compact square cards with fixed size */}
            <div className="match-grid">
              {currentMatches.map((match) => (
                <div
                  key={match.id}
                  className="match-card bg-black bg-opacity-80 rounded-lg shadow-md flex flex-col items-center text-white p-3 hover:bg-opacity-90"
                >
                  {/* League Info */}
                  <div className="w-full text-center mb-2 league-info">
                    <span className="text-sm text-gray-400 font-medium">{match.league.name}</span>
                  </div>

                  {/* Teams Section */}
                  <div className="teams-section">
                    {/* Home Team - Vertical */}
                    <div className="team-container">
                      <img
                        src={match.homeTeam.logo}
                        alt={`${match.homeTeam.name} Logo`}
                        className="w-12 h-12 object-contain mb-2"
                      />
                      <span className="text-sm font-medium text-center line-clamp-2">{match.homeTeam.name}</span>
                    </div>

                    {/* VS Badge */}
                    <div className="vs-container">
                      <span className="text-lg font-bold text-green-400">VS</span>
                      <span className="text-sm text-gray-300">{formatMatchTime(match.date)}</span>
                    </div>

                    {/* Away Team - Vertical */}
                    <div className="team-container">
                      <img
                        src={match.awayTeam.logo}
                        alt={`${match.awayTeam.name} Logo`}
                        className="w-12 h-12 object-contain mb-2"
                      />
                      <span className="text-sm font-medium text-center line-clamp-2">{match.awayTeam.name}</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="buttons-section">
                    <button
                      onClick={() => handleAddToCart(match)}
                      className="w-full bg-green-500 text-black font-medium py-2 px-3 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Add</span>
                    </button>
                    <button
                      onClick={() => handleShowDetails(match.id)}
                      className="w-full bg-blue-500 text-white font-medium py-2 px-3 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="fixed bottom-4 left-0 right-0 flex justify-center space-x-1">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === 1
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition`}
                >
                  Prev
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md text-sm transition ${
                      currentPage === number
                        ? 'bg-green-500 text-white'
                        : 'bg-black bg-opacity-50 text-white hover:bg-opacity-75'
                    }`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === totalPages
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Match Details Modal */}
      {selectedMatch && (
        <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedMatch(null)}>×</button>

            {detailsLoading ? (
              <div className="text-center py-4">Loading match details...</div>
            ) : (
              <div>
                {/* League Badge */}
                <div className="league-badge">
                  <img 
                    src={selectedMatch.league.logo} 
                    alt={selectedMatch.league.name}
                    className="league-logo"
                  />
                  <span>{selectedMatch.league.name}</span>
                </div>

                {/* Teams Header */}
                <div className="match-header">
                  <div className="team-info">
                    <img
                      src={selectedMatch.teams.home.logo}
                      alt={selectedMatch.teams.home.name}
                      className="team-logo"
                    />
                    <span className="team-name">{selectedMatch.teams.home.name}</span>
                  </div>

                  <div className="vs-badge">
                    <span className="text-xl">VS</span>
                    <span className="text-xs">
                      {new Date(selectedMatch.fixture.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-xs">
                      {new Date(selectedMatch.fixture.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="team-info">
                    <img
                      src={selectedMatch.teams.away.logo}
                      alt={selectedMatch.teams.away.name}
                      className="team-logo"
                    />
                    <span className="team-name">{selectedMatch.teams.away.name}</span>
                  </div>
                </div>

                {/* Match Details Grid */}
                <div className="match-details">
                  <div className="detail-item">
                    <span className="detail-label">Stadium</span>
                    <span className="detail-value">
                      {selectedMatch.fixture.venue?.name || 'TBD'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">
                      {selectedMatch.fixture.venue?.city || selectedMatch.league.country}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Competition</span>
                    <span className="detail-value">{selectedMatch.league.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Match Status</span>
                    <span className="detail-value">{selectedMatch.fixture.status.long}</span>
                  </div>
                </div>

                {/* Ticket Section */}
                <div className="ticket-section">
                  <h3 className="text-lg font-bold mb-1">Ticket Information</h3>
                  <div className="price-tag">$99.99</div>
                  <p className="text-xs text-gray-400 text-center mb-2">
                    Best available seats • Instant confirmation • Mobile tickets
                  </p>
                  <button
                    onClick={() => {
                      const matchForCart: SimpleMatch = {
                        id: selectedMatch.fixture.id,
                        homeTeam: {
                          name: selectedMatch.teams.home.name,
                          logo: selectedMatch.teams.home.logo,
                        },
                        awayTeam: {
                          name: selectedMatch.teams.away.name,
                          logo: selectedMatch.teams.away.logo,
                        },
                        league: {
                          name: selectedMatch.league.name,
                        },
                        date: selectedMatch.fixture.date,
                      };
                      handleAddToCart(matchForCart);
                      setSelectedMatch(null);
                    }}
                    className="add-to-cart-btn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TicketList;