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
$.ajax({
    dataType: "json",
    url: host + type + '&' + start_times + '&' + end_times,
    success: function(json) {
        json_way = _.map(json, _.clone);
        json_node = _.map(json, _.clone);
        json_relation = _.map(json, _.clone);
        draw_node(json_node);
        draw_way(json_way);
        draw_relation(json_relation);
        location.href = document.URL.split('#')[0] + '#' + type + '&' + start_str + '&' + end_str;
    }
});

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
        });

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
}

$(document).ready(function() {
    if (start_times > end_times) {
        alert('Select a range of correct dates');
    }
    $('.from').val(dates[1]);
    $('.to').val(dates[2]);
    $(".from").datepicker({
        weekStart: 1,
        dateFormat: 'yy-mm-dd',
        numberOfMonths: 2
    });
    $(".to").datepicker({
        weekStart: 1,
        dateFormat: 'yy-mm-dd',
        numberOfMonths: 2
    });
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
    });
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
    start_times = new Date(start_str + " 00:00:00").getTime() / 1000;
    end_str = $('.to').val();
    end_times = new Date(end_str + " 00:00:00").getTime() / 1000 + 24 * 60 * 60;
    //console.log(host + type + '&' + start_times + '&' + end_times);
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
                /*if ((end_times - start_times) > 24 * 60 * 60 * 30 * 2) {
                    alert('Select two 2 month at most');
                    return null;
                }*/
                break;
            case 'm':
                start_str = $('.from').val();
                start_times = new Date(start_str.substring(0, 7) + "-01 00:00:00").getTime() / 1000;
                end_str = $('.to').val();
                console.log(parseInt(end_str.substring(5, 7)));
                end_times = new Date(end_str.substring(0, 7) + "-01 00:00:00").getTime() / 1000 + 24 * 60 * 60 * months[parseInt(end_str.substring(5, 7)) - 1];
                /*if ((end_times - start_times) > 24 * 60 * 60 * 30 * 12 * 2) {
                    alert('Select two years at most');
                    return null;
                }*/
                break;
            case 'y':
                start_str = $('.from').val();
                start_times = new Date(start_str.substring(0, 4) + "-01-01 00:00:00").getTime() / 1000;
                end_str = $('.to').val();
                console.log(parseInt(end_str.substring(0, 4)));
                end_times = new Date(end_str.substring(0, 4) + "-01-01 00:00:00").getTime() / 1000 + 24 * 60 * 60 * 365;
                break;
        }
    }
    $('#chart_way').empty();
    $('#chart_way').html('<svg></svg>');
    $('#chart_node').empty();
    $('#chart_node').html('<svg></svg>');
    $('#chart_relation').empty();
    $('#chart_relation').html('<svg></svg>');
    $.ajax({
        dataType: "json",
        url: host + type + '&' + start_times + '&' + end_times,
        success: function(json) {
            json_way = _.map(json, _.clone);
            json_node = _.map(json, _.clone);
            json_relation = _.map(json, _.clone);
            draw_node(json_node);
            draw_way(json_way);
            draw_relation(json_relation);
            location.href = document.URL.split('#')[0] + '#' + type + '&' + start_str + '&' + end_str;
        }
    });
}