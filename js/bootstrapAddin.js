function adjustUnits() {
    document.getElementById('cutoff1-addon').innerHTML = getUnit($('#select1').val(), false);
    document.getElementById('cutoff2-addon').innerHTML = getUnit($('#select2').val(), false);
}

let firstDateRange = [];
let secondDateRange = [];

function setUpDateRange(dateRangeId, dates) {
    $(dateRangeId).daterangepicker({
        minYear: 2022,
        maxYear: 2022,
        "autoApply": true,
        "maxSpan": {
            "days": 2
        },
        "locale": {
            "format": "DD.MM.YYYY",
            "monthNames": [
                "Januar",
                "Februar",
                "März",
                "April",
                "Mai",
                "Juni",
                "Juli",
                "August",
                "September",
                "Oktober",
                "November",
                "Dezember"
            ],
            "firstDay": 1
        },
    }, (start, end) => {
        parseSliderDates();
        changedInputDates();
    });
}

function parseSliderDates() {
    let firstRange = $('#firstDateRange').data('daterangepicker');
    firstDateRange = [firstRange.startDate.toDate(), firstRange.endDate.toDate()];
    let secondRange = $('#secondDateRange').data('daterangepicker');
    secondDateRange = [secondRange.startDate.toDate(), secondRange.endDate.toDate()]
}

function changedInput(doSplit) {
    let category1 = $('#select1').val();
    let category2 = $('#select2').val();
    adjustUnits();
    let cutoff1 = parseInt(document.getElementById("cutoff1").value);
    let cutoff2 = parseInt(document.getElementById("cutoff2").value);
    let delayCutoff = parseInt(document.getElementById("cutoff3").value);
    let validCutoff1 = checkInput(cutoff1, 'cutoff1')
    let validCutoff2 = checkInput(cutoff2, 'cutoff2')
    let args = {
        category1: category1,
        cutoff1: cutoff1,
        category2: category2,
        cutoff2: cutoff2,
        delayCutoff: delayCutoff,
        dates: getDates()
    }
    if (validCutoff1 && validCutoff2) changeChart(doSplit, args);
}

function changedInputDates() {
    changedInput(false);
}

function checkInput(value1, cutoffId) {
    if (Number.isInteger(value1)){
        validInput(cutoffId)
        return true;
    } else {
        invalidInput(cutoffId)
        return false;
    }
}

function validInput(cutoffId) {
    drawValidity('is-invalid', 'is-valid', cutoffId)
}

function invalidInput(cutoffId) {
    drawValidity('id-valid', 'is-invalid', cutoffId)
}

function drawValidity(removeClass, addClass, cutoffId) {
    document.getElementById(cutoffId).classList.remove(removeClass);
    document.getElementById(cutoffId).classList.add(addClass);
}

function getDates() {
    return {date1: firstDateRange[0], date2: firstDateRange[1], date3: secondDateRange[0], date4: secondDateRange[1]};
}

function isRollingStockColor() {
    return "Rollmaterial" === $('#selectColor').val();
}

function changedDelayCutoff() {
    let delayCutoff = parseInt(document.getElementById("cutoff3").value);
    changeDelayCutoff(delayCutoff);
    //changedInputDates();
}