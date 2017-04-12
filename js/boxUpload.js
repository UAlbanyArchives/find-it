window.onload= function() { 
	if (window.location.hash) {
		hashID = window.location.hash.substring(1); 
		$("#colID").val(hashID);
	}
	$("#boxUpload").find(".btn-success").removeAttr("disabled");
}

function addRow() {
    var form = document.getElementById('boxEntry');
	
	var boxRow = document.createElement('div');
	boxRow.className = "form-group boxRow"
	
	var col = document.createElement('div');
	col.className = "col-xs-4";
	
	var input1 = document.createElement('input');
	input1.className = "form-control boxType";
	input1.setAttribute("type", "text");
	input1.setAttribute("placeholder", "Box");
	var span1 = document.createElement('span');
	span1.className = "inputGlyph glyphicon";
	
	boxRow.appendChild(col);
	col.appendChild(input1);
	col.appendChild(span1);
	
	var col2 = document.createElement('div');
	col2.className = "col-xs-4";
	
	var input2 = document.createElement('input');
	input2.className = "form-control indicator";
	input2.setAttribute("type", "text");
	input2.setAttribute("placeholder", "1-3");
	var span2 = document.createElement('span');
	span2.className = "inputGlyph glyphicon";
	
	boxRow.appendChild(col2);
	col2.appendChild(input2);
	col2.appendChild(span2);
	
	var col = document.createElement('div');
	col.className = "col-xs-4";
	
	var input3 = document.createElement('input');
	input3.className = "form-control location";
	input3.setAttribute("type", "text");
	input3.setAttribute("placeholder", "G-6-3-1");
	var span3 = document.createElement('span');
	span3.className = "inputGlyph glyphicon";
	
	boxRow.appendChild(col);
	col.appendChild(input3);
	col.appendChild(span3);
	
	
	$(boxRow).hide().appendTo(form).fadeIn(500);
	//autoFill();
}

/*function autoFill() {
    // Defining the local dataset
    var boxTypes = ['Box', 'Oversized', 'VHS'];

    // Constructing the suggestion engine
    var boxTypes = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: boxTypes
    });

    // Initializing the typeahead
    $('.boxType').typeahead({
        hint: true,
        highlight: true, // Enable substring highlighting 
        minLength: 1 // Specify minimum characters required for showing suggestions
    },

    {
        name: 'boxTypes',
        source: boxTypes
    });

}

$(document).ready(function(){
	autoFill();
});*/


// Searches ArchivesSpace for a refid
$("#boxUpload").submit(function(e) {
	var $key = $("#key")
	if ($key.val() != "spe") {
		$key.parent(".form-group").addClass("has-error")
		$key.parent(".form-group").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
		$key.addClass("form-control-error");
	} else {
		e.preventDefault();
		$('.inputGlyph').each(function (i) {
			$(this).removeClass("glyphicon-ok")
			$(this).removeClass("glyphicon-remove")
			$(this).removeClass("form-control-feedback")
		});
		$('.has-success').each(function (i) {
			$(this).removeClass("has-success")
		});
		$('.has-error').each(function (i) {
			$(this).removeClass("has-error")
		});
		var $button = $("#boxUpload").find(".btn-success")
		var $input = $("#boxUpload").find("input")
		$button.prop("disabled", true);
		$button.find("span").removeClass("glyphicon-arrow-up");
		$button.find("span").removeClass("glyphicon");
		$button.find("span").append("<img src='img/btn-loader.gif'/>")
		var refid = $("#boxUpload").find("input[type='text']").val();
		if (refid.length > 0) {
			$.ajax({
				type: "GET",
				dataType: "json",
				async: false,
				beforeSend: function(request) {
				  request.setRequestHeader("X-ArchivesSpace-Session", token);
				},
				url: baseUrl + '/repositories/' + repoId + "/search?page=1&aq={\"query\":{\"field\":\"identifier\", \"value\":\"" + refid + "\", \"jsonmodel_type\":\"field_query\"}}",
				success: function(data) {
					if (data["results"].length > 0) {
						var resource = data["results"][0]
						$input.parent(".form-group").addClass("has-success");
						$input.addClass("form-control-success");
						$input.parent(".form-group").find(".inputGlyph").addClass("glyphicon-ok form-control-feedback");
						$('#boxEntry').children('.boxRow').each(function (i) {
							boxCheck = validateBoxType($(this).find(".boxType"))
							if (boxCheck== true) {
								try {
									if ($(this).find(".indicator").val().indexOf("-") > 0) {
										var range=$(this).find(".indicator").val().split('-');
										var endRange = +range[1] + 1;
										for (i=range[0]; i<endRange; i++) {
											locationTitle = translateLocation($(this).find(".location"))
											makeBox($(this).find(".boxType").val(), i.toString(), locationTitle, resource["uri"], $(this).find(".checkbox-inline").is(':checked'), $(this).find(".indicator"), $(this).find(".location"))
										}
									} else {
										locationTitle = translateLocation($(this).find(".location"))
										makeBox($(this).find(".boxType").val(), $(this).find(".indicator").val(), locationTitle, resource["uri"], $(this).find(".checkbox-inline").is(':checked'), $(this).find(".indicator"), $(this).find(".location"))
									}
								} catch(err) {
									alert(err);
									$(this).find(".indicator").parent(".col-xs-4").addClass("has-error");
									$(this).find(".indicator").parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
									$(this).find(".indicator").addClass("form-control-error");
									$(this).find(".location").parent(".col-xs-4").addClass("has-error");
									$(this).find(".location").parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
									$(this).find(".location").addClass("form-control-error");
								}
							}
						});						
					} else {
						$input.parent(".form-group").addClass("has-error");
						$input.parent(".form-group").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
						$input.addClass("form-control-error");
					}				
			}
		  });
		} else {
			$input.parent(".form-group").addClass("has-error");
			$input.parent(".form-group").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
			$input.addClass("form-control-error");
		}
		$button.find("span").empty();
		$button.find("span").addClass("glyphicon");
		$button.find("span").addClass("glyphicon-arrow-up");
		$button.removeAttr("disabled");
	}
});


