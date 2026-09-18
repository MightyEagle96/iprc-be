import { Request, Response } from "express";
import Attendee, { AttendeePayload } from "../models/attendeeModel.js";
import { io } from "../app.js";

export const importAttendeesFunc = async (attendees: AttendeePayload[]) => {
  if (!Array.isArray(attendees)) {
    throw new Error("Expected an array of attendees.");
  }

  return await Attendee.insertMany(attendees, {
    ordered: false, // Continue inserting even if some records fail
  });
};

export const importAttendees = async (req: Request, res: Response) => {
  try {
    const attendees: AttendeePayload[] = req.body;

    const updatedAttendees = attendees.map((attendee) => {
      return {
        ...attendee,
        username: attendee.email,
        accredited: true,
        timeAccredited: new Date(),
      };
    });
    const result = await importAttendeesFunc(updatedAttendees);
    res.send("Attendees imported successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An unexpected error occurred");
  }
};
const getAttendanceDashboard = async () => {
  const total = await Attendee.countDocuments();
  const male = await Attendee.countDocuments({ gender: "male" });
  const female = await Attendee.countDocuments({ gender: "female" });
  const accredited = await Attendee.countDocuments({ accredited: true });

  return {
    total,
    male,
    female,
    accredited,
  };
};

export const attendanceDashboard = async (req: Request, res: Response) => {
  try {
    const { total, male, female, accredited } = await getAttendanceDashboard();
    res.send({ total, male, female, accredited });
  } catch (error) {}
};

export const searchParticipant = async (req: Request, res: Response) => {
  const q = (req.query.q as string).trim();

  const words = q.split(/\s+/);

  const attendee = await Attendee.findOne({
    $or: [
      { username: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { phoneNumber: { $regex: q, $options: "i" } },

      {
        $and: words.map((word) => ({
          name: { $regex: word, $options: "i" },
        })),
      },
    ],
  });

  if (!attendee) {
    return res.status(404).json({
      message: "Participant not found.",
    });
  }

  res.json(attendee);
};

export const accreditParticipant = async (req: Request, res: Response) => {
  try {
    await Attendee.updateOne(
      { _id: req.body._id },
      { $set: { accredited: true, timeAccredited: new Date() } },
    );

    io.emit("new-registration", await getAttendanceDashboard());
    res.send("Participant accredited successfully");
  } catch (error) {
    res.status(500).send("An unexpected error occurred");
  }
};

export const getAccreditedParticipants = async (
  req: Request,
  res: Response,
) => {
  try {
    const page = (req.query.page || 1) as number;
    const limit = (req.query.limit || 50) as number;

    const participants = await Attendee.find({ accredited: true })
      .lean()
      .sort({ timeAccredited: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const mappedParticipants = participants.map((participant, index) => {
      return {
        ...participant,
        id: (page - 1) * limit + index + 1,
      };
    });
    const total = await Attendee.countDocuments({ accredited: true });
    res.send({ total, participants: mappedParticipants });
  } catch (error) {
    res.status(500).send("An unexpected error occurred");
  }
};

export const registerAttendee = async (req: Request, res: Response) => {
  try {
    await Attendee.create({
      ...req.body,
      accredited: true,
      timeAccredited: new Date(),
    });

    io.emit("new-registration", await getAttendanceDashboard());
    res.send("Registered successfully");
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
