var CURRENT_SELECTION = 'objects';
var TYPE = 'D';

$(document).ready(function () {

    init();

    var type, from, to;

    //Call queryAPI() when from and to change.
    $('.from, .to').on('change', function () {

        from = $('.from').val();
        to = $('.to').val();
        type = calculateDuration(from, to);

        queryAPI(from, to, type);
    });


    $('#objectsButton').click(function () {

        $('#objectsButton').prop('checked', true);
        $('#changesetsButton').prop('checked', false);

        CURRENT_SELECTION = 'objects';

        from = $('.from').val();
        to = $('.to').val();
        type = calculateDuration(from, to);

        queryAPI(from, to, type);
    });

    $('#changesetsButton').click(function () {
        $('#changesetsButton').prop('checked', true);
        $('#objectsButton').prop('checked', false);
        CURRENT_SELECTION = 'changesets';

        from = $('.from').val();
        to = $('.to').val();
        type = calculateDuration(from, to);

        queryAPI(from, to, type);
    });

});

function calculateDuration(from, to) {
    var timeDifference = moment.utc(to).diff(moment.utc(from), 'days');
    var type;

    if (timeDifference === 0) {
        type = 'h';
        TYPE = 'h';
    } else if (timeDifference >= 1 && timeDifference <= 14) {
        type = 'd';
        TYPE = 'd';
    } else if (timeDifference >= 15 && timeDifference <= 30) {
        type = 'd';
        TYPE = 'w';
    } else {
        type = 'm';
        TYPE = 'm';
    }

    return type;
}

function parseURL() {
    var result = {
    };

    switch (document.location.href.split('#')[1]) {
    case undefined:
        result.from = moment.utc().subtract(8, 'days');
        result.to = moment.utc().subtract(1, 'days');
        result.stats = 'objects';
        break;
    default :
        result.from = document.location.href.split('&from=')[1].split('&to=')[0];
        result.to = document.location.href.split('&to=')[1].split('&stats=')[0];
        result.stats = document.location.href.split('&stats=')[1];
    }
    return result;
}

function init() {

    var urlObjects = parseURL();

    var from = urlObjects.from,
        to = urlObjects.to;

    CURRENT_SELECTION = urlObjects.stats;
    var type  = calculateDuration(from, to);

    //invalid date/range selection error handling.
    //Should this be moved?
    if ((!moment.utc(from) && !moment.utc(to)) || moment.utc(from).diff(moment.utc(to)) > 0) {
        alert('Please enter a valid date range');
    }

    //Fix which button appears clicked.
    if (CURRENT_SELECTION === 'changesets') {
        $('#changesetsButton').prop('checked', true);
    } else {
        $('#objectsButton').prop('checked', true);
    }

    //Add the dates in the from/to boxes.
    $('.from').val(moment.utc(from).format('YYYY-MM-DD'));
    $('.to').val(moment.utc(to).format('YYYY-MM-DD'));

    //Call queryAPI with default dates.
    queryAPI($('.from').val(), $('.to').val(), type);
}

function queryAPI(from, to, type) {

    //this superfluous variable can be removed once we can
    //query the backend for weekly stats
    var startTime = moment.utc(from) / 1000;
    var endTime = moment.utc(to).add(1, 'days') / 1000;


    document.location.href = document.location.href.split('#')[0] +
                            '#' + TYPE + '&from=' + from + '&to=' +
                            to + '&stats=' + CURRENT_SELECTION;

    $.ajax({
        dataType: 'json',
        url: settings.host + type + '&' + startTime + '&' + endTime,
        success: function (json) {
            draw(json, from, to);
        }
    });
}

function returnMax(data) {
    var i, j;
    switch (CURRENT_SELECTION) {
    case 'changesets':
        var changesets = [];
        for (i = 0; i < data.length; i++) {
            for (j = 0; j < data[i].values.length; j++) {
                changesets.push(data[i].values[j].change);
            }
        }
        return _.max(changesets);
    case 'objects':
        var objectsModified = [];
        for (i = 0; i < data.length; i++) {
            for (j = 0; j < data[i].values.length; j++) {
                objectsModified.push(data[i].values[j].y);
            }
        }
        return _.max(objectsModified);
    }
}

function generateWeeklyStats(data, from, to) {
    var weeklyData = [],
        i, j,
        weekBeginnings = [];

    var noOfWeeks = Math.floor((moment.utc(to).diff(moment.utc(from), 'days')) / 7);

    for (i = 0; i <= noOfWeeks; i++) {
        weekBeginnings[i] = [moment.utc(from).add(i * 7, 'days'), moment.utc(from).add((i + 1) * 7, 'days')];
    }

    data.forEach(function (dataRow, index) {
        weeklyData[index] = {};
        weeklyData[index].values = [];
        weeklyData[index].key = dataRow.key;
        weeklyData[index].color = dataRow.color;
        weeklyData[index].iduser = dataRow.iduser;
        for (i = 0; i <= noOfWeeks; i++) {
            weeklyData[index].values[i] = {};
            weeklyData[index].values[i].x = d3.time.format.utc('%d/%m')(new Date(weekBeginnings[i][0])) +
                                            '-' + d3.time.format.utc('%d/%m')(new Date(weekBeginnings[i][1]));
            weeklyData[index].values[i].y = 0;
            weeklyData[index].values[i].change = 0;

            for (j = 0; j < data[index].values.length; j++) {
                if ((moment.utc(data[index].values[j].x).diff(moment.utc(weekBeginnings[i][0]), 'days') >= 0) && (moment.utc(data[index].values[j].x).diff(moment.utc(weekBeginnings[i][1]), 'days') <= 0)) {
                    weeklyData[index].values[i].y += data[index].values[j].y;
                    weeklyData[index].values[i].change += data[index].values[j].change;
                }
            }
        }
    });

    return weeklyData;
}


