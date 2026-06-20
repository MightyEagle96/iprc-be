import { Router } from "express";
import { registerParticipant } from "./controllers/participantController.js";

const appRouter = Router();

appRouter.post("/registerparticipant", registerParticipant);

export default appRouter;
