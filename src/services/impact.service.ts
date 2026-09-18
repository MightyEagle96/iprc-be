import Counter from "../models/counterModel.js";
import Impact from "../models/impactModel.js";
import { sendSms } from "./sms.api.js";

type ClassCategory = "A" | "B" | "C";

interface RegisterParticipantPayload {
  firstName: string;
  lastName: string;
  gender: string;
  ageGrade: "10-19" | "20-25" | "31-36" | "37+";
  email: string;
  phoneNumber: string;
  memberOfRccg: boolean;
}

class ImpactService {
  async registerParticipant(payload: RegisterParticipantPayload) {
    // ---------------------------------------------------------
    // Normalize values
    // ---------------------------------------------------------

    const firstName = payload.firstName.trim();
    const lastName = payload.lastName.trim();
    const gender = payload.gender.trim().toLowerCase();
    const ageGrade = payload.ageGrade;
    const email = payload.email.trim().toLowerCase();
    const phoneNumber = payload.phoneNumber.trim();

    // ---------------------------------------------------------
    // Validate required fields
    // ---------------------------------------------------------

    console.log("Phone Number", phoneNumber);
    if (
      !firstName ||
      !lastName ||
      !gender ||
      !ageGrade ||
      !email ||
      !phoneNumber
    ) {
      throw new Error("All registration fields are required");
    }

    // ---------------------------------------------------------
    // Check for existing participant
    // ---------------------------------------------------------

    const existingParticipant = await Impact.findOne({
      $or: [{ email }, { phoneNumber }],
    }).lean();

    if (existingParticipant) {
      if (existingParticipant.email === email) {
        throw new Error(
          "A participant with this email address is already registered",
        );
      }

      if (existingParticipant.phoneNumber === phoneNumber) {
        throw new Error(
          "A participant with this phone number is already registered",
        );
      }
    }

    // ---------------------------------------------------------
    // Atomically generate registration number
    // ---------------------------------------------------------

    const counter = await Counter.findOneAndUpdate(
      {
        name: "impact-registration",
      },
      {
        $inc: {
          sequence: 1,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!counter) {
      throw new Error("Unable to generate registration number");
    }

    const registrationNumber = counter.sequence;

    // ---------------------------------------------------------
    // Assign class
    //
    // 1 → A
    // 2 → B
    // 3 → C
    // 4 → A
    // 5 → B
    // 6 → C
    // ---------------------------------------------------------

    const categories: ClassCategory[] = ["A", "B", "C"];

    const classCategory =
      categories[(registrationNumber - 1) % categories.length];

    // ---------------------------------------------------------
    // Create participant
    // ---------------------------------------------------------

    const participant = await Impact.create({
      registrationNumber,
      firstName,
      lastName,
      gender,
      ageGrade,
      email,
      phoneNumber,
      memberOfRccg: payload.memberOfRccg,
      classCategory,
    });

    const sms = (
      name: string,
      classCategory: string,
      registrationNumber: number,
    ) =>
      `Hello, ${name}. Welcome to IMPACT 2026. You are in cohort ${classCategory} and your registration number is ${registrationNumber}`;

    // if (participant) {
    //   await sendSms(
    //     sms(
    //       participant.firstName,
    //       participant.classCategory,
    //       participant.registrationNumber,
    //     ),
    //     participant.phoneNumber,
    //   );
    // }
    // ---------------------------------------------------------
    // Return registration result
    // ---------------------------------------------------------

    return {
      registrationNumber,
      classCategory,
      participant,
    };
  }

  async findCohort(identifier: string) {
    const value = identifier.trim().toLowerCase();

    if (!value) {
      throw new Error("Email or phone number is required");
    }

    // Normalize phone number
    let phoneNumber = value;

    if (phoneNumber.startsWith("+234")) {
      phoneNumber = `0${phoneNumber.slice(4)}`;
    } else if (phoneNumber.startsWith("234")) {
      phoneNumber = `0${phoneNumber.slice(3)}`;
    }

    const participant = await Impact.findOne({
      $or: [{ email: value }, { phoneNumber }],
    }).lean();

    if (!participant) {
      throw new Error(
        "No registration was found with the email or phone number provided",
      );
    }

    return {
      registrationNumber: participant.registrationNumber,
      classCategory: participant.classCategory,
      firstName: participant.firstName,
      lastName: participant.lastName,
      ageGrade: participant.ageGrade,
      email: participant.email,
      phoneNumber: participant.phoneNumber,
      memberOfRccg: participant.memberOfRccg,
    };
  }

  async getParticipants({
    page = 1,
    limit = 20,
    search = "",
    classCategory,
    ageGrade,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    classCategory?: "A" | "B" | "C";
    ageGrade?: string;
  }) {
    const currentPage = Math.max(1, Number(page));
    const pageLimit = Math.min(100, Math.max(1, Number(limit)));

    const filter: any = {};

    // ---------------------------------------------------------
    // Search
    // ---------------------------------------------------------

    if (search?.trim()) {
      const value = search.trim();

      const searchConditions: any[] = [
        { firstName: { $regex: value, $options: "i" } },
        { lastName: { $regex: value, $options: "i" } },
        { email: { $regex: value, $options: "i" } },
        { phoneNumber: { $regex: value, $options: "i" } },
      ];

      // Registration number search
      const registrationNumber = Number(value);

      if (!Number.isNaN(registrationNumber)) {
        searchConditions.push({
          registrationNumber,
        });
      }

      filter.$or = searchConditions;
    }

    // ---------------------------------------------------------
    // Filters
    // ---------------------------------------------------------

    if (classCategory) {
      filter.classCategory = classCategory;
    }

    if (ageGrade) {
      filter.ageGrade = ageGrade;
    }

    const skip = (currentPage - 1) * pageLimit;

    const [participants, total] = await Promise.all([
      Impact.find(filter)
        .select("-__v")
        .sort({ registrationNumber: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean(),

      Impact.countDocuments(filter),
    ]);

    return {
      participants,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total,
        totalPages: Math.ceil(total / pageLimit),
        hasNextPage: currentPage < Math.ceil(total / pageLimit),
        hasPreviousPage: currentPage > 1,
      },
    };
  }

  async getDashboardStats() {
    const [
      total,
      members,
      nonMembers,
      classDistribution,
      ageDistribution,
      genderDistribution,
    ] = await Promise.all([
      Impact.countDocuments(),

      Impact.countDocuments({
        memberOfRccg: true,
      }),

      Impact.countDocuments({
        memberOfRccg: false,
      }),

      Impact.aggregate([
        {
          $group: {
            _id: "$classCategory",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),

      Impact.aggregate([
        {
          $group: {
            _id: "$ageGrade",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),

      Impact.aggregate([
        {
          $group: {
            _id: "$gender",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),
    ]);

    return {
      total,
      members,
      nonMembers,

      classes: classDistribution.map((item) => ({
        category: item._id,
        count: item.count,
      })),

      ageGrades: ageDistribution.map((item) => ({
        ageGrade: item._id,
        count: item.count,
      })),

      genders: genderDistribution.map((item) => ({
        gender: item._id,
        count: item.count,
      })),
    };
  }
}

export default new ImpactService();
