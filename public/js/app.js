var CURRENT_SELECTION = 'OBJECTS';
var TYPE = 'D';

$(document).ready(function () {
    init();

    //Call queryAPI() when from and to change.
    $('.from').on('change', function () {
        queryAPI($('.from').val(), $('.to').val());
    });

    $('.to').change(function () {
        queryAPI($('.from').val(), $('.to').val());
    });


    $('#objectsButton').click(function () {
        $('#objectsButton').prop('checked', true);
        $('#changesetsButton').prop('checked', false);
        CURRENT_SELECTION = 'OBJECTS';
        queryAPI($('.from').val(), $('.to').val());
    });
    $('#changesetsButton').click(function () {
        $('#changesetsButton').prop('checked', true);
        $('#objectsButton').prop('checked', false);
        CURRENT_SELECTION = 'CHANGESETS';
        queryAPI($('.from').val(), $('.to').val());
    });
});

function init() {

    var fromDate = (document.location.href.split('#')[1] !== undefined) ? document.location.href.split('#')[1].split('&')[1] : moment().subtract(8, 'days'),
        toDate = (document.location.href.split('#')[1] !== undefined) ? document.location.href.split('#')[1].split('&')[2] : moment().subtract(1, 'days');

    CURRENT_SELECTION = (document.location.href.split('#')[1] !== undefined) ? (document.location.href.split('#')[1].split('&')[3]).toUpperCase() : 'OBJECTS';

    if (!Date.parse(fromDate) && !(Date.parse(toDate))) {
        alert('Please enter valid dates.');
    }
    if (CURRENT_SELECTION === 'CHANGESETS') {
        $('#changesetsButton').prop('checked', true);
    }
    else {
        $('#objectsButton').prop('checked', true);
    }
    //Call queryAPI with default dates.
    $('.from').val(moment(fromDate).format('YYYY-MM-DD'));
    $('.to').val(moment(toDate).format('YYYY-MM-DD'));
    queryAPI($('.from').val(), $('.to').val());
}

function queryAPI(startDateString, endDateString) {

    $('#chart svg').empty();
    //this superfluous variable can be removed once we can
    //query the backend for weekly stats
    var type;
    var startTime = moment.utc(startDateString) / 1000;
    var endTime = (moment.utc(endDateString) / 1000) + (24 * 60 * 60);
    var diff = moment(endDateString).diff(moment(startDateString), 'days');
    console.log("difference " + diff);

    if (diff === 0) {
        type = 'h';
        TYPE = 'h';
    } else if (diff >= 1 && diff <= 15) {
        type = 'd';
        TYPE = 'd';
    } else if (diff >= 16 && diff <= 30) {
        type = 'd';
        TYPE = 'w';
    } else {
        type = 'm';
        TYPE = 'm';
    }


    document.location.href = document.location.href.split('#')[0] + '#' + type + '&' + startDateString + '&' + endDateString + '&' + CURRENT_SELECTION;

    if (startTime > endTime) {
        alert('Select a range of correct dates');
        return null;
    } else {
        $.ajax({
            dataType: 'json',
            url: settings.host + TYPE + '&' + startTime + '&' + endTime,
            success: function (json) {
                draw(json, startDateString, endDateString);
            }
        });
    }
}

function truncate(str, maxLength, suffix) {
    if (str.length > maxLength) {
        str = str.substring(0, maxLength + 1);
        str = str.substring(0, Math.min(str.length, str.lastIndexOf(' ')));
        str = str + suffix;
    }
    return str;
}

function returnMax(data) {
    var i, j;
    switch (CURRENT_SELECTION) {
    case 'CHANGESETS':
        var changesets = [];
        for (i = 0; i < data.length; i++) {
            for (j = 0; j < data[i].values.length; j++) {
                changesets.push(data[i].values[j].change);
            }
        }
        return _.max(changesets);
    break;
    case 'OBJECTS':
        var objectsModified = [];
        for (i = 0; i < data.length; i++) {
            for (j = 0; j < data[i].values.length; j++) {
                objectsModified.push(data[i].values[j].y);
            }
        }
        return _.max(objectsModified);
    break;
    }
}


