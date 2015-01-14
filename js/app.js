//var host = 'http://localhost:3021/';
var host = 'http://54.172.162.212:3021/'
var type = 'd';
var dates = document.URL.split('#')[1].split('&');
type = dates[0];
var start_str = dates[1];
var end_str = dates[2];
var start_times = (new Date(start_str + " 00:00:00").getTime() / 1000);
var end_times = new Date(end_str + " 00:00:00").getTime() / 1000 + 24 * 60 * 60;
var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var json_way = null;
var json_node = null;
var json_relation = null;
var json_obj = null;

function draw_way(data) {
    var chart;
    var nv_way = nv;

    nv_way.addGraph(function() {
        chart = nv_way.models.multiBarChart()
            .margin({
                top: 50,
                right: 20,
                bottom: 50,
                left: 50
            })
            .transitionDuration(300)
            .delay(0)
            .rotateLabels(0)
            .groupSpacing(0.1);

        chart.multibar.hideable(true);
        chart.reduceXTicks(false).staggerLabels(true);
        chart.xAxis.tickFormat(function(d) {
            return d;
        }); //.rotateLabels(-90);

        chart.yAxis
            .tickFormat(d3.format(',.H'));
        d3.select('#chart_way svg')
            .datum(function() {
                var json_way = [];
                _.each(data, function(val, key) {
                    val.values = val.values_way;
                    val.values_node = null;
                    val.values_way = null;
                    val.values_relation = null;
                    json_way.push(val);
                });
                return json_way;
            })
            .call(chart);
        nv.utils.windowResize(chart.update);
        return chart;
    });
    $('#chart_way').removeClass("loading");
}

function draw_node(data) {
    var chart;
    var nv_node = nv;
    nv_node.addGraph(function() {
        chart = nv.models.multiBarChart()
            .margin({
                top: 50,
                right: 20,
                bottom: 50,
                left: 50
            })
            .transitionDuration(300)
            .delay(0)
            .rotateLabels(0)
            .groupSpacing(0.1);

        chart.multibar
            .hideable(true);

        chart.reduceXTicks(false).staggerLabels(true);
        chart.xAxis.tickFormat(function(d) {
            return d;
        });
        chart.yAxis
            .tickFormat(d3.format(',.H'));
        d3.select('#chart_node svg')
            .datum(function() {
                var json_node = [];
                _.each(data, function(val, key) {
                    val.values = val.values_node;
                    val.values_node = null;
                    val.values_way = null;
                    val.values_relation = null;
                    json_node.push(val);
                });
                return json_node;
            })
            .call(chart);
        nv.utils.windowResize(chart.update);
        return chart;
    });
    $('#chart_node').removeClass("loading");
}


function draw_relation(data) {
    var chart;
    var nv_relation = nv;
    nv_relation.addGraph(function() {
        chart = nv.models.multiBarChart()
            .margin({
                top: 50,
                right: 20,
                bottom: 50,
                left: 50
            })
            .transitionDuration(300)
            .delay(0)
            .rotateLabels(0)
            .groupSpacing(0.1);

        chart.multibar
            .hideable(true);

        chart.reduceXTicks(false).staggerLabels(true);
        chart.xAxis.tickFormat(function(d) {
            return d;
        });
        chart.yAxis
            .tickFormat(d3.format(',.H'));
        d3.select('#chart_relation svg')
            .datum(function() {
                var json_relation = [];
                _.each(data, function(val, key) {
                    val.values = val.values_relation;
                    val.values_node = null;
                    val.values_way = null;
                    val.values_relation = null;
                    json_relation.push(val);
                });
                return json_relation;
            })
            .call(chart);
        nv.utils.windowResize(chart.update);
        return chart;
    });
    $('#chart_relation').removeClass("loading");
}

function draw_obj(data) {
    var chart;
    var nv_obj = nv;
    nv_obj.addGraph(function() {
        chart = nv.models.multiBarChart()
            .margin({
                top: 50,
                right: 20,
                bottom: 50,
                left: 50
            })
            .transitionDuration(300)
            .delay(0)
            .rotateLabels(0)
            .groupSpacing(0.1);

        chart.multibar
            .hideable(true);

        chart.reduceXTicks(false).staggerLabels(true);
        chart.xAxis.tickFormat(function(d) {
            return d;
        });
        chart.yAxis
            .tickFormat(d3.format(',.H'));
        d3.select('#chart_obj svg')
            .datum(function() {
                var json_obj = [];
                _.each(data, function(val, key) {
                    val.values = val.values_obj;
                    val.values_node = null;
                    val.values_way = null;
                    val.values_obj = null;
                    json_obj.push(val);
                });
                return json_obj;
            })
            .call(chart);
        nv.utils.windowResize(chart.update);
        return chart;
    });
    $('#chart_obj').removeClass("loading");
}

