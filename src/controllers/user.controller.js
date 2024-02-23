import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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

export { registerUser };
