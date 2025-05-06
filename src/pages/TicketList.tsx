import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { getMatchData, getMatchById, Match } from '../utils/matchDataService';

// Simplified match type
type SimpleMatch = {
  id: number;
  homeTeam: { name: string; logo: string };
  awayTeam: { name: string; logo: string };
  league: { name: string };
  date: string;
};

const TicketList = () => {
  const [matches, setMatches] = useState<SimpleMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const { addToCart, cart } = useCart();
  const [currentPage, setCurrentPage] = useState(1);
  const [matchesPerPage] = useState(12);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getMatchData();
        if (data?.response?.length) {
          setMatches(
              data.response.map((m: Match) => ({
                id: m.fixture.id,
                homeTeam: { name: m.teams.home.name, logo: m.teams.home.logo },
                awayTeam: { name: m.teams.away.name, logo: m.teams.away.logo },
                league: { name: m.league.name },
                date: m.fixture.date,
              }))
          );
          setError(null);
        } else {
          setError('No matches available');
        }
      } catch {
        setError('Failed to load matches');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const indexOfLast = currentPage * matchesPerPage;
  const indexOfFirst = indexOfLast - matchesPerPage;
  const currentMatches = matches.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(matches.length / matchesPerPage);

  const paginate = (num: number) => setCurrentPage(num);

  const handleShowDetails = async (id: number) => {
    setDetailsLoading(true);
    const details = getMatchById(id);
    setSelectedMatch(details);
    setDetailsLoading(false);
  };

  const handleAddToCart = (match: SimpleMatch) => {
    if (cart.some((item) => item.id === match.id)) {
      return toast.info('Match already in cart!', { position: 'top-right', autoClose: 3000 });
    }
    addToCart(match);
    toast.success(`${match.homeTeam.name} vs ${match.awayTeam.name} added!`, { position: 'top-right', autoClose: 3000 });
  };

  const formatTime = (utc: string) => new Date(utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="text-white text-center">Loading matches...</div>;
  if (error) return <div className="text-white text-center">Error: {error}</div>;

  return (
      <div
          className="fixed inset-0 flex flex-col bg-cover bg-center"
          style={{
            backgroundImage:
                "url('https://images.unsplash.com/photo-1508098682722-8b9510c4e1b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
          }}
      >
        <div className="flex-1 flex flex-col items-center p-16">
          <div className="w-full pt-12">
            {!matches.length && <div className="text-white text-center text-lg">No matches available</div>}

            <div className="grid grid-cols-4 gap-3 auto-rows-[240px]">
              {currentMatches.map((match) => (
                  <div
                      key={match.id}
                      className="bg-black bg-opacity-75 rounded-lg shadow-md flex flex-col justify-between p-3 text-white transform transition-transform hover:scale-105"
                  >
                    <div className="text-center text-sm text-gray-400 font-medium">{match.league.name}</div>
                    <div className="flex justify-between items-center flex-none h-1/2 overflow-hidden">
                      <div className="flex flex-col items-center justify-center flex-1 overflow-hidden">
                        <img src={match.homeTeam.logo} alt="home logo" className="w-12 h-12 object-contain mb-3" />
                        <span className="text-sm font-medium text-center line-clamp-2">{match.homeTeam.name}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center  flex-none">
                        <span className="text-lg font-bold text-green-400">VS</span>
                        <span className="text-sm text-gray-300">{formatTime(match.date)}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center flex-1 overflow-hidden">
                        <img src={match.awayTeam.logo} alt="away logo" className="w-12 h-12 object-contain mb-3" />
                        <span className="text-sm font-medium text-center line-clamp-2">{match.awayTeam.name}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full p-0.5">
                      <button
                          onClick={() => handleAddToCart(match)}
                          className="flex-1 bg-green-500 text-black font-medium py-2 px-3 rounded-md hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Add</span>
                      </button>
                      <button
                          onClick={() => handleShowDetails(match.id)}
                          className="flex-1 bg-blue-500 text-white font-medium py-2 px-3 rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center justify-center gap-1"
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

            {totalPages > 1 && (
                <div className="fixed bottom-4 left-0 right-0 flex justify-center space-x-1">
                  <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md text-sm text-white ${
                          currentPage === 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                  >Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                          key={num}
                          onClick={() => paginate(num)}
                          className={`px-3 py-1 rounded-md text-sm transition ${
                              currentPage === num
                                  ? 'bg-green-500 text-white'
                                  : 'bg-black bg-opacity-50 text-white hover:bg-opacity-75'
                          }`}
                      >{num}</button>
                  ))}
                  <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md text-sm text-white ${
                          currentPage === totalPages ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                  >Next</button>
                </div>
            )}
          </div>
        </div>

        {selectedMatch && (
            <div
                className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 backdrop-blur-sm"
                onClick={() => setSelectedMatch(null)}
            >
              <div
                  className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-2xl w-full max-w-md relative max-h-[80vh] overflow-y-auto shadow-lg border border-white/10"
                  onClick={(e) => e.stopPropagation()}
              >
                <button
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 flex items-center justify-center rounded-full transition-transform hover:scale-110"
                    onClick={() => setSelectedMatch(null)}
                >
                  ×
                </button>

                {detailsLoading ? (
                    <div className="text-center py-4">Loading details...</div>
                ) : (
                    <>
                      <div className="flex items-center gap-2 p-1 bg-white bg-opacity-10 rounded">
                        <img src={selectedMatch.league.logo} alt="league logo" className="w-5 h-5 object-contain" />
                        <span>{selectedMatch.league.name}</span>
                      </div>

                      <div className="flex justify-between items-center my-4 p-3 bg-black bg-opacity-30 rounded-lg">
                        <div className="flex flex-col items-center gap-1">
                          <img src={selectedMatch.teams.home.logo} alt="home logo" className="w-16 h-16 object-contain hover:scale-110 transition-transform" />
                          <span className="text-base font-bold">{selectedMatch.teams.home.name}</span>
                        </div>
                        <div className="text-center font-bold">
                          <span className="block text-xl">VS</span>
                          <span className="block text-xs">
                      {new Date(selectedMatch.fixture.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                          <span className="block text-xs">
                      {new Date(selectedMatch.fixture.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <img src={selectedMatch.teams.away.logo} alt="away logo" className="w-16 h-16 object-contain hover:scale-110 transition-transform" />
                          <span className="text-base font-bold">{selectedMatch.teams.away.name}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-black bg-opacity-20 rounded-lg">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-400">Stadium</span>
                          <span className="text-sm text-white">{selectedMatch.fixture.venue?.name || 'TBD'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-400">Location</span>
                          <span className="text-sm text-white">{selectedMatch.fixture.venue?.city || selectedMatch.league.country}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-400">Competition</span>
                          <span className="text-sm text-white">{selectedMatch.league.name}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-400">Match Status</span>
                          <span className="text-sm text-white">{selectedMatch.fixture.status.long}</span>
                        </div>
                      </div>

                      <div className="bg-black bg-opacity-20 p-3 rounded-lg">
                        <h3 className="text-lg font-bold mb-1">Ticket Information</h3>
                        <div className="text-2xl font-bold text-green-500 text-center my-3">$99.99</div>
                        <p className="text-xs text-gray-400 text-center mb-2">Best available seats • Instant confirmation • Mobile tickets</p>
                        <button
                            onClick={() => {
                              handleAddToCart({
                                id: selectedMatch.fixture.id,
                                homeTeam: { name: selectedMatch.teams.home.name, logo: selectedMatch.teams.home.logo },
                                awayTeam: { name: selectedMatch.teams.away.name, logo: selectedMatch.teams.away.logo },
                                league: { name: selectedMatch.league.name },
                                date: selectedMatch.fixture.date,
                              });
                              setSelectedMatch(null);
                            }}
                            className="w-full bg-green-500 text-black font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1 hover:bg-green-600 transition-transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add to Cart
                        </button>
                      </div>
                    </>
                )}
              </div>
            </div>
        )}
      </div>
  );
};

export default TicketList;
