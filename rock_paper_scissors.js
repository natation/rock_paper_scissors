Players = new Mongo.Collection("players");

if (Meteor.isClient) {
  Template.Player.helpers({
    player: function () {
      return Players.find({num: this.playerNum});
    },
  });
}

// if (Meteor.isServer) {
//   Meteor.startup(function () {
//     // code to run on server at startup
//   });
// }