function draw(data, from, to) {
    $('#chart svg').empty();
    //Map from and to to the two date strings.
    var from = new Date(from),
        to = new Date(to);

    //decides colours of the circles
    var c = d3.scale.category10();

    //define a time scale with the range 0 - width and map the domain from,to on it
    var noOfTicks = 0;
    var dateTickValues = [];
    var limit;

    if (TYPE === 'w') {
        data = generateWeeklyStats(data, from, to);
    }

    var domainMax = returnMax(data);

    switch (TYPE) {
    case 'h':
        noOfTicks = 23;
        limit = 23;
        for (var index = 0; index <= limit; index++) {
            //new Date(JSON.parse(JSON.stringify(from))) done to shallow copy
            //the from value into dateTickValues. If
            //dateTickValues[index] = from; is done
            //It amounts to a deep copy. Array elements get overwritten with the
            //latest value of from which is pointless.
            dateTickValues[index] = new Date(JSON.parse(JSON.stringify(from)));
            from.setHours(from.getHours() + 1);
        }
        break;
    case 'd':
        limit = 0;
        for (index = from.getTime(); index <= to.getTime(); ) {
            dateTickValues[limit] = new Date(JSON.parse(JSON.stringify(from)));
            from.setDate(from.getDate() + 1);
            index = from.getTime();
            limit += 1;
        }
        noOfTicks = limit - 1;
        break;
    case 'm':
        noOfTicks = to.getMonth() - from.getMonth();
        limit = noOfTicks;
        for (index = 0; index <= limit; index++) {
            dateTickValues[index] = new Date(JSON.parse(JSON.stringify(from)));
            from.setMonth(from.getMonth() + 1);
        }
        break;
    case 'w':
        console.log('w', 'from ', moment.utc(from).add(0, 'days'), 'to ', to);
        limit = (moment.utc(to).diff(moment.utc(from), 'days'));
        noOfTicks = Math.floor(limit / 7);
        noOfTicks = (limit % 7 === 0) ? (noOfTicks - 1) : noOfTicks;
        console.log(noOfTicks);
        for (index = 0; index <= noOfTicks; index++) {
            dateTickValues[index] = [moment.utc(from).add(index * 7, 'days'), moment.utc(from).add((index + 1) * 7, 'days')];
        }
    }

    //If the noOfTicks = 0 for example when from = to, ensure that
    //at least one tick is present for values to appear under.
    noOfTicks = (noOfTicks < 1) ? 1 : noOfTicks;
    //If the graph has only one tick(when looking at data for just 2015, or when
    //from = to), then there is only one tick label which means that
    //the right end of the graph has no tick label. To solve this, have two
    //tick labels, and push the same value twice into dateTickValues
    dateTickValues[1] = (dateTickValues.length === 1) ? dateTickValues[0] : dateTickValues [1];

    //SVG margins
    var margin = {
            top: 50,
            right: 200,
            bottom: 0,
            left: 45
        }, width, rangeMax, height;

    if (noOfTicks > 11) {
        width = (noOfTicks * 60);
        rangeMax = 30;
        height = data.length * 62;
    } else {
        width = noOfTicks * 100;
        rangeMax = 40;
        height = data.length * 82;
    }

    if ((noOfTicks * 100) < $('body').innerWidth()) {
        $('#chart').css({'text-align': 'center'});
    }

    $('#chart svg').each(function () { $(this)[0].setAttribute('viewBox', '0 0 ' + (width) + ' ' + height); });

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
        case 'w':
            return d3.time.format.utc('%d/%m')(new Date(dateTickValues[i][0])) + "-" + d3.time.format.utc('%d/%m')(new Date(dateTickValues[i][1]));
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
                   .domain([0, domainMax])
                   .range([2, rangeMax]);


    for (var j = 0; j < data.length; j++) {
        var g = svg.append('g');

        for (var i = 0; i < data[j].values.length; i++) {
            var gChild = g.append('g');
            var nodeData = getStats(j, i);
            gChild.append('circle')
                  .attr('cx', i * (width / noOfTicks))
                  .attr('cy', j * rangeMax * 2 + 55)
                  .attr('class', 'circle')
                  .attr('r', rScale(nodeData))
                  .style('fill', c(j))
                  .style('opacity', 0.5);

            gChild.append('text')
                  .attr('y', j * rangeMax * 2 + 60)
                  .attr('x', i * (width / noOfTicks))
                  .attr('text-anchor', 'middle')
                  .attr('class', 'circleText')
                  .text(nodeData)
                  .style('fill', '#25383C');
                  // .style('font-weight', 'bold');
        }

        //Append osm objectors names to the right of the SVG=============================
            g.append('text')
             .attr('y', j * rangeMax * 2 + 60)
             .attr('x', width + rangeMax + 1)
             .attr('class', 'label')
             .text(data[j].key)
             .style('fill', c(j));
    }

    function getStats(j, i) {
        switch (CURRENT_SELECTION) {
        case 'objects':
            return (data[j].values[i].y > 0) ? data[j].values[i].y : '';
        case 'changesets':
            return (data[j].values[i].change > 0) ? data[j].values[i].change : '';
        }
    }

}

