'use strict';
const APP_ID = 'amzn1.ask.skill.bc9d5860-be52-477a-94b2-554b08e71e2e';  
var Alexa=require('alexa-sdk');
var Promise = require('promise');
var AWS=require('aws-sdk');
AWS.config.update({
    region: "us-east-1"   
}); 


/*Getting the required context from context 
variable by using context_name*/
function get_context(current,context_name){
	console.log('in get_context');
	return new Promise((res, rej)=>{
		var obj=[{"hotelName":"Holiday Inn\n","hotelId":"4","address":{"streetName":"Biswa Bangla Sarani,Rajarhat","streetNumber":"","zipCode":"700136","city":"Kolkata","country":"India"},"amenities":["Wireless Internet","Health/Fitness Centre","Kids Eat Free","No pets allowed","Free Breakfast"],"imageURL":"https://s3.ap-south-1.amazonaws.com/ihg-hotel-images/holiday-inn-kolkata-5060101385-4x3.jfif","phones":["Reservation-+91 124 455 1212; Front Desk-91-33-66996699"],"rating":"4.5","roompricinginformations":[{"roomType":"One Bed","price":"4195.20","currencyCd":"INR"},{"roomType":"Two Beds","price":"4195.20","currencyCd":"INR"},{"roomType":"Suite","price":"5700.00","currencyCd":"INR"},{"roomType":"Standard","price":"4195.20","currencyCd":"INR"}]}];
		res(obj[0]);	
	});
}

function confirm_order(current,reponse,roomtype){
	return new Promise((resolve,reject)=>{
		var rooms;
		rooms.push(response.roompricinginformations);
		for(var i=0;i<rooms.length;i++){
			if(rooms[i].roomType==roomtype){
				resolve(rooms[i].price);
			}
		}

	})
}

function get_room_type(current,response){
	console.log('inside get_room_type');
	var res_string;
	return new Promise((resolve,reject)=>{
		console.log('inside promise');
		var rooms=[];
		rooms.push(response.roompricinginformations);
		console.log(rooms.length);
		for(var i=0;i<rooms.length;i++){
			res_string+=rooms[i].roomType+' is available for '+rooms[i].price+'. ';
			if(i==rooms.length-1){
				res_string+='Which type you want to choose';
				resolve(res_string);
			}
		}
	});
}


var handlers ={

	'LaunchRequest' : function(){
		console.log('Inside Launch Intent');
		var current=this;
		current.emit(':ask','Welcome to IGT. How can I help you?');	
	}, 

	'HotelSearch' : function(){
		console.log('Inside HotelSearch Intent');
		var current=this;
		get_context(current,'response_api').then(res_api=>{
			console.log('response '+JSON.stringify(res_api));
			if(res_api){
				console.log('inside if');
				var intent = current.event.request.intent || {"slots":[]} ;
				if (intent.slots.roomtype && intent.slots.roomtype.value) {
					var roomtype=intent.slots.roomtype.value;
					confirm_order(current,res_api,roomtype).then(res_confirm_order=>{
						if(res_confirm_order){
							current.emit(':tell',roomtype+' is available for '+res_confirm_order+' rupees. you want to confirm the order?');
						}else{
							console.log('confirm order function failed');
						}
					})
				}else{
					console.log('inside else');
					get_room_type(current,res_api).then(res_get_room_type=>{
						if(res_get_room_type){
							console.log('get_room_type successful');
							current.emit(':ask',res_get_room_type);
						}else{
							console.log('get_room_type failed');
						}
					})
				}

			}else{
				console.log('get_context failed in HotelSearch');
			}
		})
	},
};

exports.handler = (event, context) => {
    var alexa = Alexa.handler(event, context);
	alexa.appId = APP_ID;
	alexa.registerHandlers(handlers);
	alexa.execute();
};
