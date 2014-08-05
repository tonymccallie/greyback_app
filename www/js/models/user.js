var User = function() {
    var self = this;
    self.user_id = null;
    self.domain = null;
    self.domainkey = null;

    self.init = function() {
        if(localStorage.getItem('greyback_user') !== null) {
            var data = ko.utils.parseJson(localStorage.getItem('greyback_user'));
            self.user_id = data.user_id;
            self.domain = data.domain;
            self.domainkey = data.domainkey;
        }
    }

    self.login = function() {
        self.domain = $('#login_domain').val();
        router.load('login',$('#user_login').serialize(),function(data) {
            var save_data = {
                user_id: data.user_id,
                domain: self.domain,
                domainkey: data.domainkey
            }
            localStorage.setItem('greyback_user',ko.toJSON(save_data));
            router.loadPage('start');
        });
    }

    self.logout = function() {
        localStorage.removeItem('greyback_user');
        router.loadPage('login');
    }

    self.init();
}
