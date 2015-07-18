if (Meteor.isClient) {
	Template.home.onRendered(
		function(){
			var currentRoute = Router.current().route.getName();
        	if(currentRoute == "home"){
        		Meteor.call('addMeeting', function(error,results){
        			if(error){
        				console.log(error.reason);
        			}
        			else
        			{
						Router.go('meetingPage', {_id: results});
        			}
        		});
        	}
        }
    );
    Template.meetingPage.helpers({
    	'name': function(){
    		var meetingID = this._id;
    		var name = Meetings.findOne({_id: meetingID});
    		return name
    	},
    	'timezone': function(){
    		var tz = jstz.determine();
    		return tz.name();
    	}
    })
    Template.meetingName.events({
		'keyup .changeName': function(event){
    		if(event.which == 13 || event.which == 27){
        		$(event.target).blur();
    		} 
    		else {
        		var ID = this._id;
        		var name = $(event.target).val();
                console.log(name);
        		Meteor.call('addName',ID,name);
			}
		},
    });
    Template.main.events({
    	'click .nav-bar': function(){
    		var currentRoute = Router.current().route.getName();
    		if(currentRoute != "home")
    		{
    			a = confirm("Do you want to leave this list?")
    			if(a)
    			{
    				Router.go('home');
    			}
    		}
    	}
    });
    Template.timesPost.events({
        'click .timeRemove': function(){
            var id = this._id;
            var name = this.author;
            Meteor.call('removeTime',id);
        }
    })
    Template.timesPost.helpers({
    	'times': function(){
    		var meeting_id = this._id;
            return Times.find({meeting: meeting_id}, {sort: {start: 1}});
    	},
        'formatTime': function(time){
            var tz = jstz.determine();
            return moment(time).tz(tz.name()).format('dddd, MMMM Do YYYY, h:mm a z');
        },
        'color': function(author){
            var names = Times.find({},{fields: {'author':1}}).fetch();
            var distinctData = _.uniq(names, false, function(d) {return d.author});
            var len = distinctData.length;
            var color;
            for (i=0; i<len; ++i) {
                if (i in distinctData) {
                    s = distinctData[i];
                    if(s.author == author)
                    {
                        var counter = i % 6;
                        switch(counter){
                            case 0:
                                color = "turq"
                                break
                            case 1:
                                color = "green"
                                break
                            case 2:
                                color = "red"
                                break
                            case 3:
                                color = "purple"
                                break
                            case 4:
                                color = "yellow"
                                break
                            case 5:
                                color = "orange"
                                break
                        }
                    }
                }
            }
            return color
        }
    })
    Template.timesForm.events({
    	'submit form': function(){
    		event.preventDefault();
    		var meeting = this._id;
    		var tz = jstz.determine();
			var name = $('.userName').val();
			var start = moment($('.start').val());
			var end = moment($('.end').val());
			var now = moment();
			if(end.isBefore(start) || end.isSame(start))
			{
				alert("You cannot end your free time before or at the same time as when it starts.");
			}
			else
			{
				if(now.isAfter(start) || now.isSame(start))
				{
					alert("Please start after the present moment.");
				}
				else
				{
                    newStart = moment.tz(start,tz.name()).format();
                    newEnd = moment.tz(end,tz.name()).format();
					Meteor.call('addTime',meeting,name,newStart,newEnd,function(error,result){
                        if(error){
                            console.log(error.reason);
                        }
                        else
                        {
                            console.log(result);
                            $('.start').val('');
                            $('.end').val('');
                        }
                    });
				}
			}
    	}
    });
    Template.timesCalculate.helpers({
        'sharedFreeTime': function(){
            var meeting_id = this._id;
            var tz = jstz.determine();
            var allTimes = Times.find({meeting: meeting_id}).fetch();
            var count = 0;
            var list;
            var length;
            var starting;
            var ending;
            var len = allTimes.length;
            for (i=0; i<len; ++i) {
                if (i in allTimes) {
                    s = allTimes[i];
                    var counter = 1;
                    var people = [];
                    people.push(s.author);
                    var startMoment = moment(s.start);
                    var endMoment = moment(s.end);
                    for (j=i+1; j<len; ++j) {
                        if (j in allTimes) {
                            r = allTimes[j];
                            if(s.author != r.author)
                            {
                                var checked = false;
                                var newStartMoment = moment(r.start);
                                var newEndMoment = moment(r.end);
                                if(newStartMoment.isBetween(startMoment,endMoment))
                                {
                                    startMoment = newStartMoment;
                                    if(people.indexOf(r.author) == -1)
                                    {
                                    checked = true;
                                    counter++;
                                    people.push(r.author);
                                    }
                                }
                                if(newEndMoment.isBetween(startMoment,endMoment))
                                {
                                    endMoment = newEndMoment;
                                    if(checked != true)
                                    {
                                        people.push(r.author);
                                        counter++;
                                    }
                                }
                            }
                        }
                        if(counter > count)
                        {
                            count = counter;
                            list = people;
                            length = endMoment.diff(startMoment,'hours', true);
                            starting = startMoment.format('dddd, MMMM Do YYYY, h:mm a z');
                            ending = endMoment.format('dddd, MMMM Do YYYY, h:mm a z');
                        }
                    }
                }
            }
            if(count > 1)
            {
                return count + " people can meet for "+length+" hours from "+starting+" to "+ending;
            }
            else
            {
                return "No matches found.";
            }
        }
    });
Template.timesForm.onRendered(function() {
    this.$('.datetimepicker').datetimepicker();
});
Template.tooltipHelper.onRendered(function(){
    this.$('[data-toggle="tooltip"]').tooltip();
});
}