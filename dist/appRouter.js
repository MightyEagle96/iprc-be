import { Router } from "express";
import { participantAction, registerParticipant, viewDashboard, viewParticipants, } from "./controllers/participantController.js";
import { accreditParticipant, attendanceDashboard, getAccreditedParticipants, importAttendees, searchParticipant, } from "./controllers/attendeeController.js";
const appRouter = Router();
appRouter
    .post("/registerparticipant", registerParticipant)
    .get("/dashboard", viewDashboard)
    .get("/participants", viewParticipants)
    .post("/action", participantAction)
    .post("/importdata", importAttendees)
    .get("/attendancedashboard", attendanceDashboard)
    .get("/searchparticipant", searchParticipant)
    .post("/accreditparticipant", accreditParticipant)
    .get("/getaccreditedparticipants", getAccreditedParticipants);
export default appRouter;
//# sourceMappingURL=appRouter.js.map