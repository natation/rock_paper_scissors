Iron.utils.debug = true;

Router.route('/', function () {
  layoutOptions = {fullNav: true};
  setLayout.call(this, layoutOptions);
  this.render('Home');
});

Router.route('/player1', function () {
  layoutOptions = {fullNav: false};
  setLayout.call(this, layoutOptions);
  this.render('player1');
});

Router.route('/player2', function () {
  layoutOptions = {fullNav: false};
  setLayout.call(this, layoutOptions);
  this.render('player2');
});

function setLayout (opts) {
  this.layout('ApplicationLayout', {
    data: {
      fullNav: opts.fullNav
    }
  });
}
