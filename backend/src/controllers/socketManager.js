import { Server } from "socket.io";

let connection = {};
let messages = {};
let timeOnline = {};
export const connectToSocket = (server) => {
    const io = new Server(server);

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id);
        // socket.emit("join_call", "room123");client Maan lo frontend se:
        socket.on("join_call", (path) => {//path wo data hai jo event ke saath bheja gaya ie.- room123
            if (connection[path] === undefined) {
                connection[path] = [];//room exist karta hai, lekin abhi koi user nahi hai.
            }
            connection[path].push(socket.id);//room me user add kar diya
            timeOnline[socket.id] = new Date().getTime();//user ka time online record kar diya
            console.log("User " + socket.id + " joined room: " + path);

            for (let a = 0; a < connection[path].length; a++) {
                if (connection[path][a] !== socket.id) {
                    // Notify other users in the room about the new user
                    io.to(connection[path][a]).emit("new_user_joined", socket.id, connection[path]);//new user ka id aur room me already present users ka list bhej diya
                }
            }
            if (messages[path] !== undefined) {

                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit(
                        "chat_message",
                        messages[path][a]['data'],//"Hello bhai"
                        messages[path][a]['sender'],//"Harshit"
                        messages[path][a]['socket-id-sender']//"AAA123"
                    );//New user ko ye purana chat message bhejo:
                }
            }
            socket.join(path);//User/socket path ke room me enter
        });
        socket.on("signal", (toId, message) => {
            // Handle signal data
            io.to(toId).emit("signal", socket.id, message);
        });
        socket.on("chat_message", (room, message) => {
            // Handle chat message
            const [matchingRoom, found] = Object.entries(connection)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ["", false]);
                if (found) {
                    if (messages[matchingRoom] === undefined) {
                        messages[matchingRoom] = [];
                    }
                    messages[matchingRoom].push({
                        data: data,
                        sender: sender,
                        'socket-id-sender': socket.id
                    });
                }
        });
        socket.on("disconnect", () => {
            console.log("A user disconnected: " + socket.id);
        });
    });
    return io;
}
// export default connectToSocket;