var Router = function() {
    self = this;
    self.load = function(url,data,callback) {
//        if(loader) {
//            $('#loading').show();
//        } else {
//            $('#refresh i').addClass('icon-spin');
//        }
        var quiet = true;
        var options = {
            url: DOMAIN+url+'.json',
            crossDomain: true,
            success: function (data) {
               callback(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log([jqXHR, textStatus, errorThrown]);
            },
            complete: function(jqXHR, textStatus, errorThrown) {
                if((textStatus != 'success')&&(!quiet)) {
                    alert(errorThrown);
                    //navigator.notification.alert('There was a problem communicating with the server.',null,'GroupPost');
                }
                $('#loading').fadeOut();
                $('#refresh i').removeClass('icon-spin');
            },
            dataType: 'json',
            async: true
        };

        if(typeof data === 'undefined') {
            options.type = 'GET';
        } else {
            options.type = 'POST';
            options.data = data;
        }

        try {
            $.ajax(options);
        } catch(e) {
            alert(e);
        }
    }
}