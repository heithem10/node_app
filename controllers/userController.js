const User = require("../models/userModel")
const { StatusCodes } = require("http-status-codes")
const CustomError = require("../errors")
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils")
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');


const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError('Please provide an email');
  }
  
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.NotFoundError('No user found with that email');
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  const resetUrl = `http://localhost:4200/password-reset/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link, or paste it into your browser to complete the process within 10 minutes of receiving it: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
    });

    res.status(StatusCodes.OK).json({ message: 'Email sent' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    throw new CustomError.InternalServerError('Email could not be sent');
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new CustomError.BadRequestError('Invalid Token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(StatusCodes.OK).json({ message: 'Password reset successful' });
};




//** ======================== Get all users ========================
const getAllUsers = async (req, res) => {
  // console.log(req.user) //check if I am getting req.user from authentication.js or not
  const user = await User.find({ role: "user" }).select("-password")
  res.status(StatusCodes.OK).json({ total_users: user.length, user })
}

//** ======================== Get single user ========================
const getSingleUser = async (req, res) => {
  const { id: userId } = req.params
  const user = await User.findOne({ _id: userId }).select("-password")
  if (!user) {
    throw CustomError.NotFoundError("User does not exist")
  }
  checkPermissions(req.user, user._id)
  res.status(StatusCodes.OK).json({ user })
}

//** ======================== Show current user ========================
const showCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError("User does not exist");
  }
  res.status(StatusCodes.OK).json({ user });
}

//** ======================== Update user ========================
const updateUser = async (req, res) => {
  const { username, firstName, lastName, email, address } = req.body;
  if (!username || !firstName || !lastName || !email) {
    throw new CustomError.BadRequestError("Please provide all required values");
  }
  const user = await User.findOne({ _id: req.user.userId });

  if (!user) {
    throw new CustomError.NotFoundError("User not found");
  }

  user.username = username;
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.address = address || user.address; // update address only if provided

  await user.save();
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

//** ======================== Update user by id ========================
const updateUserById = async (req, res, next) => {
  const { id } = req.params;
  const { username, firstName, lastName, email, address } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, firstName, lastName, email, address },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new CustomError.NotFoundError("User not found"));
    }

    res.status(StatusCodes.OK).json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
};

//** ======================== Update user password ========================
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide both values")
  }
  const user = await User.findOne({ _id: req.user.userId })
  const isPasswordCorrect = await user.comparePassword(oldPassword)
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Wrong password provided")
  }
  user.password = newPassword
  await user.save()
  res.status(StatusCodes.OK).json({ msg: "Success! Password Updated" })

}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  updateUserById,
  forgotPassword,
  resetPassword,
}
