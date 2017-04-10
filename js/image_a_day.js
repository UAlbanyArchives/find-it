
jQuery.support.cors = true;
 objects = $.ajax({
    type: "GET",
    dataType: "json",
    beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Basic ');
                },
    url: "http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US",
    success: function(data) {
      console.log(data);
    }
  });