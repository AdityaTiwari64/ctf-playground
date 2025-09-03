import connectDB from "@/lib/db";
import User from "@/lib/models/User";

// GET all users (for leaderboard and admin)
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    let query = {};
    let options = { password: 0 }; // Always exclude password
    
    if (isAdmin) {
      // Admin can see all users with additional info
      const users = await User.find(query, options)
        .sort({ createdAt: -1 }); // Sort by creation date for admin view
      
      return new Response(
        JSON.stringify({ users }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Regular leaderboard view
      const users = await User.find(query, options)
        .sort({ score: -1 }) // Sort by score descending
        .limit(50); // Limit to top 50

      return new Response(
        JSON.stringify({ users }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    console.error("Get users error:", err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}