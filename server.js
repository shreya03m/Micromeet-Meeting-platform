const mongoose = require('mongoose');
const express = require('express');
const dotenv = require("dotenv");
const app = express()
const Msg = require('./models/messages');
dotenv.config();
const http = require('http').createServer(app)
var _userConnections = [];
const PORT = process.env.PORT || 8800

mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
        console.log("Connected to MongoDB");
    }
);

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

app.use(express.static(__dirname + '/public'))//ye sab static files h

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/entry.html')
})
app.get('/index.html', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})
app.get('/chat.html', (req, res) => {
    res.sendFile(__dirname + '/chat.html')
})
//socket.io instantiation
const io = require("socket.io")(http)

//listen on every connection
io.on('connection', (socket) => {

    console.log("///my connection", socket.id);

    socket.on('userconnect', (data) => {
        console.log('userconnect', data.dsiplayName, data.meetingid);
        console.log("last check2", socket.id)
        var other_users = _userConnections.filter(p => p.meeting_id == data.meetingid);

        _userConnections.push({
            connectionId: socket.id,
            user_id: data.dsiplayName,
            meeting_id: data.meetingid
        });

        other_users.forEach(v => {
            socket.to(v.connectionId).emit('informAboutNewConnection', { other_user_id: data.dsiplayName, connId: socket.id });
        });

        socket.emit('userconnected', other_users);
        //return other_users;
    });//end of userconnect

    socket.on('exchangeSDP', (data) => {

        socket.to(data.to_connid).emit('exchangeSDP', { message: data.message, from_connid: socket.id });

    });//end of exchangeSDP
    socket.on('loadPrevmsg', (name) => {
        var userObj = _userConnections.find(p => p.connectionId == socket.id);
        if (userObj) {
            var meetingid = userObj.meeting_id;
            console.log("ye lio");
            let x = Msg.find();
            console.log(x)
            Msg.find({ meeting_id: meetingid }).then(result => {
                console.log(result);
                socket.emit('output-messages', result)
            })
        }
    })

    socket.on('reset', (data) => {
        var userObj = _userConnections.find(p => p.connectionId == socket.id);
        if (userObj) {
            var meetingid = userObj.meeting_id;
            var list = _userConnections.filter(p => p.meeting_id == meetingid);
            _userConnections = _userConnections.filter(p => p.meeting_id != meetingid);

            list.forEach(v => {
                socket.to(v.connectionId).emit('reset');
            });

            socket.emit('reset');
        }

    });//end of reset
    socket.on('applyfilter', (data) => {

        let userObj = _userConnections.find(p => p.connectionId == data.id);
        console.log(socket.id == data.id);
        if (userObj) {
            var meetingid = userObj.meeting_id;
            var conne = userObj.connectionId;
            var list = _userConnections.filter(p => p.meeting_id == meetingid);
            list2 = _userConnections.filter(p => p.meeting_id == meetingid);
            var list = list2.filter(p => p.connectionId !== conne);
            console.log("///filter///", list)
            console.log("mine", conne)
            list.forEach(v => {
                socket.to(v.connectionId).emit('applytoall', data);
            });

            // socket.emit('applytoall',data);
        }
    })
    socket.on('stopvideocall', () => {
        console.log('ending vc!');

        var userObj = _userConnections.find(p => p.connectionId == socket.id);
        if (userObj) {
            var meetingid = userObj.meeting_id;

            list2 = _userConnections.filter(p => p.connectionId != socket.id);
            var list = list2.filter(p => p.meeting_id == meetingid);

            list.forEach(v => {
                socket.to(v.connectionId).emit('informAboutConnectionEnd-onlymsg', socket.id);
            });
        }
    });


    socket.on('new-user-joined', (msg) => {
        console.log(msg);
        // var other_users = _userConnections.filter(p => p.meeting_id == data.meetingid);
        let userObj = _userConnections.find(p => p.connectionId == socket.id);
        console.log("/////////new user wala////////", userObj)
        if (userObj) {
            console.log("okay inside socket ")
            var meetingid = userObj.meeting_id;
            var from = userObj.user_id;
            var conne = userObj.connectionId;

            var list2 = _userConnections.filter(p => p.meeting_id == meetingid);
            var list = list2.filter(p => p.connectionId !== conne);
            console.log("list", list)

            list.forEach(v => {
                socket.to(v.connectionId).emit('new-user-in-chat-box', msg);
            });

            // socket.emit('new-user-joined',msg);
        }

    });//end of reset

    socket.on('mymessages', (msg) => {
        const message = new Msg(msg);
        message.save().then(() => {
            console.log("ye in server", msg);
            let userObj = _userConnections.find(p => p.connectionId == socket.id);
            console.log("/////////////////", userObj)
            if (userObj) {

                var meetingid = userObj.meeting_id;
                var from = userObj.user_id;
                var conne = userObj.connectionId;

                var list2 = _userConnections.filter(p => p.meeting_id == meetingid);
                var list = list2.filter(p => p.connectionId !== conne);
                console.log("list", list)
                // console.log(list)

                list.forEach(v => {
                    socket.to(v.connectionId).emit('new-mg', msg);
                });

                // socket.emit('new-mg',msg);
            }

        });
    });

    socket.on('disconnect', function () {
        console.log('Got disconnect!');

        var userObj = _userConnections.find(p => p.connectionId == socket.id);
        if (userObj) {
            var meetingid = userObj.meeting_id;

            _userConnections = _userConnections.filter(p => p.connectionId != socket.id);
            var list = _userConnections.filter(p => p.meeting_id == meetingid);

            list.forEach(v => {
                socket.to(v.connectionId).emit('informAboutConnectionEnd', socket.id);
            });
        }
    });
    //  socket.on('new-user-joined', (msg) => {
    //     socket.broadcast.emit('new-user-joined', msg)
    // })
    // socket.on('mymessages',(mdata) => {
    //     //console.log(msg,name)
    //      socket.broadcast.emit('new-mg',mdata)

    // })

})

