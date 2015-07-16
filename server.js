if (Meteor.isServer) {
	Meteor.methods({
		'addMeeting': function(){
			return Meetings.insert({createdAt: new Date ()});
		},
		'addName': function(id,name){
			Meetings.upsert({
				_id: id
			},
			{
				$set:
				{
					name: name
				}
			});
		},
		'addTime': function(meeting,name,start,end){
			return Times.insert({
				meeting: meeting,
				author: name,
				start: start,
				end: end
			})
		}
	});
}
