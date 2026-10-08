import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const registerUser = async (req, res) => {
    try {
        const { name, username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "Username already exists" });
        }
        // bcrypt is password hashing library or algorithm which is used to hash the password before storing it in the database.
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });
        await newUser.save();
        res.status(httpStatus.CREATED).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Username and password are required" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid password" });
        }
        let token = crypto.randomBytes(16).toString("hex");
        user.token = token;
        await user.save();
        res.status(httpStatus.OK).json({ message: "Login successful", token: token });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong while logging in" });
    }
}
const getUserHistory = async (req, res) => {

    try {

        const { token } = req.query;

        const user = await User.findOne({ token });

        // User nahi mila
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "User not found"
            });
        }

        // User milne ke baad hi meetings search karo
        const meetings = await Meeting.find({
            user_id: user.username
        });

        return res.status(httpStatus.OK).json({
            message: "User history retrieved successfully",
            history: user.history,
            meetings: meetings
        });

    } catch (error) {

        console.error("Error retrieving user history:", error);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Something went wrong while retrieving user history"
        });
    }
}
const addToHistory = async (req, res) => {
    try {
        const { token, meeting_code } = req.body;

        const user = await User.findOne({ token });

        // Pehle user check karo
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "User not found"
            });
        }

        // Ab user definitely available hai
        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        });

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (error) {
        console.error("Error adding to user history:", error);

        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Something went wrong while adding to user history"
        });
    }
};
export { registerUser, loginUser, getUserHistory, addToHistory };