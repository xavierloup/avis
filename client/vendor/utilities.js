// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

function nodered(scope, url, method, payload, cb){
  method = method.toLowerCase();

  var o = {
    url: url,
    method: method,
    json: true
  };

  if(method !== 'get'){
    o.body = payload;
  }

  $.ajax({
    url: '/nodered',
    method: 'post',
    data: {payload: JSON.stringify(o)},
    dataType: 'json',
    success: function(response){
      cb(response);
      scope.$apply();
    }
  });
}

// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

function express(scope, url, method, payload, cb){
  $.ajax({
    url: url,
    method: method,
    data: payload,
    dataType: 'json',
    success: function(response){
      cb(response);
      scope.$apply();
    }
  });
}

// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

function openwhisk(scope, org, space, action, payload, cb){
  var o = {
    org: org,
    space: space,
    action: action,
    payload: payload
  };

  $.ajax({
    url: '/openwhisk',
    method: 'post',
    data: {payload: JSON.stringify(o)},
    dataType: 'json',
    success: function(response){
      cb(response);
      scope.$apply();
    }
  });
}

// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
