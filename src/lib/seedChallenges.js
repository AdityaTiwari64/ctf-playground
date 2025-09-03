import connectDB from "./db.js";
import Challenge from "./models/Challenge.js";
import User from "./models/User.js";

const sampleChallenges = [
  {
    name: "Basic Web Exploitation",
    description: "Find the hidden flag in this simple web application. Look for common web vulnerabilities like SQL injection or XSS.\n\nHint: Sometimes the most obvious approach is the right one.",
    category: "web",
    points: 100,
    flag: "flag{w3b_3xpl01t_b4s1c}",
    difficulty: "easy",
    challengeLink: "https://example.com/web-challenge",
    tags: ["sql", "injection", "beginner"],
    hints: [
      { content: "Try looking at the URL parameters", cost: 10 },
      { content: "What happens when you add a single quote?", cost: 20 }
    ]
  },
  {
    name: "Caesar's Secret",
    description: "Julius Caesar used a simple cipher to protect his messages. Can you decode this one?\n\nEncrypted message: WKLV LV D VLPSOH FDHVDU FLSKHU",
    category: "crypto",
    points: 75,
    flag: "flag{c4es4r_c1ph3r_s0lv3d}",
    difficulty: "easy",
    tags: ["caesar", "cipher", "classical"],
    hints: [
      { content: "Caesar cipher shifts letters by a fixed amount", cost: 5 },
      { content: "Try shifting by 3 positions", cost: 15 }
    ]
  },
  {
    name: "Hidden in Plain Sight",
    description: "Sometimes the most important information is hidden where you least expect it. Download the image and find what's concealed within.",
    category: "forensics",
    points: 150,
    flag: "flag{st3g4n0gr4phy_m4st3r}",
    difficulty: "medium",
    tags: ["steganography", "image", "hidden"],
    hints: [
      { content: "The flag might be embedded in the image metadata", cost: 25 },
      { content: "Try using steganography tools like steghide", cost: 50 }
    ]
  },
  {
    name: "Buffer Overflow Basics",
    description: "This program has a classic buffer overflow vulnerability. Can you exploit it to get the flag?\n\nConnect to: nc challenge.ctf 1337",
    category: "pwn",
    points: 200,
    flag: "flag{buff3r_0v3rfl0w_pwn3d}",
    difficulty: "medium",
    tags: ["buffer", "overflow", "exploitation"],
    hints: [
      { content: "The buffer is only 64 bytes long", cost: 30 },
      { content: "You need to overwrite the return address", cost: 60 }
    ]
  },
  {
    name: "Reverse the Binary",
    description: "This binary contains a flag, but it's protected by some checks. Reverse engineer it to find the correct input that reveals the flag.",
    category: "reverse",
    points: 175,
    flag: "flag{r3v3rs3_3ng1n33r1ng}",
    difficulty: "medium",
    tags: ["reverse", "binary", "analysis"],
    hints: [
      { content: "Use a disassembler like Ghidra or IDA", cost: 25 },
      { content: "Look for string comparisons in the code", cost: 45 }
    ]
  },
  {
    name: "RSA Weak Keys",
    description: "Someone implemented RSA encryption but made a critical mistake. The public key is (n=143, e=7). Can you decrypt the message?\n\nCiphertext: 12",
    category: "crypto",
    points: 250,
    flag: "flag{rs4_w34k_k3ys_br0k3n}",
    difficulty: "hard",
    tags: ["rsa", "factorization", "weak"],
    hints: [
      { content: "Factor n = 143 to find p and q", cost: 50 },
      { content: "143 = 11 × 13", cost: 100 }
    ]
  },
  {
    name: "Social Media Investigation",
    description: "A suspect posted something suspicious on social media. Their username is 'ctf_player_2024'. Find their real location based on their posts.\n\nThe flag format is: flag{city_country}",
    category: "osint",
    points: 125,
    flag: "flag{mumbai_india}",
    difficulty: "medium",
    tags: ["osint", "social", "investigation"],
    hints: [
      { content: "Check multiple social media platforms", cost: 20 },
      { content: "Look for location tags in photos", cost: 40 }
    ]
  },
  {
    name: "Miscellaneous Puzzle",
    description: "This challenge doesn't fit into any specific category. You'll need to think outside the box.\n\n01000110 01001100 01000001 01000111 01111011 01100010 01101001 01101110 01100001 01110010 01111001 01011111 01110000 01110101 01111010 01111010 01101100 01100101 01111101",
    category: "misc",
    points: 100,
    flag: "flag{binary_puzzle}",
    difficulty: "easy",
    tags: ["binary", "encoding", "puzzle"],
    hints: [
      { content: "This looks like binary code", cost: 10 },
      { content: "Convert binary to ASCII", cost: 25 }
    ]
  },
  {
    name: "Advanced Web Exploitation",
    description: "This web application has multiple layers of security. You'll need to chain several vulnerabilities to get the flag.\n\nFeatures: User authentication, file upload, admin panel",
    category: "web",
    points: 300,
    flag: "flag{4dv4nc3d_w3b_ch41n}",
    difficulty: "hard",
    challengeLink: "https://advanced-web.ctf.local",
    tags: ["web", "chaining", "advanced"],
    hints: [
      { content: "Start by finding a way to bypass authentication", cost: 75 },
      { content: "Look for file upload vulnerabilities", cost: 100 },
      { content: "The admin panel might have additional vulnerabilities", cost: 125 }
    ]
  },
  {
    name: "Impossible Crypto",
    description: "This cryptographic challenge is considered nearly impossible. Only the most skilled cryptographers should attempt it.\n\nGood luck, you'll need it.",
    category: "crypto",
    points: 500,
    flag: "flag{1mp0ss1bl3_cr7pt0_m4st3r}",
    difficulty: "insane",
    tags: ["advanced", "cryptography", "expert"],
    hints: [
      { content: "This involves advanced mathematical concepts", cost: 150 },
      { content: "Consider elliptic curve cryptography", cost: 200 },
      { content: "The solution requires deep understanding of number theory", cost: 250 }
    ]
  }
];

export async function seedChallenges() {
  try {
    await connectDB();
    
    // Find a sudo user to assign as creator
    const adminUser = await User.findOne({ role: 'sudo' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    console.log('Seeding challenges...');
    
    for (const challengeData of sampleChallenges) {
      const existingChallenge = await Challenge.findOne({ name: challengeData.name });
      
      if (!existingChallenge) {
        const challenge = new Challenge({
          ...challengeData,
          createdBy: adminUser._id
        });
        
        await challenge.save();
        console.log(`Created challenge: ${challengeData.name}`);
      } else {
        console.log(`Challenge already exists: ${challengeData.name}`);
      }
    }
    
    console.log('Challenge seeding completed!');
  } catch (error) {
    console.error('Error seeding challenges:', error);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedChallenges().then(() => process.exit(0));
}