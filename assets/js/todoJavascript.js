'use strict';

$(document).ready(function() {
    // App logic goes here
    var todoText;
    var $todoVar;
    $('form').submit(function (event) { // target the form, and put a submit event listener on it. We can capture and pass in the event for us to use
      event.preventDefault(); // this tells the browser to "prevent" the "default" "event" from occuring (sending and refreshing)
      $todoVar = $(this);
      todoText = $todoVar.find($('#todo')).val();
       $('#todo-list').append('<li>' + todoText + '</li>');
      $('#todo-list').sortable();
    });
});
