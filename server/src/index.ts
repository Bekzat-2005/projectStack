import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";

import { ENV } from "./config/env";
import { schema } from "./graphql/schema";
import { connectDB } from "./config/db";
import { buildContext } from "./graphql/context";

async function startServer() {
  // 1) DB
  await connectDB(process.env.MONGO_URI!);

  // 2) Express app
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.status(200).send("ok"));

  // 3) Apollo
  const apolloServer = new ApolloServer({
    schema,
    context: buildContext
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });

  // 4) HTTP server + WS subscriptions
  const httpServer = createServer(app);

  SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: "/graphql" }
  );

  httpServer.listen(ENV.PORT, () => {
    console.log(`🚀 HTTP: http://localhost:${ENV.PORT}/graphql`);
    console.log(`📡 WS:   ws://localhost:${ENV.PORT}/graphql`);
  });
}

startServer().catch((e) => {
  console.error(e);
  process.exit(1);
});
