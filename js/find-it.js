var clipboard = new Clipboard('.btn');

window.onload= function() { 
	if (window.location.hash) {
		refid = window.location.hash.substring(1); 
		data = "ref_id[]=" + refid
		getResults(data, refid)
	}
}

// Returns results from ArchivesSpace for a refid search
function getResults(data, refid) {
	if (refid.length == 32) {
		urlPath = baseUrl + "/repositories/" + repoId + "/find_by_id/archival_objects"
	} else if (refid.length == 32) {
		urlPath = baseUrl + "/repositories/2/search?page=1&aq={\"query\":{\"field\":\"identifier\", \"value\":\"" + refid + "\", \"jsonmodel_type\":\"field_query\"}}"
	} else {
		urlPath = baseUrl + "/repositories/2/search?page=1&filter_term[]={%22primary_type%22%3A%22resource%22}&q=" + refid		
	}
  objects = $.ajax({
    type: "GET",
    dataType: "json",
    beforeSend: function(request) {
      request.setRequestHeader("X-ArchivesSpace-Session", token);
    },
    url: urlPath,
    data: data,
    success: function(results) {
	  if (results.hasOwnProperty('results')) {
		  if (Number(results["total_hits"]) < 1) {
			showFeedback("error", "#refid-search-error", "Sorry, I couldn't find anything for " + refid);
		  } else {
			$("#refid-search-error").empty().removeClass(function(index, css) {
			  return (css.match(/(^|\s)alert?\S+/g) || []).join(' ');
			});
			$("#results").empty();
			for(i=0; i<results["results"].length; i++) {
			  var objectURI = results["results"][i]["id"];
			  $("#results").append('<div id="'+i+'" class="panel panel-default">'+
				'<div class="panel-heading">'+
				  '<div class="panel-title">'+
					'<h2 class="title" style="margin-top:10px"></h2>'+
				  '</div>'+
				  '<div style="clear:both"/>'+
				'</div>'+
				'<div class="panel-body">'+
				  '<div class="instances">'+
				  '</div>'+
				'</div>'+
				'<div class="panel-footer"></div>'+
			  '</div>');
			  getData(objectURI, i, true);
			}
		  }
	  }
	  else {
		  if (results["archival_objects"].length < 1) {
			showFeedback("error", "#refid-search-error", "Sorry, I couldn't find anything for " + refid);
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
				   '<div style="clear:both"/>'+
				'</div>'+
				'<div class="panel-body">'+
				  '<div class="instances">'+
				  '</div>'+
				'</div>'+
				'<div class="panel-footer"></div>'+
			  '</div>');
			  getData(objectURI, i, false);
			}
		  }
		}
	}
  });
}

// Returns results from ArchivesSpace for a Resource id_0 search
function getResourceResults(data, resourceid) {
  objects = $.ajax({
    type: "GET",
    dataType: "json",
    beforeSend: function(request) {
      request.setRequestHeader("X-ArchivesSpace-Session", token);
    },
    url: baseUrl + "/repositories/" + repoId + "/search",
	data: data,
    success: function(results) {
      if (results["archival_objects"].length < 1) {
        showFeedback("error", "#refid-search-error", "Sorry, I couldn't find anything for " + resourceid);
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
			   '<div style="clear:both"/>'+
            '</div>'+
            '<div class="panel-body">'+
              '<div class="instances">'+
              '</div>'+
            '</div>'+
            '<div class="panel-footer"></div>'+
          '</div>');
          getData(objectURI, i, collectionSwitch);
        }
      }
    }
  });
}

