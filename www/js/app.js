function AppViewModel() {
    var self = this;
    self.user = new User();
    self.posts = new Posts();
    self.logfile = ko.observableArray([]);

    self.init = function() {
        if(self.user.user_id === null) {
            router.loadPage('login');
        } else {
            self.posts.update(self.user.user_id);
        }
    }
    //self.init();

    self.log = function(data) {
        self.logfile.push(data);
        router.loadPage('debug');
    }

    self.fire = function(data) {
       console.log('fire');
    }

    self.checkGroups = function() {
        if(self.posts.groups().length == 0) {
            router.loadPage('start');
        }
    }
}

//INIT
router = new Router();
var viewModel = new AppViewModel();
viewModel.init();
$(function() {
    pager.Href.hash = '#!/';
    pager.extendWithPage(viewModel);
    ko.bindingHandlers.fastClick = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            new FastButton(element, function() {
                valueAccessor()(viewModel, event);
            });
        }
    };
    ko.applyBindings(viewModel);
    pager.start();
});
