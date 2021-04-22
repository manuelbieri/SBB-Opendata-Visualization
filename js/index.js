const requestData = new Request('https://gist.githubusercontent.com/manuelbieri/5a20c884020ed05e89b3426e78ae97c5/raw/ecd1e2bf9e3df8f72caf558fe24144675e39813e/sbb_data_preview.txt');

let data = d3.json(requestData).then(d => {return d;});

let svg = d3.select('body').append('svg');
d3.select('body')
    .append('div')
    .attr('id', 'tooltip');

let bbox = svg.node().getBoundingClientRect();
let width = bbox.width;
let height = bbox.height;

let group = svg.append('g').attr('transform', 'translate(0,150)');

let colorLinie = {'IC6':'red', 'IC61':'orange', 'IC1': 'blue', 'IC8': 'green'}
let xCenter = [200, 400]
let yCenter = [100, 300]

function draw(criteria1, cutoff1, criteria2, cutoff2){
    data.then(d => {
        console.log(d);
        var nodes = d3.range(d.length).map(function(i) {
            return {
                radius: 10,
                category: calcCategory(criteria1, cutoff1, d[i]),
                categoryY: calcCategory(criteria2, cutoff2, d[i]),
                linie: d[i].LINIEN_TEXT,
                an_plan: new Date(d[i].ANKUNFTSZEIT),
                an_prognose: new Date(d[i].AN_PROGNOSE)
            }
        });

        writeTitles(group, criteria1, cutoff1, criteria2, cutoff2);

        var simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody())
            .force('x', d3.forceX().strength(1.5).x(function(d) {
                return xCenter[d.category];
            }))
            .force('y', d3.forceY().strength(1.5).y(function(d) {
                return yCenter[d.categoryY];
            }))
            .force('collision', d3.forceCollide().radius(function(d) {
                return d.radius/2;
            }))
            .on('tick', ticked);

        function ticked() {
            var u = d3.select('svg g')
                .selectAll('circle')
                .data(nodes);

            u.enter()
                .append('circle')
                .attr('r', function(d) {
                    return calcRadius(d);
                })
                .style('fill', function(d) {
                    return colorLinie[d.linie];
                })
                .merge(u)
                .attr('cx', function(d) {
                    return d.x;
                })
                .attr('cy', function(d) {
                    return d.y;
                })
                .on('mouseenter',(e, d) => {
                    d3.select('#tooltip')
                        .style('visibility', 'visible')
                        .style('left', e.clientX + 'px')
                        .style('top', e.clientY + 'px')
                        .text(() => {return tooltipText(d);});
                })
                .on('mousemove', function(e) {
                    d3.select('#tooltip')
                        .style('left', e.clientX + 'px')
                        .style('top', e.clientY + 'py')
                })
                .on('mouseleave',() => {
                    d3.select('#tooltip')
                        .style('visibility','hidden')
                });
            u.exit().remove();
        }
    })
}


function calcCategory(criteria, cutoff, d){
    if (criteria === "Sonnenschein") return compare(d.sonnenschein, cutoff);
    if (criteria === "Schnee") return compare(d.schnee, cutoff);
    if (criteria === "Luftfeuchtigkeit") return compare(d.luftfeuchtigkeit, cutoff);
    if (criteria === "Luftdruck") return compare(d.luftdruck, cutoff);
}

function compare(value, cutoff){
    if (value > cutoff) return 1;
    else return 0;
}

function tooltipText(d) {
    var diff = Math.abs(d.diff);
    var late = d.diff > -30000;
    var min = Math.floor(diff / 60000);
    var sec = Math.floor((diff - min * 60000) / 1000);
    var date = d.an_prognose.getDate() + '/' + (d.an_prognose.getMonth() + 1) + '/' + d.an_prognose.getFullYear();
    var time = d.an_plan.getHours().toString().padStart(2, '0') + ':' + d.an_plan.getMinutes().toString().padStart(2, '0');
    return d.linie + ' on ' + date + ' at ' + time + ' was ' + (late ? 'not':(min + ' Min ' + sec + ' Secs')) + ' late.';
}

// improve returned values.
function calcRadius(e){
    e.diff = e.an_plan - e.an_prognose;
    if (e.diff > -30000) return 2
    else return Math.log10(Math.abs(e.diff));
}

function calcX(e){
    e.x = (e.linie < 1000) * 150 + 200;
}
function calcY(e){
    e.y = Math.round(Math.random()*2) *150 + 100;
}

function sum(array){
    var sum = 0;
    for (var i = 0 ; i < array.length ; i++){
        sum = sum + array[i];
    }
    return sum;
}

function writeTitles(group, criteria1, cutoff1, criteria2, cutoff2){
    // title criteria 1
    group.append("text")
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

draw('Schnee', 5, 'Luftfeuchtigkeit', 90)
//d3.interval(() => draw('Schnee', 4, 'Luftfeuchtigkeit', 90), 3000);