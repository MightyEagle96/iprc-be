import { Router } from "express";
import {
  registerParticipant,
  viewDashboard,
} from "./controllers/participantController.js";

const appRouter = Router();

appRouter
  .post("/registerparticipant", registerParticipant)
  .get("/dashboard", viewDashboard);

export default appRouter;
