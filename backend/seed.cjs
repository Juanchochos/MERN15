require('dotenv').config();
const md5 = require('md5');
const mongoose = require("mongoose");
const User = require("./models/user.cjs");

async function seedUser() {
  try {
    // Connect to MongoDB Atlas
    const url = process.env.MONGODB_URI;
    await mongoose.connect(url);
    console.log("MongoDB connected");

    const hashedPassword = await md5('password');

    await User.create({
      login: 'james2',
      firstName: 'james',
      lastName: 'phillips',
      email: 'jennuphillips@googlemail.com',
      password: hashedPassword,
    });

    console.log('User created');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  }
}

seedUser();