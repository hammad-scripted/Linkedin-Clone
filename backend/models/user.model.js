import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    bannerImg: {
      type: String,
      default: '',
    },
    headline: {
      type: String,
      default: 'LinkedIn User',
    },
    location: {
      type: String,
      default: 'Earth Planet',
    },
    about: {
      type: String,
      default: 'I am a LinkedIn User',
    },
    skills: [String],
    experience: [
      {
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],
    education: [
      { school: String, fieldOfStudy: String, startYear: Date, endYear: Date },
    ],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

//? prehook to save the user to the database

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
});

//? compare password

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
export const User = model('User', userSchema);
