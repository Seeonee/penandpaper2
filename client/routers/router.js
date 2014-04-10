/**
 * Client-side routing.
 */
Router.configure({
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading'
});

// Wait functions.
var charactersReady = function() {
  return Meteor.subscribe('characters');
}

var codexReady = function() {
  return Meteor.subscribe('codex');
}

// Set up the routes!
Router.map(function() {
  this.route('home', {path: '/'});
  
  // Page showing all characters.
  this.route('characters', {
    path: 'characters',
    waitOn: charactersReady,
    action: function() {
      if (this.ready()) {
        this.render();
      } else {
        this.render('loading');
      }
    }
  });
  
  // Page showing a single character by name.
  this.route('character', {
    path: 'characters/:name?',
    waitOn: charactersReady,
    onRun: function() {
      var c = null;
      if (this.params.name) {
        c = Characters.findOne({name: this.params.name});
      }
      if (c) {
        Session.set('selected_character', c.name);
      }
    },
    action: function() {
      if (this.ready()) {
        this.render();
      } else {
        this.render('loading');
      }
    }
  });
  
  // Page showing all skills (or codices, if you like).
  this.route('codex', {
    waitOn: codexReady,
    action: function() {
      if (this.ready()) {
        this.render();
      } else {
        this.render('loading');
      }
    }
  });
  
  // Page showing a single codice.
  this.route('codice', {
    path: 'codex/s/:name',
    waitOn: codexReady,
    onRun: function() {
      var c = null;
      if (this.params.name) {
        c = Codex.findOne({name: this.params.name});
      }
      if (c) {
        Session.set('selected_codice', c.name);
      }
    },
    action: function() {
      if (this.ready()) {
        this.render();
      } else {
        this.render('loading');
      }
    }
  });
  
  // Page showing a filtered subset of codex entries.
  this.route('codex', {
    path: 'codex/:filters(*)?',
    waitOn: codexReady,
    onRun: function() {
      if (this.params.filters) {
        var f = PenAndPaperUtils.decode_url_filter_terms(this.params.filters);
        Session.set('selected_filters', f);
      }
    },
    action: function() {
      if (this.ready()) {
        this.render();
      } else {
        this.render('loading');
      }
    }
  });
  
  // Page showing a glossary of rules.
  this.route('glossary');
  
  // Default 404 path.
  this.route('notFound', {path: '*'});
  
});

