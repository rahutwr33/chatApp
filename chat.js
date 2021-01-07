var db = null;
var updateID = null;
var chatboxopen = false;
document.addEventListener("DOMContentLoaded",  (event) =>{
  console.log("DOM fully loaded and parsed");
  db = firebase.firestore();

  if(localStorage.getItem('user')){
    let dataref = db.collection("user").doc(String(localStorage.getItem('user')))
    dataref.get()
    .then((docRef) => { 
      document.getElementById(`current_user`).innerHTML = `You are LoggedIn as a ${docRef.data().username}`;
     })
    .catch((error) => {console.log(error)})
    db.collection("user").get().then((querySnapshot) => {
      let index = 0;
      querySnapshot.forEach((doc) => {
        ++index
        if(doc.id != localStorage.getItem('user')){
          $(".inbox_chat").append( `<div class="chat_list" id="user_${doc.id}" onclick="openChatbox(${doc.id})">
          <div class="chat_people">
            <div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>
            <div class="chat_ib">
              <h5 id="${doc.id}">${doc.data().username} <span class="chat_date">${new Date(doc.data().createdAt.toDate()).toLocaleDateString()}</span></h5>
              <!-- <p>Test, which is a new approach to have all solutions
                astrology under one roof.</p> -->
            </div>
          </div>
        </div>`);
        }
      });
    });
  }else{
    location.replace('chatApp')
  }
  db.collection("chat").onSnapshot(function(querySnapshot) {
     if(chatboxopen){
      $("#chat_list").empty();
      db.collection("chat")
      .orderBy("createdAt", "asc")
      .get()
      .then(function(querySnapshot) {
        if(!querySnapshot.empty){
          querySnapshot.forEach(function(doc) {
            if(doc.data().receiverID  == $(`#userprofile`).attr('data-id') && doc.data().senderID == localStorage.getItem('user')){
              $("#chat_list").append(`<div class="outgoing_msg"><div class="sent_msg">
                <p>${doc.data().message}</p>
                <span class="time_date">${new Date(doc.data().createdAt.toDate()).toLocaleDateString()} ${new Date(doc.data().createdAt.toDate()).getHours()}:${new Date(doc.data().createdAt.toDate()).getMinutes()}</span>
              </div></div>`);
            }
            if(doc.data().senderID == $(`#userprofile`).attr('data-id') && doc.data().receiverID == localStorage.getItem('user')){
              $("#chat_list").append(` <div class="incoming_msg">
              <div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil">
              </div>
              <div class="received_msg">
                <div class="received_withd_msg">
                  <p>${doc.data().message}</p>
                  <span class="time_date">${new Date(doc.data().createdAt.toDate()).toLocaleDateString()} ${new Date(doc.data().createdAt.toDate()).getHours()}:${new Date(doc.data().createdAt.toDate()).getMinutes()}</span>
                </div>
              </div>
            </div> `);
            }
        });
        $('.msg_history').scrollTop($('.msg_history')[0].scrollHeight);
        }
      })
      .catch(function(error) {
          console.log("Error getting documents: ", error);
      });    
     }
  });
});


function openChatbox(id){
  chatboxopen = true;
  let userid = id.getAttribute("id");
  let dataref = db.collection("user").doc(String(userid))
  dataref.get()
  .then((docRef) => { 
    $('.mesgs').css({'display': 'block'});
    document.getElementById(`nameofuser`).innerHTML = docRef.data().username;
    $("#chat_list").empty();
    $('#userprofile').attr('data-id',userid);
    $(`.chat_list.active_chat`).removeClass("active_chat")
    $(`#user_${userid}`).addClass("active_chat");
   })
  .catch((error) => {console.log(error)});
  db.collection("chat")
    .orderBy("createdAt", "asc")
    .get()
    .then(function(querySnapshot) {
      if(!querySnapshot.empty){
        querySnapshot.forEach(function(doc) {
          if(doc.data().receiverID  == userid && doc.data().senderID == localStorage.getItem('user')){
            $("#chat_list").append(`<div class="outgoing_msg"><div class="sent_msg">
              <p>${doc.data().message}</p>
              <span class="time_date">${new Date(doc.data().createdAt.toDate()).toLocaleDateString()} ${new Date(doc.data().createdAt.toDate()).getHours()}:${new Date(doc.data().createdAt.toDate()).getMinutes()}</span>
            </div></div>`);
          }
          if(doc.data().senderID == userid && doc.data().receiverID == localStorage.getItem('user')){
            $("#chat_list").append(` <div class="incoming_msg">
            <div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil">
            </div>
            <div class="received_msg">
              <div class="received_withd_msg">
                <p>${doc.data().message}</p>
                <span class="time_date">${new Date(doc.data().createdAt.toDate()).toLocaleDateString()} ${new Date(doc.data().createdAt.toDate()).getHours()}:${new Date(doc.data().createdAt.toDate()).getMinutes()}</span>
              </div>
            </div>
          </div> `);
          }
      });
      }
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}

function signout(){
  localStorage.removeItem('user');
  location.replace('chatApp')
}

function sendMessage(){
  let message = document.getElementById('write_msg').value;
  if(message){
    let sender = localStorage.getItem('user');
    let receiver = $(`#userprofile`).attr('data-id');
    
    let senderref = db.collection("user").doc(String(sender))
    let receiverref = db.collection("user").doc(String(receiver))
    
    let chatobj = {};
    chatobj.message = message;
    senderref.get()
    .then((docRef) => { 
      chatobj.sender = docRef.data();
      chatobj.senderID = sender;
    receiverref.get()
    .then((docReftwo) => { 
        chatobj.receiver = docReftwo.data();
        chatobj.receiverID = receiver;
        chatobj.createdAt = firebase.firestore.Timestamp.fromDate(new Date()).toDate();
        db.collection("chat").add(chatobj)
          .then(function(docRefthree) {
              updateID = docRefthree.id;
              console.log("Document written with ID: ", docRefthree.id);
              document.getElementById('write_msg').value = "";
              db.collection("chat").doc(docRefthree.id).onSnapshot(function(doc) {
                console.log(doc.data())
                // if(doc.data().receiverID  == receiver && doc.data().senderID == localStorage.getItem('user')){
                //   $("#chat_list").append(`<div class="outgoing_msg"><div class="sent_msg">
                //     <p>${doc.data().message}</p>
                //     <span class="time_date">${new Date(doc.data().createdAt.toDate()).toLocaleDateString()} ${new Date(doc.data().createdAt.toDate()).getHours()}:${new Date(doc.data().createdAt.toDate()).getMinutes()}</span>
                //   </div></div>`);
                // }
                // if(doc.data().senderID == $(`#userprofile`).attr('data-id') && doc.data().receiverID == localStorage.getItem('user')){
                //   console.log(2222)
                //   $("#chat_list").append(` <div class="incoming_msg">
                //   <div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil">
                //   </div>
                //   <div class="received_msg">
                //     <div class="received_withd_msg">
                //       <p>${doc.data().message}</p>
                //       <span class="time_date">${new Date(doc.data().createdAt.toDate()).toLocaleDateString()} ${new Date(doc.data().createdAt.toDate()).getHours()}:${new Date(doc.data().createdAt.toDate()).getMinutes()}</span>
                //     </div>
                //   </div>
                // </div> `);
                // }
              });
          })
          .catch(function(errorthree) {
              console.error("Error adding document: ", errorthree);
          });
      }).catch(err=>{
        console.log(err)
      })
     }).catch(err=>{
       console.log(err)
     })
  }
}
