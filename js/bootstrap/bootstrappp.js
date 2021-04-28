function changedInput(){
    let category1 = $('#select1').val();
    let category2 = $('#select2').val();
    let cutoff1 = parseInt(document.getElementById("cutoff1").value);
    let cutoff2 = parseInt(document.getElementById("cutoff2").value);
    let valid = checkInput(cutoff1, cutoff2)
    if (valid) draw(category1, cutoff1, category2, cutoff2, getDates());
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

let startDate = null;
let endDate = null;

function getDates(){
    return [startDate, endDate];
}

function parseDates(startDateString, endDateString) {
    let arrayStartDate = startDateString.split("-");
    startDate = new Date(arrayStartDate[2], parseInt(arrayStartDate[1])-1, arrayStartDate[0]);
    let arrayEndDate = endDateString.split("-");
    endDate = new Date(arrayEndDate[2], parseInt(arrayEndDate[1])-1, arrayEndDate[0]);
}

function setUpDateSlider(dates){
    parseDates(dates[0], dates[dates.length-1]);
    let slider = $('#slider').ionRangeSlider({
        type: "double",
        from: true,
        to: true,
        values: dates,
        onFinish: d => {
            parseDates(d.from_value, d.to_value);
            changedInput();
        }
    });
}

function setUpDateSwitch(){
    let switchSlider = $('#switch').ionRangeSlider({
        from: true,
        to: true,
        values: ['Rolling Stock', 'Line ID'],
    });
}