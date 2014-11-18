//var host='http://localhost:3021/';



var host = 'http://54.172.162.212:3022/'


$.ajax({
    dataType: "json",
    url: host + document.URL.split('#')[1],
    success: function(json) {

        draw_bart(json);
        draw(json);
        
    }
});



function draw(json) {
    nv.addGraph(function() {
        var chart = nv.models.lineChart();
        var fitScreen = false;
        var width = 500;
        var height = 100;
        var zoom = 3;

        chart.useInteractiveGuideline(true);
        //chart.xAxis.axisLabel('Hora').tickFormat(d3.format(',r'));
        chart.xAxis.axisLabel('Hour').tickFormat(function(d) {

            return d;
            //Caso Peru Team
            /*  var h=d;
             
             if(h>=0)
             {
             return h +' H';
             }else{
             switch(h) {
             case -4:
             return 20 +' H';
             case -3:
             return 21 +' H';
             case -2:
             return 22 +' H';
             case -1:
             return 23 +' H';
             break;
             case 0:
             return 22 +' H';
             }
             }*/


        });

        chart.yAxis
            .axisLabel('ChangeSets');

        d3.select('#chart svg')
            .attr('perserveAspectRatio', 'xMinYMid')
            .attr('width', width)
            .attr('height', height)
            .datum(json);

        setChartViewBox();
        resizeChart();
        nv.utils.windowResize(resizeChart);
        d3.select('#zoomIn').on('click', zoomIn);
        d3.select('#zoomOut').on('click', zoomOut);

        function setChartViewBox() {
            var w = width * zoom,
                h = height * zoom;

            chart
                .width(w)
                .height(h);

            d3.select('#chart svg')
                .attr('viewBox', '0 0 ' + w + ' ' + h)
                .transition().duration(500)
                .call(chart);
        }

        function zoomOut() {
            zoom += .25;
            setChartViewBox();
        }

        function zoomIn() {
            if (zoom <= .5)
                return;
            zoom -= .25;
            setChartViewBox();
        }

        function resizeChart() {
            var container = d3.select('#chart');
            var svg = container.select('svg');

            if (fitScreen) {
                var windowSize = nv.utils.windowSize();
                svg.attr("width", windowSize.width);
                svg.attr("height", windowSize.height);
            } else {
                var aspect = chart.width() / chart.height();
                var targetWidth = parseInt(container.style('width'));
                svg.attr("width", targetWidth);
                svg.attr("height", Math.round(targetWidth / aspect));
            }
        };
        return chart;
    });
}


function draw_bart(test_data) {

    var chart;
    nv.addGraph(function() {
        chart = nv.models.multiBarChart()
            //.barColor(d3.scale.category20().range())
            .margin({
                bottom: 100
            })
            .transitionDuration(300)
            .delay(0)
            .rotateLabels(0)
            .groupSpacing(0.1);

        chart.multibar
            .hideable(true);

        chart.reduceXTicks(false).staggerLabels(true);

        chart.xAxis
            .axisLabel("Hours")
            .showMaxMin(true)
            .tickFormat(d3.format(','));

        chart.yAxis
            .tickFormat(d3.format(',.H'));

        d3.select('#chart1 svg')
            .datum(test_data)
            .call(chart);

        nv.utils.windowResize(chart.update);

        chart.dispatch.on('stateChange', function(e) {
            nv.log('New State:', JSON.stringify(e));
        });

        return chart;
    });
}



$(document).ready(function() {

    $('.date-picker').val(document.URL.split('#')[1]);
    $(".date-picker").datepicker({
        weekStart: 1,
        dateFormat: 'yy-mm-dd'
    });

    $(".date-picker").on("change", function() {
        $('#chart1').empty();

        $('#chart').empty();

        $('#chart1').html('<svg></svg>');
        $('#chart').html('<svg></svg>');

        $.ajax({
            dataType: "json",
            url: host + $('.date-picker').val(),
            success: function(json) {
                draw(json);
                draw_bart(json);

                location.href = document.URL.split('#')[0] + '#'+$('.date-picker').val();
            }
        });
    });
});