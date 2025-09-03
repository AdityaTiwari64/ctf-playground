import mongoose from "mongoose";
import crypto from "crypto";

const ChallengeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ["web", "crypto", "cryptography", "forensics", "pwn", "reverse", "misc", "osint"]
  },
  points: { type: Number, required: true, min: 1 },
  flag: { type: String, required: true }, // Will be encrypted
  flagIV: { type: String }, // Initialization vector for encryption
  hints: [{ 
    content: String,
    cost: { type: Number, default: 0 }
  }],
  files: [{ 
    name: String,
    url: String,
    path: String, // Local file path
    size: Number
  }],
  challengeLink: { type: String }, // External challenge link
  tags: [String],
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard", "insane"],
    default: "medium"
  },
  isVisible: { type: Boolean, default: true },
  solves: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    solvedAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Encryption key from environment variable (ensure it's 32 bytes)
const ENCRYPTION_KEY = process.env.FLAG_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
// Ensure we have exactly 32 bytes for AES-256
const KEY_BUFFER = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex').subarray(0, 32);

// Encrypt flag before saving and update timestamp
ChallengeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Only encrypt if flag is modified and not already encrypted
  if (this.isModified('flag') && !this.flagIV) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', KEY_BUFFER, iv);
      let encrypted = cipher.update(this.flag, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      this.flag = encrypted;
      this.flagIV = iv.toString('hex');
    } catch (error) {
      console.error('Flag encryption error:', error);
      return next(error);
    }
  }
  
  next();
});

// Method to decrypt flag
ChallengeSchema.methods.getDecryptedFlag = function() {
  if (!this.flagIV) {
    return this.flag; // Return as-is if not encrypted (backward compatibility)
  }
  
  try {
    const iv = Buffer.from(this.flagIV, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY_BUFFER, iv);
    let decrypted = decipher.update(this.flag, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Flag decryption error:', error);
    return null;
  }
};

const Challenge = mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);

export default Challenge;