function draw(data, startDateString, endDateString) {

    var domainMax = returnMax(data);
    //Map startDate and endDate to the two date strings.
    var startDate = new Date(startDateString),
        endDate = new Date(endDateString);

    //decides colours of the circles
    var c = d3.scale.category20c();

    //define a time scale with the range 0 - width and map the domain startDate,endDate on it
    var noOfTicks = 0;
    var dateTickValues = [];
    var limit;

    switch (TYPE) {
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
    case 'm':
        noOfTicks = endDate.getMonth() - startDate.getMonth();
        limit = endDate.getMonth() - startDate.getMonth();
        for (index = 0; index <= limit; index++) {
            dateTickValues[index] = new Date(JSON.parse(JSON.stringify(startDate)));
            startDate.setMonth(startDate.getMonth() + 1);
        }
        break;
    }

    //If the noOfTicks = 0 for example when startDate = endDate, ensure that
    //at least one tick is present for values to appear under.
    noOfTicks = (noOfTicks < 1) ? 1 : noOfTicks;
    //If the graph has only one tick(when looking at data for just 2015, or when
    //startDate = endDate), then there is only one tick label which means that
    //the right end of the graph has no tick label. To solve this, have two
    //tick labels, and push the same value twice into dateTickValues
    dateTickValues[1] = (dateTickValues.length === 1) ? dateTickValues[0] : dateTickValues [1];

    //SVG margins
    var margin = {
            top: 50,
            right: 200,
            bottom: 0,
            left: 40
        },
        width = ((noOfTicks * 100) < $('body').innerWidth()) ? noOfTicks * 100 : $('body').innerWidth(),
        height = data.length * 72;

    if ((noOfTicks * 100) < $('body').innerWidth()) {
        $('#chart').css({'text-align': 'center'});
    }

    var x = d3.scale.linear()
    .domain([0, noOfTicks])
    .range([0, width]);

    //create axis with the above defined time scale and orient it on top(x axis on top).
    var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(noOfTicks)
    .tickFormat(function (d, i) {
        switch (TYPE) {
        case 'h':
            return d3.time.format.utc('%I%p')(new Date(dateTickValues[i]));
        case 'd':
            return d3.time.format.utc('%d %b')(new Date(dateTickValues[i]));
        case 'm':
            return d3.time.format.utc('%b %Y')(new Date(dateTickValues[i]));
        }
    })
    .orient('top');

    //Append the svg to the body
    var svg = d3.select('#chart svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .style('margin-left', margin.left + 'px')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    //Append the svg axis
    svg.append('g')
    .attr('class', 'x axis')
    .call(xAxis);

    var rScale = d3.scale.linear()
                   .domain([1, domainMax])
                   .range([10, 40]);


    for (var j = 0; j < data.length; j++) {
        var g = svg.append('g');

        var circles = g.selectAll('circle')
                       .data(data[j].values)
                       .enter()
                       .append('circle');

        var text = g.selectAll('text')
                    .data(data[j].values)
                    .enter()
                    .append('text');

        circles
        .attr('cx', function (d, i) {
            return (width / noOfTicks) * i;
        })
        .attr('class', function (d, i) {
            return 'circleColumn' + i;
        })
        .attr('cy', j * 70 + 60)
        .attr('r', function (d) {
            switch (CURRENT_SELECTION) {
            case 'OBJECTS':
                    //This is to avoid the -infinity error.
                if (d.y === 0 || d.y === null){
                    return 1;
                } else {
                    return rScale(d.y);
                }
            case 'CHANGESETS':
                if (d.change === 0 || d.change === null){
                    return 1;
                } else {
                    return rScale(d.change);
                }
            }
        })
        .style('fill', function () {
            return c(j);
        });

        text
        .attr('y', j * 70 + 65)
        .attr('x', function (d, i) {
            return (width / noOfTicks) * i - 5;
        })
        .attr('class', function (d, i) {
            return 'circleTextColumn' + i + ' value';
        })
        .text(function (d) {
            switch (CURRENT_SELECTION) {
            case 'OBJECTS':
                return d.y;
            case 'CHANGESETS':
                return d.change;
            }
        })
        .style('fill', function (d) {
            return c(j);
        })
        .style('display', 'none');

        //Append osm objectors names to the right of the SVG=============================
        g.append('text')
         .attr('y', j * 70 + 65)
         .attr('x', width + 60)
         .attr('class', 'label')
         .text(truncate(data[j].key, 30, '...'))
         .style('fill', function (d) {
             return c(j);
         })
         .on('mouseover', usernameMouseover)
         .on('mouseout', usernameMouseout);

        //Mouseover and Mouseout over ticks============================================
        d3.selectAll('.x')
          .selectAll('.tick.major')
          .on('mouseover', tickMouseover);

        d3.selectAll('.x')
          .selectAll('.tick.major')
          .on('mouseout', tickMouseout);
        //=============================================================================
    }


    function tickMouseover(p, i) {
        d3.selectAll('.circleColumn' + i).style('display', 'none');
        d3.selectAll('.circleTextColumn' + i).style('display', 'block');
    }

    function tickMouseout(p, i) {
        d3.selectAll('.circleColumn' + i).style('display', 'block');
        d3.selectAll('.circleTextColumn' + i).style('display', 'none');
    }

    function usernameMouseover() {
        var g = d3.select(this).node().parentNode;
        d3.select(g).selectAll('circle').style('display', 'none');
        d3.select(g).selectAll('.value').style('display', 'block');
    }

    function usernameMouseout() {
        var g = d3.select(this).node().parentNode;
        d3.select(g).selectAll('circle').style('display', 'block');
        d3.select(g).selectAll('text.value').style('display', 'none');
    }
}

