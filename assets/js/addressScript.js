
    'use strict';
    $(document).ready(function() {
        // You code here
        $.getJSON('https://reqres-api.herokuapp.com/api/users', function(
            json) {
            _.each(json, function(tr) {
                var str;
                str = $('<tr/>');
                str.append("<td>" + tr.id + "</td>");
                str.append("<td>" + tr.first_name + "</td>");
                str.append("<td>" + tr.last_name + "</td>");
                str.append("<td><a href='#' data-id=" + tr.id +
                    ">view</a></td>")
                $('tbody').append(str);
            });
            $('a').on('click', function() {
                var id = $(this).data('id');
                var myurl =
                    'https://reqres-api.herokuapp.com/api/users/';
                $.getJSON(myurl + id, function(jd) {
                    $('#details').html(
                        '<h3>first last</h3>');
                    $('#details').append('<h4>' +
                        jd.first_name + " " +
                        jd.last_name + '</h4>');
                    $('#details').append('<p>' + jd
                        .phone + '</p>');
                    $('#details').append('<p>' + jd
                        .address + '</p>');
                    $('#details').append(
                        '<img src=' + jd.avatar +
                        '>');
                });
            });
        });
    });
