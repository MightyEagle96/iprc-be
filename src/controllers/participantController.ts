import type { Request, Response } from "express";
import { ConcurrentJobQueue } from "./DataQueue.js";
import type { IParticipant } from "../models/participantModel.js";
import Participant from "../models/participantModel.js";

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
    });

    res.send("Participant registered successfully");
  } catch (error: any) {
    console.error(error);

    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue?.[field];

      return res
        .status(400)
        .send(`${field}${value ? ` (${value})` : ""} already exists`);
    }

    res.status(500).send(error?.message || "An unexpected error occurred");
  }
};
