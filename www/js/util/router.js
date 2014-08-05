var Router = function() {
    var self = this;

    self.loadPage = function(page) {
        window.location.hash = '#!/'+page;
    }

    self.load = function(url,data,callback) {
        var domain = null;
        if(viewModel.user.domain === null) {
            if($('#login_domain').val().length) {
                domain = $('#login_domain').val();
            } else {
                navigator.notification.alert('Please enter a valid domain name.');
                return false;
            }
        } else {
            domain = viewModel.user.domain;
        }
        var url = 'http://'+domain+'/ajax/plugin/community/community_posts/'+url;
        $('#loading').show();
        var quiet = true;
        var options = {
            url: url,
            crossDomain: true,
            success: function (data) {
                if(data.status === "SUCCESS") {
                    callback(data);
                } else {
                    navigator.notification.alert(data.message);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                switch(jqXHR.status) {
                    case 404:
                        navigator.notification.alert('That domain is not accepting GreyBack logins');
                        break;
                    default:
                        viewModel.log([jqXHR, textStatus, errorThrown]);
                        pager.navigate('#!/debug');
                }
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
            return($.ajax(options));
        } catch(e) {
            alert(e);
        }
    }
}
