import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import chalk from 'chalk';
import { signupSchema } from '../schemas/auth.schema.js';
import { generateTokenAndSetCookie} from '../lib/generateToken.js';
import {sendWelcomeEmail} from "../emails/emailHandlers.js"
export const signup = async (req, res,next) => {
  try {
    //? validation of the request body

    const validate = signupSchema.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({
        success: false,
        message: validate.error.issues[0].message,
        errors: validate.error.flatten().fieldErrors,
      });
    }
    const { name, username, email, password } = validate.data;

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });
    }

    //? save the user to the database
    const user = new User({ name, username, email, password });
    await user.save();
    //? generate jwt token and set the cookie
    await generateTokenAndSetCookie(user._id, res);
    //? send welcome email
    const profilePictureUrl = process.env.CLIENT_URL + '/profile/' + user.username;
    try {
      await sendWelcomeEmail(user.email, user.name, profilePictureUrl);
    } catch (error) {
      console.log('Error sending email', error);
    }

    return res
      .status(201)
      .json({ success: true, message: 'User registered successfully', user });
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const login = (req, res) => {};
export const logout = (req, res) => {};
