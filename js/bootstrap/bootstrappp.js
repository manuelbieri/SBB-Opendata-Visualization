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
    if (checkNewDateRange()) changedInput(false);
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

let firstDateRangeLastUsed = [];
let firstDateRange = [new Date(2021, 0, 1), new Date(2021, 0, 3)];
let secondDateRangeLastUsed = [];
let secondDateRange = [];

function checkNewDateRange(){
    if (firstDateRangeLastUsed.length === firstDateRange.length && firstDateRangeLastUsed.length === 2){
        if (firstDateRangeLastUsed[0].getTime() === firstDateRange[0].getTime() && firstDateRangeLastUsed[0].getTime() === firstDateRange[0].getTime()){
            if (secondDateRangeLastUsed.length === secondDateRange.length && secondDateRangeLastUsed.length === 2){
                if (secondDateRangeLastUsed[0].getTime() === secondDateRange[0].getTime() && secondDateRangeLastUsed[0].getTime() === secondDateRange[0].getTime()){
                    return false;
                } else return true;
            } else return true;
        } else return true;
    } else return true;
}

function getDates(){
    return firstDateRange.concat(secondDateRange);
}

function parseDates(startDateString, endDateString, sliderId) {
    let tmpDateRange = [];
    let arrayStartDate = startDateString.split("-");
    tmpDateRange[0] = new Date(arrayStartDate[2], parseInt(arrayStartDate[1])-1, arrayStartDate[0]);
    let arrayEndDate = endDateString.split("-");
    tmpDateRange[1] = new Date(arrayEndDate[2], parseInt(arrayEndDate[1])-1, arrayEndDate[0]);
    if (sliderId === "#slider1") firstDateRange = tmpDateRange;
    else secondDateRange = tmpDateRange;
}

function checkAndAdjustDateRange(sliderId) {

}

function setUpDateSlider(dates, sliderId){
    parseDates(dates[0], dates[dates.length-1]);
    let slider = $(sliderId).ionRangeSlider({
        type: "double",
        from: true,
        to: true,
        force_edges:true,
        values: dates,
        onFinish: d => {
            parseDates(d.from_value, d.to_value, sliderId);
            changedInputDates();
        }
    });
}

let isColorLine = false;

function getColorType(){
    return isColorLine;
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

function setUpPerformanceSwitch(){
    let switchSlider = $('#switchPerformance').ionRangeSlider({
        from: true,
        to: true,
        force_edges:true,
        values: ['Fast', 'Slow'],
    });
}

function changedDelayCutoff(){
    let delayCutoff = parseInt(document.getElementById("cutoff3").value);
    changeDelayCutoff(delayCutoff);
}