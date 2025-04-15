import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

// Updated Match interface based on API-Sports response
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
  league: {
    name: string;
  };
  date: string;
}

// Interface for detailed match data
interface MatchDetails {
  fixture: {
    id: number;
    referee: string | null;
    venue: {
      name: string;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
    date: string;
  };
  league: {
    name: string;
    country: string;
    logo: string;
  };
  teams: {
    home: {
      name: string;
      logo: string;
    };
    away: {
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

const fetchMatches = async (): Promise<Match[]> => {
  try {
    const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: {
        'x-apisports-key': '110b44c65ce120fd162a0db5b5ac152b',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    return data.response.map((match: any) => ({
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
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

const fetchMatchDetails = async (matchId: number): Promise<MatchDetails | null> => {
  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?id=${matchId}`, {
      headers: {
        'x-apisports-key': '110b44c65ce120fd162a0db5b5ac152b',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Match Details Response:', data);

    if (data.response.length === 0) {
      return null;
    }

    return data.response[0];
  } catch (error) {
    console.error('Error fetching match details:', error);
    return null;
  }
};

const TicketList = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const { addToCart, cart } = useCart();

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const matchData = await fetchMatches();
        setMatches(matchData);
        setError(null);
      } catch (err) {
        setError('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  const handleAddToCart = (match: Match) => {
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
    console.log(`Added match ${match.id} to cart`);
  };

  const handleShowDetails = async (matchId: number) => {
    setDetailsLoading(true);
    const details = await fetchMatchDetails(matchId);
    setSelectedMatch(details);
    setDetailsLoading(false);
  };

  const handlePurchase = (match: MatchDetails) => {
    const matchForCart: Match = {
      id: match.fixture.id,
      homeTeam: match.teams.home,
      awayTeam: match.teams.away,
      league: { name: match.league.name },
      date: match.fixture.date,
    };

    if (cart.some((item) => item.id === matchForCart.id)) {
      toast.info('Match already in cart!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    addToCart(matchForCart);
    toast.success(`${match.teams.home.name} vs ${match.teams.away.name} added to cart!`, {
      position: 'top-right',
      autoClose: 3000,
    });
    console.log(`Purchased match ${matchForCart.id} added to cart`);
    closeModal();
  };

  const closeModal = () => {
    setSelectedMatch(null);
  };

  const formatMatchTime = (utcDate: string) => {
    const date = new Date(utcDate);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div>Loading matches...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      {/* Inline styles for modal */}
      <style>
        {`
          .modal-container {
            animation: fadeIn 0.3s ease-out;
          }

          .modal-content {
            background: linear-gradient(135deg, #ffffff, #e6f0fa);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            font-family: 'Roboto', sans-serif;
            transform: scale(1);
            transition: transform 0.2s ease;
          }

          .modal-content:hover {
            transform: scale(1.02);
          }

          .modal-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a3c34;
          }

          .team-logo {
            width: 32px;
            height: 32px;
            object-fit: contain;
            border-radius: 50%;
            border: 1px solid #ddd;
          }

          .modal-details {
            color: #333;
            font-size: 1rem;
            line-height: 1.6;
          }

          .modal-details strong {
            color: #1a3c34;
          }

          .close-button {
            background: #ff6b6b;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            font-weight: bold;
            transition: background 0.2s ease;
          }

          .close-button:hover {
            background: #ff4d4d;
          }

          .purchase-button {
            background: #28a745;
            color: white;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 12px;
            transition: transform 0.2s ease, background 0.2s ease;
          }

          .purchase-button:hover {
            background: #218838;
            transform: translateY(-2px);
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>

      <div
        className="w-full min-h-screen flex justify-center bg-cover bg-center py-12 px-4"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1508098682722-8b9510c4e1b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        <div className="w-full max-w-6xl mt-80">
          {matches.length === 0 && <div>No matches available</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-black bg-opacity-80 p-4 rounded-lg shadow-lg flex flex-col items-center text-white"
              >
                <div className="flex justify-between w-full mb-2">
                  <span className="text-sm">{match.homeTeam.name}</span>
                  <span className="text-sm">{match.league.name}</span>
                  <span className="text-sm">{match.awayTeam.name}</span>
                </div>
                <div className="flex justify-between items-center w-full mb-4">
                  <img
                    src={match.homeTeam.logo}
                    alt={`${match.homeTeam.name} Logo`}
                    className="w-12 h-12 object-contain"
                  />
                  <span className="text-lg font-bold">VS</span>
                  <img
                    src={match.awayTeam.logo}
                    alt={`${match.awayTeam.name} Logo`}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div className="text-sm mb-4">{formatMatchTime(match.date)}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(match)}
                    className="bg-green-500 text-black font-bold py-2 px-4 rounded hover:bg-green-600 transition"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleShowDetails(match.id)}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition"
                  >
                    Show Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal for Match Details */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-container">
            <div className="p-6 rounded-lg max-w-lg w-full relative modal-content">
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 close-button"
              >
                ✕
              </button>
              <h2 className="modal-title mb-4">
                <img
                  src={selectedMatch.teams.home.logo}
                  alt={`${selectedMatch.teams.home.name} Logo`}
                  className="team-logo"
                />
                {selectedMatch.teams.home.name} vs {selectedMatch.teams.away.name}
                <img
                  src={selectedMatch.teams.away.logo}
                  alt={`${selectedMatch.teams.away.name} Logo`}
                  className="team-logo"
                />
              </h2>
              {detailsLoading ? (
                <p className="text-center text-gray-600">Loading details...</p>
              ) : (
                <div className="modal-details space-y-3">
                  <p>
                    <strong>League:</strong> {selectedMatch.league.name} ({selectedMatch.league.country})
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(selectedMatch.fixture.date).toLocaleDateString()} at{' '}
                    {formatMatchTime(selectedMatch.fixture.date)}
                  </p>
                  <p>
                    <strong>Venue:</strong> {selectedMatch.fixture.venue.name}
                    {selectedMatch.fixture.venue.city ? `, ${selectedMatch.fixture.venue.city}` : ''}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedMatch.fixture.status.long}
                    {selectedMatch.fixture.status.elapsed
                      ? ` (${selectedMatch.fixture.status.elapsed}' elapsed)`
                      : ''}
                  </p>
                  <p>
                    <strong>Score:</strong>{' '}
                    {selectedMatch.goals.home ?? '0'} - {selectedMatch.goals.away ?? '0'}
                  </p>
                  {selectedMatch.fixture.referee && (
                    <p>
                      <strong>Referee:</strong> {selectedMatch.fixture.referee}
                    </p>
                  )}
                </div>
              )}
              {/* Purchase Button */}
              {!detailsLoading && (
                <button
                  onClick={() => handlePurchase(selectedMatch)}
                  className="absolute bottom-4 right-4 purchase-button"
                >
                  Purchase
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TicketList;