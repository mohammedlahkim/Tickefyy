import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// Define the Fixture interface based on API-Football response
interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
    };
  };
  league: {
    id: number;
    name: string;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

const HomePage = () => {
  const [lastMatches, setLastMatches] = useState<Fixture[]>([]);

  // API configuration
  const API_KEY = "85d13f0426c99ac8053586dd6a5e47d0"; // Your provided API key
  const API_HOST = "v3.football.api-sports.io";

  useEffect(() => {
    const fetchLastMatches = async () => {
      try {
        // Fetch the last 2 matches for a specific team (e.g., Morocco, team ID 28)
        const response = await axios.get(
          `https://${API_HOST}/fixtures?team=28&last=2`, // Morocco team ID: 28, last 2 matches
          {
            headers: {
              "x-apisports-key": API_KEY,
            },
          }
        );
        setLastMatches(response.data.response);
      } catch (error) {
        console.error("Error fetching last matches:", error);
      }
    };

    fetchLastMatches();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-900 text-white">
      <div
        className="w-full min-h-screen flex flex-col items-center bg-cover bg-center px-4 py-10 relative"
        style={{
          backgroundImage: "url('/stadium.jpg')",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 flex justify-center items-center">
          <img src="/player.png" alt="Star Player" className="w-full max-w-3xl z-10" />
        </div>

        <div className="relative w-full max-w-6xl flex mt-8 items-start">
          {/* Left Section - Match Title and Last Matches */}
          <div className="w-1/4 flex flex-col space-y-4 pl-10">
            <h2 className="text-5xl font-bold bg-black bg-opacity-50 p-4 rounded-lg">
              {lastMatches.length > 0 ? (
                <>
                  {lastMatches[0].teams.home.name} <span className="text-green-400">VS</span>{" "}
                  {lastMatches[0].teams.away.name}
                </>
              ) : (
                "Morocco VS Senegal"
              )}
            </h2>

            {/* Last Matches (Replacing Last Fixture) */}
            {lastMatches.length > 0 ? (
              lastMatches.map((match, index) => (
                <div key={index} className="bg-black bg-opacity-70 p-4 rounded-xl w-60">
                  <h3 className="text-lg font-semibold">Last Match {index + 1}</h3>
                  <div className="flex items-center space-x-2">
                    <span>{match.teams.home.name.slice(0, 3).toUpperCase()}</span>
                    <img
                      src={match.teams.home.logo}
                      alt={`${match.teams.home.name} Logo`}
                      className="w-6 h-6"
                    />
                    <span>
                      {match.goals.home ?? "-"} : {match.goals.away ?? "-"}
                    </span>
                    <img
                      src={match.teams.away.logo}
                      alt={`${match.teams.away.name} Logo`}
                      className="w-6 h-6"
                    />
                    <span>{match.teams.away.name.slice(0, 3).toUpperCase()}</span>
                  </div>
                  <Link to={`/highlights/${match.fixture.id}`} className="text-green-400 text-sm">
                    View Highlights
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-black bg-opacity-70 p-4 rounded-xl w-60">
                <h3 className="text-lg font-semibold">Last Fixture</h3>
                <div className="flex items-center space-x-2">
                  <span>MOR</span>
                  <img src="/morocco-flag.png" alt="Morocco Flag" className="w-6 h-6" />
                  <span>1 : 0</span>
                  <img src="/benin-flag.png" alt="Benin Flag" className="w-6 h-6" />
                  <span>BEN</span>
                </div>
                <Link to="/highlights/last" className="text-green-400 text-sm">
                  View Highlights
                </Link>
              </div>
            )}
          </div>

          {/* Center Section - Empty */}
          <div className="w-1/2"></div>

          {/* Right Section - Upcoming Matches (Static for now) and User Profile */}
          <div className="w-1/4 flex flex-col items-end pr-10 space-y-4">
            <div className="flex flex-col w-64 space-y-4">
              {lastMatches.length > 0 ? (
                lastMatches.map((match, index) => (
                  <div
                    key={index}
                    className="bg-black bg-opacity-70 p-4 rounded-xl text-right"
                  >
                    <div className="flex flex-col items-end space-y-2">
                      <span>
                        {match.teams.home.name} vs {match.teams.away.name}
                      </span>
                      <div className="flex justify-end items-center space-x-2">
                        <img
                          src={match.teams.home.logo}
                          alt={`${match.teams.home.name} Logo`}
                          className="w-12 h-12"
                        />
                      </div>
                    </div>
                    <Link
                      to="/ticketlist"
                      className="mt-2 px-10 py-2 bg-green-400 text-black font-bold rounded-lg"
                    >
                      Purchase a ticket
                    </Link>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-black bg-opacity-70 p-4 rounded-xl text-right">
                    <div className="flex flex-col items-end space-y-2">
                      <span>Morocco vs Algeria</span>
                      <div className="flex justify-end items-center space-x-2">
                        <img src="/moralg.jpeg" alt="moralg" className="w-45 h-45" />
                      </div>
                    </div>
                    <Link
                      to="/ticketlist"
                      className="mt-2 px-10 py-2 bg-green-400 text-black font-bold rounded-lg"
                    >
                      Purchase a ticket
                    </Link>
                  </div>
                  <div className="bg-black bg-opacity-70 p-4 rounded-xl text-right">
                    <div className="flex flex-col items-end space-y-2">
                      <span>Nigeria vs Benin</span>
                      <div className="flex justify-end items-center space-x-2">
                        <img src="/nigeriabenin.jpg" alt="Benin Flag" className="w-45 h-45" />
                      </div>
                    </div>
                    <Link
                      to="/ticketlist"
                      className="mt-2 px-10 py-2 bg-green-400 text-black font-bold rounded-lg"
                    >
                      Purchase a ticket
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* User Profile (Static) */}
            <div className="bg-black bg-opacity-70 p-4 rounded-xl w-64 text-right">
              <div className="flex justify-end items-center space-x-2">
                <span>Mohammed Lahkim</span>
                <div className="w-10 h-10 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Info Section (Static for now) */}
        <div className="w-full max-w-6xl flex justify-end mt-10 pr-4 z-20">
          <div className="flex space-x-6 mr-60">
            <div className="bg-black bg-opacity-80 p-6 rounded-xl text-center border border-gray-600 shadow-lg transform transition-transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">Ticket Price</h3>
              <p className="text-3xl font-bold">50.999$</p>
            </div>
            <div className="bg-black bg-opacity-80 p-6 rounded-xl text-center border border-gray-600 shadow-lg transform transition-transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">Timing</h3>
              <p className="text-3xl font-bold">6:30 pm</p>
            </div>
            <div className="bg-black bg-opacity-80 p-6 rounded-xl text-center border border-gray-600 shadow-lg transform transition-transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">Remaining Tickets</h3>
              <p className="text-3xl font-bold">268</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;