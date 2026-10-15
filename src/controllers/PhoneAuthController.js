import twilio from "twilio";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);
const verifyServiceSID = process.env.TWILIO_VERIFY_SERVICE_SID;
const USER_ACCESS_SECRET = process.env.USER_ACCESS_SECRET;

export const sendOtp = async (req, res) => {
    try {
        let {phone} = req.body;
        phone = String(phone || "").trim();
        if(!/^\+[1-9]\d{7,14}$/.test(phone)) {
            return res.status(400).json({
                message: "Enter valid phone number with country code."
            })
        }
        const existingUser = await User.findOne({ phone });
        if(existingUser?.isPhoneVerified) {
            return res.status(409).json({
                message: "This phone number is already register . Please sign in."
            })
        }
        await client.verify.v2.services(verifyServiceSID).verifications.create({
            to: phone,
            channel: "sms"
        });
        return res.status(200).json({
            message: "OTP sent successfully."
        });
    } catch (error) {
        console.log("send otp error ", error.message);
        return res.status(500).json({
            message: "Unable to send OTP. Please try again."
        })
    }
}

export const verifyOtp = async (req, res) => {
    try {
        let { phone, name, otp } = req.body;

        phone = String(phone || "").trim();
        otp = String(otp || "").trim();
        name = String(name || "").trim();

        // 1. Validate input
        if (!/^\+[1-9]\d{7,14}$/.test(phone) || !/^\d{4,8}$/.test(otp)) {
            return res.status(400).json({
                message: "Enter a valid phone number and OTP.",
            });
        }

        //2. Verify OTP with Twilio
        const result = await client.verify.v2
            .services(verifyServiceSID)
            .verificationChecks.create({
                to: phone,
                code: otp,
            });

        if (result.status !== "approved") {
            return res.status(400).json({
                message: "Invalid or expired OTP.",
            });
        }

        // 3. Find the existing user
        let user = await User.findOne({ phone });
        console.log("user ", user);

        if (user?.isPhoneVerified) {
            return res.status(409).json({
                message: "Account already exists. Please sign in.",
            });
        }

        // 4. Create a new user or update an user which is not verified
        if (!user) {
            user = await User.create({
                phone,
                firstName: name,
                isPhoneVerified: true,
            });
        } else {
            user.firstName = name || user.firstName;
            user.isPhoneVerified = true;
            await user.save();
        }
        const userAccessToken = jwt.sign( { userId: user._id.toString() }, USER_ACCESS_SECRET, { expiresIn: "15m" });

        return res.status(200).json({
            message: "Phone verified and account created successfully.",
            userAccessToken,
            user: {
                _id: user._id,
                firstName: user.firstName,
                phone: user.phone,
                isPhoneVerified: user.isPhoneVerified,
            },
        });
    } catch (error) {
        console.error("Verify OTP error:", {
            status: error.status,
            code: error.code,
            message: error.message
        });
        return res.status(error.status || 500).json({
        message: "Unable to verify OTP. Please try again.",
        code: error.code,
        });
    }
};