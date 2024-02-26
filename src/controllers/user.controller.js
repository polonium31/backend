import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const createAccessAndRefreshToken = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {}
};
const registerUser = asyncHandler(async (req, res) => {
  // get user details from front-end
  const { fullName, email, password, username } = req.body;

  // validate details
  if (
    [fullName, email, password, username].some((field) => field?.trim() == "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check for already registered users
  const userExist = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExist) {
    throw new ApiError(409, "email or username is already registered");
  }

  // check for images and cloudinary avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is Needed");
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // upload it to cloudinary
  const avatar = await uploadOnCloud(avatarLocalPath);
  const coverImage = await uploadOnCloud(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar is Needed");
  }

  // create user object in DB
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refresh_token from the DB res
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check whether user is created or not
  if (!userCreated) {
    throw new (500, "Something went wrong while creating a user")();
  }

  return res
    .status(201)
    .json(new ApiResponse(201, userCreated, "User register successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // data from body
  const { email, username, password } = req.body;

  // checking the email and password field is not empty
  if (!(email || username)) {
    throw new ApiError(400, "email or username must not be empty");
  }
  if (!password) {
    throw new ApiError(400, "passowrd must not be empty");
  }

  // finding the user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // verify password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "INVALID user credentials");
  }

  // sending the access_token and refreshtoken via secure cookies
  const { accessToken, refreshToken } = await createAccessAndRefreshToken(
    user._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  delete user.password;
  delete user.refreshToken;
  const loggedUser = user;
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User Logged Successfully"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Unauthorized Access");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is Expired or Used");
    }
    const { accessToken, newRefreshToken } = await createAccessAndRefreshToken(
      user._id
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedUser,
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});
export { registerUser, loginUser, logoutUser, refreshAccessToken };
