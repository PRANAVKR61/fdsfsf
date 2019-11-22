'use strict';
const Alexa = require('alexa-sdk');
const Promise = require('promise');

const APP_ID = 'amzn1.ask.skill.f4c61d68-2f1a-4df1-b846-bbd101723899';

const HELP_MESSAGE = 'InterContinental Hotel Group helps you to book hotels and meeting rooms. Just say your location and I will filter the hotels for you.';
const HELP_REPROMPT = 'What would you like to do?';
const STOP_MESSAGE = 'Okay. Goodbye!';

const roomType = 'standard';
const hotelName = 'InterContinental Boston';
const check_in = '20th September';
const stayDuration = '2 nights';
const price = 445;

function add_context(current,context){
	console.log('in add_context function');
	return new Promise((res,rej)=>{
		var bool = true;
		var current_context_list =[];
		if(current.attributes && current.attributes['context']){
			current_context_list = current.attributes['context'];
			for(var i =0; i<current_context_list.length; i++){
				if(current_context_list[i].name == context.name){
					current_context_list[i] = context;
					bool = false;
					current.attributes['context'] = current_context_list;
					console.log('output of add_context function: '+JSON.stringify(current.attributes['context']));
					res(true);
					break;
				}
			}
			if(bool){
				current_context_list.push(context);
				current.attributes['context'] = current_context_list;
				console.log('output of add_context function: '+JSON.stringify(current.attributes['context']));
				res(true);
			}
		}else{
			current_context_list.push(context);
			current.attributes['context'] = current_context_list;
			console.log('output of add_context function: '+JSON.stringify(current.attributes['context']));
			res(true);
		}	
	});
}

function get_context(current,context_name){
	console.log('in get_context');
	return new Promise((res, rej)=>{
		if(current.attributes && current.attributes['context']){
			var current_context_list = current.attributes['context'];
			for(var i =0; i <current_context_list.length;i++){
				if(current_context_list[i].name == context_name){
					console.log('output of get_context function: '+JSON.stringify(current_context_list[i]));
					res(current_context_list[i]);
				}
			}
			res(false);
		}else{
			res(false);
		}	
	});
}

const handlers = {
    'LaunchRequest': function () {
    	var current = this;
    	console.log(current);
    	add_context(current,{
    		"name" : 'yes',
    		"data" : "fromLaunch"
    	});
        current.emit(':ask','Hi Sam, Welcome to InterContinental Hotels Group! Experience a quality stays for every occasion. You can make Reservation for hotels, board rooms for meetings and party. What would you like to do?');
    },
 
    'AMAZON.YesIntent' : function () {
    	var current = this;
    	get_context(current,'yes').then(res=>{
    		if(res){
  				switch(res.data){
  					case 'fromLaunch':
  						add_context(current,{
  							"name" : 'yes',
  							'data' : 'fromYes'
  						})
  						current.emit(':ask','Cool! so Sam, shall I book one '+ roomType +' room in '+ hotelName +' from '+ check_in +' for '+ stayDuration +' at $'+ price +' per night?');
  					break;
  					case 'fromYes':
  						current.emit(':tell', 'Your ticket has been booked!');
  					break;
  					default:
  						current.emit(':tell','Over');
  				}

  			}
    	})
    },

    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },

 	'AMAZON.FallbackIntent' : function () {
 		this.emit(':tell','Came into fallback intent');
 	},

    'Unhandled' : function(){
    	this.emit(':tell','Came into unhandled function');
    }
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};


