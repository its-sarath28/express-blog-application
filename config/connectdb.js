const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log(`Connected to DataBase`);
  } catch (err) {
    console.log(`Error connecting DB: ${err}`);
    process.exit(1);
  }
};

dbConnect();
