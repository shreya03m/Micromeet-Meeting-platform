var MyApp = (function () {
    var socket = null;
    var socker_url = 'http://localhost:8800';
    //socket=io();
    var meeting_id = '';
    var user_id = '';
    arr2 = localStorage.getItem('itemsJsn')
    arr = JSON.parse(arr2);
    let name = arr[0];
    var mycon;
    let textarea = document.querySelector('#messageinput')
    let send = document.querySelector('#send')
    console.log(send);

    let messageArea = document.querySelector('.container')
    let audiochat = document.querySelector('#audiochat')
    let audioentry = document.querySelector('#audioentry')
    let load_prev_msg = document.querySelector('#prevmsgs')
    //function to add msg to msg box
    const append = (message, type) => {
        const msgEl = document.createElement('div');
        msgEl.innerHTML = message;
        msgEl.classList.add('message');
        msgEl.classList.add(type);
        messageArea.appendChild(msgEl);
        textarea.value = "";
        console.log("appended")
    }

    //function to initialize the meetingid and username(userid) 
    // and connecting with the various events(button and sockets)
    function init(uid, mid) {
        user_id = uid;
        meeting_id = mid;

        $('#meetingname').text("Meeting ID:" + meeting_id);
        // $('#me h5').innerHTML(`<ion-icon name="contact"></ion-icon>`)
        $('#me h5').text(user_id + '(Me)');

        document.title = user_id;

        SignalServerEventBinding();
        EventBinding();
    }

    function SignalServerEventBinding() {
        // Set up the nodejs and socket connection
        socket = io.connect(socker_url);

        var serverFn = function (data, to_connid) {
            socket.emit('exchangeSDP', { message: data, to_connid: to_connid });

        };
        // on reseting starting entry page will come
        socket.on('reset', function () {
            window.location.href = "../";
        });
        // connections between the various users 
        socket.on('exchangeSDP', async function (data) {
            await WrtcHelper.ExecuteClientFn(data.message, data.from_connid);
        });

        socket.on('informAboutNewConnection', function (data) {
            console.log("audioentry");
            audioentry.play();
            AddNewUser(data.other_user_id, data.connId);
            WrtcHelper.createNewConnection(data.connId);
        });
        // for the messages that comes from mongodb database
        socket.on('output-messages', (data) => {
            console.log(data)
            if (data.length) {
                data.forEach(message => {
                    var nametemp = message.username;
                    var msgtemp = message.msg;
                    var timetemp = message.time;
                    var datetemp = message.date;
                    console.log('//new-msg-dusri side')
                    console.log("////temp-", nametemp)
                    console.log("////is client-", name)
                    if (nametemp == name) {
                        let msg = 'you' + " " + datetemp + "-" + timetemp + '--' + msgtemp;
                        console.log(msg)
                        append(msg, 'right');
                    }
                    else {
                        let msg = nametemp + " " + datetemp + "-" + timetemp + '--' + msgtemp;
                        append(msg, 'left');
                    }
                });

            }
           
        });
        // fully exit from the meeting.
        socket.on('informAboutConnectionEnd', function (connId) {
            $('#' + connId).remove();
            WrtcHelper.closeExistingConnection(connId);

        });
        // ending the video call part only chat remaining
        socket.on('informAboutConnectionEnd-onlymsg', function (connId) {
            $('#' + connId).remove();
            WrtcHelper.closeExistingConnection(connId);




        });

        socket.on('new-user-in-chat-box', data => {
            console.log("chloo")
            append(`${data} joined`, 'center');
        })

        socket.on('new-mg', (mdata) => {
            var nametemp = mdata.username;
            var msgtemp = mdata.msg;
            var timetemp = mdata.time;
            var datetemp = mdata.date;
            // console.log('//new-msg-dusri side')
            // console.log("////temp-", nametemp)
            // console.log("////is client-", name)
            if (nametemp == name) {
                let msg = 'you ' + datetemp + "-" + timetemp + '--' + msgtemp;
                console.log(msg)
                append(msg, 'right');
            }
            else {
                let msg = nametemp + " " + datetemp + "-" + timetemp + '--' + msgtemp;
                append(msg, 'left');
            }

            console.log("audiochat")
            audiochat.play();
        })

        socket.on('connect', () => {

            // console.log("last check1", socket.id)
            mycon = socket.id;
            // console.log("my-----connect", mycon);

            if (socket.connected) {
                WrtcHelper.init(serverFn, socket.id);

                if (user_id != "" && meeting_id != "") {
                    socket.emit('userconnect', { dsiplayName: user_id, meetingid: meeting_id });
                    socket.emit('new-user-joined', name);

                }
            }
        });

        socket.on('userconnected', function (other_users) {
            $('#divUsers .other').remove();
            if (other_users) {
                for (var i = 0; i < other_users.length; i++) {
                    AddNewUser(other_users[i].user_id, other_users[i].connectionId);
                    WrtcHelper.createNewConnection(other_users[i].connectionId);
                }
            }
            $(".toolbox").show();
            $('#messages').show();
            $('#divUsers').show();
            $('.container').show();
            $('#send_c').show();
            $('.form1').show();
            $('.cpl').show();
            $('.t1').show();



        });
        // to apply filters to the user window in all others users side
        socket.on('applytoall', (data) => {
            // console.log(data.id);
            WrtcHelper.applyfilterm(data.id, data.filter);
        })
    }

    function EventBinding() {
        $('#btnResetMeeting').on('click', function () {
            socket.emit('reset');
        });
        $('#btnendVideoCall').on('click', function () {
            arr=[];
            arr.push(name);
            console.log(arr);
            localStorage.setItem("itemsJsn", JSON.stringify(arr));
            socket.emit('stopvideocall');
            $(".toolbox").hide();
            $('#messages').hide();
            $('#divUsers').hide();
            $('#afterendvc').show();
            

        });

        $("#filter").on('change', async function (event) {
            let currentFilter = event.target.value
            console.log("filter changed");
            info = {
                filter: currentFilter,
                id: mycon
            }
            socket.emit('applyfilter', (info));
        })

        $('#divUsers').on('dblclick', 'video', function () {
            this.requestFullscreen();
        });
        $('#rejoina').on('click',()=>{
            let rejoinurl=window.location.origin + "/index.html?mid=" + meeting_id;
            window.location.href=rejoinurl;
            name=arr[0];
        });


        send.addEventListener("click", () => {
            let mg = textarea.value
            console.log(mg);
            a = new Date();
            date1 = a.toLocaleDateString();
            time1 = a.getHours() + ':' + a.getMinutes() + ':' + a.getSeconds();
            append(`you:` + date1 + "-" + time1 + "--" + mg, 'right');
            data = {
                msg: mg,
                username: name,
                meeting_id: meeting_id,
                time: time1,
                date: date1
            }
            console.log("sending to server", name + ':' + mg)
            socket.emit('mymessages', (data));

        });
        // loading the previous msgs associate with the meeting id
        load_prev_msg.addEventListener("click", () => {
            socket.emit('loadPrevmsg', (name));
            console.log("hello prev");
            load_prev_msg.style = "display:none;";
        });

    }

    function AddNewUser(other_user_id, connId) {
        var $newDiv = $('#otherTemplate').clone();
        $newDiv = $newDiv.attr('id', connId).addClass('other');
        // $newDiv.style.width="600px";
        // $newDiv = $newDiv.addClass('col')
        $newDiv.find('h5').text(other_user_id);
        $newDiv.find('video').attr('id', 'v_' + connId);
        $newDiv.find('audio').attr('id', 'a_' + connId);
        $newDiv.show();
        $('#divUsers').append($newDiv);
    }


    return {
        _init: function (uid, mid) {
            console.log("app.js");
            init(uid, mid);
            socket.emit('new-user-joined', name);

        }

    };

}());