//Checks to see if box type is valid
function validateBoxType(boxInput) {
	goodBoxes = ["Box", "Oversized", "Reel", "Flat-File", "Artifact-box", "Video-Tape", "Cassette", "CD", "VHS", "Beta", "Map-Tube", "Umatic", "DVD", "Floppy-Disk", "Roll", "Zip-Disk", "USB", "5.25in-Floppy", "3.5in-Floppy", " 	Phonograph-Record", "PDF"]
	if (boxInput.val().length < 1){
		boxInput.val("Box");
	}
	if (goodBoxes.indexOf(boxInput.val()) >= 0) {
		boxInput.parent(".col-xs-4").addClass("has-success");
		boxInput.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-ok form-control-feedback");
		boxInput.addClass("form-control-success");
		return true
	} else {
		boxInput.parent(".col-xs-4").addClass("has-error");
		boxInput.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
		boxInput.addClass("form-control-error");
		return false
	}
}

// Translates location from UA to ASpace title
function translateLocation(locationInput) {
	mainStacks = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]
	var location = locationInput.val().split('-');
	if (location[0] == "Cold") {
		if (location.length == 3) {
			return "Science Library, 3, Cold Storage [Bay: " +location[1] + ", Shelf: " + location[2] + "]"
		} else if (location.length == 4) {
			return "Science Library, 3, Cold Storage [Cabinet: " + location[1] + ", Drawer: " + location[2] + ", Section: " + location[3] + "]"
		} else {
			locationInput.parent(".col-xs-4").addClass("has-error");
			locationInput.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
			locationInput.addClass("form-control-error");
			return ""
		}
	} else if (location[0] == "Vault") {
		if (location.length == 1) {
			return "Science Library, 3, Vault [Room: Vault]"
		} else if (location.length == 4) {
			return "Science Library, 3, Vault [Row: " + location[1] + ", Bay: " + location[2] + ", Shelf: " + location[3] + "]" 
		} else {
			locationInput.parent(".col-xs-4").addClass("has-error");
			locationInput.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
			locationInput.addClass("form-control-error");
			return ""
		}
	} else if (location[0] == "CCBE") {
		if (location.length == 2) {
			return "Science Library, LL, CCBE [Row: " + location[1] + "]"
		} else {
			locationInput.parent(".col-xs-4").addClass("has-error");
			locationInput.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
			locationInput.addClass("form-control-error");
			return ""
		}
	} else if (location[0] == "RR") {
		if (location.length == 2) {
			return "Science Library, 3, Reading Room [Shelf: " + location[1] + "]"	
		} else {
			locationInput.parent(".col-xs-4").addClass("has-error");
			locationInput.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
			locationInput.addClass("form-control-error");
			return ""
		}	
	} else if (location[0] == "SB17" || location[0] == "SB14") {
		if (location.length == 4) {
			return "Main Library, Basement, " + location[0] + " [Row: " + location[1] + ", Bay: " + location[2] + ", Shelf: " + location[3] + "]"
		} else {
			locationInput.parent(".col-xs-4").addClass("has-error");
			locationInput.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
			locationInput.addClass("form-control-error");
			return ""
		}	
	} else if (location[0] == "L") {
		if (location.length == 3) {
			if (location[1] == "1" || location[1] == "9") {
				var lType = lType = "Drawer"
			} else {
				var lType = lType = "Shelf"
			}
			return "Science Library, 3, Main Storage, " + location[0] + " [Bay: " + location[1] + ", " + lType + ": " + location[2] + "]"				
		} else {
			locationInput.parent(".col-xs-4").addClass("has-error");
			locationInput.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
			locationInput.addClass("form-control-error");
			return ""
		}		
	} else if (mainStacks.indexOf(location[0]) >= 0) {
		if (location.length == 4) {
			return "Science Library, 3, Main Storage, " + location[0] + " [Row: " +location[1] + ", Bay: " + location[2] + ", Shelf: " +location[3] + "]"
		} else {
			locationInput.parent(".col-xs-4").addClass("has-error");
			locationInput.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
			locationInput.addClass("form-control-error");
			return ""
		}
	} else {
		locationInput.parent(".col-xs-4").addClass("has-error");
		locationInput.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
		locationInput.addClass("form-control-error");
		return ""
	}
}

