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
  this.route('home', {
    path: '/',
    onBeforeAction: function() {
      this.subscribe('characters').wait();
      this.subscribe('codex').wait();
    },
    action: function() {
      if (this.ready()) {
        this.render();
      } else {
        this.render('loading');
      }
    }
  });
  
  // Page showing all characters.
  this.route('characters', {
    path: 'characters',
    onBeforeAction: function() {
      this.subscribe('characters').wait();
      this.subscribe('codex').wait();
    },
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
    path: 'characters/:name?/:edit?',
    onBeforeAction: function() {
      this.subscribe('characters').wait();
      this.subscribe('codex').wait();
    },
    onRun: function() {
      var c = null;
      if (this.params.name) {
        c = Characters.findOne({name: {
          $regex: RegExp.quote(this.params.name),
          $options: 'i'
        }});
      }
      if (c) {
        Session.set('selected_character', c.name);
      }
      if (this.params.edit === 'edit') {
        Session.set('editing_character', true);
      } else {
        Session.set('editing_character', null);
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
  
  // Page showing a single character by name.
  this.route('character_edit_slot', {
    path: 'characters/:name/e/:slot_name/:slot_id?/f/:filters(*)?',
    // waitOn: charactersReady, // TODO: Needs characters too!
    onBeforeAction: function() {
      this.subscribe('characters').wait();
      this.subscribe('codex').wait();
    },
    onRun: function() {
      var c = null;
      if (this.params.name) {
        c = Characters.findOne({name: {
          $regex: RegExp.quote(this.params.name),
          $options: 'i'
        }});
      }
      if (!c) {
        // That's all for now.
        Session.set('selected_character', null);
        return;
      }
      Session.set('selected_character', c.name);
      Session.set('editing_character', true);
      var slot = {name: this.params.slot_name, id: this.params.slot_id };
      if (SlotsUtils.isValidSlot(slot)) {
        var f = {};
        if (this.params.filters) {
          if (this.params.filters !== 'all') {
            f = CodexFilters.decode_url_filter_terms(this.params.filters);
          }
        }
        var level = CharacterSupport.get_slot_level(c, slot);
        f = CodexFilters.narrow_filters(f, slot.name, level);
        Session.set('selected_filters', f);
        Session.set('editing_slot', slot);
      } else {
        Session.set('editing_slot', null);
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
        Session.set('selected_character', null);
        Session.set('editing_slot', null);
        Session.set('selected_filters', null);
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
      Session.set('selected_character', null);
      Session.set('editing_slot', null);
      if (this.params.filters) {
        if (this.params.filters === 'all') {
          Session.set('selected_filters', null);
        } else {
          var f = CodexFilters.decode_url_filter_terms(this.params.filters);
          Session.set('selected_filters', f);
        }
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

