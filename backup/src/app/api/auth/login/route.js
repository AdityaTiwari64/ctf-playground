import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return new Response(
        JSON.stringify({ message: "Invalid credentials" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ message: "Invalid credentials" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return user data (excluding password)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      score: user.score,
      createdAt: user.createdAt,
    };

    return new Response(
      JSON.stringify({ 
        message: "Login successful", 
        user: userData 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    return new Response(
      JSON.stringify({ message: "Server error, please try again" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}