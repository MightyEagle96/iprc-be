import { Router } from "express";
import {
  participantAction,
  registerParticipant,
  viewDashboard,
  viewParticipants,
} from "./controllers/participantController.js";

const appRouter = Router();

appRouter
  .post("/registerparticipant", registerParticipant)
  .get("/dashboard", viewDashboard)
  .get("/participants", viewParticipants)
  .post("/action", participantAction);

export default appRouter;
