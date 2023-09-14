/*
 * Jiazhou Chen
 *
 * This plugin will run the math task
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
            whichSide: {
                type: jspsych.ParameterType.STRING,
                default: '',
            },
            maxRespTime: {
                type: jspsych.ParameterType.INT,
                default: 5000,
            }
        }
    }

    class MathPlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.timing = {
                fade: 0,
                intro: 200,
                selDur: 500,
                fbDur:2000,
                iti:0,
            }
        }

        trial(display_element, trial) {
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }


            let eq, cor, op;
            if (trial.mathEquation === '') {
                [eq, cor, op] = math_engine()
            } else {
                let eq = trial.mathEquation;
                let cor = trial.mathCorr;
            }
            trial.initTime = performance.now()
            if (trial.whichSide === '') {
                trial.whichSide = Math.random() > 0.5 ? 'left':'right';
            }
            if (trial.whichSide === 'left') {
                trial.btxt = ['Correct','Wrong'];
            } else {
                trial.btxt = ['Wrong','Correct'];
            }

            trial.mathCor = cor;
            trial.jsPsych = this.jsPsych;
            trial.mathEquation = eq;
            trial.mathOperation = op;


            resetSkipButton()
            document.getElementById('skipButton').addEventListener('click',()=> {
                alert("Skipping entire task block")
                trial.jsPsych.endCurrentTimeline()
                trial.jsPsych.finishTrial()
                trial.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                trial.jsPsych.pluginAPI.clearAllTimeouts()
            })
            // set up information:

            updateInfo('You have 5 seconds to make a response here. Afterwards the feedback will display for 2s.' +
                'Total scheduled time per trial is 12s, including emotion ratings ' +
                'There will be 30 trials for the short version and 100 for long.' +
                'The math task will have a difficulty score for every trial. ' +
                'Currently, we consider number of digits and operation type. ' +
                'The score should be (NumDigits1 * NumDigits2)^OperationScale. ' +
                'Operation scale is 1 for + / - but 2 for *.')

            // replace RPE engine here to generate
            display_element.innerHTML = this.initMathPage(eq,trial.btxt)

            const veil = document.getElementById('veil')
            veil.style.display = 'flex'

            const stat1 = veil.animate([
                {opacity: '100%'},
                {opacity: '0%'},
            ], {duration:this.timing.fade,iterations: 1,delay:this.timing.intro,fill: 'forwards'}).finished

            stat1.then(()=>{
                document.getElementById('veil').style.display = 'none'
                this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: (e) => {
                        this.mathKeypress(e,trial)
                    },
                    valid_responses: ['j','J','f','F'],
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false,
                });
                this.jsPsych.pluginAPI.setTimeout((e) => {
                    this.mathKeypress(e,trial)
                },trial.maxRespTime)

            })




        }

        initMathPage(eq,btxt) {
            let html = `
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Rubik">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Bebas Neue">
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
                    margin: auto;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    padding: 1%;
                    font-family: "Oswald", sans-serif; 
                    aspect-ratio: auto 3/1;
                    min-width: 50vw;
                    font-size: 5rem;
                    line-height: 5rem;
                    border-radius: 20px;
                    opacity: 0;
                    z-index: 992;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                }
                .fb p {
                    margin: auto;
                }
                .fb strong {
                    font-size: 6rem;
                }
                .fb h1 {
                    margin: auto;
                    font-size: 7rem;
                    font-weight: 1000;
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

        mathKeypress(e, trial) {
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()
            let resp;
            if(e) {
                resp = e;
                resp.answer = resp.key === 'f' ? trial.btxt[0]:trial.btxt[1]
                resp.actualCor = resp.answer === trial.mathCor;
                resp.equation = trial.mathEquation;
                resp.operation = trial.mathOperation;
                resp.initTime = trial.initTime;
                resp.pts = calScoreMath(resp)
                document.getElementById(`${e.key}Button`).style.backgroundColor = '#eda532'

                console.log(resp.pts)

            } else {
                resp = {
                    key:'',
                    rt:'',
                    equation:trial.mathEquation,
                    operation:trial.mathOperation,
                    answer:'na',
                    actualCor:'na',
                }
            }
            const fb = document.createElement('div')
            fb.id = 'fb'
            fb.className = 'fb'
            fb.style.backgroundColor = '#d1d1d1'
            fb.innerHTML = `<h1>No response</h1>`

            document.getElementById('veil').appendChild(fb)

            if (resp.actualCor === true) {
                fb.style.backgroundColor = '#ccdea6'
                fb.innerHTML = `<h1>TRUE!</h1><p>You earn <strong>${resp.pts}</strong> points</p>`

            } else if (resp.actualCor === false) {
                fb.style.backgroundColor = '#db9a86'
                fb.innerHTML = `<h1>FALSE!</h1>`

            }



            document.getElementById('veil').animate([
                {opacity: '0%',display: 'none'},
                {opacity: '100%', display: 'flex'},
            ], {duration:this.timing.fade,iterations: 1,delay:this.timing.selDur,fill: 'forwards'})
            const aniPromise = fb.animate([
                {opacity: '0%'},
                {opacity: '100%'},
            ], {duration:this.timing.fade,iterations: 1,delay:this.timing.selDur,fill: 'forwards'}).finished
            aniPromise.then(()=>{
                this.jsPsych.pluginAPI.setTimeout(()=>{
                    this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                    this.jsPsych.pluginAPI.clearAllTimeouts()
                    this.jsPsych.finishTrial(resp)
                },this.timing.fbDur)

            })

        }

    }
    MathPlugin.info = info;

    return MathPlugin;
})(jsPsychModule);





function math_engine() {
    const a = Math.round(Math.random()*20)
    const b = Math.round(Math.random()*20)
    const ops = ['+','-','×']
    const sel_op = ops[Math.floor(Math.random() * ops.length)];
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

    return [eq, out, sel_op]

}



