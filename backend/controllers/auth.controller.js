import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import chalk from 'chalk';
import { signupSchema, signinSchema } from '../schemas/auth.schema.js';
import { generateTokenAndSetCookie } from '../lib/token.js';
import { sendWelcomeEmail } from '../emails/emailHandlers.js';

const withoutPassword = (user) => {
  const publicUser = user.toObject();
  delete publicUser.password;
  return publicUser;
};

export const signup = async (req, res, next) => {
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
    const profileUrl =
      process.env.CLIENT_URL + '/profile/' + user.username;
    try {
      await sendWelcomeEmail(user.email, user.name, profileUrl);
    } catch (error) {
      console.log('Error sending email', error);
    }

    return res
      .status(201)
      .json({
        success: true,
        message: 'User registered successfully',
        user: withoutPassword(user),
      });
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const login = async (req, res) => {
  const result = signinSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.issues[0].message,
      errors: result.error.flatten().fieldErrors,
    });
  }

  // safe payload

  const { username, password } = result.data;

  // ? check if user exists

  const user = await User.findOne({ username });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: 'User does not exist' });
  }

  //? check if password is correct

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res
      .status(400)
      .json({ success: false, message: 'Password is incorrect' });
  }

  //? generate jwt token and set the cookie
  try {
    await generateTokenAndSetCookie(user._id, res);
    return res
      .status(200)
      .json({
        success: true,
        message: 'User logged in successfully',
        user: withoutPassword(user),
      });
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const logout = (req, res) => {
  try {
    //? clear the cookie
    res.clearCookie('jwt_linkedin');
    return res
      .status(200)
      .json({ success: true, message: 'User logged out successfully' });
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized request, user not found!',
      });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
