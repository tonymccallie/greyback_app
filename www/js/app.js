var DOMAIN = 'http://empower21.greyback.net/'
    //DEVELOPMENT
    var devtest = /localhost/.test(window.location.hostname);
    if(devtest) {
        DOMAIN = 'http://localhost/empower21_api/';
        isMobile = false;
    }
    devtest = /threeleaf/.test(window.location.hostname);
    if(devtest) {
        DOMAIN = 'http://office.threeleaf.net/empower21_api/';
        isMobile = false;
    }

function AppViewModel() {
    var self = this;
    self.posts = new Posts();
    self.logfile = ko.observableArray([]);
    self.log = function(data) {
        self.logfile.push(data);
    }
    self.pageLoaded = function(data) {
       
    }
}

//INIT
router = new Router();
var viewModel = new AppViewModel();
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