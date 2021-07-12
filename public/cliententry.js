const socket = io();
function enter_to_new_meet() {
    arr = [];
    user_id = document.querySelector("#fnameen").value;
    console.log("ui", user_id);
    arr.push(user_id);
    meeting_id = document.querySelector("#lnameen").value;
    arr.push(meeting_id);
    console.log(arr);
    localStorage.setItem("itemsJsn", JSON.stringify(arr));
    window.location.href = "../index.html";
}
function join_meeting() {
    arr = [];
    console.log("joining with given link");
    user_id = document.querySelector("#fnameen").value;
    meeting_link = document.querySelector("#lnameen").value;

    arr.push(user_id);
    console.log(arr);
    localStorage.setItem("itemsJsn", JSON.stringify(arr));
    window.location.href = meeting_link;

}

console.log("client entry")
video_call = document.querySelector(".buten1");
video_call.addEventListener("click", enter_to_new_meet);
chat = document.querySelector(".buten2");
chat.addEventListener("click", join_meeting);
