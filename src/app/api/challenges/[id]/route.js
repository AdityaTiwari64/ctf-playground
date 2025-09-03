import connectDB from "@/lib/db";
import Challenge from "@/lib/models/Challenge";
import User from "@/lib/models/User";

// GET specific challenge (requires authentication)
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Require user authentication
    if (!userId) {
      return new Response(
        JSON.stringify({ message: "Authentication required" }),
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

    const challenge = await Challenge.findById(id)
      .populate('createdBy', 'username')
      .select('-flag -flagIV'); // Don't expose flag or encryption IV

    if (!challenge) {
      return new Response(
        JSON.stringify({ message: "Challenge not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Add solve status for specific user
    if (userId) {
      challenge._doc.isSolved = challenge.solves.some(
        solve => solve.userId.toString() === userId
      );
    }
    challenge._doc.solveCount = challenge.solves.length;

    return new Response(
      JSON.stringify({ challenge }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Get challenge error:", err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// PUT update challenge (sudo only)
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const updateData = await req.json();
    const { userId, adminPassword } = updateData;

    console.log("Challenge update attempt:", { id, userId });

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
        JSON.stringify({ message: "Admin password is required for challenge updates." }),
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

    delete updateData.userId; // Remove userId from update data
    delete updateData.adminPassword; // Remove password from update data

    // Don't update flag if it's empty (keep existing flag)
    if (!updateData.flag || updateData.flag.trim() === '') {
      delete updateData.flag;
    }

    updateData.updatedAt = Date.now();

    const challenge = await Challenge.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!challenge) {
      return new Response(
        JSON.stringify({ message: "Challenge not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Challenge updated successfully",
        challenge: {
          ...challenge.toObject(),
          flag: undefined // Don't return flag
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Update challenge error:", err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// DELETE challenge (sudo only)
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { userId, adminPassword } = await req.json();

    console.log("Challenge delete attempt:", { id, userId });

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
        JSON.stringify({ message: "Admin password is required for challenge deletion." }),
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

    const challenge = await Challenge.findByIdAndDelete(id);

    if (!challenge) {
      return new Response(
        JSON.stringify({ message: "Challenge not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Challenge deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Delete challenge error:", err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}