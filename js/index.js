//const requestData = new Request('https://gist.githubusercontent.com/manuelbieri/5a20c884020ed05e89b3426e78ae97c5/raw/ecd1e2bf9e3df8f72caf558fe24144675e39813e/sbb_data_preview.txt');
const requestData = new Request('data/sbb_data_preview.json')
//const requestData = new Request('data/sbb_data_v2.json')

let delayCutoff = 180000;

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
    setUpDateSlider(Array.from(dates), '#slider1');
    setUpDateSlider(Array.from(dates), '#slider2' +
        '')
    return tmp;
});

let svg = d3.select('svg');

let group = svg.append('g').attr('transform', 'translate(0,150)');

let colorLine = {'IC6':'red', 'IC61':'orange', 'IC1': 'blue', 'IC8': 'green'}
let colorRollingStock = {'IC2000':'red', 'FVDosto':'orange', 'ICN': 'blue', 'Eurocity': 'green'}

let bbox = svg.node().getBoundingClientRect();
let width = bbox.width;
let height = bbox.height;

let yCenter = [height/7, height/7*4]
let xCenter = [width/7*2, width/7*5]


function draw(args){
    data.then(values => {
        delayCutoff = args.delayCutoff * 60 * 1000;
        let d = values.filter(e => {return e.BETRIEBSTAG.getTime() >= args.dates[0].getTime() && e.BETRIEBSTAG.getTime() <= args.dates[1].getTime()});
        let nodes = d3.range(d.length).map(function(i) {
            return {
                radius: 10,
                categoryX: calcCategory(args.category1, args.cutoff1, d[i]),
                categoryY: calcCategory(args.category2, args.cutoff2, d[i]),
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

        writeTitles(group, args.category1, args.cutoff1, args.category2, args.cutoff2);

        let simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBodyReuse())
            .force('x', d3.forceX().strength(1).x(function(d) {
                return xCenter[d.categoryX];
            }))
            .force('y', d3.forceY().strength(1).y(function(d) {
                return yCenter[d.categoryY];
            }))
            .velocityDecay(0.93)
            .on('tick', ticked);

        function ticked() {
            let u = d3.select('svg g')
                .selectAll('circle')
                .data(nodes);

            u.enter()
                .append('circle')
                .merge(u)
                .style('fill', d => { return getColor(d)})
                .attr('r', d => {return calcRadius(d);})
                .attr('cx', d => {return d.x})
                .attr('cy', d => {return d.y})
                .on('mouseenter',(e, d) => {updateInfo(d);})
                .on('mousemove', (e, d) => {updateInfo(d);})
            u.exit().remove();
        }
    })
}

function getColor(d){
    let color = null;
    if (getColorType()) color = colorLine[d.LINIEN_TEXT];
    else color = colorRollingStock[getTrainType(d.block)];
    console.assert(color != null);
    return color;
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
    document.getElementById("imageCarousel1").src = "Graphics/Images/" + trainType + "/1.webp"
    document.getElementById("imageCarousel2").src = "Graphics/Images/" + trainType + "/2.webp"
    document.getElementById("imageCarousel3").src = "Graphics/Images/" + trainType + "/3.webp"
    document.getElementById("imageCarousel4").src = "Graphics/Images/" + trainType + "/4.webp"
}

function updateInfo(d) {
    document.getElementById("line").innerHTML = d.LINIEN_TEXT;
    document.getElementById("lineNumber").innerHTML = d.LINIEN_ID;
    document.getElementById("arrival").innerHTML = d.ANKUNFTSZEIT.getHours().toString().padStart(2, '0') + ':' + d.ANKUNFTSZEIT.getMinutes().toString().padStart(2, '0');
    document.getElementById("dayOfService").innerHTML = d.BETRIEBSTAG.getDate() + "-" + (d.BETRIEBSTAG.getMonth() + 1) + "-" + d.BETRIEBSTAG.getFullYear();
    document.getElementById("delay").innerHTML = (d.diff >= -delayCutoff ? "Keine Verspätung" : dateDiffToString(Math.abs(d.diff)));
    document.getElementById("sunshine").innerHTML = d.sonnenschein;
    document.getElementById("rainfall").innerHTML = d.niederschlag;
    document.getElementById("snow").innerHTML = d.schnee;
    document.getElementById("temperature").innerHTML = d.lufttemperatur;
    document.getElementById("humidity").innerHTML = d.luftfeuchtigkeit;
    updateCarousel(d.block);
}

function dateDiffToString(diff){
    let min = Math.floor(diff / 60000);
    let sec = Math.floor((diff - min * 60000) / 1000);
    return min + ' Min ' + sec + ' Secs';
}

function getUnit(criteria, cutoff, d){
    let unit = null;
    if (criteria === "Sonnenschein") unit = "min";
    else if (criteria === "Schnee") unit = "cm";
    else if (criteria === "Luftfeuchtigkeit") unit = "%";
    else if (criteria === "Luftdruck") unit = "hPa";
    else if (criteria === "Lufttemperatur") unit = "&deg;C";
    else if (criteria === "Niederschlag") unit = "mm";
    else if (criteria === "Globalstrahlung") unit = "W/m<sup>2</sup>";
    console.assert(unit != null);
    return unit;
}

function calcCategory(criteria, cutoff, d){
    if (criteria === "Sonnenschein") return compare(d.sonnenschein, cutoff);
    else if (criteria === "Schnee") return compare(d.schnee, cutoff);
    else if (criteria === "Luftfeuchtigkeit") return compare(d.luftfeuchtigkeit, cutoff);
    else if (criteria === "Luftdruck") return compare(d.luftdruck, cutoff);
    else if (criteria === "Lufttemperatur") return compare(d.lufttemperatur, cutoff);
    else if (criteria === "Niederschlag") return compare(d.niederschlag, cutoff);
    else if (criteria === "Globalstrahlung") return compare(d.schnee, cutoff);
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

    // subtitle criteria 1 (value smaller than cutoff)
    group.append("text")
        .attr("transform", "translate(" + (xCenter[0]) + ",-110)")
        .text(criteria1 + " unter oder gleich " + cutoff1 + getUnit(criteria1));

    // subtitle criteria 1 (value bigger than cutoff)
    group.append("text")
        .attr("transform", "translate(" + (xCenter[1]) + ",-110)")
        .text(criteria1 + " über " + cutoff1 + getUnit(criteria1));

    // subtitle criteria 2 (value smaller than cutoff)
    let text = group.append("text")
        .attr("transform", "translate(30," + yCenter[0] + ") rotate(-90)")
        .html(criteria2 + " <br> unter oder gleich " + cutoff2 + getUnit(criteria2));


    // subtitle criteria 2 (value bigger than cutoff)

    group.append("text")
        .attr("transform", "translate(30," + yCenter[1] + ") rotate(-90)")
        .html(criteria2 + "<br>über " + cutoff2 + getUnit(criteria2));

}



changedInput();
//draw({category1:'Schnee', cutoff1:5, category2:'Luftfeuchtigkeit', cutoff2:90, delayCutoff:3, dates:[new Date(2021, 0, 1), new Date(2021, 0, 3)]});
//d3.interval(() => draw('Schnee', 4, 'Luftfeuchtigkeit', 90), 3000);