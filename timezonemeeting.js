Router.route('/',
  {
    name: 'home',
    template: 'home'
});
Router.route('/meeting/:_id',
{
  name: 'meetingPage',
  template: 'meetingPage',
  data: function(){
          var currentMeeting = this.params._id;
      return Meetings.findOne({_id: currentMeeting});
    }
})
Router.configure({
  layoutTemplate: 'main'
});
Meetings = new Meteor.Collection('meetings');
Times = new Meteor.Collection('times');