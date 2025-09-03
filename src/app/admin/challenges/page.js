"use client";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminChallengesPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "web",
    points: "",
    flag: "",
    difficulty: "medium",
    hints: [],
    files: [],
    tags: "",
    isVisible: true,
    adminPassword: "",
    challengeLink: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "sudo") {
      router.push("/");
      return;
    }
    fetchChallenges();
  }, [user, router]);

  const fetchChallenges = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Admin should be able to see all challenges, including hidden ones
      const response = await fetch(`/api/challenges?userId=${user._id || user.id}&admin=true`);
      const data = await response.json();
      
      if (response.ok) {
        setChallenges(data.challenges || []);
      } else {
        console.error("Error fetching challenges:", data.message);
        setChallenges([]);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleHintChange = (index, field, value) => {
    const newHints = [...formData.hints];
    newHints[index] = { ...newHints[index], [field]: value };
    setFormData(prev => ({ ...prev, hints: newHints }));
  };

  const addHint = () => {
    setFormData(prev => ({
      ...prev,
      hints: [...prev.hints, { content: "", cost: 0 }]
    }));
  };

  const removeHint = (index) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('challengeId', editingChallenge?._id || 'new');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          return data.file;
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      });

      const uploadedFileInfos = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...uploadedFileInfos]);
      
      // Add to form data
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...uploadedFileInfos]
      }));

      alert(`Successfully uploaded ${uploadedFileInfos.length} file(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload some files');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      ...formData,
      userId: user._id || user.id, // Handle both _id and id
      points: parseInt(formData.points),
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
    };

    console.log("Submitting challenge data:", submitData); // Debug log

    try {
      const url = editingChallenge 
        ? `/api/challenges/${editingChallenge._id}`
        : "/api/challenges";
      
      const method = editingChallenge ? "PUT" : "POST";

      console.log(`${method} request to:`, url); // Debug log

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log("Server response:", data); // Debug log

      if (response.ok) {
        alert(editingChallenge ? "Challenge updated!" : "Challenge created!");
        setShowForm(false);
        setEditingChallenge(null);
        resetForm();
        fetchChallenges();
      } else {
        alert(data.message);
        console.error("Server error:", data);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error saving challenge");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "web",
      points: "",
      flag: "",
      difficulty: "medium",
      hints: [],
      files: [],
      tags: "",
      isVisible: true,
      adminPassword: "",
      challengeLink: "",
    });
    setUploadedFiles([]);
  };

  const editChallenge = (challenge) => {
    console.log("Editing challenge:", challenge); // Debug log
    setEditingChallenge(challenge);
    setFormData({
      name: challenge.name || "",
      description: challenge.description || "",
      category: challenge.category || "web",
      points: challenge.points ? challenge.points.toString() : "",
      flag: "", // Don't pre-fill flag for security
      difficulty: challenge.difficulty || "medium",
      hints: challenge.hints || [],
      files: challenge.files || [],
      tags: challenge.tags ? challenge.tags.join(", ") : "",
      isVisible: challenge.isVisible !== undefined ? challenge.isVisible : true,
      adminPassword: "", // Always require password for edits
      challengeLink: challenge.challengeLink || "",
    });
    setUploadedFiles(challenge.files || []);
    setShowForm(true);
  };

  const deleteChallenge = async (challengeId) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    const adminPassword = prompt("Enter your admin password to confirm deletion:");
    if (!adminPassword) return;

    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          adminPassword: adminPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Challenge deleted!");
        fetchChallenges();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting challenge");
    }
  };



  if (!user || user.role !== "sudo") {
    return <div className="text-white">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Challenge Management</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingChallenge(null);
              resetForm();
            }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
          >
            Add New Challenge
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingChallenge ? "Edit Challenge" : "Create New Challenge"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="web">Web</option>
                    <option value="crypto">Crypto</option>
                    <option value="cryptography">Cryptography</option>
                    <option value="forensics">Forensics</option>
                    <option value="pwn">PWN</option>
                    <option value="reverse">Reverse</option>
                    <option value="misc">Misc</option>
                    <option value="osint">OSINT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Points</label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="insane">Insane</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Flag</label>
                <input
                  type="text"
                  name="flag"
                  value={formData.flag}
                  onChange={handleInputChange}
                  required={!editingChallenge}
                  placeholder={editingChallenge ? "Leave empty to keep current flag" : "flag{example}"}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Challenge Link (Optional)</label>
                <input
                  type="url"
                  name="challengeLink"
                  value={formData.challengeLink}
                  onChange={handleInputChange}
                  placeholder="https://example.com/challenge"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  External link to the challenge (e.g., web application, remote server)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Admin Password</label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your admin password to confirm"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Required for security verification when creating/updating challenges
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="web, sql, injection"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Hints</label>
                  <button
                    type="button"
                    onClick={addHint}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                  >
                    Add Hint
                  </button>
                </div>
                {formData.hints.map((hint, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Hint content"
                      value={hint.content}
                      onChange={(e) => handleHintChange(index, "content", e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Cost"
                      value={hint.cost}
                      onChange={(e) => handleHintChange(index, "cost", parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeHint(index)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Challenge Files</label>
                  <label className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm cursor-pointer">
                    {uploading ? "Uploading..." : "Upload Files"}
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between gap-2 mb-2 p-2 bg-gray-700 rounded">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-1">
                  Files will be stored locally and accessible to participants
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isVisible"
                  checked={formData.isVisible}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm">Visible to users</label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingChallenge ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingChallenge(null);
                    resetForm();
                  }}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Solves
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {challenges.map((challenge) => (
                  <tr key={challenge._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {challenge.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 bg-blue-600 rounded text-xs">
                        {challenge.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {challenge.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        challenge.difficulty === 'easy' ? 'bg-green-600' :
                        challenge.difficulty === 'medium' ? 'bg-yellow-600' :
                        challenge.difficulty === 'hard' ? 'bg-orange-600' :
                        'bg-red-600'
                      }`}>
                        {challenge.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {challenge.solveCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {challenge.challengeLink ? (
                        <a 
                          href={challenge.challengeLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          🔗 Link
                        </a>
                      ) : (
                        <span className="text-gray-500 text-xs">No link</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        challenge.isVisible ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {challenge.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => editChallenge(challenge)}
                        className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteChallenge(challenge._id)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}