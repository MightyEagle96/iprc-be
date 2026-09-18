import axios from "axios";

const apiKey = "tlv_4oE9obw7oDhcWUzJtA2i5RagtcvnkDtaQ9QSLKZFsmM";

const baseURL = "https://v4.api.termii.com/";

export const sendSms = async (body: string, phoneNumber: string) => {
  try {
    const normalizedPhoneNumber = phoneNumber.trim().replace(/^0/, "234");
    const result = await axios.post(
      `${baseURL}send_sms`,
      {
        api_key: apiKey,
        to: normalizedPhoneNumber,
        from: "IMPACT 2026",
        sms: body,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log(result.data);
  } catch (error) {
    //console.error(error.response.data);
  }
};
