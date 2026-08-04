import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = async (userId, res) => {
  try {
    const token = await jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.cookie('jwt_linkedin', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return token;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const verifyToken = async function name() {
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
    return null;
  }
};
