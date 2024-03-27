import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(400, "name and description is required");
  }
  const userId = req.user._id;
  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: userId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  // check if Invalid userId
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId!");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found!");
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