// Fetches JSON from an ArchivesSpace URI
function getData(uri, parent_selector, collectionSwitch, iterator) {
  $.ajax({
    type: "GET",
    dataType: "json",
    beforeSend: function(request) {
      request.setRequestHeader("X-ArchivesSpace-Session", token);
    },
    url: baseUrl + uri,
    success: function(data) {
	  if (data["jsonmodel_type"] !== "location") {
		  //add and if here to see if restrictions
		  restrictCount = 0
		  for (i = 0; i < data["notes"].length; i++) {
				if (data["notes"][i]["type"] == "accessrestrict") {
					var restriction = data["notes"][i]["subnotes"][0]["content"];
					if (restriction !== "Access to this record group is unrestricted.") {
						restrictCount = restrictCount + 1
						if (restriction.indexOf("because it is unprocessed") >= 0) {
							displayData("#"+parent_selector+" .instances", "<div class='alert alert-warning'><strong>Unprocessed</strong> " + restriction + "</div>")
						} else {
							displayData("#"+parent_selector+" .instances", "<div class='alert alert-danger'><strong>Restricted</strong> " + restriction + "</div>")
						}
					}
				}
		  }
		  if (restrictCount == 0) {
			  if (data["restrictions"] == true) {
				  displayData("#"+parent_selector+" .instances", "<div class='alert alert-danger'><strong>Restrictions</strong></div>")
			  }
		  }
	  }
      if (data["jsonmodel_type"] == "resource") {
		if (collectionSwitch == true) {
		 var resourceID = data['uri'].split('/resources/')[1];
		displayData('#'+parent_selector+' .title', '<a href="http://169.226.92.25:8080/resources/' + resourceID + '#">' + data['title'] + '</a> <small><span style="vertical-align:text-top" class="label label-info" data-toggle="tooltip" data-placement="top" title="collection">' + data["id_0"] + '</span></small> <!--<small><span style="vertical-align:text-top" class="label label-default">' + data['level'] + '</span></small>--><a href="http://meg.library.albany.edu:8080/archive/view?docId=' + data["id_0"] + '.xml" class="btn btn-success pull-right">XTF</a>');
			if (data['instances'].length > 0) {
			  handleInstances(data['instances'], parent_selector)
			} else {
			  displayData("#"+parent_selector+" .instances", "This resource has no instances <img style='width:100px;' class='loadGIF' src='img/Loading_icon.gif'/>")
			  getChildren(parent_selector, data['uri'], "")
			}
			$('[data-toggle="tooltip"]').tooltip()
			displayData("#"+parent_selector+" .panel-footer", '<h4 style="margin:0px">' + data['extents'][0]['number'] + ' ' + data['extents'][0]['extent_type'] + '</h4>');
		} else {
			displayData("#"+parent_selector+" .panel-footer", '<a href="http://169.226.92.25:8080/resources/' + data['uri'].split('/resources/')[1] + '#" >' + data['title'] + '</a> (' + data["id_0"] + ')<a href="http://meg.library.albany.edu:8080/archive/view?docId=' + data["id_0"] + '.xml" class="btn btn-success btn-xs pull-right">XTF</a>');
			displayData('#'+parent_selector+' .title', );
			$(".fileButton").attr("href", "http://meg.library.albany.edu:8080/archive/view?docId=" + data['id_0'] + ".xml#" + $(".fileButton").attr("id"))
		}
		$("#results").fadeIn(200)
      } else if (data["jsonmodel_type"] == "archival_object") {
        var aoID = data['uri'].split('/archival_objects/')[1];
        var resourceID = data['resource']['ref'].split('/resources/')[1];
        displayData('#'+parent_selector+' .title', '<a href="http://169.226.92.25:8080/resources/' + resourceID + '#tree::archival_object_' + aoID + '">' + data['display_string'] + '</a>' + ' <small><span style="vertical-align:text-top" class="label label-default">' + data['level'] + '</span></small> <a id="' + data["ref_id"] +'" class="btn btn-success pull-right fileButton">XTF</a>  ');
        if (data['instances'].length > 0) {
          handleInstances(data['instances'], parent_selector)
        } else {
          displayData("#"+parent_selector+" .instances", "This archival object has no instances <img style='width:100px;' class='loadGIF' src='img/Loading_icon.gif'/>")
		  getChildren(parent_selector, data['resource']['ref'], data['uri'])
        }
        getData(data["resource"]["ref"], parent_selector, collectionSwitch);
      } else if (data["jsonmodel_type"] == "location") {
        displayData("#location_"+parent_selector+"_"+iterator, "<p>" + data["title"] + "</p>"); //<----HERE
        /*displayData("#"+parent_selector+" .button"+iterator, '<button id="locationCopy'+iterator+'" class="btn btn-small" data-clipboard-target="#location_'+parent_selector+"_"+iterator+'">Copy Location</button>');*/
      }
    }
  });
}

// Loops through instance data and constructs HTML for each
function handleInstances(data, parent_selector) {
  var list = '';
  for (i = 0; i < data.length; i++) {
    if (data[i]["instance_type"] !== "digital_object") {
		console.log(data[i]['sub_container']['top_container']['ref']);
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

//if no instances, gets links to child objects
function getChildren(parent_selector, uri, childURI) {
	 $.ajax({
		type: "GET",
		dataType: "json",
		beforeSend: function(request) {
		  request.setRequestHeader("X-ArchivesSpace-Session", token);
		},
		url: baseUrl + uri + '/tree',
		success: function(data) {
			if (childURI.length > 0){
				match = findMatch(data, childURI)
				for (i = 0; i < match["children"].length; i++) {
					var uriAO = match["children"][i]["record_uri"]
					$.ajax({
						type: "GET",
						dataType: "json",
						beforeSend: function(request) {
						  request.setRequestHeader("X-ArchivesSpace-Session", token);
						},
						url: baseUrl + uriAO,
						success: function(data) {
						displayData("#"+parent_selector+" .instances", "<p style='margin-top:15px;'><span class='glyphicon glyphicon-arrow-right' style='margin-left:20px;'></span> <a href='//libstaff/find-it#" + data["ref_id"] + "'>" + data["title"] + "</a></p>")
					}
				  });
				}
				$("#"+parent_selector+" .instances").children("img").remove(); 
			} else {
				for (i = 0; i < data["children"].length; i++) {
					var uriAO = data["children"][i]["record_uri"]
					$.ajax({
						type: "GET",
						dataType: "json",
						beforeSend: function(request) {
						  request.setRequestHeader("X-ArchivesSpace-Session", token);
						},
						url: baseUrl + uriAO,
						success: function(data) {
						displayData("#"+parent_selector+" .instances", "<p style='margin-top:15px;'><span class='glyphicon glyphicon-arrow-right' style='margin-left:20px;'></span> <a href='//libstaff/find-it#" + data["ref_id"] + "'>" + data["title"] + "</a></p>")
					}
				  });
				}
				$("#"+parent_selector+" .instances").children("img").remove(); 
			}
    }
  });
}

// Recursive loop though tree to find matching archival object
//help from http://stackoverflow.com/questions/22222599/javascript-recursive-search-in-json-object
function findMatch(node, childURI) {
    var i,
        currentChild,
        result;

    if (childURI == node["record_uri"]) {
        return node;
    } else {
        for (i = 0; i < node["children"].length; i += 1) {
            currentChild = node["children"][i];

            // Search in the current child
            result = findMatch(currentChild, childURI);

            // Return the result if the node has been found
            if (result !== false) {
                return result;
            }
        }

        return false;
    }
}



// Loops through locations data and constructs HTML for each
function handleLocations(data, parent_selector, iterator) {
  for (l = 0; l < data.length; l++) {
    getData(data[l]["ref"], parent_selector, false, iterator);
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
      $('#resourceid_0-search button[type="submit"]').prop("disabled", true);
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
      $("#resourceid_0-search button[type='submit']").prop("disabled", false);
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
