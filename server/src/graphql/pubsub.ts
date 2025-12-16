import { PubSub } from "graphql-subscriptions";

export const pubsub = new PubSub() as any;


export const EVENTS = {
  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_DELETED: "TASK_DELETED",
   COMMENT_ADDED: "COMMENT_ADDED",
  COMMENT_DELETED: "COMMENT_DELETED"
};
