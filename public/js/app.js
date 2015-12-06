var CURRENT_SELECTION = 'objects';
var TYPE = 'D';

$(document).ready(function () {

    init();

    var type, fromDate, toDate;

    //Call queryAPI() when from and to change.
    $('.from, .to').on('change', function () {

        fromDate = $('.from').val();
        toDate = $('.to').val();
        type = calculateDuration(fromDate, toDate);

        queryAPI(fromDate, toDate, type);
    });


    $('#objectsButton').click(function () {

        $('#objectsButton').prop('checked', true);
        $('#changesetsButton').prop('checked', false);

        CURRENT_SELECTION = 'objects';

        fromDate = $('.from').val();
        toDate = $('.to').val();
        type = calculateDuration(fromDate, toDate);

        queryAPI(fromDate, toDate, type);
    });

    $('#changesetsButton').click(function () {
        $('#changesetsButton').prop('checked', true);
        $('#objectsButton').prop('checked', false);
        CURRENT_SELECTION = 'changesets';

        fromDate = $('.from').val();
        toDate = $('.to').val();
        type = calculateDuration(fromDate, toDate);

        queryAPI(fromDate, toDate, type);
    });

});

function calculateDuration(fromDate, toDate) {
    var timeDifference = moment.utc(toDate).diff(moment.utc(fromDate), 'days');
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

    var fromDate = urlObjects.from,
        toDate = urlObjects.to;

    CURRENT_SELECTION = urlObjects.stats;
    var type  = calculateDuration(fromDate, toDate);

    //invalid date/range selection error handling.
    //Should this be moved?
    if ((!moment.utc(fromDate) && !moment.utc(toDate)) || moment.utc(fromDate).diff(moment.utc(toDate)) > 0) {
        alert('Please enter a valid date range');
    }

    //Fix which button appears clicked.
    if (CURRENT_SELECTION === 'changesets') {
        $('#changesetsButton').prop('checked', true);
    } else {
        $('#objectsButton').prop('checked', true);
    }

    //Call queryAPI with default dates.
    $('.from').val(moment.utc(fromDate).format('YYYY-MM-DD'));
    $('.to').val(moment.utc(toDate).format('YYYY-MM-DD'));
    queryAPI($('.from').val(), $('.to').val(), type);
}

function queryAPI(startDateString, endDateString, type) {

    //this superfluous variable can be removed once we can
    //query the backend for weekly stats
    var startTime = moment.utc(startDateString) / 1000;
    var endTime = (moment.utc(endDateString) / 1000) + (24 * 60 * 60);


    document.location.href = document.location.href.split('#')[0] + '#' + TYPE + '&from=' + startDateString + '&to=' + endDateString + '&stats=' + CURRENT_SELECTION;


    $.ajax({
        dataType: 'json',
        url: settings.host + type + '&' + startTime + '&' + endTime,
        success: function (json) {
            draw(json, startDateString, endDateString);
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

function generateWeeklyStats(data, startDateString, endDateString) {
    var weeklyData = [],
        i, j,
        weekBeginnings = [];

    var noOfWeeks = Math.floor((moment.utc(endDateString).diff(moment.utc(startDateString), 'days')) / 7);

    for (i = 0; i <= noOfWeeks; i++) {
        weekBeginnings[i] = [moment.utc(startDateString).add(i * 7, 'days'), moment.utc(startDateString).add((i + 1) * 7, 'days')];
    }

    // console.log("weekBeginnings " + JSON.stringify(weekBeginnings));

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
            // console.log('i ', i, ' weekBeginnings[i] ', weekBeginnings[i][1], ' data[index].values[i].x ', data[index].values[i].x, ' difference ', moment.utc(weekBeginnings[i][1]).diff(moment.utc(data[index].values[i].x), 'days'))
        }
    });

    return weeklyData;
}


function draw(data, startDateString, endDateString) {
    $('#chart svg').empty();
    //Map startDate and endDate to the two date strings.
    var startDate = new Date(startDateString),
        endDate = new Date(endDateString);

    //decides colours of the circles
    var c = d3.scale.category10();

    //define a time scale with the range 0 - width and map the domain startDate,endDate on it
    var noOfTicks = 0;
    var dateTickValues = [];
    var limit;

    if (TYPE === 'w') {
        data = generateWeeklyStats(data, startDateString, endDateString);
    }

    var domainMax = returnMax(data);

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
        limit = noOfTicks;
        for (index = 0; index <= limit; index++) {
            dateTickValues[index] = new Date(JSON.parse(JSON.stringify(startDate)));
            startDate.setMonth(startDate.getMonth() + 1);
        }
        break;
    case 'w':
        console.log('w', 'startDateString ', moment.utc(startDateString).add(0, 'days'), 'endDateString ', endDateString);
        limit = (moment.utc(endDateString).diff(moment.utc(startDateString), 'days'));
        noOfTicks = Math.floor(limit / 7);
        noOfTicks = (limit % 7 === 0) ? (noOfTicks - 1) : noOfTicks;
        console.log(noOfTicks);
        for (index = 0; index <= noOfTicks; index++) {
            dateTickValues[index] = [moment.utc(startDateString).add(index * 7, 'days'), moment.utc(startDateString).add((index + 1) * 7, 'days')];
        }
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

