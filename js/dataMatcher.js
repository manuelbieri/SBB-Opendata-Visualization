const requestTrains = new Request('https://data.sbb.ch/api/records/1.0/search/?dataset=jahresformation&q=&rows=4000&refine.zugart=IC&refine.beginnfahrplanperiode=Fpl-2021');
const requestTimes = new Request('https://gist.githubusercontent.com/manuelbieri/5a20c884020ed05e89b3426e78ae97c5/raw/a039f719ee8f780792772aa1d92cbc925a877bb3/sbb_data_preview.txt');
const requestWeather = new Request('https://data.geo.admin.ch/ch.meteoschweiz.klima/nbcn-tageswerte/nbcn-daily_BER_current.csv');

let trains =
    d3.json(requestTrains, d => {return d}).then(d => {return d.records}).then(d => {
        var tmp = [];
        for (var i = 0; i < d.length; i++) {
            if (d[i].fields.zug > 700 && d[i].fields.zug < 1500) {
                tmp.push({
                        zug: d[i].fields.zug,
                        bitmap: d[i].fields.bitmap,
                        block: d[i].fields.block_bezeichnung
                    }
                );
            }
        }
        return tmp;
    });

let times =
    d3.dsv(";", requestTimes, d => {
        if (!(d.AN_PROGNOSE_STATUS === "UNBEKANNT" && d.AN_PROGNOSE === "") && d.DURCHFAHRT_TF === "false" && d.FAELLT_AUS_TF === "false") {
            let betriebstag = d.BETRIEBSTAG;
            let an = d.ANKUNFTSZEIT;
            let an_prognose = d.AN_PROGNOSE;
            let b = new Date(parseInt(betriebstag.substring(6, 10)), parseInt(betriebstag.substring(4, 6)) - 1, parseInt(betriebstag.substring(0, 2)))
            let ANKUNFTSZEIT = new Date(parseInt(an.substring(6, 10)), parseInt(an.substring(4, 6)) - 1, parseInt(an.substring(0, 2)), parseInt(an.substring(11, 13)), parseInt(an.substring(14, 16)))
            let AN_PROGNOSE = new Date(parseInt(an_prognose.substring(6, 10)), parseInt(an_prognose.substring(4, 6)) - 1, parseInt(an_prognose.substring(0, 2)), parseInt(an_prognose.substring(11, 13)), parseInt(an_prognose.substring(14, 16)), parseInt(an_prognose.substring(17, 19)))

            return {
                LINIEN_ID: parseInt(d.LINIEN_ID),
                LINIEN_TEXT: d.LINIEN_TEXT,
                BETRIEBSTAG: new Date(parseInt(betriebstag.substring(6, 10)), parseInt(betriebstag.substring(4, 6)) - 1, parseInt(betriebstag.substring(0, 2))),
                ANKUNFTSZEIT: ANKUNFTSZEIT,
                AN_PROGNOSE: AN_PROGNOSE
            };
        }
    });

let weather =
    d3.dsv(";", requestWeather, d => {
        return {
            date: new Date(parseInt(d.date.substring(0,4)), parseInt(d.date.substring(4,6))-1, parseInt(d.date.substring(6,8))),
            globalstrahlung_tagesmittel: parseInt(d.gre000d0),
            schnee_morgen: parseInt(d.hto000d0),
            luftdruck_tagesmittel: parseInt(d.prestad0),
            niederschlag_tagessumme: parseInt(d.rre150d0),
            sonnenschein_tagessumme: parseInt(d.sre000d0),
            lufttemperatur_tagesmittel: parseInt(d.tre200d0),
            luftfeuchtigkeit_tagesmittel: parseInt(d.ure200d0)}
    });

let data = times.then(timesData => {
    let tmp = [];
    trains.then(trainsData => {
        weather.then(weatherData => {
            timesLoop:
            for (let timesCounter = 0; timesCounter < timesData.length ; timesCounter++){
                trainsLoop:
                for (let trainsCounter = 0 ; trainsCounter < trainsData.length ; trainsCounter++){
                    if (parseInt(timesData[timesCounter].LINIEN_ID) === parseInt(trainsData[trainsCounter].zug) && bitmapMatcher(trainsData[trainsCounter].bitmap, timesData[timesCounter].BETRIEBSTAG)) {
                        weatherLoop:
                        for (let weatherCounter = 0 ; weatherCounter < weatherData.length ; weatherCounter++){
                            if (timesData[timesCounter].BETRIEBSTAG.getDate() === weatherData[weatherCounter].date.getDate() && timesData[timesCounter].BETRIEBSTAG.getMonth() === weatherData[weatherCounter].date.getMonth()) {
                                tmp.push({
                                    ANKUNFTSZEIT: timesData[timesCounter].ANKUNFTSZEIT,
                                    AN_PROGNOSE: timesData[timesCounter].AN_PROGNOSE,
                                    BETRIEBSTAG: timesData[timesCounter].BETRIEBSTAG,
                                    LINIEN_ID: timesData[timesCounter].LINIEN_ID,
                                    LINIEN_TEXT: timesData[timesCounter].LINIEN_TEXT,
                                    block: trainsData[trainsCounter].block,
                                    globalstrahlung: weatherData[weatherCounter].globalstrahlung_tagesmittel,
                                    luftdruck: weatherData[weatherCounter].luftdruck_tagesmittel,
                                    luftfeuchtigkeit: weatherData[weatherCounter].luftfeuchtigkeit_tagesmittel,
                                    lufttemperatur: weatherData[weatherCounter].lufttemperatur_tagesmittel,
                                    niederschlag: weatherData[weatherCounter].niederschlag_tagessumme,
                                    schnee: weatherData[weatherCounter].schnee_morgen,
                                    sonnenschein: weatherData[weatherCounter].sonnenschein_tagessumme
                                });
                                break trainsLoop;
                            }
                        }
                    } else if (trainsData[trainsCounter].zug > 1500) {
                        break;
                    }
                }
            }
        })
    })
    return tmp;
})


function bitmapMatcher(bitmap, date){
    let index = (date - new Date(2020,11,13)) / (1000*60*60*24);
    return bitmap.charAt(index) === 'X';
}

data.then(d => console.log(d));
