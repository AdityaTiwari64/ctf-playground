import connectDB from "@/lib/db";
import Challenge from "@/lib/models/Challenge";
import User from "@/lib/models/User";
import Submission from "@/lib/models/Submission";

// POST submit flag (with rate limiting)
export async function POST(req) {
  try {
    await connectDB();

    const { challengeId, userId, flag } = await req.json();

    if (!challengeId || !userId || !flag) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
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

    // Basic rate limiting: prevent too many attempts
    const recentAttempts = await Challenge.findById(challengeId);
    if (!recentAttempts) {
      return new Response(
        JSON.stringify({ message: "Challenge not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Use the challenge we already found
    const challenge = recentAttempts;

    // Check if user already solved this challenge
    const alreadySolved = challenge.solves.some(
      solve => solve.userId.toString() === userId
    );

    if (alreadySolved) {
      return new Response(
        JSON.stringify({ message: "You have already solved this challenge" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize and validate flag input
    const sanitizedFlag = flag.trim().replace(/[^\w{}_-]/g, '');
    if (sanitizedFlag.length === 0 || sanitizedFlag.length > 100) {
      return new Response(
        JSON.stringify({ message: "Invalid flag format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if flag is correct (decrypt stored flag)
    const correctFlag = challenge.getDecryptedFlag();
    const isCorrect = correctFlag && sanitizedFlag === correctFlag.trim();

    // Record submission (both correct and incorrect)
    const submission = new Submission({
      userId: userId,
      challengeId: challengeId,
      flag: sanitizedFlag,
      isCorrect: isCorrect,
      points: isCorrect ? challenge.points : 0,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });
    await submission.save();

    if (!isCorrect) {
      // Log failed attempt for security monitoring
      console.log(`Failed flag attempt for challenge ${challengeId} by user ${userId}: ${sanitizedFlag}`);

      return new Response(
        JSON.stringify({ message: "Incorrect flag" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Add solve to challenge
    challenge.solves.push({
      userId: userId,
      solvedAt: new Date()
    });
    await challenge.save();

    // Update user score
    await User.findByIdAndUpdate(
      userId,
      { $inc: { score: challenge.points } }
    );

    return new Response(
      JSON.stringify({
        message: "Correct flag! Challenge solved!",
        points: challenge.points
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Submit flag error:", err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}