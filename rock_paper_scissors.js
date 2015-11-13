Players = new Mongo.Collection("players");

if (Meteor.isClient) {
  Template.Player.helpers({
    player: function () {
      return Players.find({num: this.playerNum});
    },
    bothDone: function () {
      var bothDone = true;
      Players.find({}).forEach(function (player) {
        if (!player.choice) {
          bothDone = false;
        }
      });
      return bothDone;
    }
  });

  Template.Choices.helpers({
    rock: function () {
      var player = Players.findOne({num: this.playerNum});
      return player && (player.choice === "Rock");
    },
    paper: function () {
      var player = Players.findOne({num: this.playerNum});
      return player && (player.choice === "Paper");
    },
    scissors: function () {
      var player = Players.findOne({num: this.playerNum});
      return player && (player.choice === "Scissors");
    },
    disabled: function () {
      return this.ready;
    }
  });

  Template.Choices.events({
    'click .choice': function (e) {
      e.preventDefault();
      var choice = e.target.textContent,
          player = Players.findOne({num: this.playerNum});
      Players.update(player._id, {$set: {choice: choice}});
    }
  });

  Template.OpponentChoice.helpers({
    opponentChoice: function () {
      var playerNum = this.playerNum === 1 ? 2 : 1,
          otherPlayer = Players.findOne({num: playerNum});
      if (otherPlayer && this.ready) {
        return otherPlayer.choice;
      } else {
        return '?';
      }
    }
  });

  Template.Outcome.helpers({
    outcome: function () {
      var that = this;
      if (that.ready) {
        var winner = determineWinner();
        setTimeout(function (winner) {
          Players.find({}).forEach(function (player) {
            Players.update(player._id, {$set: {choice: ""}});
            if (winner) {
              if (player.num === winner)
                Players.update(player._id, {$set: {wins: player.wins + 1}});
              else {
                Players.update(player._id, {$set: {losses: player.losses + 1}});
              }
            } else {
              Players.update(player._id, {$set: {ties: player.ties + 1}});
            }
          });
        }, 2000, winner);
        if (winner) {
          return "Player " + winner + " wins!";
        } else {
          return "It was a tie!";
        }
      } else {
        return "Waiting...";
      }
    }
  });
}

// if (Meteor.isServer) {
//   Meteor.startup(function () {
//     // code to run on server at startup
//   });
// }

function determineWinner () {
  var winner = false,
      choices = {};
  Players.find({}).forEach(function (player) {
    choices[player.num] = player.choice;
  });
  var p1Choice = choices[1],
      p2Choice = choices[2];
  if (p1Choice !== p2Choice) {
    switch (p1Choice) {
      case "Rock":
        winner = p2Choice === "Paper" ? 2 : 1;
        break;
      case "Paper":
        winner = p2Choice === "Scissors" ? 2 : 1;
        break;
      case "Scissors":
        winner = p2Choice === "Rock" ? 2 : 1;
        break;
    }
  }
  return winner;
}
