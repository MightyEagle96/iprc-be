import type { Request, Response } from "express";
import { ConcurrentJobQueue } from "./DataQueue.js";
import type { IParticipant } from "../models/participantModel.js";
import Participant from "../models/participantModel.js";
import { io } from "../app.js";

const dataQueue = new ConcurrentJobQueue({
  concurrency: 1,
  maxQueueSize: 100,
  retryDelay: 1000,
  shutdownTimeout: 3000,
  retries: 3,
});
export const registerParticipant = async (req: Request, res: Response) => {
  try {
    const body: IParticipant = req.body;

    const exceeded = await Participant.countDocuments({ INID: body.INID });

    if (exceeded > 1) {
      throw new Error("Participant limit exceeded for this institution");
    }

    await dataQueue.enqueue(async () => {
      body.tagId = `${body.INID}${String.fromCharCode(exceeded + 65)}`;

      await Participant.create(body);

      const data = await getDashboard();

      io.emit("new-registration", data);
    });

    res.send("Participant registered successfully");
  } catch (error: any) {
    if (error?.code === 11000) {
      const field: any = Object.keys(error.keyPattern)[0];
      const value = error.keyValue?.[field];

      return res
        .status(400)
        .send(`${field}${value ? ` (${value})` : ""} already exists`);
    }

    res.status(500).send(error?.message || "An unexpected error occurred");
  }
};

export const viewDashboard = async (req: Request, res: Response) => {
  try {
    const data = await getDashboard();

    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("An unexpected error occurred");
  }
};

const getDashboard = async () => {
  try {
    const total = await Participant.countDocuments();
    const male = await Participant.countDocuments({ gender: "male" });
    const female = await Participant.countDocuments({ gender: "female" });
    const pending = await Participant.countDocuments({ status: "pending" });
    const approved = await Participant.countDocuments({ status: "approved" });
    const rejected = await Participant.countDocuments({ status: "rejected" });

    const institutions = await Participant.aggregate([
      {
        $group: {
          _id: "$INID",
        },
      },
      {
        $count: "totalUniqueINIDs",
      },
    ]);

    return {
      total,
      male,
      female,
      institutions: institutions[0].totalUniqueINIDs,
      pending,
      approved,
      rejected,
    };
  } catch (error) {
    console.error(error);
  }
};
