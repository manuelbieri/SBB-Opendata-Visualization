/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Organization and style inspired by:
 * https://bost.ocks.block/mike/chart/
 *
 */
let delayCutoff = 3;

function bubbleChart() {
    // Constants for sizing
    let width = 940;
    let height = 600;

    // Locations to move bubbles towards, depending
    // on which view mode is selected.
    let center = {x: width / 2, y: height / 2};

    let xCenters = {
        0: {x: width / 3},
        1: {x: 2 * width / 3}
    };

    let yCenters = {
        0: {y: height / 3},
        1: {y: height / 3 * 2}
    };

    // custom variables
    /**
     * Collects all valid dates.
     * @type {Set<any>}
     */
    const dates = new Set();

    // X locations of the titles.
    let titleX = {
        0: 30,
        1: xCenters["0"].x,
        2: xCenters["1"].x
    };

    // X locations of the titles.
    let titleY = {
        0: 20,
        1: yCenters["0"].y - 30,
        2: yCenters["1"].y + 30
    }

    // @v4 strength to apply to the position forces
    let forceStrength = 0.03;

    // These will be set in create_nodes and create_vis
    let svg = null;
    let bubbles = null;
    let nodes = [];

    // Charge function that is called for each node.
    // As part of the ManyBody force.
    // This is what creates the repulsion between nodes.
    //
    // Charge is proportional to the diameter of the
    // circle (which is stored in the radius attribute
    // of the circle's associated data.
    //
    // This is done to allow for accurate collision
    // detection with nodes of different sizes.
    //
    // Charge is negative because we want nodes to repel.
    // @v4 Before the charge was a stand-alone attribute
    //  of the force layout. Now we can use it as a separate force!
    function charge(d) {
        return -Math.pow(d.radius, 2.0) * forceStrength;
    }

    // Here we create a force layout and
    // @v4 We create a force simulation now and
    //  add forces to it.
    let simulation = d3.forceSimulation()
        .velocityDecay(0.2)
        .force('x', d3.forceX().strength(forceStrength).x(center.x))
        .force('y', d3.forceY().strength(forceStrength).y(center.y))
        .force('charge', d3.forceManyBodyReuse().strength(charge))
        .on('tick', ticked);

    // @v4 Force starts up automatically,
    //  which we don't want as there aren't any nodes yet.
    simulation.stop();

    // Nice looking colors - no reason to buck the trend
    // @v4 scales now have a flattened naming scheme
    let fillColorLine = d3.scaleOrdinal()
        .domain(['IC6', 'IC61', 'IC1', 'IC8'])
        .range(['red', 'orange', 'blue', 'green']);

    let fillColorRollingStock = d3.scaleOrdinal()
        .domain(['IC2000', 'FVDosto', 'ICN', 'Eurocity'])
        .range(['red', 'orange', 'blue', 'green']);


    /*
     * This data manipulation function takes the raw data from
     * the CSV file and converts it into an array of node objects.
     * Each node will store data and visualization diffs to visualize
     * a bubble.
     *
     * rawData is expected to be an array of data objects, read in from
     * one of d3's loading functions like d3.csv.
     *
     * This function returns the new node array, with a node in that
     * array for each element in the rawData input.
     */
    function calcDelay(e) {
        return e.ANKUNFTSZEIT - e.AN_PROGNOSE;
    }

    function calcRadius(diff) {
        if (diff > -delayCutoff * 60 * 1000) return 2
        else return Math.log10(Math.abs(diff));
    }

    function createNodes(rawData, dateRange) {
        // Use the max total_amount in the data as the max in the scale's domain
        // note we have to ensure the total_amount is a number.
        for (let i = 0; i < rawData.length; i++) {
            rawData[i].ANKUNFTSZEIT = new Date(rawData[i].ANKUNFTSZEIT);
            rawData[i].AN_PROGNOSE = new Date(rawData[i].AN_PROGNOSE);
            rawData[i].BETRIEBSTAG = new Date(rawData[i].BETRIEBSTAG);
            dates.add(rawData[i].BETRIEBSTAG.getDate() + "-" + (rawData[i].BETRIEBSTAG.getMonth() + 1) + "-" + rawData[i].BETRIEBSTAG.getFullYear());
        }

        rawData = rawData.filter(d => {
            console.assert(dateRange.date1 != null && dateRange.date2 != null)
            let inFirstRange = dateRange.date1.getTime() <= d.BETRIEBSTAG.getTime() && d.BETRIEBSTAG.getTime() <= dateRange.date2.getTime();
            if (dateRange.date3 != null && dateRange.date4 != null) {
                return inFirstRange || dateRange.date3.getTime() <= d.BETRIEBSTAG.getTime() && d.BETRIEBSTAG.getTime() <= dateRange.date4.getTime();
            } else {
                return inFirstRange;
            }
        })

        setUpDateSlider(Array.from(dates), '#slider1');
        setUpDateSlider(Array.from(dates), '#slider2');
        parseSliderDates();

        // Use map() to convert raw data into node data.
        // Checkout http://learnjsdata.com/ for more on
        // working with data.
        let myNodes = rawData.map(function (d) {
            let diff = calcDelay(d);
            return {
                ANKUNFTSZEIT: d.ANKUNFTSZEIT,
                AN_PROGNOSE: d.AN_PROGNOSE,
                LINIEN_ID: d.LINIEN_ID,
                diff: diff,
                radius: calcRadius(diff),
                LINIEN_TEXT: d.LINIEN_TEXT,
                block: d.block,
                BETRIEBSTAG: d.BETRIEBSTAG,
                globalstrahlung: d.globalstrahlung,
                luftdruck: d.luftdruck,
                luftfeuchtigkeit: d.luftfeuchtigkeit,
                lufttemperatur: d.lufttemperatur,
                niederschlag: d.niederschlag,
                schnee: d.schnee,
                sonnenschein: d.sonnenschein,
                x: width / 2 + (Math.random() * 40 - 20),
                y: height / 2 + (Math.random() * 40 - 20)
            };
        });

        // sort them to prevent occlusion of smaller nodes.
        myNodes.sort(function (a, b) {
            return b.diff - a.diff;
        });

        return myNodes;
    }

    /*
     * Main entry point to the bubble chart. This function is returned
     * by the parent closure. It prepares the rawData for visualization
     * and adds an svg element to the provided selector and starts the
     * visualization creation process.
     *
     * selector is expected to be a DOM element or CSS selector that
     * points to the parent element of the bubble chart. Inside this
     * element, the code will add the SVG continer for the visualization.
     *
     * rawData is expected to be an array of data objects as provided by
     * a d3 loading function like d3.csv.
     */
    let chart = function chart(selector, rawData, args) {
        // convert raw data into nodes data
        nodes = createNodes(rawData, args.dates);
        // Create a SVG element inside the provided selector
        // with desired size.
        svg = d3.select(selector)
            .append('svg')
            .attr('width', width)
            .attr('height', height)

        // Bind nodes data to what will become DOM elements to represent them.
        bubbles = svg.selectAll('.bubble')
            .data(nodes, function (d) {
                return d.LINIEN_ID;
            });

        // Create new circle elements each with class `bubble`.
        // There will be one circle.bubble for each object in the nodes array.
        // Initially, their radius (r attribute) will be 0.
        // @v4 Selections are immutable, so lets capture the
        //  enter selection to apply our transtition to below.
        let bubblesE = bubbles.enter().append('circle')
            .classed('bubble', true)
            .attr('r', 0)
            .attr('fill', d => {
                return getColor(d, isRollingStockColor())
            })
            .attr('stroke', d => {
                return d3.rgb(getColor(d, isRollingStockColor())).darker();
            })
            .attr('stroke-width', 2)
            .on('click', showDetail)
            .on('mouseover', (e, d) => {
                console.log(e.currentTarget);
                console.log(this);
                console.log(d)
            });


        // @v4 Merge the original empty selection and the enter selection
        bubbles = bubbles.merge(bubblesE);

        // Fancy transition to make bubbles appear, ending with the
        // correct radius
        bubbles.transition()
            .duration(2000)
            .attr('r', function (d) {
                return d.radius;
            });

        // Set the simulation's to our newly created nodes array.
        // @v4 Once we set the nodes, the simulation will start running automatically!
        simulation.nodes(nodes);

        // Set initial layout to single BETRIEBSTAG.
        GroupBubbles();
    };

    /*
     * Callback function that is called after every tick of the
     * force simulation.
     * Here we do the acutal repositioning of the SVG circles
     * based on the current x and y diffs of their bound node data.
     * These x and y diffs are modified by the force simulation.
     */
    function ticked() {
        bubbles
            .attr('cx', function (d) {
                return d.x;
            })
            .attr('cy', function (d) {
                return d.y;
            });
    }

    /*
     * Provides a x diff for each node to be used with the split by year
     * x force.
     */
    function nodeXPos(d, args) {
        return xCenters[calcCategory(args.category1, args.cutoff1, d)].x;
    }

    function nodeYPos(d, args) {
        return yCenters[calcCategory(args.category2, args.cutoff2, d)].y;
    }

    function calcCategory(criteria, cutoff, d) {
        if (criteria === "Sonnenschein") return compare(d.sonnenschein, cutoff);
        else if (criteria === "Schnee") return compare(d.schnee, cutoff);
        else if (criteria === "Luftfeuchtigkeit") return compare(d.luftfeuchtigkeit, cutoff);
        else if (criteria === "Luftdruck") return compare(d.luftdruck, cutoff);
        else if (criteria === "Lufttemperatur") return compare(d.lufttemperatur, cutoff);
        else if (criteria === "Niederschlag") return compare(d.niederschlag, cutoff);
        else if (criteria === "Globalstrahlung") return compare(d.schnee, cutoff);
    }

    function compare(diff, cutoff) {
        if (diff > cutoff) return 1;
        else return 0;
    }

    /*
     * Sets visualization in "single BETRIEBSTAG mode".
     * The year labels are hidden and the force layout
     * tick function is set to move all nodes to the
     * center of the visualization.
     */
    function GroupBubbles() {
        hideTitles();

        // @v4 Reset the 'x' force to draw the bubbles to the center.
        simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
        simulation.force('y', d3.forceY().strength(forceStrength).y(center.y));

        // @v4 We can reset the alpha diff and restart the simulation
        simulation.alpha(1).restart();
    }


    /*
     * Sets visualization in "split by year mode".
     * The year labels are shown and the force layout
     * tick function is set to move nodes to the
     * yearCenter of their data's year.
     */
    function splitBubbles(args) {
        showTitles(args);

        // @v4 Reset the 'x' force to draw the bubbles to their year xCenters
        simulation.force('x', d3.forceX().strength(forceStrength).x(d => {
            return nodeXPos(d, args)
        }));
        simulation.force('y', d3.forceY().strength(forceStrength).y(d => {
            return nodeYPos(d, args)
        }));

        // @v4 We can reset the alpha diff and restart the simulation
        simulation.alpha(1).restart();
    }

    /*
     * Hides Year title displays.
     */
    function hideTitles() {
        svg.selectAll('.title').remove();
    }

    /*
     * Shows Year title displays.
     */
    function showTitles(args) {
        // Another way to do this would be to create
        // the year texts once and then just hide them.
        svg.selectAll('.title').remove();
        let years = svg.selectAll('text.title')
            .data([
                {x: 0, y: 1, title: args.category2, cutoff: args.cutoff2, filler: 'Weniger '},
                {x: 0, y: 2, title: args.category2, cutoff: args.cutoff2, filler: 'Mehr '},
                {x: 1, y: 0, title: args.category1, cutoff: args.cutoff1, filler: 'Weniger '},
                {x: 2, y: 0, title: args.category1, cutoff: args.cutoff1, filler: 'Mehr '}
            ]);

        years.enter().append('text')
            .attr('class', 'title')
            .attr('text-anchor', d => {
                return (d.x === 0 ? 'left' : 'middle')
            })
            .attr('transform', d => {
                return 'translate(' + titleX[d.x] + ',' + titleY[d.y] + ') rotate(' + (d.x === 0 ? '-90' : '0') + ')';
            })
            .text(function (d) {
                return d.filler + d.title + ' als ' + d.cutoff + getUnit(d.title, true);
            });
    }

    /*
     * Function called on mouseover to display the
     * details of a bubble in the tooltip.
     */
    function showDetail(d) {
        document.getElementById("line").innerHTML = d.LINIEN_TEXT;
        document.getElementById("lineNumber").innerHTML = d.LINIEN_ID;
        document.getElementById("arrival").innerHTML = d.ANKUNFTSZEIT.getHours().toString().padStart(2, '0') + ':' + d.ANKUNFTSZEIT.getMinutes().toString().padStart(2, '0');
        document.getElementById("dayOfService").innerHTML = d.ANKUNFTSZEIT.getDate() + "-" + (d.ANKUNFTSZEIT.getMonth() + 1) + "-" + d.ANKUNFTSZEIT.getFullYear();
        document.getElementById("delay").innerHTML = d.AN_PROGNOSE.getHours().toString().padStart(2, '0') + ':' + d.AN_PROGNOSE.getMinutes().toString().padStart(2, '0') + "<br>(" + (d.diff >= -delayCutoff ? "Keine Verspätung" : dateDiffToString(Math.abs(d.diff))) + ")";
        document.getElementById("sunshine").innerHTML = d.sonnenschein;
        document.getElementById("rainfall").innerHTML = d.niederschlag;
        document.getElementById("snow").innerHTML = d.schnee;
        document.getElementById("temperature").innerHTML = d.lufttemperatur;
        document.getElementById("humidity").innerHTML = d.luftfeuchtigkeit;
        document.getElementById("air_pressure").innerHTML = d.luftdruck;
        updateCarousel(d.block);
    }

    function getColor(d, colorRollingStock) {
        if (colorRollingStock) return fillColorRollingStock(getTrainType(d.block));
        else return fillColorLine(d.LINIEN_TEXT);
    }

    /*
     * Externally accessible function (this is attached to the
     * returned chart function). Allows the visualization to toggle
     * between "single BETRIEBSTAG" and "split by year" modes.
     *
     * displayName is expected to be a string and either 'year' or 'all'.
     */
    chart.toggleDisplay = function (doSplit, args) {
        if (doSplit) {
            splitBubbles(args);
        } else {
            GroupBubbles(args);
        }
    };

    chart.changeColor = function (colorRollingStock) {
        bubbles
            .attr('fill', d => {
                return getColor(d, colorRollingStock)
            })
            .attr('stroke', d => {
                return d3.rgb(getColor(d, colorRollingStock)).darker()
            });
    }

    chart.changeDelayCutoff = function (newDelayCutoff) {
        delayCutoff = newDelayCutoff;
        bubbles.attr('r', d => {
            return calcRadius(d)
        })
    }

    // return the chart function from closure.
    return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

let myBubbleChart = bubbleChart();
/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #vis div.
 */
function display(error, data, args) {
    if (error) {
        console.log(error);
    }
    myBubbleChart('#canvas', data, args);
    if (args.category1 !== undefined) {
        myBubbleChart.toggleDisplay(true, args);
    }
}

function changeChart(doSplit, args) {
    if (doSplit) myBubbleChart.toggleDisplay(doSplit, args);
    else loadChart(args);
}

function changeColors(colorRollingStock) {
    myBubbleChart.changeColor(colorRollingStock);
}

function changeDelayCutoff(newDelayCutoff, args) {
    delayCutoff = newDelayCutoff;
}

// Load the data.
function loadChart(args) {
    $("#canvas").empty();
    d3.json('data/sbb_data_merged_v1.json', (e, d) => {
        display(e, d, args);
    });
}

loadChart({dates: {date1: new Date(2021, 0, 1), date2: new Date(2021, 0, 3), date3: null, date4: null}});
changedInputDates();

// data related functions
function getUnit(criteria, forSVG) {
    let unit = null;
    if (criteria === "Sonnenschein") unit = "min";
    else if (criteria === "Schnee") unit = "cm";
    else if (criteria === "Luftfeuchtigkeit") unit = "%";
    else if (criteria === "Luftdruck") unit = "hPa";
    else if (criteria === "Lufttemperatur") unit = "°C";
    else if (criteria === "Niederschlag") unit = "mm";
    else if (criteria === "Globalstrahlung") unit = forSVG ? "W/m2" : "W/m<sup>2</sup>";
    console.assert(unit != null);
    return unit;
}

function dateDiffToString(diff) {
    let min = Math.floor(diff / 60000);
    let sec = Math.floor((diff - min * 60000) / 1000);
    return min + ' Min ' + sec + ' Secs';
}

function getTrainType(block) {
    block = block.toLowerCase();
    if (block.includes("2e")) return "IC2000";
    else if (block.includes("rabde502")) return "FVDosto";
    else if (block.includes("icn")) return "ICN";
    else return "Eurocity";
}

function updateCarousel(block) {
    let trainType = getTrainType(block);
    document.getElementById("imageCarousel1").src = "Graphics/Images/Trains/" + trainType + "/1.webp"
    document.getElementById("imageCarousel2").src = "Graphics/Images/Trains/" + trainType + "/2.webp"
    document.getElementById("imageCarousel3").src = "Graphics/Images/Trains/" + trainType + "/3.webp"
    document.getElementById("imageCarousel4").src = "Graphics/Images/Trains/" + trainType + "/4.webp"
}
