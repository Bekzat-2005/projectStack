import mongoose, { Schema, Types } from "mongoose";

export interface CommentDoc extends mongoose.Document {
  text: string;
  task: Types.ObjectId;
  author: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<CommentDoc>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const CommentModel =
  mongoose.models.Comment || mongoose.model<CommentDoc>("Comment", CommentSchema);
