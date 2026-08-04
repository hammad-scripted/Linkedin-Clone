import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import chalk from 'chalk';
import { signupSchema } from '../schemas/auth.schema.js';
import { generateToken } from '../lib/generateToken.js';
export const signup = async (req, res) => {
  try {
    //? validation of the request body

    const validate = signupSchema.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({
        success: false,
        message: validate.error.issues[0].message,
        errors: validation.error.flatten().fieldErrors,
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
    generateTokenAndSetCookie({ userId: user._id }, 200, res);
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const login = (req, res) => {};
export const logout = (req, res) => {};
