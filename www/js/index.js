var app = {
  INITIAL_TIMEOUT: 60, // 60 seconds
  EXTENDED_TIMEOUT: 90, // 90 seconds
  PERMITTED_DELTA: 10,

  count: 0,
  timerExtended: false,
  startTime: null,
  lastBreathCount: null,

  initialize: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    $(document).on('deviceready', this.onDeviceReady);
  },

  onDeviceReady: function() {
    app.$start = $('#start');
    app.$progress = $('#progress');
    app.$results = $('#results');
    app.$resultsBody = $('#results tbody');
    app.$start.on('touchstart', app.start);
    $('#restart-counting').on('touchstart', function(){
      window.location.reload();
    });
  },

  start: function(){
    app.$start.toggleClass('hide');
    app.startTime = (+new Date) / 1000;
    app.$progress.toggleClass('hide').on('touchstart', app.record);
    app.timer = setTimeout(app.displayResults, app.INITIAL_TIMEOUT * 1000);
  },

  displayResults: function(){
    app.$progress.unbind('touchstart', app.record).toggleClass('hide');
    app.$results.toggleClass('hide');
  },

  elapsedTime: function(){
    return ((+new Date) / 1000) - app.startTime;
  },

  computeDelta: function(x, y){
    return Math.abs(((x - y)/((x + y) / 2) * 100)).toFixed(1);
  },

  extendTimer: function(elapsedTime){
    clearTimeout(app.timer);
    app.timer = setTimeout(app.displayResults, (app.EXTENDED_TIMEOUT - elapsedTime) * 1000);
    app.timerExtended = true;
  },

  deltaError: function(elapsedTime){
    if (app.timerExtended)
      app.reset();
    else
      app.extendTimer(elapsedTime);
  },

  record: function(){
    var elapsedTime = app.elapsedTime(),
        breathCount = (app.count/elapsedTime) * 60,
        delta = app.lastBreathCount ? app.computeDelta(app.lastBreathCount, breathCount) : 0,
        html = $('<tr><td>'+ elapsedTime.toFixed(1) +'</td><td>'+ breathCount.toFixed(1) +'</td><td>'+ delta +'</td></tr>');

    ++app.count;

    if (delta > app.PERMITTED_DELTA) {
      html.addClass('danger');
      app.deltaError(elapsedTime);
    };

    app.$resultsBody.append(html);
    app.lastBreathCount = breathCount;
  },

  reset: function(){
    $('#recount-message').removeClass('hide');
    app.displayResults();
  }
};
