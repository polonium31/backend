import mongoose, { Schema, Types } from "mongoose";

const subscriptionSchema = Schema(
  {
    id: {},
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channels: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
