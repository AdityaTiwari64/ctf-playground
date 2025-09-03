'use client'

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";

const Challenges = () => {
  const { user } = useContext(AuthContext);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [flagInputs, setFlagInputs] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/challenges?userId=${user._id || user.id}`);
        const data = await res.json();

        if (res.ok) {
          setChallenges(data.challenges || []);
        } else {
          setError(data.message || 'Failed to fetch challenges');
        }
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user]);

  const handleFlagSubmit = async (challengeId) => {
    const flag = flagInputs[challengeId];
    if (!flag) {
      setSubmissionStatus({
        ...submissionStatus,
        [challengeId]: { type: 'error', message: 'Please enter a flag' }
      });
      return;
    }

    setSubmissionStatus({
      ...submissionStatus,
      [challengeId]: { type: 'loading', message: 'Submitting...' }
    });

    try {
      const res = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId,
          flag,
          userId: user._id || user.id
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmissionStatus({
          ...submissionStatus,
          [challengeId]: { type: 'success', message: 'Correct! Challenge solved!' }
        });
        setFlagInputs({ ...flagInputs, [challengeId]: '' });
        // Refresh challenges to update solved status
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setSubmissionStatus({
          ...submissionStatus,
          [challengeId]: { type: 'error', message: data.message || 'Incorrect flag' }
        });
      }
    } catch (err) {
      setSubmissionStatus({
        ...submissionStatus,
        [challengeId]: { type: 'error', message: 'Submission failed' }
      });
    }
  };

  const handleFlagChange = (challengeId, value) => {
    setFlagInputs({ ...flagInputs, [challengeId]: value });
    // Clear status when user starts typing
    if (submissionStatus[challengeId]) {
      setSubmissionStatus({
        ...submissionStatus,
        [challengeId]: null
      });
    }
  };

  const categories = ['all', ...new Set(challenges.map(ch => ch.category))];
  const filteredChallenges = selectedCategory === 'all'
    ? challenges
    : challenges.filter(ch => ch.category === selectedCategory);

  const openChallengeModal = (challenge) => {
    setSelectedChallenge(challenge);
    setShowModal(true);
  };

  const closeChallengeModal = () => {
    setSelectedChallenge(null);
    setShowModal(false);
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-4">Please log in to view challenges.</p>
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading challenges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Challenges</h1>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">CTF Challenges</h1>
          <p className="text-gray-400">Test your skills and capture the flags!</p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === category
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges Grid */}
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-6xl mb-4">🏁</div>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No Challenges Available</h2>
            <p className="text-gray-500">Check back later for new challenges!</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredChallenges.map((challenge, index) => (
              <div
                key={challenge._id || index}
                className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 hover:border-cyan-500 transition-all duration-300 overflow-hidden h-80 flex flex-col"
              >
                {/* Challenge Header - Clickable */}
                <div
                  className="p-6 border-b border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors duration-200 flex-shrink-0"
                  onClick={() => openChallengeModal(challenge)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white">{challenge.name}</h3>
                    <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {challenge.points} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-medium">
                      {challenge.category}
                    </span>
                    {challenge.solved && (
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                        ✓ Solved
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {truncateText(challenge.description, 120)}
                    {challenge.description.length > 120 && (
                      <span className="text-cyan-400 ml-1 font-medium">Click to read more</span>
                    )}
                  </p>
                </div>

                {/* Challenge Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  {/* Links and Files */}
                  <div className="mb-4 space-y-2">
                    {challenge.challengeLink && (
                      <a
                        href={challenge.challengeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 mr-2"
                      >
                        🔗 Challenge Link
                      </a>
                    )}
                    {challenge.files && challenge.files.length > 0 && challenge.files.map((file, fileIndex) => (
                      <a
                        key={fileIndex}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 mr-2"
                      >
                        📁 {file.name || `File ${fileIndex + 1}`}
                      </a>
                    ))}
                  </div>

                  {/* Flag Submission */}
                  {!challenge.solved && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter flag here..."
                          value={flagInputs[challenge._id] || ''}
                          onChange={(e) => handleFlagChange(challenge._id, e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleFlagSubmit(challenge._id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleFlagSubmit(challenge._id)}
                          disabled={submissionStatus[challenge._id]?.type === 'loading'}
                          className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                        >
                          {submissionStatus[challenge._id]?.type === 'loading' ? '...' : 'Submit'}
                        </button>
                      </div>

                      {/* Submission Status */}
                      {submissionStatus[challenge._id] && (
                        <div className={`text-sm p-2 rounded ${submissionStatus[challenge._id].type === 'success'
                          ? 'bg-green-900 text-green-300 border border-green-700'
                          : submissionStatus[challenge._id].type === 'error'
                            ? 'bg-red-900 text-red-300 border border-red-700'
                            : 'bg-blue-900 text-blue-300 border border-blue-700'
                          }`}>
                          {submissionStatus[challenge._id].message}
                        </div>
                      )}
                    </div>
                  )}

                  {challenge.solved && (
                    <div className="bg-green-900 text-green-300 border border-green-700 p-3 rounded-md text-center">
                      <span className="font-medium">🎉 Challenge Completed!</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Challenge Detail Modal */}
        {showModal && selectedChallenge && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={closeChallengeModal}>
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-600" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-2xl font-bold text-white">{selectedChallenge.name}</h2>
                    <span className="bg-cyan-600 text-white px-4 py-2 rounded-full text-lg font-medium">
                      {selectedChallenge.points} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded text-sm font-medium">
                      {selectedChallenge.category}
                    </span>
                    {selectedChallenge.solved && (
                      <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">
                        ✓ Solved
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeChallengeModal}
                  className="ml-4 text-gray-400 hover:text-white text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Full Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedChallenge.description}
                  </p>
                </div>

                {/* Links and Files */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Resources</h3>
                  <div className="space-y-2">
                    {selectedChallenge.challengeLink && (
                      <a
                        href={selectedChallenge.challengeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 mr-2"
                      >
                        🔗 Challenge Link
                      </a>
                    )}
                    {selectedChallenge.files && selectedChallenge.files.length > 0 && selectedChallenge.files.map((file, fileIndex) => (
                      <a
                        key={fileIndex}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 mr-2"
                      >
                        📁 Download {file.name || `File ${fileIndex + 1}`}
                      </a>
                    ))}
                    {!selectedChallenge.challengeLink && (!selectedChallenge.files || selectedChallenge.files.length === 0) && (
                      <p className="text-gray-400 text-sm">No additional resources available</p>
                    )}
                  </div>
                </div>

                {/* Flag Submission */}
                {!selectedChallenge.solved && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Submit Flag</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter flag here..."
                          value={flagInputs[selectedChallenge._id] || ''}
                          onChange={(e) => handleFlagChange(selectedChallenge._id, e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-lg"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleFlagSubmit(selectedChallenge._id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleFlagSubmit(selectedChallenge._id)}
                          disabled={submissionStatus[selectedChallenge._id]?.type === 'loading'}
                          className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 text-lg"
                        >
                          {submissionStatus[selectedChallenge._id]?.type === 'loading' ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>

                      {/* Submission Status */}
                      {submissionStatus[selectedChallenge._id] && (
                        <div className={`text-sm p-3 rounded ${submissionStatus[selectedChallenge._id].type === 'success'
                          ? 'bg-green-900 text-green-300 border border-green-700'
                          : submissionStatus[selectedChallenge._id].type === 'error'
                            ? 'bg-red-900 text-red-300 border border-red-700'
                            : 'bg-blue-900 text-blue-300 border border-blue-700'
                          }`}>
                          {submissionStatus[selectedChallenge._id].message}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedChallenge.solved && (
                  <div className="bg-green-900 text-green-300 border border-green-700 p-4 rounded-lg text-center">
                    <span className="font-medium text-lg">🎉 Challenge Completed!</span>
                    <p className="text-sm mt-1">You have successfully solved this challenge.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;