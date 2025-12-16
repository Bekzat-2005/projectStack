import { resolvers } from "../../graphql/resolvers";
import { TaskModel } from "../../models/Task.model";

jest.mock("../../models/Task.model");

describe("Task resolvers (unit)", () => {
  const ctx: any = { userId: "u1" };

  afterEach(() => jest.clearAllMocks());

  it("updateTaskStatus", async () => {
    const mockTask: any = {
      isDeleted: false,
      status: "TODO",
      workspace: { toString: () => "w1" }, // 🔥 МІНДЕТТІ
      save: jest.fn(),
      populate: jest.fn().mockResolvedValue({
        id: "t1",
        status: "DONE",
      }),
    };

    (TaskModel.findById as jest.Mock).mockResolvedValue(mockTask);

    const result = await resolvers.Mutation.updateTaskStatus(
      {},
      { taskId: "t1", status: "DONE" },
      ctx
    );

    expect(mockTask.save).toHaveBeenCalled();
    expect(result.status).toBe("DONE");
  });
});
