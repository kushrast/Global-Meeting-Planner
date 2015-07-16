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
    Template.timesPost.helpers({
    	'times': function(){
    		var meeting_id = this._id;
            return Times.find({meeting: meeting_id}, {sort: {start: 1}});
    	},
        'formatTime': function(time){
            var tz = jstz.determine();
            var changedTime= moment.tz(time, tz);
            return moment(time).format("dddd, MMMM Do YYYY, h:mm:ss a"); // "Sunday, February 14th 2010, 3:25:50 pm"
        }
    })
    Template.timesForm.events({
    	'submit form': function(){
    		event.preventDefault();
    		var meeting = this._id;
    		var tz = jstz.determine();
			var name = $('.userName').val();
			var start = $('.start').val();
			var end = $('.end').val();
			var startDate = moment.tz(start,tz.name());
			var endDate = moment.tz(end,tz.name());
			var now = moment();
			if(startDate == endDate || startDate > endDate)
			{
				alert("You cannot end your free time before or at the same time as when it starts.");
			}
			else
			{
				if(now == startDate || now > startDate)
				{
					alert("Please start after the present moment.");
				}
				else
				{
					Meteor.call('addTime',meeting,name,startDate.format(),endDate.format(),function(error,result){
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
    })
Template.timesForm.onRendered(function() {
    this.$('.datetimepicker').datetimepicker();
});
}