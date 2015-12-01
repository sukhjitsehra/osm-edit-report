    function truncate(str, maxLength, suffix) {
        if (str.length > maxLength) {
            str = str.substring(0, maxLength + 1);
            str = str.substring(0, Math.min(str.length, str.lastIndexOf(' ')));
            str = str + suffix;
        }
        return str;
    }

    function drawGraph(whichGraph, data, startDateString, endDateString) {
        console.log('drawGraph!');
        //SVG margins
        var margin = {
            top: 20,
            right: 200,
            bottom: 0,
            left: 20
            },
        width = 1000,
        height = 800;

        //Map startDate and endDate to the two date strings.
        var startDate = new Date(startDateString),
            endDate = new Date(endDateString);

        //decides colours of the circles
        var c = d3.scale.category20c();

        //define a time scale with the range 0 - width and map the domain startDate,endDate on it
        var noOfTicks = 0;
        var dateTickValues = [];
        var limit;

        switch (type) {
        case 'h':
            noOfTicks = 23;
            limit = 23;
            for (var index = 0; index <= limit; index++) {
                //new Date(JSON.parse(JSON.stringify(startDate))) done to shallow copy
                //the startDate value into dateTickValues. If
                //dateTickValues[index] = startDate; is done
                //It amounts to a deep copy. Array elements get overwritten with the
                //latest value of startDate which is pointless.
                dateTickValues[index] = new Date(JSON.parse(JSON.stringify(startDate)));
                startDate.setHours(startDate.getHours() + 1);
            }
            break;

        case 'd':
            limit = 0;
            for (index = startDate.getTime(); index <= endDate.getTime(); ) {
                dateTickValues[limit] = new Date(JSON.parse(JSON.stringify(startDate)));
                startDate.setDate(startDate.getDate() + 1);
                index = startDate.getTime();
                limit += 1;
            }
            noOfTicks = limit - 1;
            break;
        }

        //If the noOfTicks = 0 for example when startDate = endDate, ensure that
        //at least one tick is present for values to appear under.
        noOfTicks = (noOfTicks < 1) ? 1 : noOfTicks;
        //If the graph has only one tick(when looking at data for just 2015, or when
        //startDate = endDate), then there is only one tick label which means that
        //the right end of the graph has no tick label. To solve this, have two
        //tick labels, and push the same value twice into dateTickValues
        dateTickValues[1] = (dateTickValues.length == 1) ? dateTickValues[0] : dateTickValues [1];

        var x = d3.scale.linear()
        .domain([0, noOfTicks])
        .range([0, width]);

        //create axis with the above defined time scale and orient it on top(x axis on top).
        var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(noOfTicks)
        .tickFormat(function (d, i) {
            switch (type) {
            case 'h':
                return d3.time.format.utc('%I%p')(new Date(dateTickValues[i]));
            case 'd':
                return d3.time.format.utc('%a:%d %b')(new Date(dateTickValues[i]));
            }
        })
        .orient('top');

        //Append the svg to the body
        var svg = d3.select("#chart svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .style('margin-left', margin.left + 'px')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        //Append the svg axis
        svg.append('g')
        .attr('class', 'x axis')
        .call(xAxis);


        for (j = 0; j < data.length; j++) {
            var g = svg.append('g');

            var circles = g.selectAll('circle')
                           .data(data[j].values)
                           .enter()
                           .append('circle');

            var text = g.selectAll('text')
                        .data(data[j].values)
                        .enter()
                        .append('text');

            var xScale = d3.time.scale()
                           .domain([startDate, endDate])
                           .range([0, width]);

            var rScale = d3.scale.log()
                           .domain([1, 10])
                           .range([0, 2]);

            circles
            .attr('cx', function (d, i) {
                return (width / noOfTicks) * i;
            })
            .attr('class', function (d, i) {
                return 'circleColumn' + i;
            })
            .attr('cy', j * 20 + 20)
            .attr('r', function (d) {
                // switch (whichGraph) {
                // case '#chart':
                        //This is to avoid the -infinity error.
                    if (d.y === 0 || d.y === null){
                        return 1;
                    } else {
                        return rScale(d.y);
                    }
                // }
            })
            .style('fill', function () {
                return c(j);
            });

            text
            .attr('y', j * 20 + 25)
            .attr('x', function (d, i) {
                return (width / noOfTicks) * i - 5;
            })
            .attr('class', function(d, i) {
                return 'circleTextColumn' + i + ' value';
            })
            .text(function (d) {
                // switch (whichGraph) {
                // case '#chart svg':
                    return d.y;
                // case '#chart_line_changeset svg':
                //     return d.change;
                // }
            })
            .style('fill', function (d) {
                return c(j);
            })
            .style('display', 'none');

            //Append osm editors names to the right of the SVG=============================
            g.append('text')
             .attr('y', j * 20 + 25)
             .attr('x', width + 60)
             .attr('class', 'label')
             .text(truncate(data[j].key, 30, '...'))
             .style('fill', function (d) {
                 return c(j);
             })
             .on('mouseover', mouseover)
             .on('mouseout', mouseout);

            //Mouseover and Mouseout over ticks============================================
            d3.selectAll('.x')
              .selectAll('.tick.major')
              .on('mouseover', tickMouseover);

            d3.selectAll('.x')
              .selectAll('.tick.major')
              .on('mouseout', tickMouseout);
            //=============================================================================
        }


        $('#chart').removeClass('loading');

        function tickMouseover(p, i) {
            d3.selectAll('.circleColumn' + i).style('display', 'none');
            d3.selectAll('.circleTextColumn' + i).style('display', 'block');
        }

        function tickMouseout(p, i) {
            d3.selectAll('.circleColumn' + i).style('display', 'block');
            d3.selectAll('.circleTextColumn' + i).style('display', 'none');
        }

        function mouseover() {
            var g = d3.select(this).node().parentNode;
            d3.select(g).selectAll('circle').style('display', 'none');
            d3.select(g).selectAll('text.value').style('display', 'block');
        }

        function mouseout() {
            var g = d3.select(this).node().parentNode;
            d3.select(g).selectAll('circle').style('display', 'block');
            d3.select(g).selectAll('text.value').style('display', 'none');
        }
    }

$(document).ready(function(){

    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    //Call draw with default dates.
    $('.from').val(moment(yesterday).format('YYYY-MM-DD'));
    $('.to').val(moment(yesterday).format('YYYY-MM-DD'));
    draw($('.from').val(), $('.to').val());

    //Call draw() when from and to change.
    $('.from').on('change', function(e) {
        $('#chart svg').empty();
        draw($('.from').val(), $('.to').val());
    });
    $('.to').change(function (event) {
        $('#chart svg').empty();
        draw($('.from').val(), $('.to').val());
    });
});

function draw(startDateString, endDateString) {

    var startTime = moment.utc(startDateString)/1000;
    var endTime = (moment.utc(endDateString)/1000) + (24 * 60 * 60);

    console.log('startTime ' + startTime);
    console.log('endTime ' + endTime);

    if (startDateString === endDateString) {
        console.log('Per hour!');
        type = 'h';

    } else {
        type = 'd';
        console.log('Per day!');
    }

    if (startTime > endTime) {
        alert('Select a range of correct dates');
        return null;
    } else{
       $.ajax({
            dataType: 'json',
            url: settings.host + type + '&' + startTime + '&' + endTime,
            success: function (json) {
                console.log("JSON  ", JSON.stringify(json));
                drawGraph('#chart svg', json, startDateString, endDateString);
            }
        });
    }
}