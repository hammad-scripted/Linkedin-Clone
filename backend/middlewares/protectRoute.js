import { User } from '../models/user.model.js';
import { verifyToken } from '../lib/token.js';

export const protectRoute = async (req, res, next) => {
  const token = req.cookies.jwt_linkedin;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized request, token not found!',
    });
  }

  try {
    const decoded = await verifyToken(token);

    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Please login to access this route',
      });
    }

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized request, user not found!',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ success: false, message: 'Please login to access this route' });
  }
};
