import connectDB from "@/lib/db";
import Submission from "@/lib/models/Submission";
import User from "@/lib/models/User";

// GET progress data for leaderboard graph
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const hours = parseInt(searchParams.get('hours')) || 24; // Default to last 24 hours
    const limit = parseInt(searchParams.get('limit')) || 10; // Top 10 users

    // Calculate time range
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (hours * 60 * 60 * 1000));

    // Get top users by current score
    const topUsers = await User.find({}, { password: 0 })
      .sort({ score: -1 })
      .limit(limit);

    if (topUsers.length === 0) {
      return new Response(
        JSON.stringify({ progressData: [] }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const topUserIds = topUsers.map(user => user._id);

    // Get all correct submissions for these users within the time range
    const submissions = await Submission.find({
      userId: { $in: topUserIds },
      isCorrect: true,
      submittedAt: { $gte: startTime, $lte: endTime }
    })
    .sort({ submittedAt: 1 })
    .populate('userId', 'username');

    // Generate time intervals (every hour)
    const timeIntervals = [];
    for (let i = 0; i <= hours; i++) {
      const time = new Date(startTime.getTime() + (i * 60 * 60 * 1000));
      timeIntervals.push({
        time: time,
        label: time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      });
    }

    // Build progress data for each user
    const progressData = topUsers.map((user, index) => {
      const userSubmissions = submissions.filter(sub => 
        sub.userId._id.toString() === user._id.toString()
      );

      // Calculate cumulative score at each time interval
      const points = timeIntervals.map(interval => {
        const submissionsUpToTime = userSubmissions.filter(sub => 
          sub.submittedAt <= interval.time
        );
        const cumulativeScore = submissionsUpToTime.reduce((sum, sub) => sum + sub.points, 0);
        
        return {
          time: interval.label,
          score: cumulativeScore,
          timestamp: interval.time
        };
      });

      // Generate a consistent color for each user
      const colors = [
        '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
        '#ec4899', '#84cc16', '#6366f1', '#f97316', '#14b8a6'
      ];

      return {
        userId: user._id,
        username: user.username,
        currentScore: user.score,
        color: colors[index % colors.length],
        points: points
      };
    });

    // Filter out users with no progress (all zeros)
    const activeProgressData = progressData.filter(user => 
      user.points.some(point => point.score > 0)
    );

    return new Response(
      JSON.stringify({ 
        progressData: activeProgressData,
        timeRange: {
          start: startTime,
          end: endTime,
          hours: hours
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Get progress data error:", err);
    return new Response(
      JSON.stringify({ message: "Server error", progressData: [] }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}