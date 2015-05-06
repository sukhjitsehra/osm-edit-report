(function(settings) {
    var start_str = '';
    var end_str = '';
    var start_times = 0;
    var end_times = 0;
    var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var date_xaxis = [];
    var json_obj = null;
    var url = document.URL;
    var type = null;
    var dates = [];
    var today = new Date();
    if (url.indexOf("#") != -1 && url.indexOf("&") != -1) {
        dates = url.split('#')[1].split('&');
        type = dates[0];
        start_str = dates[1];
        end_str = dates[2];
    } else {
        type = 'd';
        end_str = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        today.setDate(today.getDate() - 8);
        start_str = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        dates.push(type);
        dates.push(start_str);
        dates.push(end_str);
    }
    start_times = (new Date(start_str + " 00:00:00").getTime() / 1000);
    end_times = new Date(end_str + " 00:00:00").getTime() / 1000 + 24 * 60 * 60 - 1;

    function draw_line(data) {
        console.log(data);
        var chart;
        var nv_line = nv;
        nv_line.addGraph(function() {
            var chart;
            chart = nv_line.models.lineChart().useInteractiveGuideline(true);
            chart
                .x(function(d, i) {
                    return d.x;
                });
            chart.margin({
                right: 63,
                left: 35
            });
            chart.xAxis
                .axisLabel('Date')
                .tickFormat(
                    date_format()
                );
            date_xaxis = _.uniq(date_xaxis);
            if (date_xaxis.length > 10) {
                date_xaxis = _.each(date_xaxis, function(v, k) {
                    return k % 2 == 0;
                });
            }
            chart.xAxis.tickValues(date_xaxis);
            chart.yAxis.tickFormat(d3.format(',.H'));
            d3.select('#chart_line svg')
                .datum(data)
                .transition().duration(500)
                .call(chart);
            nv_line.utils.windowResize(chart.update);
            return chart;
        });
        $('#chart_line').removeClass("loading");
    }

    function draw_line_changeset(data) {
        console.log(data);
        _.each(data, function(val, key) {
            _.each(val.values, function(v) {
                v.y = v.change;
                v.x = new Date(v.x);
            });
        });
        var chart;
        var nv_line = nv;
        nv_line.addGraph(function() {
            var chart;
            chart = nv_line.models.lineChart().useInteractiveGuideline(true);
            chart
                .x(function(d, i) {
                    return d.x;
                });
            chart.margin({
                right: 63,
                left: 35
            });
            chart.xAxis
                .axisLabel('Date')
                .tickFormat(
                    date_format()
                );
            date_xaxis = _.uniq(date_xaxis);
            if (date_xaxis.length > 10) {
                date_xaxis = _.each(date_xaxis, function(v, k) {
                    return k % 2 == 0;
                });
            }
            chart.xAxis.tickValues(date_xaxis);
            chart.yAxis.tickFormat(d3.format(',.H'));
            d3.select('#chart_line_changeset svg')
                .datum(data)
                .transition().duration(500)
                .call(chart);
            nv_line.utils.windowResize(chart.update);
            return chart;
        });
        $('#chart_line_changeset').removeClass("loading");
    }

    function date_format() {
        var formatter;
        switch (type) {
            case 'h':
                //per hour
                formatter = function(d, i) {
                    if (typeof d === 'object') {
                        var date = new Date(d);
                        return d3.time.format.utc('%a %d %H%p')(date);
                    } else {
                        var date = new Date(d);
                        return d3.time.format.utc('%H%p')(date);
                    }
                }
                break;
            case 'd':
                //per day
                formatter = function(d, i) {
                    if (typeof d === 'object') {
                        var date = new Date(d);
                        return d3.time.format.utc('%a:%d %b')(date);
                    } else {
                        var date = new Date(d);
                        return d3.time.format.utc('%a:%d-%b')(date);
                    }
                }
                break;
            case 'm':
                // per month
                formatter = function(d, i) {
                    if (typeof d === 'object') {
                        var date = new Date(d);
                        return d3.time.format.utc('%b %Y')(date);
                    } else {
                        var date = new Date(d);
                        return d3.time.format.utc('%b %Y')(date);
                    }
                }
                break;
            case 'y':
                // per year
                formatter = function(d, i) {
                    if (typeof d === 'object') {
                        var date = new Date(d);
                        return d3.time.format.utc('%Y')(date);
                    } else {
                        var date = new Date(d);
                        return d3.time.format.utc('%Y')(date);
                    }
                }
                break;
        }
        return formatter;
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
                $(".to").datepicker("option", "minDate", start_str);
            },
            yearRange: '2015:' + today.getFullYear()
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
                $(".from").datepicker("option", "maxDate", end_str);
            },
            yearRange: '2015:' + today.getFullYear()
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
                    if ((end_times - start_times) > 60 * 24 * 3600) {
                        $("#span-warning").text(' You selected request per hour, this is not possible if there is more than two months on range, please select other range');
                        $('#error-warning').show();
                        setTimeout(function() {
                            $('#error-warning').hide();
                        }, 8000);
                        return null;
                    }
                    break;
                case 'd':
                    // if ((end_times - start_times) > 24 * 60 * 60 * 30 * 3) {
                    //     return null;
                    // }
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
                    start_times = Date.UTC(parseInt(start_str.split('-')[0]), 0, 1) / 1000;
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
            $('.label_bar').text('Date ' + start_str);
            $('.label_line').text('Date ' + start_str);
        } else {
            $('.label_bar').text('Date: From ' + start_str + ' to ' + end_str);
            $('.label_line').text('Date: From ' + start_str + ' to ' + end_str);
        }
        $('#chart_line').empty();
        $('#chart_line').html('<svg></svg>');
        $('#chart_line_changeset').empty();
        $('#chart_line_changeset').html('<svg></svg>');

        $.ajax({
            dataType: "json",
            url: settings.host + type + '&' + start_times + '&' + end_times,
            success: function(json) {
                date_xaxis = [];
                json_obj = [];
                _.each(json, function(val, key) {
                    val.values_obj = null;
                    switch (type) {
                        case 'h':
                            //per hour
                            _.each(val.values, function(v, k) {
                                var d = val.values[k].x.split('-');
                                var date_timestamp = Date.UTC(d[0],
                                    parseInt(d[1]) - 1,
                                    parseInt(d[2]), parseInt(d[3]), 0);
                                var utc = new Date(date_timestamp);
                                val.values[k].x = utc;
                                date_xaxis.push(date_timestamp);

                            });
                            break;
                        case 'd':
                            //per day
                            _.each(val.values, function(v, k) {
                                var d = val.values[k].x.split('-');
                                var date_timestamp = Date.UTC(parseInt(d[0]),
                                    parseInt(d[1]) - 1,
                                    parseInt(d[2]));
                                var utc = new Date(date_timestamp);
                                val.values[k].x = utc;
                                date_xaxis.push(date_timestamp);
                            });
                            break;
                        case 'm':
                            _.each(val.values, function(v, k) {
                                var d = val.values[k].x.split('-');
                                var date_timestamp = Date.UTC(d[0],
                                    parseInt(d[1]) - 1, 12, 0, 0);
                                var utc = new Date(date_timestamp);
                                val.values[k].x = utc;
                                date_xaxis.push(date_timestamp);
                            });
                            break;
                        case 'y':
                            _.each(val.values, function(v, k) {
                                var d = val.values[k].x.split('-');
                                var date_timestamp = Date.UTC(d[0], 0, 2, 0, 0);
                                var utc = new Date(date_timestamp);
                                val.values[k].x = utc;
                                date_xaxis.push(date_timestamp);
                            });
                            break;
                    }
                    json_obj.push(val);
                });
                draw_line(json_obj);
                draw_line_changeset(JSON.parse(JSON.stringify(json_obj)));
            }
        });
        $('#chart_line').addClass("loading");
        $('#chart_line_changeset').addClass("loading");
        location.href = document.URL.split('#')[0] + '#' + type + '&' + start_str + '&' + end_str;
    }
})(settings);