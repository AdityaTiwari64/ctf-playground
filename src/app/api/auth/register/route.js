import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password, role } = await req.json();
    console.log(email, password, role );

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
    

    const user = new User({
      email,
      username,
      password,
      role,
    });
    await user.save();

    return new Response(
        JSON.stringify({ message: "User created", username }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
  } catch (err) {
    console.error(err);
    return new Response(
        JSON.stringify({ message: "Server error, chill." }),
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
