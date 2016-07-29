function getResults(data, refid) {
  objects =  $.ajax({
    type:"GET",
    dataType: "json",
    beforeSend: function(request){request.setRequestHeader("X-ArchivesSpace-Session", token);},
    url: baseUrl+"/repositories/"+repoId+"/find_by_id/archival_objects",
    data: data,
    success: function(results) {
      if(results["archival_objects"].length < 1) {
        throwError("search", "Sorry, I couldn't find anything for "+refid);
      } else {
        $("#refid-search-error").empty().removeClass("alert").removeClass(function (index, css) {
            return (css.match (/(^|\s)alert\S+/g) || []).join(' ');
        });
        var objectURI = results["archival_objects"][0]["ref"];
        getJson(objectURI);
      }
    }
  });
}

function getJson(uri) {
  $.ajax({
    type:"GET",
    dataType: "json",
    beforeSend: function(request){ request.setRequestHeader("X-ArchivesSpace-Session", token); },
    url: baseUrl+uri,
    success: function(data) {
      if(data["jsonmodel_type"]=="resource") {
        appendData(data, "resource");
      } else {
        appendData(data, "archival_object");
        getJson(data["resource"]["ref"])
      }
    }
  });
}

function handleInstances(data) {
  var list ='';
  for(i=0; i<data.length; i++) {
    var container = data[i]["container"];
    var instanceLength = countInstances(container);
    var instance = [];
    for(n=1; n<=instanceLength; n++) {
      instance.push(capitalize(container["type_"+n])+" "+container["indicator_"+n]);
    }
    containerHTML = instance.join(", ")
    item = "<h4>"+containerHTML+"</h4>"
    if(container["container_locations"].length > 0) {
      var location = handleLocations(container["container_locations"]);
      item = item+location;
    }
    list = list+item;
  }
  $("#results-body").append(list);
}

function handleLocations(data) {
  // get the locations
}

function handleAgents(data) {
  // get the names of linked agents
}

function handleSubjects() {
  // get the titles of linked subjects
}

function capitalize(str) {
  str = str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
    return letter.toUpperCase();
  });
  return str;
}

function countInstances(obj) {
  var count=0;
  for(var prop in obj) {
     if (prop.match("^type_")) {
        ++count;
     }
  }
  return count;
 }

 function appendData(object, type) {
   if(type=="resource") {
     $("#results-footer").empty();
     $("#results-footer").append(object["title"]+' ('+object["id_0"]+')');
   } else {
     $("#results-title").empty();
     $("#results-body").empty();
     $("#results-title").append('<h2 style="margin-top:10px">'+object['display_string']+' <span class="label label-default pull-right">'+object['level']+'</span></h2>');
     if(object['instances'].length > 0){
       var instances = object['instances'];
       handleInstances(instances)
     } if (object['linked_agents'].length > 0) {
       handleAgents(object["linked_agents"]);
     } if (object["subjects"].length > 0) {
       handleSubjects(object["subjects"]);
     }
     $("#results").fadeIn(400)
   }
 }

function updateStatus() {
  $('#as-status').removeClass(function (index, css) {
      return (css.match (/(^|\s)label-\S+/g) || []).join(' ');
  }).addClass("label-warning").text("Checking Status").fadeIn(400);
  $.ajax({
    type:"GET",
    url: baseUrl+"/version",
    success: function(results) {
      checkCredentials();
      displaySuccess("as", "Connected");
    },
    error: function(request) {
      throwError("as", "Disconnected");
      throwError("login", "Not logged in");
      window.setTimeout(updateStatus, 5000);
    }
  });
}

function checkCredentials() {
  $.ajax({
    type:"GET",
    dataType: "json",
    beforeSend: function(request){ request.setRequestHeader("X-ArchivesSpace-Session", token); },
    url: baseUrl+"/users/current-user",
    success: function(results) {
      displaySuccess("login", "Logged in");
    },
    error: function(results) {
      throwError("login", "Not logged in");
      window.setTimeout(checkCredentials, 5000);
    }
  });
}

function throwError(type, message) {
  if (type == "search") {
    $("#refid-search-error").addClass("alert alert-danger").text(message);
  } else if (type == "as") {
    $("#as-status").removeClass(function (index, css) {
        return (css.match (/(^|\s)label-\S+/g) || []).join(' ');
    }).addClass("label-danger").text(message).fadeIn(400);
    $('#refid-search button[type="submit"]').prop("disabled", true);
  } else if (type == "login") {
    $('#login-status').removeClass(function (index, css) {
        return (css.match (/(^|\s)label-\S+/g) || []).join(' ');
    }).addClass("label-danger").text(message).fadeIn(400);
    $("#refid-search button[type='submit']").prop("disabled", true);
  }
}

function displaySuccess(type, message) {
  if (type == "as") {
    $("#as-status").removeClass(function (index, css) {
        return (css.match (/(^|\s)label-\S+/g) || []).join(" ");
    }).addClass('label-success').text(message).fadeIn(400);
  } else if (type == "login") {
    $("#login-status").removeClass(function (index, css) {
        return (css.match (/(^|\s)label-\S+/g) || []).join(" ");
    }).addClass("label-success").text(message).fadeIn(400);
    $("#refid-search button[type='submit']").prop("disabled", false);
  }
}

$("#refid-search").submit(function(e){
  e.preventDefault();
  $("#results").fadeOut(200)
  var refid = $("#refid-search input[type='text']").val();
  if(refid.length < 1) {
    $("#refid-search-error").addClass("alert alert-danger").text("You didn't enter anything!");
  } else {
    var params = "ref_id[]="+refid;
    getResults(params, refid)
  }
});

updateStatus();
