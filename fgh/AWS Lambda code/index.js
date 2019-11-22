'use strict';
const Alexa = require('alexa-sdk');
const moment = require('moment');
const Promise = require('promise');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const APP_ID = 'amzn1.ask.skill.f4c61d68-2f1a-4df1-b846-bbd101723899';

const HELP_MESSAGE = 'InterContinental Hotel Group helps you to book hotels and meeting rooms. Just say your location and I will filter the hotels for you.';
const HELP_REPROMPT = 'What would you like to do?';
const STOP_MESSAGE = 'Okay. Goodbye!';

var place;

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
        'name' : 'yes',
        'data' : 'fromLaunch'
      });
        current.emit(':ask','Hi Alok, Welcome to InterContinental Hotels Group! Experience a quality stays for every occasion. You can make Reservation for hotels, board rooms for meetings and party. What would you like to do?');
    },

    'PropertySearch':function(){
        console.log("inside PropertySearch")
        console.log(this);
        var current=this;
        delegateSlotFunction(current).then(intent=>{
            console.log("after delegateSlotFunction in PropertySearch")
            console.log(intent);
            var data = null;

            var xhr = new XMLHttpRequest();
            xhr.withCredentials = true;

            xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log("response text");
                console.log(this.responseText);
                var hotel_details=JSON.parse(this.responseText);
                var text="";
                if(hotel_details.length>0){
                    add_context(current,{
                        "name":"hotelDetails",
                        "data":{
                            "hotelName":hotel_details[0].hotelName,
                            "roompricinginformations":hotel_details[0].roompricinginformations,
                            "hotelId":hotel_details[0].hotelId
                        }
                    })
                    get_context(current,"hotelDetails").then(res=>{
                        console.log("get_context res is "+JSON.stringify(res));
                    });
                    add_context(current,{
                      'name' : 'yes',
                      'data'  : 'fromPropertySearch'
                    });
                    add_context(current,{
                      'name' : 'no',
                      'data'  : 'fromPropertySearch'
                    });
                var currency;
                if(hotel_details[0].roompricinginformations[0].currencyCd=="USD"){
                  currency="dollars"
                }
                else{
                  currency="rupees"
                }
                    //text='I found 2 hotels based on your schedule. A top result that has been rated as overall excellent by more than 5000 travelles is the'+hotel_details[0].hotelName+'as it has an indoor pool, which you always expect in your stay. A 5-star hotel with standard room at $ 445 per night.';
                    text='You always prefer low smoking with kitchenette standard room. It is available at '+hotel_details[0].hotelName+' at '+intent.Destination.value +' which cost '+Math.round(hotel_details[0].roompricinginformations[0].price)+' '+currency+' per night. Shall I confirm your booking';
                    if(hotel_details.length>1){
                        delete hotel_details.splice(0, 1);
                        add_context(current,{
                            "name":"hotelList",
                            "data":hotel_details
                        });
                    }
                    current.emit(':ask',text);
                }
                else{
                    text="Sorry, I couldn't find any hotel at that "+intent.Destination.value;
                    current.emit(':tell',text);
                }
                
                
            }
            });
            var EndDate=moment(intent.StartDate.value).add(moment.duration(intent.EndDate.value)).format("YYYY-MM-DD");
            var url="https://propertysearch.apps.dev.cloudsprint.io/api/hotel?location="+intent.Destination.value+"&startdate="+intent.StartDate.value+"&enddate="+EndDate+"&numberofrooms="+intent.NumberofRooms.value+"&numberofadults="+intent.NumberofAdults.value;
            console.log(url);
            xhr.open("GET", url);
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.setRequestHeader("postman-token", "f8f4db59-a46e-3307-a516-55ce25079552");
            console.log("get call");
            xhr.send(data);
            
        })   
    },
    'NextIntent':function(){
        var current=this;
        get_context(current,"hotelList").then(res=>{
            if(res&&res.data.length){
                console.log("NextIntent");
                console.log("get_context hotelList is "+JSON.stringify(res));
                var hotel_details=res.data;
                var hotelName=hotel_details[0].hotelName.replace("&", "and");
                var currency;
                if(hotel_details[0].roompricinginformations[0].currencyCd=="USD"){
                  currency="dollars"
                }
                else{
                  currency="rupees"
                }
                var text="The "+hotelName+'is another excellent choice as it has an indoor pool, which you always expect in your stay. A 5-star hotel with standard room at '+Math.round(hotel_details[0].roompricinginformations[0].price)+' '+currency+' per night. Shall I confirm your booking';
                //text='You always prefer low smoking with kitchenette standard room. It is available at '+hotel_details[0].hotelName+' at '+intent.Destination.value +' which cost '+hotel_details[0].roompricinginformations[0].price+' per night. Shall I confirm your booking';
                console.log("text is "+text);
                add_context(current,{
                  'name' : 'yes',
                  'data'  : 'fromNextIntent'
                });
                add_context(current,{
                  'name' : 'no',
                  'data'  : 'fromNextIntent'
                });
                current.emit(':ask',text);
            }
            else{
                current.emit(':tell',"No other hotel available at that destination");
            }
            
        });
    },
    // 'PropertySearch' : function () {
    //   console.log("inside propertysearch")
    //   var current = this;
    //   delegateSlotFunction(current).then(intent=>{
    //     console.log("after delegate function")
    //     console.log("intent"+intent);
    //     place = intent.destination.value;
        
    //     add_context(current,{
    //     'name' : 'yes',
    //     'data'  : 'fromPropertySearch'
    //   });
    //   add_context(current,{
    //     'name' : 'no',
    //     'data'  : 'fromPropertySearch'
    //   });
    //   current.emit(':ask',"You always prefer low smoking with kitchenette standard room. It is available at Holiday Inn"+ place +"which cost $750 per night. Shall I confirm your booking");
    //   })
    // },

    'NextHotelIntent' : function () {
      add_context(this,{
        'name' : 'yes',
        'data'  : 'fromNextHotel'
      });
      add_context(this,{
        'name' : 'no',
        'data'  : 'fromNextHotel'
      });
      this.emit(':ask',"Here is another hotel with your preferred amenities at Crown Plaza"+ place +"which cost $800 per night. Shall I confirm your booking");
    },
 
    'AMAZON.YesIntent' : function () {
      var current = this;
      get_context(current,'yes').then(res=>{
        if(res){
          switch(res.data){
            case 'fromPropertySearch':
            case 'fromNextIntent':
              current.emit(':tell','Your booking has been confirmed. Enjoy the stay with us.');
            break;
            case 'fromNo':
              current.emit('NextIntent');
            break;
            default:
              current.emit(':tell','Over');
          }

        }
      })
    },

    'AMAZON.NoIntent' : function () {
      var current = this;
      get_context(current,'no').then(res=>{
        if(res){
          switch(res.data){
            case 'fromPropertySearch':
            case 'fromNextIntent':
              add_context(this,{
                'name' : 'yes',
                'data'  : 'fromNo'
              });
              add_context(this,{
                'name' : 'no',
                'data' : 'fromNo'
              })
              current.emit(':ask','Shall I recommend next hotel?');
            break;
            case 'fromNo' :
              current.emit(':tell','Thank you. Goodbye')
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

function delegateSlotFunction(current){
    return new Promise((resolve,reject)=>{
        var intentRequest=current.event.request;
        console.log("intentRequest is "+JSON.stringify(current));
        if (intentRequest.dialogState === "STARTED"){
            // Pre-fill slots: update the intent object with slot values for which
            // you have defaults, then return Dialog.Delegate with this updated intent
            // in the updatedIntent property.
            //console.log("start is "+intentRequest.intent.slots.StartDate.name);
            var updatedIntent=intentRequest.intent;
            current.emit(":delegate", updatedIntent);
        } else if (intentRequest.dialogState != "COMPLETED"){
            // return a Dialog.Delegate directive with no updatedIntent property.
            var updatedIntent=intentRequest.intent;
            //checkNumber(current,intentRequest);
            current.emit(":delegate", updatedIntent);
        } else {
            // Dialog is now complete and all required slots should be filled,
            // so call your normal intent handler. 
            //handlePlanMyTripIntent(intent, session, callback);
            resolve(intentRequest.intent.slots)            
        }
    });
    
}

function checkNumber(current,intentRequest){
    var updatedIntent=intentRequest.intent;
    var flag=0;
    if(isNaN(intentRequest.intent.slots.NumberofRooms.value))
    {
        console.log("NumberofRooms not filled");
        console.log("before deletion:"+JSON.stringify(updatedIntent));
        delete updatedIntent.slots.NumberofRooms['value'];
        console.log("after deletion:"+JSON.stringify(updatedIntent));
        //current.emit(":delegate", updatedIntent);
        flag=1;
    }
    if(isNaN(intentRequest.intent.slots.NumberofAdults.value))
    {
        console.log("NumberofAdults not filled");
        //var updatedIntent=intentRequest.intent;
        console.log("before deletion:"+JSON.stringify(updatedIntent));
        delete updatedIntent.slots.NumberofAdults['value'];
        console.log("after deletion:"+JSON.stringify(updatedIntent));
        //current.emit(":delegate", updatedIntent);
        flag=1;
    }
    current.emit(":delegate", updatedIntent);
}

/*Removing context from the context variable*/ 
function remove_context(current,context_name){
    console.log('in remove_context');
    return new Promise((res,rej)=>{
                    var local_context_list =[];
                    if(current.attributes && current.attributes['context']){
                                    var current_context_list = current.attributes['context'];
                                    for(var i =0; i<current_context_list.length; i++){
                                                    if(current_context_list[i].name == context_name){
                                                                    
                                                    }else{
                                                                    local_context_list.push(current_context_list[i]);
                                                    }
                                    }
                                    current.attributes['context'] = local_context_list;
                                    console.log('output of remove_context function: '+JSON.stringify(current.attributes['context']));
                                    res(true);
                    }else{
                                    res(false);
                    }
    });
}