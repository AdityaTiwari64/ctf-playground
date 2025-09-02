import mongoose from "mongoose";

 const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    console.log("DB Connecting..");
    
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "ctf_playground", 
    });
    console.log("DB Connected..");
  } catch (error) {
    console.error("Connection failed:", error);
    throw error;
  }
};

export default connectDB;

