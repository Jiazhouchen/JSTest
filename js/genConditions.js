





function pad(x, pad_to, pad_with) {
    if (typeof x === 'number') {
        x = x.toString()
    }
    if (x.length < pad_to) {
        return pad_with.repeat( (pad_to - x.length) ) + x.toString()
    } else {
        return x.toString()
    }
}

function fixed_iti(iti,t) {
    return new Array(t).fill(iti);
}