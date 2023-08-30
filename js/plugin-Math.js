/*
 * Jiazhou Chen
 *
 * This plugin will run the gambling task with rank competition
 *
 *
 *
 */

jsPsychMath = (function(jspsych) {

    const info = {
        name: 'Math',
        description: '',
        parameters: {
            mathEquation: {
                type: jspsych.ParameterType.STRING,
                default: '',
            },
            mathCorr: {
                type: jspsych.ParameterType.INT,
                default: 'Correct',
            },
            which_side: {
                type: jspsych.ParameterType.STRING,
                default: '',
            },

        }
    }

    class MathPlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }
            let eq, cor;
            if (trial.mathEquation === '') {
                [eq, cor] = math_engine()
            } else {
                let eq = trial.mathEquation;
                let cor = trial.mathCorr;
            }
            trial.initTime = performance.now()
            trial.btxt = ['Correct','Wrong'];
            trial.mathCor = cor;
            trial.jsPsych = this.jsPsych;

            let html = initMathPage(eq,trial.btxt)
            // set up information:

            updateInfo('The math task will have a difficulty score for every trial. ' +
                'Currently, we consider number of digits and operation type. ' +
                'The score should be (NumDigits1 * NumDigits2)^OperationScale. ' +
                'Operation scale is 1 for + / - but 2 for *.')

            // replace RPE engine here to generate
            display_element.innerHTML = html
            document.getElementById('veil').style.display = 'inline'
            document.getElementById('veil').style.backdropFilter = 'blur(30px)'
            document.getElementById('veil').style.webkitBackdropFilter = 'blur(30px)'
            document.getElementById('veil').animate([
                {backdropFilter: 'blur(30px)',webkitBackdropFilter: 'blur(30px)'},
                {backdropFilter: 'none',webkitBackdropFilter: 'none'},
            ], {duration:200,iterations: 1,delay:300,fill: 'forwards'}).finished.then(()=>{
                document.getElementById('veil').style.display = 'none'
                this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: mathKeypress.bind(trial),
                    valid_responses: ['j','J','f','F'],
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false,
                });
                this.jsPsych.pluginAPI.setTimeout(mathKeypress.bind(trial),5000)
            })




        }
    }
    MathPlugin.info = info;

    return MathPlugin;
})(jsPsychModule);

function switchVeil(){
    const veil = document.getElementById('veil')
    if (veil) {
        if (veil.style.display === 'inline') {

        }
    }
}

function initMathPage(eq,btxt) {
    let html = `
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Rubik">
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            -webkit-user-select: none; /* Safari */
            -ms-user-select: none; /* IE 10 and IE 11 */
            user-select: none; /* Standard syntax */
        }
        .wrap {
            display: flex;
            flex-direction: column;
            
        }
        .helpText {
            margin-bottom: auto;
            padding-top: 8%;
            font-size: 3vmin;
            text-align: center;
        }
        .equation {
            flex: 1;
            font-family: "Rubik", sans-serif;
            padding-top: 8%;
            font-size: 17vmin;
            font-weight: bold;
            text-align: center;
            line-height: 17vmin;
            justify-content:center;
        }
        .buttonRow {
            margin-top: auto;
            padding: 1% 20% 1% 20%;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            font-weight: bold;
            justify-content: space-between;
            align-items: center;
        }
        .buttonRow span {
            padding: 0 7% 0 6%;
            font-size: 2vmin;
        }
        .buttonRow button {
            min-height: 100%;
            min-width: 20%;
            border-radius: 10px;
            color: black;
            border-color: black;
            transition-duration: 0.5s;
        }
        .buttonRow button:hover {
            background-color: unset;
            color: unset;
        }
        
        

        .fb {
            -webkit-user-select: none; /* Safari */
            -ms-user-select: none; /* IE 10 and IE 11 */
            user-select: none; /* Standard syntax */
            position: absolute;
            top: 25%;
            left: 20%;
            width: 60%;
            height: 30%;
            padding: 1%;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 6vw;
            text-align: center;
            vertical-align: middle;
            line-height: 0%;
            border-radius: 20px;
            opacity: 0;
            z-index: 991;
        }
    </style>
    <body>
    <div class = 'wrap' id = 'MathWrap'>
        <div class = 'helpText' id = 'helpText'>
           Please decide if the math equation below is correct or wrong
        </div>
        <div class = 'equation' id = 'equation'>
           ${eq}
        </div>
        <div class = 'buttonRow' id = 'buttonRow'>
           <button id="fButton">${btxt[0]}</button>
           <button id="jButton">${btxt[1]}</button>
        </div>
        <div class = 'buttonRow' style="margin: 0; padding-bottom: 3vmin" id = 'buttonRow'>
           <span>Press 'F'</span>
           <span>Press 'J'</span>
        </div>
    </div>
    <div class = 'veil' id = 'veil'></div>    
    </body>
    `
    return html

}

function math_engine() {
    const a = Math.round(Math.random()*20)
    const b = Math.round(Math.random()*20)
    const opor = ['+','-','×']
    const sel_op = opor[Math.floor(Math.random() * opor.length)];
    let ra=0;
    let out;
    let eq;
    if (sel_op === '+') {
        ra = a+b
    } else if (sel_op === '-') {
        ra = a-b
    } else if (sel_op === '×') {
        ra = a*b
    }

    if (Math.random() > 0.5) {
        out = 'Correct'
        eq = `${a} ${sel_op} ${b} = ${ra}`
    } else {
        out = 'Wrong'
        eq = `${a} ${sel_op} ${b} = ${ra + Math.ceil(Math.random()*20) - Math.ceil(Math.random()*20)}`
    }

    return [eq, out]

}

function mathKeypress(e) {
    let resp;
    if(e) {
        resp = e;
        resp.answer = resp.key === 'f' ? this.btxt[0]:this.btxt[1]
        resp.actualCor = resp.answer === this.mathCor;
        console.log(resp)
        document.getElementById(`${e.key}Button`).style.backgroundColor = '#eda532'

    } else {
        resp = {key:'',rt:'',answer:'na',actualCor:'na'}
    }
    const fb = document.createElement('div')
    fb.id = 'fb'
    fb.className = 'fb'

    const fb_text = document.createElement('h1')
    fb_text.id = 'fb-text'
    fb.appendChild(fb_text)
    if (resp.actualCor === true) {
        fb.style.backgroundColor = '#ccdea6'
        fb_text.textContent = 'True!'
        document.getElementById('MathWrap').appendChild(fb)
    } else if (resp.actualCor === false) {
        fb.style.backgroundColor = '#cf9382'
        fb_text.textContent = 'False!'
        document.getElementById('MathWrap').appendChild(fb)
    }
    document.getElementById('veil').style.display = 'inline'
    document.getElementById('veil').animate([
        {backdropFilter: 'none',webkitBackdropFilter: 'none'},
        {backdropFilter: 'blur(30px)',webkitBackdropFilter: 'blur(30px)'},
    ], {duration:400,iterations: 1,delay:500,fill: 'forwards'})
    const aniPromise = fb.animate([
        {opacity: 0},
        {opacity: 1},
    ], {duration:400,iterations: 1,delay:500,fill: 'forwards'}).finished
    aniPromise.then(()=>{
        setTimeout(()=>{
            this.jsPsych.finishTrial(resp)
        },1000)

    })

}

