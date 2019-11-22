'use strict';
const Alexa = require('alexa-sdk');
const moment = require('moment');
const APP_ID = 'amzn1.ask.skill.3115694f-e35a-4119-be73-cb66d93db8c0';

const SKILL_NAME = 'Space Facts';
const GET_FACT_MESSAGE = "Here's your fact: ";
const HELP_MESSAGE = 'You can say tell me a space fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const data = [
    'A year on Mercury is just 88 days long.',
    'Despite being farther from the Sun, Venus experiences higher temperatures than Mercury.',
    'Venus rotates counter-clockwise, possibly because of a collision in the past with an asteroid.',
    'On Mars, the Sun appears about half the size as it does on Earth.',
    'Earth is the only planet not named after a god.',
    'Jupiter has the shortest day of all the planets.',
    'The Milky Way galaxy will collide with the Andromeda Galaxy in about 5 billion years.',
    'The Sun contains 99.86% of the mass in the Solar System.',
    'The Sun is an almost perfect sphere.',
    'A total solar eclipse can happen once every 1 to 2 years. This makes them a rare event.',
    'Saturn radiates two and a half times more energy into space than it receives from the sun.',
    'The temperature inside the Sun can reach 15 million degrees Celsius.',
    'The Moon is moving approximately 3.8 cm away from our planet every year.',
];
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
const handlers = {
    'LaunchRequest': function () {
        console.log(this);
        this.emit(':ask',"launch");
    },
    'PropertySearch':function(){
        console.log(this);
        var current=this;
        delegateSlotFunction(current).then(intent=>{
            console.log(intent);
            var data = null;

            var xhr = new XMLHttpRequest();
            xhr.withCredentials = true;

            xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log("response text");
                console.log(this.responseText);
                var hotel_details=JSON.parse(this.responseText);
                var text='I found 2 hotels based on your schedule. A top result that has been rated as overall excellent by more than 5000 travelles is the'+hotel_details[0].hotelName+'as it has an indoor pool, which you always expect in your stay. A 5-star hotel with standard room at $ 445 per night.'
                current.emit(':tell',text);
            }
            });
            var EndDate=moment(intent.StartDate.value).add(moment.duration(intent.EndDate.value)).format("YYYY-MM-DD");
            var url="https://propertysearch.app.dev.digifabricpcf.com/api/hotel?location="+intent.Destination.value+"&startdate="+intent.StartDate.value+"&enddate="+EndDate+"&numberofrooms="+intent.NumberofRooms.value+"&numberofadults="+intent.NumberofAdults.value;
            console.log(url);
            xhr.open("GET", url);
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.setRequestHeader("postman-token", "f8f4db59-a46e-3307-a516-55ce25079552");
            console.log("get call");
            xhr.send(data);
            
        })
        
    },
    'GetNewFactIntent': function () {
        const factArr = data;
        const factIndex = Math.floor(Math.random() * factArr.length);
        const randomFact = factArr[factIndex];
        const speechOutput = GET_FACT_MESSAGE + randomFact;

        this.response.cardRenderer(SKILL_NAME, randomFact);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
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
    'Unhandled' : function () {
        var message = 'Sorry, I could not understand.';
        this.response.speak(message).listen(message);
        this.emit(':responseReady');
    }
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    console.log('logging event'+JSON.stringify(event));
    alexa.execute();
};


function delegateSlotFunction(current){
    return new Promise((resolve,reject)=>{
        var intentRequest=current.event.request;
        console.log("intentRequest is "+JSON.stringify(current));
        if (intentRequest.dialogState === "STARTED"){
            // Pre-fill slots: update the intent object with slot values for which
            // you have defaults, then return Dialog.Delegate with this updated intent
            // in the updatedIntent property.
            console.log("start is "+intentRequest.intent.slots.StartDate.name);
            var updatedIntent=intentRequest.intent;
            current.emit(":delegate", updatedIntent);
        } else if (intentRequest.dialogState != "COMPLETED"){
            // return a Dialog.Delegate directive with no updatedIntent property.
            var updatedIntent=intentRequest.intent;
            current.emit(":delegate", updatedIntent);
        } else {
            // Dialog is now complete and all required slots should be filled,
            // so call your normal intent handler. 
            //handlePlanMyTripIntent(intent, session, callback);
            if(isNaN(intentRequest.intent.slots.NumberofRooms.value))
            {
                var updatedIntent=intentRequest.intent;
                delete updatedIntent.intent.slots.NumberofRooms['value'];
                current.emit(":delegate", updatedIntent);
            }
            if(isNaN(intentRequest.intent.slots.NumberofAdults.value))
            {
                var updatedIntent=intentRequest.intent;
                delete updatedIntent.intent.slots.NumberofAdults['value'];
                current.emit(":delegate", updatedIntent);
            }
            resolve(intentRequest.intent.slots)
        }
    });
    
}