var native_qs = require("querystring-browser");
var _ = require('lodash');

module.exports = function (query) {
  if (!query) return {};
  if (typeof query == 'string') {
    if (!query.match(/\[\w*\]/)) return native_qs.parse(query);
    query = native_qs.parse(query);
  }
  return parse(query)
}

function parse(query) {
  const result = {};
  for (var [key, value] of Object.entries(query)) {
    const keyPath = [...key.matchAll(/\w+/g)].map(match => match[0]).join('.')
    _.merge(result, _.set({}, keyPath, value))
  }
  return result
}

module.exports.parse = module.exports;

module.exports.stringify = function(obj) {
  if (_.isObject(obj) && !_.isArray(obj)) {
    var result = [];
    _.each(obj, function (val, key) {
      if (_.isArray(val)) {
        result.push(stringifyArray(key, val));
      } else if (_.isObject(val)) {
        result.push(stringifyObject(key, val));
      } else if (val || typeof val === 'boolean') {
        result.push(key + '=' + native_qs.escape(val));
      }
    });
    result = result.filter(function (e) { return e });
    return result.join('&');
  } else {
    throw new Error('Invalid Object Format');
    return;
  }
}

function stringifyObject(key, obj) {
  var result = [];
  _.each(obj, function (val, key2) {
    key2 = key + '[' + key2 + ']';
    if (_.isArray(val)) {
      result.push(stringifyArray(key2, val));
    } else if (_.isObject(val)) {
      result.push(stringifyObject(key2, val));
    } else if (val || typeof val === 'boolean') {
      result.push(key2 + '=' + val);
    }
  });
  result = result.filter(function (e) { return e });
  return result.join('&');
}

function stringifyArray(key, obj) {
  var result = [];
  _.each(obj, function (val) {
    if (_.isObject(val)) {
      // not allow any object in an array
      throw new Error('Not Allow Any Object In An Array:' + key + '=' + JSON.stringify(obj));
    } else if (val || typeof val === 'boolean') {
      result.push(key + '[]=' + val);
    }
  });
  return result.join('&');
}
