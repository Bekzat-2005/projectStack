import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: number;
  workspace: Types.ObjectId;
  assignee?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
      trim: true
    },
    description: {
      type: String,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
      index: true
    },
    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const TaskModel =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
