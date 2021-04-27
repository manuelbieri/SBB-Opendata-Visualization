function changedInput(){
    let category1 = $('#select1').val();
    let category2 = $('#select2').val();
    let cutoff1 = parseInt(document.getElementById("cutoff1").value);
    let cutoff2 = parseInt(document.getElementById("cutoff2").value);
    let valid = checkInput(cutoff1, cutoff2)
    if (valid) draw(category1, cutoff1, category2, cutoff2);
}

function checkInput(value1, value2){
    if (Number.isInteger(value1) && Number.isInteger(value2)){
        if (value1 > 0 && value2 > 0) {
            validInput();
            return true;
        }
        else{
            invalidInput();
            return false;
        }
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

function setUpDateSlider(){
    let slider = $('.js-range-slider').ionRangeSlider({
        type: "double",
        from: [new Date().getMonth(), new Date().getFullYear()],
        to: [new Date().getMonth(), new Date().getFullYear()],
        values: [
            "Jan 21", "Feb 21", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        onChange: d => {console.dir(d)}
    });
}