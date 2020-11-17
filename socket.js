let io;

module.exports = {
    init: httpsServer => {
        io = require('socket.io')(httpsServer, {
            cors: true
        });
        return io
    },
    getIO: ()=> {
        if (!io){
            throw new Error('Socket.io is not initiatlized');
        }
        return io;
    }
}