// Uploads a container to ASpace
function makeBox(boxType, indicator, locationTitle, resourceURI, checkBool, iObject, lObject) {
	$.ajax({
		type: "GET",
		dataType: "json",
		async: false,
		beforeSend: function(request) {
		  request.setRequestHeader("X-ArchivesSpace-Session", token);
		},
		url: baseUrl + '/repositories/' + repoId + "/search?page=1&page_size=20&q=%22" + locationTitle + "%22",
		success: function(data) {
			for(i=0; i<data["results"].length; i++) {
				if (data["results"][i]["title"] == locationTitle) {
					var today = new Date();
					var date = today.toISOString().split('T')[0];
					newLocation = {"status": "current", "jsonmodel_type": "container_location", "start_date": date, "ref": data["results"][i]["uri"]}
					boxObject = {"jsonmodel_type": "top_container", "type": boxType, "indicator": indicator, "container_locations": [], "restricted": checkBool, "active_restrictions": []}
					boxObject["container_locations"].push(newLocation);
					$.ajax({
						type: "POST",
						async: false,
						data: JSON.stringify(boxObject),
						beforeSend: function(request) {
						  request.setRequestHeader("X-ArchivesSpace-Session", token);
						  request.setRequestHeader('Content-Type', 'application/json');
						},
						url: baseUrl + '/repositories/' + repoId + "/top_containers",
						success: function(data) {
							var boxURI = data["uri"]
							var newContainer = {"indicator_1": boxObject["indicator"], "type_1": boxObject["type"]}
							var instance = {"jsonmodel_type": "instance", "instance_type": "mixed_materials", "sub_container": {"jsonmodel_type": "sub_container", "top_container": {"ref": boxURI}}, "is_representative": false}
							$.ajax({
								type: "GET",
								dataType: "json",
								async: false,
								beforeSend: function(request) {
								  request.setRequestHeader("X-ArchivesSpace-Session", token);
								},
								url: baseUrl + resourceURI,
								success: function(resourceObj) {
									resourceObj["instances"].push(instance);
									//console.log(resourceObj);
									$.ajax({
										type: "POST",
										async: false,
										data: JSON.stringify(resourceObj),
										beforeSend: function(request) {
										  request.setRequestHeader("X-ArchivesSpace-Session", token);
										  request.setRequestHeader('Content-Type', 'application/json');
										},
										url: baseUrl + resourceObj['uri'],
											success: function(data) {
												iObject.parent(".col-xs-4").addClass("has-success");
												iObject.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-ok form-control-feedback");
												iObject.addClass("form-control-success");
												lObject.parent(".col-xs-4").addClass("has-success");
												lObject.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-ok form-control-feedback");
												lObject.addClass("form-control-success");
											},
											error: function(data) {
												iObject.parent(".col-xs-4").addClass("has-error");
												iObject.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
												iObject.addClass("form-control-error");
												lObject.parent(".col-xs-4").addClass("has-error");
												lObject.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
												lObject.addClass("form-control-error");
											}
										});
									},
									error: function(data) {
										iObject.parent(".col-xs-4").addClass("has-error");
										iObject.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
										iObject.addClass("form-control-error");
										lObject.parent(".col-xs-4").addClass("has-error");
										lObject.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
										lObject.addClass("form-control-error");
									}
								});
							},
							error: function(data) {
								alert("ERROR: Location failed to Post");
								//alert(JSON.stringify(data));
								iObject.parent(".col-xs-4").addClass("has-error");
								iObject.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
								iObject.addClass("form-control-error");
								lObject.parent(".col-xs-4").addClass("has-error");
								lObject.parent(".col-xs-4").find(".inputGlyph").addClass("glyphicon-remove form-control-feedback");
								lObject.addClass("form-control-error");
							}
					});
				}
			}
		}
	});
}