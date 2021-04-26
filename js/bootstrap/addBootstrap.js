function changedInput(){
    let category1 = $('#select1').val();
    let category2 = $('#select2').val();
    let cutoff1 = parseInt(document.getElementById("cutoff1").value);
    let cutoff2 = parseInt(document.getElementById("cutoff2").value);
    let valid = checkInput(cutoff1, cutoff2)
    if (valid) draw(category1, cutoff1, category2, cutoff2);
    else console.log("invalid")
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