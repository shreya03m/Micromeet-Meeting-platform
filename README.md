# Micromeet-Meeting-platform
## Features:
1)Multipeer VideoCall
2)Chat-inbetween the meetings,after the meeting and even after days with the same meeting link. 
3)ScreenSharing 
4)Recording(of once video or screen only)
5)Applying fun filter to video call
6)Keeping notes in between the meeting.

## How to get access to the the MicroMeet:
1)Clone the repository
2)After that you can follow this link for the connections: https://youtu.be/CNlxRvZMnis

## how the connection is done in the backend?
1) It uses a NodeJS (socket.io) based signaling server for client to server and server to client communication.SDP & ICE details (between peers) will be shared 
through this Signaling Server.Participants can do Audio/Video/Screen sharing and it is being done using Browser builtin WebRTC APIs.

## Structure of Repo
1)Public folder:It consist of all the CSS files,Client side Javascript files and other media files like images,audio etc.<br>
2).env file contain the mongodb url of the database<br>
3)Model folder:It contains  Javascript files in which format of MongoDB database is there<br>
4)entry.html is the html file associated with the first page of the webapp.<br>
5)index.html is the html file associated with the second page of the webapp.<br>
6)server.js is the main server file contains a NodeJS project. This is being used as signaling server and for meeting & participant management,also has web socket connection with client and mongodb connections too.<br>

## Application Flow
First,we need to run our server.js file .So for that go to the current dirrectory where all files and folders are there and open the terminal in that directory and then type npm run dev so the server will start running on port 8800<br>
When we open any browser then the localhost:8800,entry page will be displayed you can write your username if wanted to create new meeting then click on new meeting button,or if you have link paste it in the textbox and after clicking on join button you can join the meeting<br>
 It sends a request to our signaling server for meeting/participant registration.
Server checks & store meeting/user/connection detail in its server memory.
When a user registers with a server, it gets details of already registered/connected users against that meeting it. Server also notifies other participants about this new participant.
Client side creates a RTCPeerConnection for every new participant and maintains these connections in an array. Same happens for Streams.
Every box in meeting represents a participant. For every remote participant, we've an RTCPeerConnection, a Video Stream, An Audio Stream, A Video Player and An Audio Player,also so a space for the chat box. So as soon as remote peer starts a video stream, that is displayed in relevant video player.
When local user starts camera or starts screen sharing, Video track is added in all remote connections. Same happens for unmute.
On remote sides, event of new track is triggered and stream is added in relevant video player or audio player. Also stream is maintained in list as remote stream.
for the chatbox it will be there inbetween the meeting after the meeting is over.Therefore user can share text anytime.<br>

## RTCPeerConnection Management
First user (User1) joins the meeting. Box for local user is displayed. No peer exists (or no peers data come from server) so no rtc connection is created. Signaling server now know about one participant.
Second user (User2) joins the meeting. Box for local user is displayed. Request goes to server. Server saves its details and returns detail of existing users (i.e. user 1). User2 will receive detail of User1 and will create a box for it. User2 will create an RTCPeerConnection for User1 and will store it in connection array. Server will also notify User1 about User2. User1 will create a box for User2. User1 will create an RTCPeerConnection for User2 and will store it in connections array.
Third user (User3) joins the meeting. Box for local user is displayed. Request goes to server. Server saves its details and returns detail of existing users (i.e. User1, User2). User3 will receive detail of User1 & User2. It will create a boxes for them. User3 will create RTCPeerConnection for User1 & for User2 and and will store them in its connections array. Server will also notify User1 & User2 about User3. User1 will create a box for User3. User1 will create an RTCPeerConnection for User3 and will store it in its connections array. and User2 will create an RTCPeerConnection for User3 and will store it in its connections array.
When a user (browser) gets disconnected from signalr server, server removes it from local memory (after specific time when disconnected event fires). It also notifies other participants so they remove RTC connection object from its connections list.<br>

## SDP Sharing Between Peers
A peer (browser tab) starts communication by creating connection and then creating an 'offer'. This offer object is shared with other peer through signaling server and other peer responds with an 'answer' object. Both shares ICE details through signaling server. Once they share all this meta data, they can do real time communication (audio or video or data streams) directly.<br>

In our example, whenever a change is made to connection (streams added or removed), we need offer/answer flow is required again. We can use 'negotiationneeded' event in this case to create offer as this event will be raised whenever we make any change in connection (e.g. adding or removing streams).
In this exchange of data through signaling server, user unique identifiers will be shared (who is sending and to whom it is sending).

