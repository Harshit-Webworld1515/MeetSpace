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
            // chat_message event ke saath room aur message data bheja gaya hai
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
                console.log("Message from " + socket.id + " in room " + matchingRoom + ": " + message);
                // Broadcast the message to all users in the room except the sender
                connection[matchingRoom].forEach((userId) => {
                    if (userId !== socket.id) {
                        io.to(userId).emit("chat_message", message, sender, socket.id);
                    }
                });
            }
        });
        socket.on("disconnect", () => {
            //Abhi current time aur user ke online hone ke time ke beech kitna time difference hai, milliseconds mein nikaala
            var diffTime = Math.abs(new Date().getTime() - timeOnline[socket.id]);
            console.log("User " + socket.id + " was online for " + diffTime + " milliseconds.");
            var key
            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connection)))) {
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k;
                        for (let a = 0; a < connection[key].length; ++a) {
                            // connection[key][a]==v[a];
                            if (v[a] !== socket.id) {
                                io.to(v[a]).emit("user_left", socket.id, diffTime);
                            }
                        }
                        var index = connection[key].indexOf(socket.id);
                        connection[key].splice(index, 1);//User ko room se remove kar diya
                        if (connection[key].length === 0) {
                            delete connection[key];
                            delete messages[key];
                        }
                    }
                }
            }
        });
    });
    return io;
}
// export default connectToSocket;