$(document).ready(function() {
    $('.from').val(dates[1]);
    $('.to').val(dates[2]);

    $(".from").datepicker({
        weekStart: 1,
        dateFormat: 'yy-mm-dd',
        showButtonPanel: true,
        changeMonth: true,
        changeYear: true,
        beforeShow: function(input, inst) {
            if (type === 'm') {
                $(inst.dpDiv).addClass('calendar-off');
                $("#ui-datepicker-div").removeClass('YearDatePicker');
            } else if (type === 'y') {
                $(inst.dpDiv).addClass('calendar-off');
                $("#ui-datepicker-div").addClass('YearDatePicker');
            } else {
                $("#ui-datepicker-div").removeClass('YearDatePicker');
                $(inst.dpDiv).removeClass('calendar-off');
            }
        },
        onClose: function(selectedDate) {
            if ($(window.event.srcElement).hasClass('ui-datepicker-close')) {
                if (type === 'm') {
                    var m = parseInt($("#ui-datepicker-div .ui-datepicker-month :selected").val());
                    var y = parseInt($("#ui-datepicker-div .ui-datepicker-year :selected").val());
                    $(this).datepicker("setDate", new Date(y, m, '01'));
                    draw();
                } else if (type === 'y') {
                    var y = parseInt($("#ui-datepicker-div .ui-datepicker-year :selected").val());
                    $(this).datepicker("setDate", new Date(y, '01', '01'));
                    draw();
                } else {

                }
            }
            //  setTimeout(function() {
            $(".to").datepicker("option", "minDate", start_str);
            //  }, 10);
        },
        yearRange: '2012:2020'

    });

    $(".to").datepicker({
        weekStart: 1,
        dateFormat: 'yy-mm-dd',
        //numberOfMonths: 2,
        showButtonPanel: true,
        changeMonth: true,
        changeYear: true,
        beforeShow: function(input, inst) {
            if (type === 'm') {
                $(inst.dpDiv).addClass('calendar-off');
                $("#ui-datepicker-div").removeClass('YearDatePicker');
            } else if (type === 'y') {
                $(inst.dpDiv).addClass('calendar-off');
                $("#ui-datepicker-div").addClass('YearDatePicker');
            } else {
                $("#ui-datepicker-div").removeClass('YearDatePicker');
                $(inst.dpDiv).removeClass('calendar-off');
            }
        },
        onClose: function(selectedDate) {
            if ($(window.event.srcElement).hasClass('ui-datepicker-close')) {
                if (type === 'm') {
                    var m = parseInt($("#ui-datepicker-div .ui-datepicker-month :selected").val());
                    var y = parseInt($("#ui-datepicker-div .ui-datepicker-year :selected").val());
                    $(this).datepicker("setDate", new Date(y, m, '01'));
                    draw();
                } else if (type === 'y') {
                    var y = parseInt($("#ui-datepicker-div .ui-datepicker-year :selected").val());
                    $(this).datepicker("setDate", new Date(y, '01', '01'));
                    draw();
                } else {

                }
            }
            //  setTimeout(function() {
            $(".from").datepicker("option", "maxDate", end_str);
            // }, 10);
        },
        yearRange: '2012:2020'
    });

    $(".from").datepicker("option", "maxDate", end_str);
    $(".to").datepicker("option", "minDate", start_str);



    $(".from").on("change", function() {
        draw();
    });

    $(".to").on("change", function() {
        draw();
    });
    $(".dropdown-menu li a").click(function() {
        var selText = $(this).text();
        type = $(this).attr("id");
        $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
        draw();
        setTimeout(function() {
            location.href = document.URL.split('#')[0] + '#' + type + '&' + start_str + '&' + end_str;
        }, 200);
    });

    $('.type_label').text($('#' + type).text());
    draw();
});

