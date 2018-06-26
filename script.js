// Initialize Firebase
var config = {
  apiKey: "AIzaSyCPrEITecZHbkPPG5Ml4ufKJqLWC85XoFw",
  authDomain: "rps-game-f272a.firebaseapp.com",
  databaseURL: "https://rps-game-f272a.firebaseio.com",
  projectId: "rps-game-f272a",
  storageBucket: "rps-game-f272a.appspot.com",
  messagingSenderId: "287919389862"
};
firebase.initializeApp(config);
var database = firebase.database();

//keep track of connections
var players = database.ref("/players");
var decisions = database.ref("/decisions");
var connected = database.ref(".info/connected");

//Player on client
var you = "";

//Object for game logic
var Rock = {
  Paper: 0,
  Scissors: 1,
  Rock: 0
};
var Paper = {
  Rock: 1,
  Scissors: 0,
  Paper: 0
};
var Scissors = {
  Paper: 1,
  Rock: 0,
  Scissors: 0
};

//Add user to database
function addUser() {
  //take a snap of the players reference
  players.once("value", function (snap) {

    //if player 1 and 2 are not here, set player 1
    if (snap.child("player2").exists() && snap.child("player1").exists()) {
      console.log("There is already a player 1 and 2");
      $("#form-div").removeClass("d-none");
    }
    //if player 1 is not here, then set player 1
    else if (snap.child("player2").exists() && !snap.child("player1").exists()) {
      console.log("player 2 exists");
      players.child("player1").set({
        player1Name: you,
        online: true
      });
      var con = players.child("player1");
      con.onDisconnect().remove();
    }
    //if player 2 is not here, then set player 2
    else if (!snap.child("player2").exists() && snap.child("player1").exists()) {
      console.log("player 1 exists");
      players.child("player2").set({
        player2Name: you,
        online: true
      });
      var con = players.child("player2");
      con.onDisconnect().remove();
    }
    else {
      console.log("player1 and 2 does not exist");
      players.child("player1").set({
        player1Name: you,
        online: true
      });

      //remove player 1 if he disconnects. 
      //works because it's being called by .info/connected reference
      var con = players.child("player1");
      con.onDisconnect().remove();
    }
  });
};

//Record player 1's decision
//everything done inside this function is seen by everyone
$(".1").on("click", function () {
  var decision = $(this).text();
  players.once("value", function (snap) {
    if (you == snap.child("player1/player1Name").val()) {
      decisions.child("player1").set({ decision: decision });
    };
  });
});

//Record player 2's decision
//everything done inside this function is seen by everyone
$(".2").on("click", function () {
  var decision2 = $(this).text();
  players.once("value", function (snap) {
    if (you == snap.child("player2/player2Name").val()) {
      decisions.child("player2").set({ decision: decision2 });
    }
  });
});

//Listen to players ref
//if anything changes, update for all clients
players.on("value", function (snap) {
    //if player 1 and 2 are not here
    decisions.remove();
    if (snap.child("player2").exists() && snap.child("player1").exists()) {
      $("#result").html("It's ON!")
    }
    //if player 1 is not here
    else if (snap.child("player2").exists() && !snap.child("player1").exists()) {
      $("#result").html(snap.child("player2/player2Name").val() + " is searching for a challenge");
    }
    //if player 2 is not here
    else if (!snap.child("player2").exists() && snap.child("player1").exists()) {
      $("#result").html(snap.child("player1/player1Name").val() + " is searching for a challenge");
    }
    else {
      $("#result").html("Nobody wants to play Rock paper scissors...?");
    }
});

//When user clicks submit, calls addUser
//This will implement addUser's logic only for the person clicking submit
$("#add-user").on("click", function () {
  event.preventDefault();
  $("#form-div").addClass("d-none");
  you = $("#email-input").val().trim();
  console.log("Welcome " + you + "!");
  addUser();
});

//check if both decisions are made
//on method allows for two way communication, (server calls all clients )
decisions.on("value", function (snap) {
  if (snap.child("player1").exists() && snap.child("player2").exists()) {
    gameLogic(snap);
  }
  if (snap.child("player1").exists() && !snap.child("player2").exists()) {
    $("#result").html("Player 1 has Chosen");
  }
  if (!snap.child("player1").exists() && snap.child("player2").exists()) {
    $("#result").html("Player 2 has Chosen");
  }
});

function gameLogic(snap) {
  var Decision1 = snap.child("player1/decision").val();
  var Decision2 = snap.child("player2/decision").val();
  var Result1 = eval(Decision1)[Decision2];
  var Result2 = eval(Decision2)[Decision1];
  if(Result1==1){
    $("#result").html("Player 1 has Won!");
    decisions.remove();
  }
  else if(Result2==1){
    $("#result").html("Player 2 has Won!");
    decisions.remove();
  }
  else{
    $("#result").html("Tie");
    decisions.remove();
  }
}
