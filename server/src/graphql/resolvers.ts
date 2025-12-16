import bcrypt from "bcryptjs";
import { UserModel } from "../models/User.model";
import { WorkspaceModel } from "../models/Workspace.model";
import { TaskModel } from "../models/Task.model";
import { signToken } from "../utils/jwt";
import { pubsub, EVENTS } from "./pubsub";
import { CommentModel } from "../models/Comment.model";
import { withFilter } from "graphql-subscriptions";



export const resolvers = {
  Query: {
    hello: () => "Hello from GraphQL 🚀",

    me: async (_: unknown, __: unknown, ctx: any) => {
      if (!ctx.userId) throw new Error("Not authenticated");

      const user = await UserModel.findById(ctx.userId);
      if (!user || user.isDeleted) throw new Error("User not found");

      return user;
    },

    workspaces: async (_: unknown, __: unknown, ctx: any) => {
  if (!ctx.userId) throw new Error("Not authenticated");

  return WorkspaceModel.find({
    isArchived: false,
    $or: [
      { owner: ctx.userId },
      { members: ctx.userId },
    ],
  }).populate("owner members");
},
   workspace: async (_: unknown, { id }: any, ctx: any) => {
  if (!ctx.userId) throw new Error("Not authenticated");

  const workspace = await WorkspaceModel.findById(id).populate(
    "owner members"
  );

  if (!workspace || workspace.isArchived)
    throw new Error("Workspace not found");

  const isOwner = workspace.owner.toString() === ctx.userId;
  const isMember = workspace.members.some(
    (m: any) => m.toString() === ctx.userId
  );

  if (!isOwner && !isMember) {
    throw new Error("Access denied");
  }

  return workspace;
},

    tasks: async (_: unknown, { workspaceId }: any, ctx: any) => {
      if (!ctx.userId) throw new Error("Not authenticated");

      return TaskModel.find({
        workspace: workspaceId,
        isDeleted: false,
      }).populate("assignee workspace");
    },
    comments: async (_: unknown, { taskId }: any, ctx: any) => {
  if (!ctx.userId) throw new Error("Not authenticated");

  return CommentModel.find({ task: taskId, isDeleted: false })
    .sort({ createdAt: 1 })
    .populate("author task");

},
task: async (_: any, { id }: { id: string }, ctx: any) => {
    if (!ctx.userId) throw new Error("Not authenticated");

    const task = await TaskModel.findOne({
      _id: id,
      isDeleted: false,
    });

    return task; // ❗ throw жасама
  },
  userByEmail: async (_: unknown, { email }: { email: string }, ctx: any) => {
  if (!ctx.userId) throw new Error("Not authenticated");

  const user = await UserModel.findOne({ email, isDeleted: false });
  return user; // табылмаса null қайтады
},
  },

  Mutation: {
    register: async (_: unknown, args: any) => {
      const { email, password, name } = args;

      const exists = await UserModel.findOne({ email });
      if (exists) throw new Error("Email already exists");

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await UserModel.create({ email, passwordHash, name });

      const token = signToken(user.id);
      return { accessToken: token, user };
    },

    login: async (_: unknown, args: any) => {
      const { email, password } = args;

      const user = await UserModel.findOne({ email, isDeleted: false });
      if (!user) throw new Error("Invalid credentials");

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) throw new Error("Invalid credentials");

      const token = signToken(user.id);
      return { accessToken: token, user };
    },

    createWorkspace: async (_: unknown, args: any, ctx: any) => {
      if (!ctx.userId) throw new Error("Not authenticated");

      const workspace = await WorkspaceModel.create({
        name: args.name,
        description: args.description,
        owner: ctx.userId,
        members: [ctx.userId],
      });

      return workspace.populate("owner members");
    },

    addMember: async (_: unknown, args: any, ctx: any) => {
      if (!ctx.userId) throw new Error("Not authenticated");

      const workspace = await WorkspaceModel.findById(args.workspaceId);
      if (!workspace) throw new Error("Workspace not found");

      if (workspace.owner.toString() !== ctx.userId) {
        throw new Error("Only owner can add members");
      }

      if (!workspace.members.includes(args.userId)) {
        workspace.members.push(args.userId);
        await workspace.save();
      }

      return workspace.populate("owner members");
    },

    createTask: async (_: unknown, args: any, ctx: any) => {
      if (!ctx.userId) throw new Error("Not authenticated");

      const task = await TaskModel.create({
        title: args.title,
        description: args.description,
        priority: args.priority ?? 3,
        workspace: args.workspaceId,
        assignee: ctx.userId,
      });

      const populated = await task.populate("assignee workspace");

      await pubsub.publish(EVENTS.TASK_CREATED, {
        taskCreated: populated,
        workspaceId: args.workspaceId,
      });

      return populated;
    },

    updateTaskStatus: async (_: unknown, args: any, ctx: any) => {
      if (!ctx.userId) throw new Error("Not authenticated");

      const task = await TaskModel.findById(args.taskId);
      if (!task || task.isDeleted) throw new Error("Task not found");

      task.status = args.status;
      await task.save();

      const populated = await task.populate("assignee workspace");

      await pubsub.publish(EVENTS.TASK_UPDATED, {
        taskUpdated: populated,
        workspaceId: task.workspace.toString(),
      });

      return populated;
    },

     deleteTask: async (_: unknown, { taskId }: any, ctx: any) => {
  if (!ctx.userId) throw new Error("Not authenticated");

  const task = await TaskModel.findById(taskId);
  if (!task || task.isDeleted) throw new Error("Task not found");

  task.isDeleted = true;
  await task.save();

  // 👇 МЫНА ЖЕРГЕ ҚОСАСЫҢ
  await pubsub.publish(EVENTS.TASK_DELETED, {
    taskDeleted: taskId,
    workspaceId: task.workspace.toString(),
  });

  return true;
},
addComment: async (_: unknown, { taskId, text }: any, ctx: any) => {
  if (!ctx.userId) throw new Error("Not authenticated");

  const comment = await CommentModel.create({
    text,
    task: taskId,
    author: ctx.userId,
  });

  const populated = await comment.populate("author task");

  await pubsub.publish(EVENTS.COMMENT_ADDED, {
    commentAdded: populated,
    taskId,
  });

  return populated;
},

deleteComment: async (_: unknown, { commentId }: any, ctx: any) => {
  if (!ctx.userId) throw new Error("Not authenticated");

  const comment = await CommentModel.findById(commentId);
  if (!comment || comment.isDeleted) throw new Error("Comment not found");

  comment.isDeleted = true;
  await comment.save();

  await pubsub.publish(EVENTS.COMMENT_DELETED, {
    commentDeleted: comment.id,
    taskId: comment.task.toString(),
  });

  return true;
},
  },


  Subscription: {
    taskCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.TASK_CREATED),
      resolve: (payload: any, args: any) =>
        payload.workspaceId === args.workspaceId
          ? payload.taskCreated
          : null,
    },

    taskUpdated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.TASK_UPDATED),
      resolve: (payload: any, args: any) =>
        payload.workspaceId === args.workspaceId
          ? payload.taskUpdated
          : null,
    },
    taskDeleted: {
  subscribe: () => pubsub.asyncIterator(EVENTS.TASK_DELETED),
  resolve: (payload: any, args: any) => {
    if (payload.workspaceId !== args.workspaceId) return null;
    return payload.taskDeleted;
  },
},
 commentAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(EVENTS.COMMENT_ADDED),
      (payload, variables) => {
        return payload.taskId === variables.taskId;
      }
    ),
  },

  commentDeleted: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(EVENTS.COMMENT_DELETED),
      (payload, variables) => {
        return payload.taskId === variables.taskId;
      }
    ),
  },
  },
  
};
