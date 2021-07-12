function update(arr) {
    tablecontrl = document.querySelector("#table1");
    let str = `<tr>
    <th scope="col">#</th>
    <th scope="col">Title</th>
    <th scope="col">Note</th>
  </tr>`;
    for (let i = 1; i < arr.length; i++) {
        str += `
        <tr>
        <th>${i}</th>
        <td>${arr[i][0]}</td>
        <td>${arr[i][1]}</td>
        <td><input type="button" value="delete" class="but2" onclick="deleted(${i})"></td>
        </tr>`;
    }
    tablecontrl.innerHTML = str;
}
function deleted(index) {
    arr2 = localStorage.getItem('itemsJsn')
    arr = JSON.parse(arr2);
    // total = total - (arr[index][2]);
    console.log(total)
    arr.splice(index, 1)
    localStorage.setItem("itemsJsn", JSON.stringify(arr));
    update(arr);
}

function submit() {
    console.log("updating");
    tit = document.querySelector("#fname1").value;
    des = document.querySelector("#lname1").value;
    // price = document.getElementById("price").value;
    console.log(tit, des);
    if (localStorage.getItem('itemsJsn') == null) {
        arr = [];
        // total = total + price;
        // console.log(total)
        arr.push([tit, des]);
        localStorage.setItem("itemsJsn", JSON.stringify(arr));

    }
    else {
        arr2 = localStorage.getItem('itemsJsn')
        arr = JSON.parse(arr2);
        // total = total + price;
        arr.push([tit, des]);
        localStorage.setItem("itemsJsn", JSON.stringify(arr));
    }
    tit = "";
    des = "";
    update(arr);
}
var total = 0;
if (localStorage.getItem('itemsJsn') == null) {
    arr = [];
}
else {
    arr2 = localStorage.getItem('itemsJsn')
    arr = JSON.parse(arr2);
    update(arr);
}
let add = document.querySelector("#but1");
add.addEventListener("click", submit);

// module.exports = {
//     update: update,
//     submit:submit,
//     deleted:deleted
// }