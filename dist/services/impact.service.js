import Counter from "../models/counterModel.js";
import Impact from "../models/impactModel.js";
class ImpactService {
    async registerParticipant(payload) {
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
        if (!firstName ||
            !lastName ||
            !gender ||
            !ageGrade ||
            !email ||
            !phoneNumber) {
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
                throw new Error("A participant with this email address is already registered");
            }
            if (existingParticipant.phoneNumber === phoneNumber) {
                throw new Error("A participant with this phone number is already registered");
            }
        }
        // ---------------------------------------------------------
        // Atomically generate registration number
        // ---------------------------------------------------------
        const counter = await Counter.findOneAndUpdate({
            name: "impact-registration",
        }, {
            $inc: {
                sequence: 1,
            },
        }, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        });
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
        const categories = ["A", "B", "C"];
        const classCategory = categories[(registrationNumber - 1) % categories.length];
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
        const sms = (name, classCategory, registrationNumber) => `Hello, ${name}. Welcome to IMPACT 2026. You are in cohort ${classCategory} and your registration number is ${registrationNumber}`;
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
    async findCohort(identifier) {
        const value = identifier.trim().toLowerCase();
        if (!value) {
            throw new Error("Email or phone number is required");
        }
        // Normalize phone number
        let phoneNumber = value;
        if (phoneNumber.startsWith("+234")) {
            phoneNumber = `0${phoneNumber.slice(4)}`;
        }
        else if (phoneNumber.startsWith("234")) {
            phoneNumber = `0${phoneNumber.slice(3)}`;
        }
        const participant = await Impact.findOne({
            $or: [{ email: value }, { phoneNumber }],
        }).lean();
        if (!participant) {
            throw new Error("No registration was found with the email or phone number provided");
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
}
export default new ImpactService();
//# sourceMappingURL=impact.service.js.map