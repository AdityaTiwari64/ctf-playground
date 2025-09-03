import connectDB from "@/lib/db";
import Challenge from "@/lib/models/Challenge";
import User from "@/lib/models/User";

// GET all challenges (requires authentication)
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('admin') === 'true';

    // Require user authentication to view challenges
    if (!userId) {
      return new Response(
        JSON.stringify({ message: "Authentication required to view challenges" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return new Response(
        JSON.stringify({ message: "Invalid user" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Admin users can see all challenges, regular users only see visible ones
    let query = {};
    if (isAdmin && user.role === 'sudo') {
      // Admin can see all challenges
      query = {};
    } else {
      // Regular users only see visible challenges
      query = { isVisible: true };
    }
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const challenges = await Challenge.find(query)
      .populate('createdBy', 'username')
      .select('-flag -flagIV') // Don't expose flags or encryption IV
      .sort({ points: 1 });

    // Add solve status for specific user
    if (userId) {
      challenges.forEach(challenge => {
        challenge._doc.isSolved = challenge.solves.some(
          solve => solve.userId.toString() === userId
        );
        challenge._doc.solveCount = challenge.solves.length;
      });
    } else {
      challenges.forEach(challenge => {
        challenge._doc.solveCount = challenge.solves.length;
      });
    }

    return new Response(
      JSON.stringify({ challenges }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Get challenges error:", err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// POST create new challenge (sudo only)
export async function POST(req) {
  try {
    await connectDB();

    const challengeData = await req.json();
    const { userId, adminPassword, name, description, category, points, flag, hints, files, tags, difficulty, challengeLink } = challengeData;

    console.log("Challenge creation attempt:", { userId, name, category, challengeLink });

    // Verify user exists and is sudo
    const user = await User.findById(userId);
    if (!user || user.role !== 'sudo') {
      return new Response(
        JSON.stringify({ message: "Unauthorized. Sudo access required." }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify admin password
    if (!adminPassword) {
      return new Response(
        JSON.stringify({ message: "Admin password is required for challenge creation." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const isPasswordValid = await user.comparePassword(adminPassword);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ message: "Invalid admin password." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate required fields
    if (!name || !description || !category || !points || !flag) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const challenge = new Challenge({
      name,
      description,
      category,
      points: parseInt(points),
      flag,
      hints: hints || [],
      files: files || [],
      tags: tags || [],
      difficulty: difficulty || 'medium',
      challengeLink: challengeLink || "",
      createdBy: userId
    });

    await challenge.save();

    return new Response(
      JSON.stringify({ 
        message: "Challenge created successfully", 
        challenge: {
          ...challenge.toObject(),
          flag: undefined // Don't return flag
        }
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Create challenge error:", err);
    if (err.code === 11000) {
      return new Response(
        JSON.stringify({ message: "Challenge name already exists" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({ message: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}