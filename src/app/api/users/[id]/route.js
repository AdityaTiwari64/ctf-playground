import connectDB from "@/lib/db";
import User from "@/lib/models/User";

// GET user by ID
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await User.findById(id, { password: 0 }); // Exclude password

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ user }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Get user error:", err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// PATCH user score (for CTF challenges)
export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { score } = await req.json();

    if (typeof score !== 'number') {
      return new Response(
        JSON.stringify({ message: "Score must be a number" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $inc: { score: score } }, // Increment score
      { new: true, select: '-password' } // Return updated user without password
    );

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "Score updated successfully", 
        user 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Update score error:", err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// PUT user (admin update)
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { username, email, score, role, isVerified, adminPassword, adminId } = await req.json();

    // Verify admin credentials
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'sudo') {
      return new Response(
        JSON.stringify({ message: "Unauthorized: Admin access required" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify admin password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(adminPassword, admin.password);
    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ message: "Invalid admin password" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update user
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (score !== undefined) updateData.score = parseInt(score);
    if (role !== undefined) updateData.role = role;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "User updated successfully", 
        user 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Update user error:", err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// DELETE user (admin only)
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { adminPassword, adminId } = await req.json();

    // Verify admin credentials
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'sudo') {
      return new Response(
        JSON.stringify({ message: "Unauthorized: Admin access required" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify admin password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(adminPassword, admin.password);
    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ message: "Invalid admin password" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Prevent admin from deleting themselves
    if (id === adminId) {
      return new Response(
        JSON.stringify({ message: "Cannot delete your own account" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "User deleted successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Delete user error:", err);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}