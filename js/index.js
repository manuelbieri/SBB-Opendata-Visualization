//const requestData = new Request('https://gist.githubusercontent.com/manuelbieri/5a20c884020ed05e89b3426e78ae97c5/raw/ecd1e2bf9e3df8f72caf558fe24144675e39813e/sbb_data_preview.txt');
//const requestData = new Request('data/sbb_data_preview.json')
const requestData = new Request('data/sbb_data_v2.json')

const delayCutoff = 180000;

const dates = new Set();
const trains = new Set();

let data = d3.json(requestData).then(d => {
    let tmp = [];
    for (let i = 0 ; i < d.length ; i++){
        let betriebstag = new Date(d[i].BETRIEBSTAG);
        dates.add(betriebstag.getDate() + "-" + (betriebstag.getMonth() + 1) + "-" + betriebstag.getFullYear());
        trains.add(d[i].block);
        tmp.push({
            ANKUNFTSZEIT: new Date(d[i].ANKUNFTSZEIT),
            AN_PROGNOSE: new Date(d[i].AN_PROGNOSE),
            BETRIEBSTAG: betriebstag,
            LINIEN_ID: d[i].LINIEN_ID,
            LINIEN_TEXT: d[i].LINIEN_TEXT,
            block: d[i].block,
            globalstrahlung: d[i].globalstrahlung,
            luftdruck: d[i].luftdruck,
            luftfeuchtigkeit: d[i].luftfeuchtigkeit,
            lufttemperatur: d[i].lufttemperatur,
            niederschlag: d[i].niederschlag,
            schnee: d[i].schnee,
            sonnenschein: d[i].sonnenschein,
        })
    }
    //console.log(trains);
    setUpDateSlider(Array.from(dates));
    return tmp;
});

let svg = d3.select('svg');

let bbox = svg.node().getBoundingClientRect();
let width = bbox.width;
let height = bbox.height;

let group = svg.append('g').attr('transform', 'translate(0,150)');

let colorLinie = {'IC6':'red', 'IC61':'orange', 'IC1': 'blue', 'IC8': 'green'}
let xCenter = [200, 400]
let yCenter = [100, 300]


function draw(criteria1, cutoff1, criteria2, cutoff2, dateRange){
    data.then(values => {
        //console.log(values.length); https://bl.ocks.org/alokkshukla/3d6be4be0ef9f6977ec6718b2916d168
        let d = values.filter(e => {return e.BETRIEBSTAG.getTime() >= dateRange[0].getTime() && e.BETRIEBSTAG.getTime() <= dateRange[1].getTime()});
        let nodes = d3.range(d.length).map(function(i) {
            return {
                radius: 10,
                categoryX: calcCategory(criteria1, cutoff1, d[i]),
                categoryY: calcCategory(criteria2, cutoff2, d[i]),
                ANKUNFTSZEIT: d[i].ANKUNFTSZEIT,
                AN_PROGNOSE: d[i].AN_PROGNOSE,
                diff: calcDelay(d[i]),
                BETRIEBSTAG: d[i].BETRIEBSTAG,
                LINIEN_ID: d[i].LINIEN_ID,
                LINIEN_TEXT: d[i].LINIEN_TEXT,
                block: d[i].block,
                globalstrahlung: d[i].globalstrahlung,
                luftdruck: d[i].luftdruck,
                luftfeuchtigkeit: d[i].luftfeuchtigkeit,
                lufttemperatur: d[i].lufttemperatur,
                niederschlag: d[i].niederschlag,
                schnee: d[i].schnee,
                sonnenschein: d[i].sonnenschein,
            }
        });

        writeTitles(group, criteria1, cutoff1, criteria2, cutoff2);

        let simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody())
            .force('x', d3.forceX().strength(1).x(function(d) {
                return xCenter[d.categoryX];
            }))
            .force('y', d3.forceY().strength(1).y(function(d) {
                return yCenter[d.categoryY];
            }))
            .velocityDecay(0.9)
            .on('tick', ticked);

        function ticked() {
            let u = d3.select('svg g')
                .selectAll('circle')
                .data(nodes);

            u.enter()
                .append('circle')
                .style('fill', function(d) {
                    return colorLinie[d.LINIEN_TEXT];
                })
                .merge(u)
                .attr('r', function(d) {
                    return calcRadius(d);
                })
                .attr('cx', function(d) {
                    return d.x;
                })
                .attr('cy', function(d) {
                    return d.y;
                })
                .on('mouseenter',(e, d) => {
                    updateInfo(d);
                })
                .on('mousemove', function(e, d) {
                    updateInfo(d);
                })
            u.exit().remove();
        }
    })
}

