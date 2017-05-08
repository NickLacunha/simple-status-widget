var status_view;
var status_view_text;
var status_callback;
var waiting_text = 'Processing...';
var status_queue = [];
var sq_running = false;
var status_refresh_seconds = 1750;

$(document).ready( function () {
     status_view = $('.status-view');
     status_view_text = $('.status-view p');
     status_view_text.html(waiting_text);
});

/**
Shows the status queue and starts displaying messages
**/
var start_status_view = function() {

        status_view.show();
        sq_running = true;
        status_callback = refresh_status();
    
}

/**
Displays the given message or adds it to the status queue.
**/
var update_status = function(status_message, job_name, override) {
    
	// store the message and the job name so that you can cancel messages by job name later
    var status_object = {
        message: status_message,
        type: job_name
    }
    
    // minimize redudancy--only push message if it's not already on the queue
    if (! status_queue.indexOf(status_object) > -1){
		// allow caller to force message to front of queue
		if (override) {
			status_queue.unshift(status_object);
		} else {
			status_queue.push(status_object);
		}
    }
    if (! sq_running){
        start_status_view();
    }
}

/**
Displays the next message off of the status queue
Sets a timeout to refresh status again. This is the only
function that can set a timeout on refresh_status, so
cancelling status_callback is guaranteed to end operation
**/
var refresh_status = function() {
    // display next message if it exists
    if (status_queue.length){
        var next_msg = status_queue.shift();
        status_view_text.html(next_msg.message);
    // display a generic message
    } else {
        status_view_text.html(waiting_text);
    }
    // refresh the view again to move through the queue
    status_callback = window.setTimeout(refresh_status, status_refresh_seconds);
}

/**
Removes all status messages from the queue, displays the override text,
and sets a timer to hide the status view
**/
var finish_status_queue = function(complete_text) {
    // Override any pending status refresh
    if (status_callback) {
        window.clearTimeout(status_callback);
    }
    // de-initialize
    sq_running = false;
	status_queue = [];
    // show a message indicating completion and set the view to fade
	status_view_text.html(complete_text);
	window.setTimeout(function(){status_view.hide('fade');}, status_refresh_seconds);
}

/**
Removes all status messages associated with a particular job
**/
var finish_job = function(job_name){
    console.log('removing messages for ' + job_name);
    
    var removes = [];
    
    for (var i=0; i < status_queue.length; i++){
        if (status_queue[i].type == job_name){
            removes.push(i);
        }
    }
    
    for (var j=removes.length-1; j>=0; j--){
        //console.log('removing message ' + status_queue[j].message);
		status_queue.splice(removes[j],1);
    }
    
}

/* helper functions for accessing hard-coded status messages */
var get_message = function(job_name, mode) {
    mode = (typeof mode != 'undefined') ? mode : 'working';
    
    var formatted = job_name.replace(/ /g, '_');
    var message = status_message_list[formatted][mode];
    
    if (message  == '')
        message = status_message_list[formatted]['working'];
    
    return message;
}