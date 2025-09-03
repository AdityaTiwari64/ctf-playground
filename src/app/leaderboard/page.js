"use client";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function LeaderboardPage() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
    fetchProgressData();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      const response = await fetch("/api/leaderboard/progress?hours=24&limit=10");
      const data = await response.json();
      setProgressData(data.progressData || []);
    } catch (error) {
      console.error("Error fetching progress data:", error);
      setProgressData([]);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-yellow-400";
      case 2:
        return "text-gray-300";
      case 3:
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  const ProgressGraph = () => {
    if (progressData.length === 0) return null;

    const maxScore = Math.max(...progressData.flatMap(team => team.points.map(p => p.score)));
    const timePoints = progressData[0]?.points.map(p => p.time) || [];

    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-300">Top 10 Teams Progress</h2>
        <div className="relative">
          {/* Graph Container */}
          <div className="relative h-80 bg-gray-900 rounded-lg p-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
              <span>{maxScore}</span>
              <span>{Math.floor(maxScore * 0.75)}</span>
              <span>{Math.floor(maxScore * 0.5)}</span>
              <span>{Math.floor(maxScore * 0.25)}</span>
              <span>0</span>
            </div>

            {/* Graph area */}
            <div className="ml-8 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                  <div
                    key={ratio}
                    className="absolute w-full border-t border-gray-700"
                    style={{ top: `${(1 - ratio) * 100}%` }}
                  />
                ))}
              </div>

              {/* Progress lines */}
              <svg className="absolute inset-0 w-full h-full">
                {progressData.map((team, teamIndex) => {
                  const pathData = team.points.map((point, index) => {
                    const x = (index / (timePoints.length - 1)) * 100;
                    const y = (1 - (point.score / maxScore)) * 100;
                    return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                  }).join(' ');

                  return (
                    <g key={teamIndex}>
                      {/* Line */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke={team.color}
                        strokeWidth="2"
                        className="drop-shadow-sm"
                      />
                      {/* Points */}
                      {team.points.map((point, index) => {
                        const x = (index / (timePoints.length - 1)) * 100;
                        const y = (1 - (point.score / maxScore)) * 100;
                        return (
                          <circle
                            key={index}
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r="3"
                            fill={team.color}
                            className="drop-shadow-sm"
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-400 mt-2">
              {timePoints.map((time) => (
                <span key={time}>{time}</span>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
            {progressData.map((team, index) => (
              <div key={index} className="flex items-center text-xs">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-gray-300 truncate">{team.team}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-400">Top performers in CTF Playground</p>
        </div>

        {/* Progress Graph */}
        <ProgressGraph />

        {users.length === 0 ? (
          <div className="text-center text-gray-400">
            <p className="text-xl">No users found</p>
            <p>Be the first to solve some challenges!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top 3 Podium */}
            {users.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                <div className="bg-gray-800 rounded-lg p-6 text-center transform translate-y-4">
                  <div className="text-4xl mb-2">🥈</div>
                  <div className="text-xl font-bold">{users[1].username}</div>
                  <div className="text-gray-300">{users[1].score} points</div>
                  <div className="text-sm text-gray-400 mt-2">
                    {users[1].role === 'sudo' && (
                      <span className="bg-red-600 px-2 py-1 rounded text-xs">ADMIN</span>
                    )}
                  </div>
                </div>

                {/* 1st Place */}
                <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-lg p-6 text-center">
                  <div className="text-5xl mb-2">🥇</div>
                  <div className="text-2xl font-bold">{users[0].username}</div>
                  <div className="text-yellow-100 text-lg">{users[0].score} points</div>
                  <div className="text-sm mt-2">
                    {users[0].role === 'sudo' && (
                      <span className="bg-red-600 px-2 py-1 rounded text-xs">ADMIN</span>
                    )}
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="bg-gray-800 rounded-lg p-6 text-center transform translate-y-4">
                  <div className="text-4xl mb-2">🥉</div>
                  <div className="text-xl font-bold">{users[2].username}</div>
                  <div className="text-gray-300">{users[2].score} points</div>
                  <div className="text-sm text-gray-400 mt-2">
                    {users[2].role === 'sudo' && (
                      <span className="bg-red-600 px-2 py-1 rounded text-xs">ADMIN</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((leaderUser, index) => {
                      const rank = index + 1;
                      const isCurrentUser = user && user.id === leaderUser._id;
                      
                      return (
                        <tr 
                          key={leaderUser._id}
                          className={`${isCurrentUser ? 'bg-blue-900 bg-opacity-50' : ''} hover:bg-gray-700`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-lg font-bold ${getRankColor(rank)}`}>
                              {getRankIcon(rank)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium">
                                {leaderUser.username}
                                {isCurrentUser && (
                                  <span className="ml-2 text-blue-400 text-xs">(You)</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-400">
                              {leaderUser.score} pts
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {leaderUser.role === 'sudo' ? (
                              <span className="px-2 py-1 bg-red-600 rounded text-xs font-medium">
                                ADMIN
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-blue-600 rounded text-xs font-medium">
                                USER
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(leaderUser.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Stats */}
            {user && (
              <div className="bg-gray-800 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-bold mb-4">Your Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      #{users.findIndex(u => u._id === user.id) + 1 || 'N/A'}
                    </div>
                    <div className="text-gray-400">Current Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {user.score}
                    </div>
                    <div className="text-gray-400">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {users.length > 0 ? Math.max(0, users[0].score - user.score) : 0}
                    </div>
                    <div className="text-gray-400">Points Behind Leader</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}