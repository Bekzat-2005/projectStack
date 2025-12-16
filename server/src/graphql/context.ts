import { verifyToken } from "../utils/jwt";

export type GraphQLContext = {
  userId: string | null;
};

export function buildContext({ req }: any): GraphQLContext {
  const auth = req.headers.authorization;

  if (!auth) {
    return { userId: null };
  }

  const token = auth.replace("Bearer ", "");

  try {
    const payload = verifyToken(token);
    return { userId: payload.userId };
  } catch {
    return { userId: null };
  }
}
