import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import React from 'react';
import axios from 'axios';
import httpStatus from "http-status";

export const AuthContext = React.createContext({});
const client = axios.create({
    baseURL: "http://localhost:8080/api/v1/users",

});
export const AuthProvider = ({ children }) => {
    const authContext = useContext(AuthContext);


    const [userData, setUserData] = useState(authContext);

    const navigate = useNavigate();
    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })
            if (request.status === httpStatus.CREATED) {
                return request.data.message;
            }
        } catch (error) {
            throw error;
        }
    }
    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            })
            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token)

            }
        } catch (error) {
            throw error;

        }
    }


    const data = {
        userData, setUserData, handleRegister,handleLogin
    }
    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}



//"
// Maine frontend mein Authentication ke liye Context API aur
// Axios ka systematic setup banaya hai. Context API ki help
// se  authentication-related data aur functions ko different
// components mein easily share kar sakta hoon,authcontext 
// se authentication component le rha
//  aur Axios ki help  se frontend se backend APIs ko
//    HTTP requests bhej  sakta hoon.
//"
