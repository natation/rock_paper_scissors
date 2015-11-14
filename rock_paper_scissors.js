Players = new Mongo.Collection("players");

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
        Players.insert({
          num: 1,
          wins: 0,
          losses: 0,
          ties: 0,
          choice: ""
        });
        Players.insert({
          num: 2,
          wins: 0,
          losses: 0,
          ties: 0,
          choice: ""
        });
    }
  });

  Meteor.publish("players", function () {
    return Players.find();
  });
}

if (Meteor.isClient) {
  Meteor.subscribe("players");

  Template.Player.helpers({
    player: function () {
      return Players.find({num: this.playerNum});
    },
    bothDone: function () {
      var bothDone,
          players = Players.find();
      if (players.count() > 0) {
        bothDone = true;
        Players.find({}).forEach(function (player) {
          if (!player.choice) {
            bothDone = false;
          }
        });
      }
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
      Meteor.call("updateChoice", player._id, choice);
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
            if (player.choice) {
              Meteor.call("updateChoice", player._id, "");
              if (winner) {
                if (player.num === winner)
                  Meteor.call("updateScore", player, "win");
                else {
                  Meteor.call("updateScore", player, "loss");
                }
              } else {
                  Meteor.call("updateScore", player, "tie");
              }
            }
          });
        }, 3000, winner);
        if (winner) {
          return "Player " + winner + " wins!";
        } else if (typeof winner !== "undefined") {
          return "It's a tie!";
        }
      } else {
        return "Waiting...";
      }
    }
  });
}

function determineWinner () {
  var winner,
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
  } else if (p1Choice === p2Choice) {
    winner = false;
  }
  return winner;
}

Meteor.methods({
  updateChoice: function (playerId, choice) {
    Players.update(playerId, {$set: {choice: choice}});
  },
  updateScore: function (player, type) {
    switch (type) {
      case "win":
        Players.update(player._id, {$set: {wins: player.wins + 1}});
        break;
      case "loss":
        Players.update(player._id, {$set: {losses: player.losses + 1}});
        break;
      case "tie":
        Players.update(player._id, {$set: {ties: player.ties + 1}});
    }
  }
});
