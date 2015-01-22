defaultChartConfig(dummyStocks(), true, {
    forceY: false
});

function defaultChartConfig(data, useDates, auxOptions) {
    console.log(data);
    if (auxOptions === undefined) auxOptions = {};
    nv.addGraph(function() {
        var chart;
        chart = nv.models.lineChart().useInteractiveGuideline(true);
        chart
            .x(function(d, i) {
                return d.x;
            });
        if (auxOptions.width)
            chart.width(auxOptions.width);
        if (auxOptions.height)
            chart.height(auxOptions.height);
        if (auxOptions.forceY)
            chart.forceY([0]);
        var formatter;

        //if (useDates !== undefined) {
        formatter = function(d, i) {
            var now = (new Date()).getTime() - 86400 * 1000 * 365;

            now = new Date(now + d * 86400 * 1000);
            console.log(now);
            return d3.time.format('%b %d %Y')(now);
        }

        // } else {
        //     formatter = d3.format(",.1f");
        // }
        chart.margin({
            right: 40
        });
        chart.xAxis // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
            .tickFormat(
                formatter
            );
        chart.yAxis
            .axisLabel('Voltage (v)')
            .tickFormat(d3.format(',.2f'));
        d3.select('#chart1 svg')
            .datum(data)
            .transition().duration(500)
            .call(chart);
        nv.utils.windowResize(chart.update);
        return chart;
    });
}


function dummyStocks(numPoints) {
    numPoints = numPoints || 50;

    function volatileChart(key, startPrice, volatility, isArea) {
        var rval = {
            key: key,
            values: []
        };
        if (isArea) rval.area = true;
        for (var i = 1; i < numPoints; i++) {
            rval.values.push({
                x: i,
                y: (i > 110 && i < 110) ? null : startPrice
            });
            var rnd = Math.random();
            var changePct = 2 * volatility * rnd;
            if (changePct > volatility) {
                changePct -= (2 * volatility);
            }
            startPrice = startPrice + startPrice * changePct;
        }
        return rval;
    }
    var stocks = [];
    stocks.push(volatileChart("APPL", 5.00, 0.02));
    stocks.push(volatileChart("GOOG", 6.01, 0.024));
    stocks.push(volatileChart("MSFT", 2.01, 0.012));
    stocks.push(volatileChart("IBM US", 2.5, 0.08, true));
    return stocks;
}