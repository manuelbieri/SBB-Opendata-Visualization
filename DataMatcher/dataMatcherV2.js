const requestTrains = new Request('https://data.sbb.ch/api/records/1.0/search/?dataset=jahresformation&q=&rows=4000&facet=zug&facet=debicode&facet=zugart&facet=bhf_von&facet=bhf_bis&facet=umlauf&facet=block_bezeichnung&facet=beginnfahrplanperiode&refine.zugart=IC&refine.beginnfahrplanperiode=Fpl-2022');
const requestTimes = new Request('data/sbb_data_v2.csv');
const requestWeather = new Request('https://data.geo.admin.ch/ch.meteoschweiz.klima/nbcn-tageswerte/nbcn-daily_BER_current.csv');

let times = [];
d3.dsv(";", requestTimes, d => {
    times.push(d);

});

let weather = [];
d3.dsv(";", requestWeather, d => {
    weather.push(d)
});

let trains =
    d3.json(requestTrains, d => {return d}).then(d => {return d.records}).then(d => {
        let tmp = [];
        for (let i = 0; i < d.length; i++) {
            tmp.push({
                    zug: d[i].fields.zug,
                    bitmap: d[i].fields.bitmap,
                    block: d[i].fields.block_bezeichnung
                }
            );
        }
        return tmp;
    });


let data = trains.then(trains => {
    //console.log(trains, times, weather)
    let tmp = [];
    for (let j = 0 ; j < times.length ; j++){
        trainsLoop:
        for (let i = 0 ; i < trains.length ; i++){
            if (parseInt(times[j].LINIEN_ID) === parseInt(trains[i].zug) && bitmapMatcher(trains[i].bitmap, times[j].BETRIEBSTAG)) {
                let betriebstag = times[j].BETRIEBSTAG;
                let an = times[j].ANKUNFTSZEIT;
                let an_prognose = times[j].AN_PROGNOSE;
                let BETRIEBSTAG = new Date(parseInt(betriebstag.substring(6, 10)), parseInt(betriebstag.substring(4, 6)) - 1, parseInt(betriebstag.substring(0, 2)))
                let ANKUNFTSZEIT = new Date(parseInt(an.substring(6, 10)), parseInt(an.substring(4, 6)) - 1, parseInt(an.substring(0, 2)), parseInt(an.substring(11, 13)), parseInt(an.substring(14, 16)))
                let AN_PROGNOSE = new Date(parseInt(an_prognose.substring(6, 10)), parseInt(an_prognose.substring(4, 6)) - 1, parseInt(an_prognose.substring(0, 2)), parseInt(an_prognose.substring(11, 13)), parseInt(an_prognose.substring(14, 16)), parseInt(an_prognose.substring(17, 19)))

                if (BETRIEBSTAG != null && ANKUNFTSZEIT != null && AN_PROGNOSE != null) {
                    for (let k = 0; k < weather.length; k++) {
                        let weatherDate = new Date(parseInt(weather[k].date.substring(0, 4)), parseInt(weather[k].date.substring(4, 6)) - 1, parseInt(weather[k].date.substring(6, 8)))

                        if (ANKUNFTSZEIT.getDate() === weatherDate.getDate() && ANKUNFTSZEIT.getMonth() === weatherDate.getMonth()) {
                            tmp.push({
                                BETRIEBSTAG: BETRIEBSTAG,
                                AN_PROGNOSE: AN_PROGNOSE,
                                ANKUNFTSZEIT: ANKUNFTSZEIT,
                                LINIEN_ID: parseInt(times[j].LINIEN_ID),
                                LINIEN_TEXT: times[j].LINIEN_TEXT,
                                block: trains[i].block,
                                globalstrahlung: parseInt(weather[k].gre000d0),
                                schnee: parseInt(weather[k].hto000d0),
                                luftdruck: parseInt(weather[k].prestad0),
                                niederschlag: parseInt(weather[k].rre150d0),
                                sonnenschein: parseInt(weather[k].sre000d0),
                                lufttemperatur: parseInt(weather[k].tre200d0),
                                luftfeuchtigkeit: parseInt(weather[k].ure200d0),
                            });
                            break trainsLoop;
                        }
                    }
                }
            }
        }
    }
    return tmp;
})

function bitmapMatcher(bitmap, date){
    let index = (date - new Date(2020,11,13)) / (1000*60*60*24);
    return bitmap.charAt(index) === 'X';
}

data.then(d => {
    let tbl  = document.getElementById('myTable');
    drawTable(d, tbl);
    let elements = tbl.getElementsByTagName("td");
    for (let j = 0 ; j < elements.length ; j++){
        if (elements[j].innerHTML.includes('NaN')) {
            elements[j].style.color = "red";
        }
    }
    console.log(d);
});

function drawTable(d, table){
    for(let i = 0; i < d.length; i++){
        let tr = table.insertRow();
        tr.insertCell().appendChild(document.createTextNode(d[i].BETRIEBSTAG.getDate() + '/' + (d[i].BETRIEBSTAG.getMonth()+1)));
        tr.insertCell().appendChild(document.createTextNode(d[i].ANKUNFTSZEIT.getDate() + '/' + (d[i].ANKUNFTSZEIT.getMonth()+1) + ' (' + d[i].ANKUNFTSZEIT.getHours() + ':' + d[i].ANKUNFTSZEIT.getMinutes() + ':' + d[i].ANKUNFTSZEIT.getSeconds() + ')'));
        tr.insertCell().appendChild(document.createTextNode(d[i].AN_PROGNOSE.getDate() + '/' + (d[i].AN_PROGNOSE.getMonth()+1) + ' (' + d[i].AN_PROGNOSE.getHours() + ':' + d[i].AN_PROGNOSE.getMinutes() + ':' + d[i].AN_PROGNOSE.getSeconds() + ')'));
        tr.insertCell().appendChild(document.createTextNode(d[i].LINIEN_ID));
        tr.insertCell().appendChild(document.createTextNode(d[i].LINIEN_TEXT));
        tr.insertCell().appendChild(document.createTextNode(d[i].globalstrahlung));
        tr.insertCell().appendChild(document.createTextNode(d[i].luftdruck));
        tr.insertCell().appendChild(document.createTextNode(d[i].luftfeuchtigkeit));
        tr.insertCell().appendChild(document.createTextNode(d[i].lufttemperatur));
        tr.insertCell().appendChild(document.createTextNode(d[i].niederschlag));
        tr.insertCell().appendChild(document.createTextNode(d[i].schnee));
        tr.insertCell().appendChild(document.createTextNode(d[i].sonnenschein));
    }
}