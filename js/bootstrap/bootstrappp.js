function adjustUnits(category1, category2) {
    document.getElementById('cutoff1-addon').innerHTML = getUnit(category1);
    document.getElementById('cutoff2-addon').innerHTML = getUnit(category2);
}

function changedInput(doSplit){
    let category1 = $('#select1').val();
    let category2 = $('#select2').val();
    adjustUnits(category1, category2);
    let cutoff1 = parseInt(document.getElementById("cutoff1").value);
    let cutoff2 = parseInt(document.getElementById("cutoff2").value);
    let delayCutoff = parseInt(document.getElementById("cutoff3").value);
    let valid = checkInput(cutoff1, cutoff2)
    let args = {category1:category1, cutoff1:cutoff1, category2:category2, cutoff2:cutoff2, delayCutoff:delayCutoff, dates:getDates()}
    if (valid) changeChart(doSplit, args);
}

function changedInputDates(){
    changedInput(false);
}

function checkInput(value1, value2){
    if (Number.isInteger(value1) && Number.isInteger(value2)){
        validInput();
        return true;
    } else{
        invalidInput();
        return false;
    }
}

function validInput(){
    drawValidity('is-invalid', 'is-valid')
}

function invalidInput(){
    drawValidity('is-valid', 'is-invalid')
}

function drawValidity(removeClass, addClass){
    document.getElementById("cutoff1").classList.remove(removeClass);
    document.getElementById("cutoff2").classList.remove(removeClass);
    document.getElementById("cutoff1").classList.add(addClass);
    document.getElementById("cutoff2").classList.add(addClass);
}

let firstDateRange = [];
let secondDateRange = [];

function getDates(){
    return {date1:firstDateRange[0], date2:firstDateRange[1], date3:secondDateRange[0], date4:secondDateRange[1]};
}

function parseSliderDates() {
    let sliderFirstRange = $('#slider1').data("ionRangeSlider");
    let sliderSecondRange = $('#slider2').data("ionRangeSlider");
    firstDateRange = [parseSliderDate(sliderFirstRange.result.from_value), parseSliderDate(sliderFirstRange.result.to_value)]
    secondDateRange = [parseSliderDate(sliderSecondRange.result.from_value), parseSliderDate(sliderSecondRange.result.to_value)]
}

function parseSliderDate(dateString){
    let dateArray = dateString.split("-");
    return new Date(dateArray[2], parseInt(dateArray[1])-1, dateArray[0]);
}

function adjustDateRange(sliderId) {
    let tmpDateRange;
    if (sliderId === "#slider1") tmpDateRange = firstDateRange;
    else tmpDateRange = secondDateRange;

    if (tmpDateRange[0].getTime() === tmpDateRange[1].getTime()){
        let slider = $(sliderId).data("ionRangeSlider");
        let currentValue = slider.result.to;
        if (currentValue + 1 <= slider.result.max){
            slider.update({to: currentValue+1})
        } else{
            slider.update({from: currentValue-1})
        }
        parseSliderDates();
    }
}


function setUpDateSlider(dates, sliderId){
    let slider = $(sliderId).ionRangeSlider({
        type: "double",
        from: dates.length-2,
        to: dates.length-1,
        force_edges:true,
        values: dates,
        onUpdate: d => {
        },
        onFinish: d => {
            parseSliderDates();
            adjustDateRange(sliderId);
            changedInputDates();
        }
    });
}

function setUpColorSwitch(){
    let switchSlider = $('#switch').ionRangeSlider({
        from: true,
        to: true,
        force_edges:true,
        values: ['Line ID', 'Rolling Stock'],
        onFinish: d => {
            let isColorRollingStock = (d.from_value === "Rolling Stock");
            changeColors(isColorRollingStock);
        }
    });
}

function isRollingStockColor(){
    let slider = $("#switch").data("ionRangeSlider");
    return "Rolling Stock" === slider.result.from_value;
}


function setUpPerformanceSwitch(){
    let switchSlider = $('#switchPerformance').ionRangeSlider({
        from: true,
        to: true,
        force_edges:true,
        values: ['Fast', 'Slow'],
    });
}

function getPerformanceSetting(){
    let slider = $("#switch").data("ionRangeSlider");
}

function changedDelayCutoff(){
    let delayCutoff = parseInt(document.getElementById("cutoff3").value);
    changeDelayCutoff(delayCutoff);
}