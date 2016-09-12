// Returns results from ArchivesSpace for a refid search
function getResults(data, refid) {
  objects = $.ajax({
    type: "GET",
    dataType: "json",
    beforeSend: function(request) {
      request.setRequestHeader("X-ArchivesSpace-Session", token);
    },
    url: baseUrl + "/repositories/" + repoId + "/find_by_id/archival_objects",
    data: data,
    success: function(results) {
      if (results["archival_objects"].length < 1) {
        showFeedback("error", "#refid-search-error", "Sorry, I couldn't find anything for " + refid);
      } else {
        //this could probably be tightened up
        $("#refid-search-error").empty().removeClass("alert").removeClass(function(index, css) {
          return (css.match(/(^|\s)alert\S+/g) || []).join(' ');
        });
        var objectURI = results["archival_objects"][0]["ref"];
        var object = getJson(objectURI);
        console.log(object)
        // var resource = getJson(object["resource"]["ref"]);
        // var instances, agents, subjects
        // if (object['instances'].length > 0) {
        //   var instances = handleInstances(object['instances'])
        // }
        // if (object['linked_agents'].length > 0) {
        //   var agents = handleAgents(object["linked_agents"]);
        // }
        // if (object["subjects"].length > 0) {
        //   var subjects = handleSubjects(object["subjects"]);
        // }
        // showResults(resource, object, instances, agents, subjects);
      }
    }
  });
}

// Fetches JSON from an ArchivesSpace URI
function getJson(uri, token) {
  $.ajax({
    type: "GET",
    dataType: "json",
    beforeSend: function(request) {
      request.setRequestHeader("X-ArchivesSpace-Session", token);
    },
    url: baseUrl + uri,
    success: function(data) {
      return data;
      console.log(data)
    },
    error: console.log("error")
  });
}

// Loops through instance data and constructs HTML for each
function handleInstances(data) {
  var list = '';
  for (i = 0; i < data.length; i++) {
    var container = data[i]["container"];
    var instanceLength = countInstanceTypes(container);
    var instance = [];
    for (n = 1; n <= instanceLength; n++) {
      instance.push(capitalize(container["type_" + n]) + " " + container["indicator_" + n]);
    }
    containerHTML = instance.join(", ")
    item = "<h4>" + containerHTML + "</h4>"
    if (container["container_locations"].length > 0) {
      var location = handleLocations(container["container_locations"]);
      item = item + location;
    }
    list = list + item;
  }
  return list;
}

// Loops through locations data and constructs HTML for each
function handleLocations(data) {
  location = '';
  for (i = 0; i++; i<data.length) {
    locationData = getJson(data[i]["ref"]);
    location = location + '<p>' + locationData["title"] + '</p>';
  }
  return location;
}

// Loops through agents and constructs HTML for each
function handleAgents(data) {
  return "<span class='label label-default'>Agents go here</span>"
}

// Loops through subjects and constructs HTML for each
function handleSubjects() {
  return "<span class='label label-default'>Subjects go here</span>"
}

// Capitalizes the first letter of a string
function capitalize(str) {
  str = str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
    return letter.toUpperCase();
  });
  return str;
}

// Counts the number of instance types in an instance object
function countInstanceTypes(obj) {
  var count = 0;
  for (var prop in obj) {
    if (prop.match("^type_")) {
      ++count;
    }
  }
  return count;
}

// Adds HTML with results to the page
function showResults(resource, object, instances, agents, subjects) {
  $("#results-footer").empty();
  $("#results-title").empty();
  $("#results-body").empty();
  $("#results-footer").append(resource["title"] + ' (' + resource["id_0"] + ')');
  $("#results-title").append('<h2 style="margin-top:10px">' + object['display_string'] + ' <span class="label label-default pull-right">' + object['level'] + '</span></h2>');
  $("#results-body").append(instances);
  $("#results-body").append(agents);
  $("#results-body").append(subjects);
  $("#results").fadeIn(400)
}

// Checks ArchivesSpace status
function updateStatus() {
  showFeedback("warning", "#as-status", "Checking Status");
  $.ajax({
    type: "GET",
    url: baseUrl + "/version",
    success: function(results) {
      checkCredentials();
      showFeedback("success", "#as-status", "Connected");
    },
    error: function(request) {
      showFeedback("error", "#as-status", "Disconnected");
      showFeedback("error", "#as-login-status", "Not logged in");
      window.setTimeout(updateStatus, 5000);
    }
  });
}

// Checks ArchivesSpace credentials
function checkCredentials() {
  $.ajax({
    type: "GET",
    dataType: "json",
    beforeSend: function(request) {
      request.setRequestHeader("X-ArchivesSpace-Session", token);
    },
    url: baseUrl + "/users/current-user",
    success: function(results) {
      showFeedback("success", "#as-login-status", "Logged in");
    },
    error: function(results) {
      showFeedback("error", "#as-login-status", "Not logged in");
      window.setTimeout(checkCredentials, 5000);
    }
  });
}

// Displays error, warning and success messages to users
function showFeedback(type, target, message) {
  $(target).removeClass(function(index, css) {return (css.match(/(^|\s)label-\S+/g) || []).join(' ');});
  if (type == "error") {
    $(target).addClass("label-danger").text(message).fadeIn(400);
    if (target.match(/(^|\s)#as-\S+/g)) {
      $('#refid-search button[type="submit"]').prop("disabled", true);
    }
  } else if (type == "success") {
    $(target).addClass('label-success').text(message).fadeIn(400);
    if (target.match(/(^|\s)#as-\S+/g)) {
      $("#refid-search button[type='submit']").prop("disabled", false);
    } else if (type == "warning") {
      $(target).addClass("label-warning").text("Checking Status").fadeIn(400);
    }
  }
}

// Searches ArchivesSpace for a refid
$("#refid-search").submit(function(e) {
  e.preventDefault();
  $("#results").fadeOut(200)
  var refid = $("#refid-search input[type='text']").val();
  if (refid.length < 1) {
    showFeedback("error", "#refid-search-error", "You didn't enter anything!");
  } else {
    var params = "ref_id[]=" + refid;
    getResults(params, refid)
  }
});

updateStatus();
