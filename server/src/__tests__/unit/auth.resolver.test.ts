import { resolvers } from "../../graphql/resolvers";
import { UserModel } from "../../models/User.model";
import bcrypt from "bcryptjs";

jest.mock("../../models/User.model");
jest.mock("bcryptjs");

describe("Auth resolvers (unit)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("register → creates user and returns token", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);
    (UserModel.create as jest.Mock).mockResolvedValue({
      id: "u1",
      email: "test@test.com",
      name: "Test",
    });

    const res = await resolvers.Mutation.register(
      {},
      { email: "test@test.com", password: "123456", name: "Test" }
    );

    expect(res.user.email).toBe("test@test.com");
    expect(res.accessToken).toBeDefined();
  });

  it("register → throws if email exists", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({ email: "test@test.com" });

    await expect(
      resolvers.Mutation.register(
        {},
        { email: "test@test.com", password: "123", name: "Test" }
      )
    ).rejects.toThrow();
  });

  it("login → success", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({
      id: "u1",
      email: "a@a.com",
      password: "hashed",
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = await resolvers.Mutation.login(
      {},
      { email: "a@a.com", password: "123" }
    );

    expect(res.accessToken).toBeDefined();
  });

  it("login → wrong password", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({
      password: "hashed",
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      resolvers.Mutation.login({}, { email: "a@a.com", password: "wrong" })
    ).rejects.toThrow();
  });

  it("login → user not found", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      resolvers.Mutation.login({}, { email: "x@x.com", password: "123" })
    ).rejects.toThrow();
  });
});
