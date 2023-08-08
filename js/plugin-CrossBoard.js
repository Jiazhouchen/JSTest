/*
 * Jiazhou Chen
 *
 * This plugin will run the gambling task with rank competition
 *
 *
 *
 */

jsPsychCrossBoard = (function(jspsych) {

    const info = {
        name: 'compete',
        description: '',
        parameters: {
            read_bio: {
                type: jspsych.ParameterType.BOOL,
                default: true,
            },
            which_side: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'whichside',
                default: 'right',
            },
            switch: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: 'switch',
                default: true,
            },
            iti: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: 'iti',
                default: 1000,
            },
        }
    }

    class CrossBoardPlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }
            let html = init_gamble_page()
            // replace RPE engine here to generate
            display_element.innerHTML = html
            let trial_t = performance.now()
            console.log(init_time - trial_t)
            const sv = drawCrossBoard(display_element,trial)


        }
    }
    CrossBoardPlugin.info = info;

    return CrossBoardPlugin;
})(jsPsychModule);

function drawCrossBoard(display_element, trial) {
    const l1 = document.createElement('div')
    l1.className = 'option_wrapper'

    const veil = document.createElement('div')
    veil.className = 'veil'
    veil.style.display = 'none'

    const l2 = document.createElement('div')
    l2.className = 'option_wrapper'

    veil.appendChild(l2)
    const tb1 = gen_table(4,4,'lottoTable')
    const txt = document.createElement('b')
    txt.textContent = '🚀'

    console.log(tb1.firstChild.firstChild.lastChild)
    tb1.rows[0].cells[0].appendChild(txt)
    l1.appendChild(tb1)

    display_element.appendChild(l1)
    display_element.appendChild(veil)
}

function gen_table(nrow,ncol,className) {
    // creates a <table> element and a <tbody> element
    const tbl = document.createElement("table");
    tbl.className = className
    const tblBody = document.createElement("tbody");
    // tblBody.className = className

    for (let i = 0; i < nrow; i++) {
        // creates a table row
        const row = document.createElement("tr");
        // row.className = className
        for (let j = 0; j < ncol; j++) {
            // Create a <td> element and a text node, make the text
            // node the contents of the <td>, and put the <td> at
            // the end of the table row
            const cell = document.createElement("td");
            cell.setAttribute('row',i);
            cell.setAttribute('col',j)
            // cell.className = className;
            row.appendChild(cell);
        }

        // add the row to the end of the table body
        tblBody.appendChild(row);
    }

    // put the <tbody> in the <table>
    tbl.appendChild(tblBody);
    return tbl

}