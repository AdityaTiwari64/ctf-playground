import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password, role } = await req.json();
    console.log("Registration attempt:", { email, role });

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const username = extractUsername(email);
    if (!username) {
      return new Response(
        JSON.stringify({ message: "Invalid Email... Please use your VIT Email ID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "User with this email or username already exists" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const user = new User({
      email,
      username,
      password,
      role: role || "user",
    });
    
    await user.save();
    console.log("User created successfully:", username);

    return new Response(
        JSON.stringify({ message: "User created successfully", username }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
  } catch (err) {
    console.error("Registration error:", err);
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return new Response(
        JSON.stringify({ message: `${field} already exists` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
        JSON.stringify({ message: "Server error, please try again" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
  }
}

const vitMailRegex = /^[a-zA-Z0-9]+\.([a-z0-9]+)@vitbhopal\.ac\.in$/;

function extractUsername(email) {
  const match = email.match(vitMailRegex);
  return match ? match[1].toUpperCase() : null;
}