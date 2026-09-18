import { Request, Response } from "express";
import impactService from "../services/impact.service.js";

class ImpactController {
  async registerParticipant(req: Request, res: Response) {
    try {
      const participant = await impactService.registerParticipant(req.body);

      return res.status(201).json({
        success: true,
        message: "Participant registered successfully",
        data: participant,
      });
    } catch (error: any) {
      console.error("Impact registration error:", error);

      // ---------------------------------------------------------
      // Duplicate email / phone number
      // ---------------------------------------------------------

      if (error?.code === 11000) {
        const duplicateField = Object.keys(error.keyPattern || {})[0];

        let message = "A participant with these details already exists";

        if (duplicateField === "email") {
          message =
            "A participant with this email address is already registered";
        }

        if (duplicateField === "phoneNumber") {
          message =
            "A participant with this phone number is already registered";
        }

        return res.status(409).json({
          success: false,
          message,
        });
      }

      // ---------------------------------------------------------
      // Validation / business errors
      // ---------------------------------------------------------

      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // ---------------------------------------------------------
      // Unknown server error
      // ---------------------------------------------------------

      return res.status(500).json({
        success: false,
        message:
          "An unexpected error occurred while registering the participant",
      });
    }
  }

  async findCohort(req: Request, res: Response) {
    try {
      const { identifier } = req.body;

      const cohort = await impactService.findCohort(identifier);

      return res.status(200).json({
        success: true,
        message: "Cohort retrieved successfully",
        data: cohort,
      });
    } catch (error: any) {
      console.error("Find cohort error:", error);

      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to find registration",
      });
    }
  }

  async getParticipants(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search = "",
        classCategory,
        ageGrade,
      } = req.query;

      const result = await impactService.getParticipants({
        page: Number(page),
        limit: Number(limit),
        search: String(search),
        classCategory: classCategory as "A" | "B" | "C" | undefined,
        ageGrade: ageGrade ? String(ageGrade) : undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Participants retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Get participants error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve participants",
      });
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await impactService.getDashboardStats();

      return res.status(200).json({
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: stats,
      });
    } catch (error: any) {
      console.error("Dashboard stats error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve dashboard statistics",
      });
    }
  }
}

export default new ImpactController();
