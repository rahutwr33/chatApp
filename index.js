var db = null;
document.addEventListener("DOMContentLoaded",  (event) =>{
    console.log("DOM fully loaded and parsed");
    db = firebase.firestore();
    if(localStorage.getItem('user')){
        location.replace('chat.html')
    }
})
  
  function saveUser(){
   let username = document.getElementById('username').value;
   db.collection("user").where("username", "==", username)
   .get()
   .then(function(querySnapshot) {
    if(querySnapshot.empty){
        db.collection("user").add({
            username : username,
            createdAt: firebase.firestore.Timestamp.fromDate(new Date()).toDate()
            })
            .then(function(docRef) {
                console.log("Document written with ID: ", docRef.id);
                document.getElementById('username').value = '';
                localStorage.setItem('user', docRef.id)
                location.replace('chat.html')
            })
            .catch(function(error) {
                console.error("Error adding document: ", error);
            });
    }else{
        querySnapshot.forEach(function(user) {
            localStorage.setItem('user', user.id)
            location.replace('chat.html')
        });
    }
   })
   .catch(function(error) {
       console.log("Error getting documents: ", error);
   });

  }