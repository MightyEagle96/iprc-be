import { Router } from "express";
import {
  registerParticipant,
  viewDashboard,
  viewParticipants,
} from "./controllers/participantController.js";

const appRouter = Router();

appRouter
  .post("/registerparticipant", registerParticipant)
  .get("/dashboard", viewDashboard)
  .get("/participants", viewParticipants);

export default appRouter;
