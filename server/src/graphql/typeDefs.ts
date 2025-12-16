export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    createdAt: String!
  }

  type Workspace {
    id: ID!
    name: String!
    description: String
    owner: User!
    members: [User!]!
    createdAt: String!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    priority: Int!
    workspace: Workspace!
    assignee: User
    createdAt: String!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    task: Task!
    createdAt: String!
  }

  type AuthPayload {
    accessToken: String!
    user: User!
  }

  # ================= QUERIES =================
  type Query {
    hello: String!
    me: User!

    workspaces: [Workspace!]!
    workspace(id: ID!): Workspace!

    tasks(workspaceId: ID!): [Task!]!
    task(id: ID!): Task

    comments(taskId: ID!): [Comment!]!

    # 👇 МЫНА ЖАҢА
    userByEmail(email: String!): User
  }

  # ================= MUTATIONS =================
  type Mutation {
    register(email: String!, password: String!, name: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    createWorkspace(name: String!, description: String): Workspace!
    addMember(workspaceId: ID!, userId: ID!): Workspace!

    createTask(
      workspaceId: ID!
      title: String!
      description: String
      priority: Int
    ): Task!

    updateTaskStatus(taskId: ID!, status: String!): Task!
    deleteTask(taskId: ID!): Boolean!

    addComment(taskId: ID!, text: String!): Comment!
    deleteComment(commentId: ID!): Boolean!
  }

  # ================= SUBSCRIPTIONS =================
  type Subscription {
    taskCreated(workspaceId: ID!): Task!
    taskUpdated(workspaceId: ID!): Task!
    taskDeleted(workspaceId: ID!): ID!

    commentAdded(taskId: ID!): Comment!
    commentDeleted(taskId: ID!): ID!
  }
`;
