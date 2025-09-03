import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  flag: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
submissionSchema.index({ userId: 1, submittedAt: -1 });
submissionSchema.index({ challengeId: 1, submittedAt: -1 });
submissionSchema.index({ isCorrect: 1, submittedAt: -1 });

const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

export default Submission;