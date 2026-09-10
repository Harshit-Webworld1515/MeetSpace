import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";

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
        let token = crypto.randomBytes(16).toString("hex");
        user.token = token;
        await user.save();
        if (!isPasswordValid) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid password" });
        }
        res.status(httpStatus.OK).json({ message: "Login successful", token: token });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong while logging in" });
    }
}
export { registerUser, loginUser };