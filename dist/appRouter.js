import { Router } from "express";
import { participantAction, registerParticipant, viewDashboard, viewParticipants, } from "./controllers/participantController.js";
import { accreditParticipant, attendanceDashboard, getAccreditedParticipants, importAttendees, registerAttendee, searchParticipant, } from "./controllers/attendeeController.js";
import impactController from "./controllers/impact.controller.js";
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
    .get("/getaccreditedparticipants", getAccreditedParticipants)
    .post("/registerattendee", registerAttendee)
    //
    .post("/impact-registration", impactController.registerParticipant)
    .post("/cohort", impactController.findCohort)
    .get("/impact/stats", impactController.getDashboardStats)
    .get("/impact/participants", impactController.getParticipants);
export default appRouter;
//# sourceMappingURL=appRouter.js.map