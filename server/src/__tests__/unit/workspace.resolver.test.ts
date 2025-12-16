import { resolvers } from "../../graphql/resolvers";
import { WorkspaceModel } from "../../models/Workspace.model";

jest.mock("../../models/Workspace.model");

describe("Workspace resolvers (unit)", () => {
  const ctx: any = { userId: "u1" };

  afterEach(() => jest.clearAllMocks());

  it("createWorkspace", async () => {
    const mockWorkspace: any = {
      owner: "u1",
      members: ["u1"],
      populate: jest.fn().mockResolvedValue({
        id: "w1",
        name: "Workspace",
      }),
    };

    (WorkspaceModel.create as jest.Mock).mockResolvedValue(mockWorkspace);

    const result = await resolvers.Mutation.createWorkspace(
      {},
      { name: "Workspace", description: "" },
      ctx
    );

    expect(mockWorkspace.populate).toHaveBeenCalledWith("owner members");
    expect(result.name).toBe("Workspace");
  });

  it("addMember", async () => {
    const mockWorkspace: any = {
      owner: { toString: () => "u1" }, // 🔥 МІНДЕТТІ
      members: ["u1"],
      save: jest.fn(),
      populate: jest.fn().mockResolvedValue({
        id: "w1",
      }),
    };

    (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

    const result = await resolvers.Mutation.addMember(
      {},
      { workspaceId: "w1", userId: "u2" },
      ctx
    );

    expect(mockWorkspace.members).toContain("u2");
    expect(mockWorkspace.save).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });
});