function updateInfo(d) {
    document.getElementById("line").innerHTML = d.LINIEN_TEXT;
    document.getElementById("rollingStock").innerHTML = d.block;
    document.getElementById("arrival").innerHTML = d.ANKUNFTSZEIT.getHours().toString().padStart(2, '0') + ':' + d.ANKUNFTSZEIT.getMinutes().toString().padStart(2, '0');
    document.getElementById("dayOfService").innerHTML = d.BETRIEBSTAG.getDate() + "-" + (d.BETRIEBSTAG.getMonth() + 1) + "-" + d.BETRIEBSTAG.getFullYear();
    document.getElementById("delay").innerHTML = (d.diff >= -delayCutoff ? "Keine Verspätung" : dateDiffToString(Math.abs(d.diff)));
    document.getElementById("sunshine").innerHTML = d.sonnenschein;
    document.getElementById("rainfall").innerHTML = d.niederschlag;
    document.getElementById("snow").innerHTML = d.schnee;
    document.getElementById("temperature").innerHTML = d.lufttemperatur;
    document.getElementById("humidity").innerHTML = d.luftfeuchtigkeit;
}

function dateDiffToString(diff){
    let min = Math.floor(diff / 60000);
    let sec = Math.floor((diff - min * 60000) / 1000);
    return min + ' Min ' + sec + ' Secs';
}

function calcCategory(criteria, cutoff, d){
    if (criteria === "Sonnenschein") return compare(d.sonnenschein, cutoff);
    else if (criteria === "Schnee") return compare(d.schnee, cutoff);
    else if (criteria === "Luftfeuchtigkeit") return compare(d.luftfeuchtigkeit, cutoff);
    else if (criteria === "Luftdruck") return compare(d.luftdruck, cutoff);
    else if (criteria === "Lufttemperatur") return compare(d.lufttemperatur, cutoff);
    else if (criteria === "Niederschlag") return compare(d.niederschlag, cutoff);
    else if (criteria === "Globalstrahlung") return compare(d.schnee, cutoff);
    else if (criteria === "Luftdruck") return compare(d.sonnenschein, cutoff);
}

function compare(value, cutoff){
    if (value > cutoff) return 1;
    else return 0;
}

function calcDelay(e){
    return e.ANKUNFTSZEIT - e.AN_PROGNOSE;
}

// improve returned values.
function calcRadius(e){
    if (e.diff > -delayCutoff) return 2
    else return Math.log10(Math.abs(e.diff));
}

function sum(array){
    let sum = 0;
    for (let i = 0 ; i < array.length ; i++){
        sum = sum + array[i];
    }
    return sum;
}

function writeTitles(group, criteria1, cutoff1, criteria2, cutoff2){
    // reset all labels
    group.selectAll("text").text("")

    // title criteria 1
    group.append("text")
        .attr("id", "title1")
        .style("font-size", "24px")
        .attr("transform", "translate(" + (sum(xCenter)/xCenter.length) + ",-70) rotate(0)")
        .text(criteria1);

    // subtitle criteria 1 (value smaller than cutoff)
    group.append("text")
        .style("font-size", "20px")
        .attr("transform", "translate(" + (xCenter[0]) + ",-50) rotate(0)")
        .text("<=" + cutoff1);

    // subtitle criteria 1 (value bigger than cutoff)
    group.append("text")
        .style("font-size", "20px")
        .attr("transform", "translate(" + (xCenter[1]) + ",-50) rotate(0)")
        .text(">" + cutoff1);

    // title criteria 2
    group.append("text")
        .style("font-size", "24px")
        .attr("transform", "translate(10," + (sum(yCenter)/yCenter.length) + ") rotate(-90)")
        .text(criteria2);

    // subtitle criteria 2 (value smaller than cutoff)
    group.append("text")
        .style("font-size", "20px")
        .attr("transform", "translate(30," + yCenter[0] + ") rotate(-90)")
        .text("<=" + cutoff2);

    // subtitle criteria 2 (value bigger than cutoff)
    group.append("text")
        .style("font-size", "20px")
        .attr("transform", "translate(30," + yCenter[1] + ") rotate(-90)")
        .text(">" + cutoff2);
}

draw('Schnee', 5, 'Luftfeuchtigkeit', 90, [new Date(2021, 0, 1), new Date(2021, 0, 3)])
//d3.interval(() => draw('Schnee', 4, 'Luftfeuchtigkeit', 90), 3000);