function todate(timestamp) {
    var date = new Date(timestamp * 1000);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return year + '-' + month + '-' + day;
}

function draw() {
    start_str = $('.from').val();
    start_times = Date.UTC(parseInt(start_str.split('-')[0]), parseInt(start_str.split('-')[1]) - 1, parseInt(start_str.split('-')[2])) / 1000;
    end_str = $('.to').val();
    end_times = Date.UTC(parseInt(end_str.split('-')[0]), parseInt(end_str.split('-')[1]) - 1, parseInt(end_str.split('-')[2])) / 1000 + 24 * 60 * 60;
    if (start_times > end_times) {
        alert('Select a range of correct dates');
        return null;
    } else {

        switch (type) {
            case 'h':
                if ((end_times - start_times) > 24 * 60 * 60 * 5) {
                    alert('Select two 5 days at most');
                    return null;
                }
                break;
            case 'd':
                if ((end_times - start_times) > 24 * 60 * 60 * 30 * 3) {
                    alert('Select two 2 month at most');
                    return null;
                }
                break;
            case 'm':
                start_str = $('.from').val();
                start_times = Date.UTC(parseInt(start_str.split('-')[0]), parseInt(start_str.split('-')[1]) - 1, 1) / 1000;
                end_str = $('.to').val();
                end_times = Date.UTC(parseInt(end_str.split('-')[0]), parseInt(end_str.split('-')[1]) - 1, 1) / 1000 + 24 * 60 * 60 * months[parseInt(end_str.substring(5, 7)) - 1];
                start_str = start_str.split('-')[0] + '-' + start_str.split('-')[1] + '-01';
                end_str = end_str.split('-')[0] + '-' + end_str.split('-')[1] + '-' + months[parseInt(end_str.substring(5, 7)) - 1];
                $('.from').val(start_str);
                $('.to').val(end_str);

                break;
            case 'y':
                start_str = $('.from').val();
                start_times = Date.UTC(parseInt(start_str.split('-')[0]), 1, 1) / 1000;
                end_str = $('.to').val();
                end_times = Date.UTC(parseInt(end_str.split('-')[0]), 1, 1) / 1000 + 24 * 60 * 60 * 365;
                start_str = start_str.split('-')[0] + '-01-01';
                end_str = end_str.split('-')[0] + '-12-31'
                $('.from').val(start_str);
                $('.to').val(end_str);
                break;
        }
    }
    if (start_str === end_str) {

        //$('.label_way').text('Number of ways  at ' + start_str);
        //$('.label_node').text('Number of nodes  at ' + start_str);
        //$('.label_relation').text('Number of relations  at ' + start_str);
        $('.label_obj').text('Date ' + start_str);

    } else {

        // $('.label_way').text('Number of ways  by ' + $('#' + type).text().split(' ')[1] + ' from ' + start_str + ' to ' + end_str);
        // $('.label_node').text('Number of nodes by ' + $('#' + type).text().split(' ')[1] + ' from ' + start_str + ' to ' + end_str);
        // $('.label_relation').text('Number of relations by ' + $('#' + type).text().split(' ')[1] + ' from ' + start_str + ' to ' + end_str);
        $('.label_obj').text('Date ' + $('#' + type).text().split(' ')[1] + ' from ' + start_str + ' to ' + end_str);

    }

    //$('#chart_way').empty();
    //$('#chart_way').html('<svg></svg>');
    //$('#chart_node').empty();
    //$('#chart_node').html('<svg></svg>');
    //$('#chart_relation').empty();
    //$('#chart_relation').html('<svg></svg>');
    $('#chart_obj').empty();
    $('#chart_obj').html('<svg></svg>');

    $.ajax({
        dataType: "json",
        url: host + type + '&' + start_times + '&' + end_times,
        success: function(json) {
            //json_way = _.map(json, _.clone);
            //json_node = _.map(json, _.clone);
            //json_relation = _.map(json, _.clone);
            //draw_node(json_node);
            //draw_way(json_way);
            //draw_relation(json_relation);
            draw_obj(json);
        }
    });
    // $('#chart_node').addClass("loading");
    // $('#chart_way').addClass("loading");
    // $('#chart_relation').addClass("loading");
    $('#chart_obj').addClass("loading");
    location.href = document.URL.split('#')[0] + '#' + type + '&' + start_str + '&' + end_str;
}