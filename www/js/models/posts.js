//POSTS
var Posts = function() {
    self = this;
    self.latest = ko.observableArray([]);
    self.selected = ko.observable();
    self.selectedIndex = ko.observable(0);
    self.init = function() {
        router.load('posts/index',null,function(data) {
            var today = new Date();
            var today = today.getFullYear()+'-'+(('0'+(today.getMonth()+1)).slice(-2))+'-'+(('0'+today.getDate()).slice(-2));
            var indexCounter = 0;
            var foundDay = false;
            $.each(data.posts,function(index,item) {
                post = {
                    id: item.Post.id,
                    title: item.Post.title,
                    verse: item.Post.verse,
                    reference: item.Post.reference,
                    prayer: item.Post.prayer,
                    day: item.Post.day,
                    month: item.Post.month
                };
                self.latest.push(post);
                if(today === item.Post.start) {
                    foundDay = true;
                    self.selectedIndex(indexCounter);
                }
                indexCounter++;
            });
            if(!foundDay) {
                self.selectedIndex(self.latest().length - 1);
            }
            self.selected(self.latest()[self.selectedIndex()]);
        });
        
    }
    self.init();
    self.next = function() {
        var next = self.selectedIndex() - 1;
        if(next < 0) {
            next = 0;
        }
        self.selected(self.latest()[next]);
        self.selectedIndex(next);
    }
    
    self.prev = function() {
        var first = self.latest().length - 1;
        var prev = self.selectedIndex() + 1;
        if(prev > first) {
            prev = first;
        }
        self.selected(self.latest()[prev]);
        self.selectedIndex(prev);
    }
}