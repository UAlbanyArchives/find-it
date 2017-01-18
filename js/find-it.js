var clipboard = new Clipboard('.btn');

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
        var index = $.inArray(refid, replacedIds);
        if (index > -1) {
          showFeedback("error", "#refid-search-error", "I couldn't find anything for " + refid +", trying a secondary lookup for " +replacedWithIds[index]);
          getResults("ref_id[]=" + replacedWithIds[index], replacedWithIds[index]);
        } else {
          showFeedback("error", "#refid-search-error", "Sorry, I couldn't find anything for " + refid);
        }
      } else {
        $("#refid-search-error").empty().removeClass(function(index, css) {
          return (css.match(/(^|\s)alert?\S+/g) || []).join(' ');
        });
        $("#results").empty();
        for(i=0; i<results["archival_objects"].length; i++) {
          var objectURI = results["archival_objects"][i]["ref"];
          $("#results").append('<div id="'+i+'" class="panel panel-default">'+
            '<div class="panel-heading">'+
              '<div class="panel-title">'+
                '<h2 class="title" style="margin-top:10px"></h2>'+
              '</div>'+
            '</div>'+
            '<div class="panel-body">'+
              '<div class="instances">'+
              '</div>'+
            '</div>'+
            '<div class="panel-footer"></div>'+
          '</div>');
          getData(objectURI, i);
        }
      }
    }
  });
}

// Fetches JSON from an ArchivesSpace URI
function getData(uri, parent_selector, iterator) {
  $.ajax({
    type: "GET",
    dataType: "json",
    beforeSend: function(request) {
      request.setRequestHeader("X-ArchivesSpace-Session", token);
    },
    url: baseUrl + uri,
    success: function(data) {
      if (data["jsonmodel_type"] == "resource") {
        displayData("#"+parent_selector+" .panel-footer", data["title"] + ' (' + data["id_0"] + ')');
        $("#results").fadeIn(200)
      } else if (data["jsonmodel_type"] == "archival_object") {
        var aoID = data['uri'].split('/archival_objects/')[1];
        var resourceID = data['resource']['ref'].split('/resources/')[1];
        displayData('#'+parent_selector+' .title', '<a href="http://as.rockarch.org/resources/' + resourceID + '#tree::archival_object_' + aoID + '" target="_blank">' + data['display_string'] + '</a>' + ' <small><span style="vertical-align:text-top" class="label label-default">' + data['level'] + '</span></small>');
        if (data['instances'].length > 0) {
          handleInstances(data['instances'], parent_selector)
        } else {
          displayData("#"+parent_selector+" .instances", "This archival object has no instances")
        }
        getData(data["resource"]["ref"], parent_selector);
      } else if (data["jsonmodel_type"] == "location") {
        displayData("#location_"+parent_selector+"_"+iterator, data["title"]);
        displayData("#"+parent_selector+" .button"+iterator, '<button id="locationCopy'+iterator+'" class="btn btn-small" data-clipboard-target="#location_'+parent_selector+"_"+iterator+'">Copy Location</button>');
      }
    }
  });
}

// Loops through instance data and constructs HTML for each
function handleInstances(data, parent_selector) {
  var list = '';
  for (i = 0; i < data.length; i++) {
    if (data[i]["instance_type"] !== "digital_object") {
      $("#"+parent_selector+" .instances").append("<h4 class=instance"+parseInt(i)+"/><p id=location_"+parent_selector+"_"+parseInt(i)+"/><div class=button"+parseInt(i)+"/>");
      var container = data[i]["container"];
      var instanceLength = countInstanceTypes(container);
      var instance = [];
      for (n = 1; n <= instanceLength; n++) {
        instance.push(capitalize(container["type_" + n]) + " " + container["indicator_" + n]);
      }
      completeInstance = instance.join(", ");
      displayData("#"+parent_selector+" .instance"+i, completeInstance);
      if (container["container_locations"].length >= 1) {
        handleLocations(container["container_locations"], parent_selector, i);
      }
      else if (container["container_locations"].length < 1){
        displayData("#location_"+parent_selector+"_"+i, "No location found");
      }
    }
  }
}

// Loops through locations data and constructs HTML for each
function handleLocations(data, parent_selector, iterator) {
  for (l = 0; l < data.length; l++) {
    getData(data[l]["ref"], parent_selector, iterator);
  }
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
function displayData(target, data) {
  $(target).append(data);
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
  if (type == "error") {
    if (target.match(/(^|\s)#as-\S+/g)) {
      $(target).removeClass(function(index, css) {
        return (css.match(/(^|\s)label\S+/g) || []).join(' ');
      });
      $(target).addClass("label-danger").text(message).fadeIn(400);
      $('#refid-search button[type="submit"]').prop("disabled", true);
    } else {
      $(target).removeClass(function(index, css) {
        return (css.match(/(^|\s)alert\S+/g) || []).join(' ');
      });
      $(target).addClass("alert alert-danger").text(message).fadeIn(400);
    }
  } else if (type == "success") {
    if (target.match(/(^|\s)#as-\S+/g)) {
      $(target).removeClass(function(index, css) {
        return (css.match(/(^|\s)label\S+/g) || []).join(' ');
      });
      $(target).addClass('label-success').text(message).fadeIn(400);
      $("#refid-search button[type='submit']").prop("disabled", false);
    } else {
      $(target).removeClass(function(index, css) {
        return (css.match(/(^|\s)alert\S+/g) || []).join(' ');
      });
      $(target).addClass('alert-success').text(message).fadeIn(400);
    }
  } else if (type == "warning") {
    $(target).removeClass(function(index, css) {
      return (css.match(/(^|\s)label\S+/g) || []).join(' ');
    });
    $(target).addClass("label-warning").text("Checking Status").fadeIn(400);
  }
}

// Searches ArchivesSpace for a refid
$("#refid-search").submit(function(e) {
  e.preventDefault();
  $("#results").fadeOut(100);
  var refid = $("#refid-search input[type='text']").val();
  if (refid.length < 1) {
    showFeedback("error", "#refid-search-error", "You didn't enter anything!");
  }
  else {
    if (refid.startsWith('http')) {
    var refid = refid.split('#')[1];
    var params = "ref_id[]=" + refid;
    }
    else {
    var params = "ref_id[]=" + refid;
    }
    getResults(params, refid);
    $("#refid-search input[type='text']").val('');
  }
});

updateStatus();
