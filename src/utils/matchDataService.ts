interface MatchTeam {
  name: string;
  logo: string;
}

interface MatchFixture {
  id: number;
  date: string;
  status: {
    long: string;
    short: string;
    elapsed?: number | null;
  };
  venue?: {
    name: string;
    city: string | null;
  };
  referee?: string | null;
}

interface MatchLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
}

interface MatchGoals {
  home: number | null;
  away: number | null;
}

export interface Match {
  fixture: MatchFixture;
  league: MatchLeague;
  teams: {
    home: MatchTeam;
    away: MatchTeam;
  };
  goals: MatchGoals;
}

export interface MatchResponse {
  response: Match[];
}

// Sample match data for development/fallback
const generateMatches = () => {
  const leagues = [
    {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      teams: [
        { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
        { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
        { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
        { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
        { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png" },
        { id: 47, name: "Tottenham", logo: "https://media.api-sports.io/football/teams/47.png" },
        { id: 46, name: "Leicester", logo: "https://media.api-sports.io/football/teams/46.png" },
        { id: 45, name: "Everton", logo: "https://media.api-sports.io/football/teams/45.png" }
      ]
    },
    {
      id: 140,
      name: "La Liga",
      country: "Spain",
      logo: "https://media.api-sports.io/football/leagues/140.png",
      teams: [
        { id: 541, name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" },
        { id: 529, name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" },
        { id: 530, name: "Atletico Madrid", logo: "https://media.api-sports.io/football/teams/530.png" },
        { id: 532, name: "Valencia", logo: "https://media.api-sports.io/football/teams/532.png" },
        { id: 536, name: "Sevilla", logo: "https://media.api-sports.io/football/teams/536.png" },
        { id: 543, name: "Real Betis", logo: "https://media.api-sports.io/football/teams/543.png" }
      ]
    },
    {
      id: 135,
      name: "Serie A",
      country: "Italy",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      teams: [
        { id: 489, name: "AC Milan", logo: "https://media.api-sports.io/football/teams/489.png" },
        { id: 496, name: "Juventus", logo: "https://media.api-sports.io/football/teams/496.png" },
        { id: 505, name: "Inter", logo: "https://media.api-sports.io/football/teams/505.png" },
        { id: 497, name: "Roma", logo: "https://media.api-sports.io/football/teams/497.png" },
        { id: 492, name: "Napoli", logo: "https://media.api-sports.io/football/teams/492.png" },
        { id: 487, name: "Lazio", logo: "https://media.api-sports.io/football/teams/487.png" }
      ]
    },
    {
      id: 78,
      name: "Bundesliga",
      country: "Germany",
      logo: "https://media.api-sports.io/football/leagues/78.png",
      teams: [
        { id: 157, name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png" },
        { id: 165, name: "Borussia Dortmund", logo: "https://media.api-sports.io/football/teams/165.png" },
        { id: 173, name: "RB Leipzig", logo: "https://media.api-sports.io/football/teams/173.png" },
        { id: 169, name: "Eintracht Frankfurt", logo: "https://media.api-sports.io/football/teams/169.png" },
        { id: 161, name: "VfL Wolfsburg", logo: "https://media.api-sports.io/football/teams/161.png" },
        { id: 168, name: "Bayer Leverkusen", logo: "https://media.api-sports.io/football/teams/168.png" }
      ]
    },
    {
      id: 61,
      name: "Ligue 1",
      country: "France",
      logo: "https://media.api-sports.io/football/leagues/61.png",
      teams: [
        { id: 85, name: "Paris Saint Germain", logo: "https://media.api-sports.io/football/teams/85.png" },
        { id: 81, name: "Marseille", logo: "https://media.api-sports.io/football/teams/81.png" },
        { id: 80, name: "Lyon", logo: "https://media.api-sports.io/football/teams/80.png" },
        { id: 79, name: "Lille", logo: "https://media.api-sports.io/football/teams/79.png" },
        { id: 82, name: "Monaco", logo: "https://media.api-sports.io/football/teams/82.png" },
        { id: 94, name: "Rennes", logo: "https://media.api-sports.io/football/teams/94.png" }
      ]
    }
  ];

  const matches: Match[] = [];
  let matchId = 1;
  const startDate = new Date("2024-03-20T20:00:00+00:00");

  // Generate matches for each league
  leagues.forEach(league => {
    const teams = league.teams;
    // Generate matches between all teams in the league
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const matchDate = new Date(startDate);
        matchDate.setDate(startDate.getDate() + matchId - 1);

        matches.push({
          fixture: {
            id: matchId,
            date: matchDate.toISOString(),
            status: { long: "Not Started", short: "NS" },
            venue: {
              name: `${teams[i].name} Stadium`,
              city: league.country
            }
          },
          league: {
            id: league.id,
            name: league.name,
            country: league.country,
            logo: league.logo
          },
          teams: {
            home: {
              name: teams[i].name,
              logo: teams[i].logo
            },
            away: {
              name: teams[j].name,
              logo: teams[j].logo
            }
          },
          goals: {
            home: null,
            away: null
          }
        });
        matchId++;
      }
    }
  });

  return {
    response: matches
  };
};

const SAMPLE_MATCHES: MatchResponse = generateMatches();

// League IDs for major leagues
const LEAGUE_IDS = [
  39,  // Premier League
  140, // La Liga
  135, // Serie A
  78,  // Bundesliga
  61,  // Ligue 1
  2,   // UEFA Champions League
  3    // UEFA Europa League
];

const fetchAllLeaguesData = async (): Promise<MatchResponse | null> => {
  try {
    console.log('Fetching data for all leagues...');
    
    // Make a single API call for all leagues with more parameters
    const response = await fetch('https://v3.football.api-sports.io/fixtures?league=' + LEAGUE_IDS.join('-') + '&season=2023&next=20', {
      headers: {
        'x-apisports-key': 'ffc0672a4f50f7ce9346c790a8bcff89'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response for all leagues:', data);

    // Store the complete response
    localStorage.setItem('allMatchData', JSON.stringify(data));
    localStorage.setItem('lastFetchTimestamp', Date.now().toString());
    
    return data as MatchResponse;
  } catch (error) {
    console.error('Error fetching all leagues data:', error);
    return null;
  }
};

export const fetchAndStoreMatchData = async (): Promise<MatchResponse> => {
  try {
    // Check if we already have data and it's less than 24 hours old
    const lastFetch = localStorage.getItem('lastFetchTimestamp');
    const now = Date.now();
    
    if (lastFetch && (now - parseInt(lastFetch)) < 24 * 60 * 60 * 1000) {
      console.log('Using cached data - less than 24 hours old');
      const cachedData = localStorage.getItem('allMatchData');
      return cachedData ? JSON.parse(cachedData) : SAMPLE_MATCHES;
    }

    // If no cached data or it's old, fetch new data
    const newData = await fetchAllLeaguesData();
    if (newData && newData.response && newData.response.length > 0) {
      return newData;
    }

    // Use sample data as fallback
    console.log('Using sample data as fallback');
    localStorage.setItem('allMatchData', JSON.stringify(SAMPLE_MATCHES));
    localStorage.setItem('lastFetchTimestamp', now.toString());
    return SAMPLE_MATCHES;
  } catch (error) {
    console.error('Error in fetchAndStoreMatchData:', error);
    return SAMPLE_MATCHES;
  }
};

export const getMatchData = async (): Promise<MatchResponse> => {
  try {
    // First check if we have data in localStorage
    const data = localStorage.getItem('allMatchData');
    const lastFetch = localStorage.getItem('lastFetchTimestamp');
    const now = Date.now();

    console.log('SAMPLE_MATCHES contains:', SAMPLE_MATCHES.response.length, 'matches');

    // If we have recent data in localStorage, use it
    if (data && lastFetch && (now - parseInt(lastFetch)) < 24 * 60 * 60 * 1000) {
      const parsedData = JSON.parse(data);
      console.log('Found data in localStorage:', parsedData);
      console.log('Number of matches in localStorage:', parsedData.response?.length || 0);
      return parsedData;
    }

    // If no data or old data, store and return sample data
    console.log('No valid data in localStorage, using sample data');
    console.log('Sample data being stored:', SAMPLE_MATCHES);
    
    // Make sure we're storing the correct structure
    const dataToStore = {
      response: SAMPLE_MATCHES.response
    };
    
    localStorage.setItem('allMatchData', JSON.stringify(dataToStore));
    localStorage.setItem('lastFetchTimestamp', now.toString());
    
    const verifyData = localStorage.getItem('allMatchData');
    console.log('Verified stored data:', JSON.parse(verifyData || '{}'));
    
    return dataToStore;
  } catch (error) {
    console.error('Error in getMatchData:', error);
    // Return properly structured sample data even in error case
    return {
      response: SAMPLE_MATCHES.response
    };
  }
};

export const getMatchById = (matchId: number): Match | null => {
  try {
    const data = localStorage.getItem('allMatchData');
    if (!data) return null;
    
    const matchData = JSON.parse(data) as MatchResponse;
    if (!matchData.response || !Array.isArray(matchData.response)) return null;
    
    return matchData.response.find(match => match.fixture.id === matchId) || null;
  } catch (error) {
    console.error('Error getting match by ID:', error);
    return null;
  }
};

export const getMatchesByLeague = (leagueId: number): Match[] => {
  try {
    const data = localStorage.getItem('allMatchData');
    if (!data) return [];
    
    const matchData = JSON.parse(data) as MatchResponse;
    if (!matchData.response || !Array.isArray(matchData.response)) return [];
    
    return matchData.response.filter(match => match.league.id === leagueId);
  } catch (error) {
    console.error('Error getting matches by league:', error);
    return [];
  }
}; 