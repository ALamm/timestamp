var url = require('url');
var moment = require('moment');  // to easily format dates
var chrono = require('chrono-node');  // to recognize natural dates in a string (even if something like "This Friday from 13:00 - 16.00")

moment().format();

// checks if a date is truly valid (e.g. a date like December 32, 2014 returns false)
function isValidDate(d) {
	if ( Object.prototype.toString.call(d) !== "[object Date]" )
	return false;
	return !isNaN(d.getTime());
}

module.exports = function (req,res) {
    
    var result = { 
    	unix: "null", 
    	natural: "null" 
    };

    var obj = url.parse(req.url, true);	// use the node url module to parse the req url
    var arr = obj.href.split('');  		
    var str = arr.slice(1).join('');  	// remove '/' from beginning of href
    str = str.replace(/%20/g," ");		// remove '%20' anywhere in the string
    var date = new Date(str*1000);
    
    console.log("The string that was passed in the URL: " + str);
    
    var dateEntered = chrono.parseDate(str);  // chrono will try to parse valid natural language date strings from url. returns null if it can't
    
    console.log("chrono result (only does naturals): " + dateEntered);
    
    if(dateEntered === null) {   // not a valid natural date according to chrono BUT it might be a Unix Timestamp
    	
    	console.log("invalid natural date: " + str);
    	var regex = new RegExp(/^\d+$/); 	// string made up of only numbers 
    	
    	if (regex.test(str)){   // test if input is a valid unix timestamp and should check if less than Jan 19, 2038 (year 2038 problem for Unix Timestamps)
    		console.log("but it's valid unix date: " + str);
    		date = moment(date).format("MMMM DD, YYYY"); //convert to natural 
    		result.unix = str;
    		result.natural = date;
    		res.send(JSON.stringify(result));
    	}
    	else {
    		console.log("not any kind of date");
    		res.send(JSON.stringify(result));
    	}
    }
    else {  // valid natural date - according to chrono package - but still need to check if it's a valid date (e.g. dec 32,2015)
    	console.log("Double check if this is a valid date: " + str);
    	date = new Date(str);
    	if (isValidDate(date)) {
    		result.unix = date.getTime() / 1000;  //get unix time
    		result.natural = moment(dateEntered).format("MMMM DD, YYYY");  // convert date to the format shown
    		res.send((result));			
    	}
    	else {
    		console.log("not a valid date");
    		res.send(result);
    	}
    }
    res.end();
};