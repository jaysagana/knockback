/*
  knockback-validation.js 0.17.0
  (c) 2011-2013 Kevin Malakoff - http://kmalakoff.github.com/knockback/
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
  Dependencies: Knockout.js, Backbone.js, and Underscore.js.
*/
(function() {
  return (function(factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
      return define('knockback-validation', ['underscore', 'backbone', 'knockout', 'knockback'], factory);
    }
    // CommonJS/NodeJS or No Loader
    else {
      return factory.call(this);
    }
  })(function() {// Generated by CoffeeScript 1.6.2
var Collection, EMAIL_REGEXP, Model, NUMBER_REGEXP, URL_REGEXP, callOrGet, kb, ko, _, _unwrapObservable;

kb = !this.kb && (typeof require !== 'undefined') ? require('knockback') : this.kb;

_ = kb._;

Model = kb.Model;

Collection = kb.Collection;

ko = kb.ko;

this.Knockback = this.kb = kb;

if (typeof exports !== 'undefined') {
  module.exports = kb;
}

_unwrapObservable = ko.utils.unwrapObservable;

/*
  knockback-validation.js 0.17.0
  (c) 2011-2013 Kevin Malakoff.
  Knockback.Observable is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/knockback/blob/master/LICENSE
*/


callOrGet = function(value) {
  value = _unwrapObservable(value);
  if (typeof value === 'function') {
    return value.apply(null, Array.prototype.slice.call(arguments, 1));
  } else {
    return value;
  }
};

kb.Validation = (function() {
  function Validation() {}

  return Validation;

})();

kb.valueValidator = function(value, bindings, validation_options) {
  if (validation_options == null) {
    validation_options = {};
  }
  (validation_options && !(typeof validation_options === 'function')) || (validation_options = {});
  return ko.dependentObservable(function() {
    var active_index, current_value, disabled, identifier, identifier_index, priorities, results, validator;

    results = {
      $error_count: 0
    };
    current_value = _unwrapObservable(value);
    !('disable' in validation_options) || (disabled = callOrGet(validation_options.disable));
    !('enable' in validation_options) || (disabled = !callOrGet(validation_options.enable));
    priorities = validation_options.priorities || [];
    _.isArray(priorities) || (priorities = [priorities]);
    active_index = priorities.length + 1;
    for (identifier in bindings) {
      validator = bindings[identifier];
      results[identifier] = !disabled && callOrGet(validator, current_value);
      if (results[identifier]) {
        results.$error_count++;
        (identifier_index = _.indexOf(priorities, identifier) >= 0) || (identifier_index = priorities.length);
        if (results.$active_error && identifier_index < active_index) {
          results.$active_error = identifier;
          active_index = identifier_index;
        } else {
          results.$active_error || (results.$active_error = identifier, active_index = identifier_index);
        }
      }
    }
    results.$enabled = !disabled;
    results.$disable = !!disabled;
    results.$valid = results.$error_count === 0;
    return results;
  });
};

kb.inputValidator = function(view_model, el, validation_options) {
  var $input_el, bindings, identifier, input_name, options, result, type, validator, validators;

  if (validation_options == null) {
    validation_options = {};
  }
  (validation_options && !(typeof validation_options === 'function')) || (validation_options = {});
  validators = kb.valid;
  $input_el = $(el);
  if ((input_name = $input_el.attr('name')) && !_.isString(input_name)) {
    input_name = null;
  }
  if (!(bindings = $input_el.attr('data-bind'))) {
    return null;
  }
  options = (new Function("sc", "with(sc[0]) { return { " + bindings + " } }"))([view_model]);
  if (!(options && options.value)) {
    return null;
  }
  (!options.validation_options) || (_.defaults(options.validation_options, validation_options), validation_options = options.validation_options);
  bindings = {};
  (!validators[type = $input_el.attr('type')]) || (bindings[type] = validators[type]);
  (!$input_el.attr('required')) || (bindings.required = validators.required);
  (!options.validations) || ((function() {
    var _ref, _results;

    _ref = options.validations;
    _results = [];
    for (identifier in _ref) {
      validator = _ref[identifier];
      _results.push(bindings[identifier] = validator);
    }
    return _results;
  })());
  result = kb.valueValidator(options.value, bindings, validation_options);
  (!input_name && !validation_options.no_attach) || (view_model["$" + input_name] = result);
  return result;
};

kb.formValidator = function(view_model, el) {
  var $root_el, bindings, form_name, input_el, name, options, results, validation_options, validator, validators, _i, _len, _ref;

  results = {};
  validators = [];
  $root_el = $(el);
  if ((form_name = $root_el.attr('name')) && !_.isString(form_name)) {
    form_name = null;
  }
  if ((bindings = $root_el.attr('data-bind'))) {
    options = (new Function("sc", "with(sc[0]) { return { " + bindings + " } }"))([view_model]);
    validation_options = options.validation_options;
  }
  validation_options || (validation_options = {});
  validation_options.no_attach = !!form_name;
  _ref = $root_el.find('input');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    input_el = _ref[_i];
    if (!(name = $(input_el).attr('name'))) {
      continue;
    }
    validator = kb.inputValidator(view_model, input_el, validation_options);
    !validator || validators.push(results[name] = validator);
  }
  results.$error_count = ko.dependentObservable(function() {
    var error_count, _j, _len1;

    error_count = 0;
    for (_j = 0, _len1 = validators.length; _j < _len1; _j++) {
      validator = validators[_j];
      error_count += validator().$error_count;
    }
    return error_count;
  });
  results.$valid = ko.dependentObservable(function() {
    return results.$error_count() === 0;
  });
  results.$enabled = ko.dependentObservable(function() {
    var enabled, _j, _len1;

    enabled = true;
    for (_j = 0, _len1 = validators.length; _j < _len1; _j++) {
      validator = validators[_j];
      enabled &= validator().$enabled;
    }
    return enabled;
  });
  results.$disabled = ko.dependentObservable(function() {
    return !results.$enabled();
  });
  if (form_name) {
    view_model["$" + form_name] = results;
  }
  return results;
};

/*
  knockback-validators.js 0.17.0
  (c) 2011-2013 Kevin Malakoff.
  Knockback.Observable is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/knockback/blob/master/LICENSE
*/


URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;

EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;

kb.valid = {
  required: function(value) {
    return !value;
  },
  url: function(value) {
    return !URL_REGEXP.test(value);
  },
  email: function(value) {
    return !EMAIL_REGEXP.test(value);
  },
  number: function(value) {
    return !NUMBER_REGEXP.test(value);
  }
};

kb.hasChangedFn = function(model) {
  var attributes, m;

  m = null;
  attributes = null;
  return function() {
    var current_model;

    if (m !== (current_model = _unwrapObservable(model))) {
      m = current_model;
      attributes = (m ? m.toJSON() : null);
      return false;
    }
    if (!(m && attributes)) {
      return false;
    }
    return !_.isEqual(m.toJSON(), attributes);
  };
};

kb.minLengthFn = function(length) {
  return function(value) {
    return !value || value.length < length;
  };
};

kb.uniqueValueFn = function(model, key, collection) {
  return function(value) {
    var c, k, m,
      _this = this;

    m = _unwrapObservable(model);
    k = _unwrapObservable(key);
    c = _unwrapObservable(collection);
    if (!(m && k && c)) {
      return false;
    }
    return !!_.find(c.models, function(test) {
      return (test !== m) && test.get(k) === value;
    });
  };
};

kb.untilTrueFn = function(stand_in, fn, model) {
  var was_true;

  was_true = false;
  if (model && ko.isObservable(model)) {
    model.subscribe(function() {
      return was_true = false;
    });
  }
  return function(value) {
    var f, result;

    if (!(f = _unwrapObservable(fn))) {
      return _unwrapObservable(stand_in);
    }
    was_true |= !!(result = f(_unwrapObservable(value)));
    return (was_true ? result : _unwrapObservable(stand_in));
  };
};

kb.untilFalseFn = function(stand_in, fn, model) {
  var was_false;

  was_false = false;
  if (model && ko.isObservable(model)) {
    model.subscribe(function() {
      return was_false = false;
    });
  }
  return function(value) {
    var f, result;

    if (!(f = _unwrapObservable(fn))) {
      return _unwrapObservable(stand_in);
    }
    was_false |= !(result = f(_unwrapObservable(value)));
    return (was_false ? result : _unwrapObservable(stand_in));
  };
};
; return kb;});
}).call(this);