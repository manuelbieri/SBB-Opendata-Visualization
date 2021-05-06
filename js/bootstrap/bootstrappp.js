function adjustUnits() {
    document.getElementById('cutoff1-addon').innerHTML = getUnit($('#select1').val(), false);
    document.getElementById('cutoff2-addon').innerHTML = getUnit($('#select2').val(), false);
}

function changedInput(doSplit) {
    let category1 = $('#select1').val();
    let category2 = $('#select2').val();
    adjustUnits();
    let cutoff1 = parseInt(document.getElementById("cutoff1").value);
    let cutoff2 = parseInt(document.getElementById("cutoff2").value);
    let delayCutoff = parseInt(document.getElementById("cutoff3").value);
    let valid = checkInput(cutoff1, cutoff2)
    let args = {
        category1: category1,
        cutoff1: cutoff1,
        category2: category2,
        cutoff2: cutoff2,
        delayCutoff: delayCutoff,
        dates: getDates()
    }
    if (valid) changeChart(doSplit, args);
}

function changedInputDates() {
    changedInput(false);
}

function checkInput(value1, value2) {
    if (Number.isInteger(value1) && Number.isInteger(value2)) {
        validInput();
        return true;
    } else {
        invalidInput();
        return false;
    }
}

function validInput() {
    drawValidity('is-invalid', 'was-validated')
}

function invalidInput() {
    drawValidity('was-validated', 'is-invalid')
}

function drawValidity(removeClass, addClass) {
    document.getElementById("cutoff1").classList.remove(removeClass);
    document.getElementById("cutoff2").classList.remove(removeClass);
    document.getElementById("cutoff1").classList.add(addClass);
    document.getElementById("cutoff2").classList.add(addClass);
}

let firstDateRange = [];
let secondDateRange = [];

function getDates() {
    return {date1: firstDateRange[0], date2: firstDateRange[1], date3: secondDateRange[0], date4: secondDateRange[1]};
}

function parseSliderDates() {
    let sliderFirstRange = $('#slider1').data("ionRangeSlider");
    let sliderSecondRange = $('#slider2').data("ionRangeSlider");
    firstDateRange = [parseSliderDate(sliderFirstRange.result.from_value), parseSliderDate(sliderFirstRange.result.to_value)]
    secondDateRange = [parseSliderDate(sliderSecondRange.result.from_value), parseSliderDate(sliderSecondRange.result.to_value)]
}

function parseSliderDate(dateString) {
    let dateArray = dateString.split("-");
    return new Date(dateArray[2], parseInt(dateArray[1]) - 1, dateArray[0]);
}

function adjustDateRange(sliderId) {
    let tmpDateRange;
    if (sliderId === "#slider1") tmpDateRange = firstDateRange;
    else tmpDateRange = secondDateRange;

    if (tmpDateRange[0].getTime() === tmpDateRange[1].getTime()) {
        let slider = $(sliderId).data("ionRangeSlider");
        let currentValue = slider.result.to;
        if (currentValue + 1 <= slider.result.max) {
            slider.update({to: currentValue + 1})
        } else {
            slider.update({from: currentValue - 1})
        }
        parseSliderDates();
    }
}

function calculateTimeDiffs() {
    let slider1 = $('#slider1').data("ionRangeSlider");
    let slider2 = $('#slider2').data("ionRangeSlider");
    let diff1110 = slider1.result.to - slider1.result.from + 1;
    let diff2120 = slider2.result.to - slider2.result.from + 1;
    let diff2110 = Math.abs(slider2.result.to - slider1.result.from) + 1;
    let diff2010 = Math.abs(slider2.result.from - slider1.result.from) + 1;

    if (slider1.result.to <= slider2.result.from || slider2.result.to <= slider1.result.from) {
        return {usedPerformance: diff1110 + diff2120, toAdjust: diff1110 > diff2120 ? '#slider1' : '#slider2'};
    } else if (slider1.result.from <= slider2.result.from && slider2.result.to <= slider1.result.to) {
        return {usedPerformance: diff1110, toAdjust: '#slider1'};
    } else if (slider2.result.from <= slider1.result.from && slider1.result.to <= slider2.result.to) {
        return {usedPerformance: diff2120, toAdjust: '#slider2'};
    } else if (slider1.result.from <= slider2.result.from && slider2.result.from <= slider1.result.to && slider1.result.to <= slider2.result.to) {
        return {usedPerformance: diff2110, toAdjust: '#slider1'};
    } else if (slider2.result.from <= slider1.result.from && slider1.result.from <= slider2.result.to && slider2.result.to <= slider1.result.to) {
        return {usedPerformance: diff2010 + diff1110, toAdjust: '#slider2'};
    } else {
        console.log(firstDateRange);
        console.log(secondDateRange);
        throw "Not defined case"
    }
}

function resetSliderToAllowedRange(toAdjust) {
    let sliderToAdjust = $(toAdjust).data("ionRangeSlider");
    let sliderNotToAdjust = $(toAdjust === '#slider1' ? '#slider2' : '#slider1').data("ionRangeSlider");
    let rangeAlreadyOccupied = sliderNotToAdjust.result.to - sliderNotToAdjust.result.from + 1;
    let rangeToMaxOccupy = getPerformance() - rangeAlreadyOccupied;
    sliderToAdjust.update({from: sliderNotToAdjust.result.to - rangeToMaxOccupy})
}

function checkDateRange() {
    let performanceBoundary = getPerformance();
    let args = calculateTimeDiffs();
    if (args.usedPerformance > performanceBoundary) {
        resetSliderToAllowedRange(args.toAdjust);
    }
}


function setUpDateSlider(dates, sliderId) {
    $(sliderId).ionRangeSlider({
        type: "double",
        from: dates.length - 2,
        to: dates.length - 1,
        force_edges: true,
        values: dates,
        onChange: () => {
            parseSliderDates();
            adjustDateRange(sliderId);
            checkDateRange();
        },
        onFinish: () => {
            parseSliderDates();
            adjustDateRange(sliderId);
            changedInputDates();
        }
    });
}

function setUpColorSwitch() {
    $('#switch').ionRangeSlider({
        from: true,
        to: true,
        force_edges: true,
        values: ['Line ID', 'Rolling Stock'],
        onFinish: d => {
            let isColorRollingStock = (d.from_value === "Rolling Stock");
            changeColors(isColorRollingStock);
        }
    });
}

function isRollingStockColor() {
    let slider = $("#switch").data("ionRangeSlider");
    return "Rolling Stock" === slider.result.from_value;
}


function setUpPerformanceSwitch() {
    $('#switchPerformance').ionRangeSlider({
        from: true,
        to: true,
        force_edges: true,
        values: ['Fast', 'Slow'],
    });
}

function getPerformance() {
    let switchSlider = $("#switchPerformance").data("ionRangeSlider");
    if (switchSlider.result.from === 0) return 10;
    else return 26;
}

function changedDelayCutoff() {
    let delayCutoff = parseInt(document.getElementById("cutoff3").value);
    changeDelayCutoff(delayCutoff);
}