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
            difficulty: {
                type: jspsych.ParameterType.STRING,
                default: 'easy',
            },
            twist: {
                type: jspsych.ParameterType.BOOL,
                default: false,
            },
            whichSide: {
                type: jspsych.ParameterType.STRING,
                default: 'left',
            },
            maxRespTime: {
                type: jspsych.ParameterType.INT,
                default: -1,
            },
            digitLength: {
                type: jspsych.ParameterType.INT,
                default: 2,
            },
            operationLevel: {
                type: jspsych.ParameterType.INT,
                default: 0,
            },
            oldFb: {
                type: jspsych.ParameterType.BOOL,
                default: false,
            }

        }
    }

    class MathPlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.timing = initTiming()
            this.keyMap = new keyMap()
            this.data = initData('Math')
        }

        trial(display_element, trial) {
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }
            this.data.initTime = performance.now()
            if (trial.maxRespTime > 0) {
                this.timing.maxRespTime = trial.maxRespTime
            }

            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()

            // set up the default contingencies:
            if (trial.difficulty === 'easy') {
                trial.digitLength = 1
            } else if (trial.difficulty === 'hard') {
                trial.digitLength = 2
            }

            if (trial.twist === true) {
                trial.operationLevel = 1
            } else if (trial.twist === false) {
                trial.operationLevel = 0
            }

            if (trial.whichSide === '') {
                trial.whichSide = Math.random() > 0.5 ? 'left':'right';
            }
            // DO NOT USE RIGHT SIDE
            if (trial.whichSide === 'left') {
                this.btxt = ['TRUE','FALSE'];
            } else {
                this.btxt = ['FALSE','TRUE'];
            }
            this.data.TRUEside = trial.whichSide

            this.data.difficulty = trial.difficulty
            this.data.twist = trial.twist
            this.oldFb = trial.oldFb
            let eq, cor, corLogi, op;
            if (trial.mathEquation === '') {
                [eq, corLogi, op] = mathEngine(trial.digitLength, trial.operationLevel)
                cor = corLogi?'TRUE':'FALSE'

            } else {
                eq = trial.mathEquation;
                cor = trial.mathCorr;
                op = ''
            }

            this.data.contingency = {
                equation: eq,
                operation: op,
                fact: cor,
                digitLength: trial.digitLength,
                operationLevel: trial.operationLevel,
            }

            // replace RPE engine here to generate
            display_element.innerHTML = this.initMathPage(eq,this.btxt)

            const stat1 = resolveAfter(this.timing.init,'',this.jsPsych)

            stat1.then(()=>{
                document.getElementById('veil').style.display = 'none'
                photonSwitch('math-stim')
                this.data.stimOnset = performance.now()
                this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: this.mathKeypress,
                    valid_responses: this.keyMap.allowedKeys(['left','right']),
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false,
                });
                this.jsPsych.pluginAPI.setTimeout(() => {
                    this.mathKeypress('')
                },this.timing.maxRespTime)

            })




        }
        initMathPage(eq,btxt) {
            return `
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
                    padding-bottom: 8%;
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
                    justify-content: space-around;
                    align-items: center;
                }
                .buttonRow span {
                    margin: auto;
                    font-size: 2vmin;
                }
                .buttonRow button {
                    height: 5vw;
                    aspect-ratio: auto 3 / 1;
                    border-radius: 10px;
                    color: black;
                    border-color: black;
                    transition-duration: 0.5s;
                }
                .buttonRow button:hover {
                    background-color: unset;
                    color: unset;
                }
                
            </style>
            <body>
            <div class = 'wrapLong' id = 'MathWrap'>
                <div class = 'helpText' id = 'helpText'>
                   
                </div>
                <div class = 'equation' id = 'equation'>
                   ${eq}
                </div>
                <div class = 'buttonRow' id = 'buttonRow'>
                   <button id="leftButton">${btxt[0]}</button>
                   <button id="rightButton">${btxt[1]}</button>
                </div>
                <div class = 'buttonRow' style="margin: 0; padding-bottom: 3vmin" id = 'buttonRow2'>
                   <span>Press LEFT key</span>
                   <span>Press RIGHT key</span>
                </div>
            </div>
            <div class = 'veil' id = 'veil'></div>    
            </body>
            `


        }

        mathKeypress(e) {
            photonSwitch('math-resp')
            this.data.keyPressOnset = performance.now()
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()
            console.log(e)


            if(e !== '') {
                this.data.key = this.keyMap.getAction(e.key.toLowerCase());
                this.data.rt  = e.rt;
                this.data.respType    = (this.data.key === 'left' ? this.btxt[0]:this.btxt[1])
                this.data.respFactual = (this.data.respType === this.data.contingency.fact);
                document.getElementById(`${this.data.key}Button`).style.backgroundColor = '#eda532'
            } else {
                this.data.fb = 'noresp'
                this.data.respType = 'noresp'
                this.data.respFactual = 'noresp'
                document.getElementById('equation').remove()
                document.getElementById(`leftButton`).remove()
                document.getElementById(`rightButton`).remove()
                document.getElementById(`buttonRow2`).remove()
            }


            let uChoice, cfChoice, cSn;
            const diffScore = calScoreMath({
                digitLength: this.data.contingency.digitLength,
                operationLevel: this.data.contingency.operationLevel,
                rt: this.data.rt,
                maxRespTime: this.timing.maxRespTime,
            });
            const invertScore = Math.round((diffScore - Math.random()*3) -10);
            this.data.pts = -10;
            this.data.cfPts = diffScore;
            uChoice = 'Did not respond'
            cfChoice = this.data.contingency.fact
            cSn = 3

            if (this.data.respFactual === true) {
                uChoice = this.data.respType
                cfChoice = (this.data.respType === 'TRUE' ? 'FALSE':'TRUE')
                this.data.pts = diffScore
                this.data.cfPts = invertScore
                this.data.fb = 'correct'
                cSn = 0

            } else if (this.data.respFactual === false) {
                uChoice = this.data.respType
                cfChoice = (this.data.respType === 'TRUE' ? 'FALSE':'TRUE')
                this.data.pts = invertScore
                this.data.cfPts = diffScore
                this.data.fb = 'wrong'
                cSn = 1
            }
            const fb = standardFeedback(uChoice,this.data.pts,cfChoice,this.data.cfPts,this.data.fb==='noresp',
                cSn,'chose',false,this.oldFb)
            fb.id = 'fb'
            document.getElementById('veil').appendChild(fb)
            const fb1 = resolveAfter(this.timing.selDur,'',this.jsPsych)
            fb1.then(()=>{
                document.getElementById('veil').style.display = 'flex'
                const fb2 = resolveAfter(this.timing.preFb,'',this.jsPsych)
                fb2.then(()=>{
                    fb.style.opacity = '100%'
                    photonSwitch('math-fbOn')
                    this.data.fbOnset = performance.now()
                    this.jsPsych.pluginAPI.setTimeout(()=>{
                        this.data.endTime = performance.now()
                        this.data.duration = this.data.endTime - this.data.initTime
                        this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                        this.jsPsych.pluginAPI.clearAllTimeouts()
                        this.jsPsych.finishTrial(this.data)
                    },this.timing.fbDur)
                })
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
        out = 'TRUE'
        eq = `${a} ${sel_op} ${b} = ${ra}`
    } else {
        out = 'FALSE'
        eq = `${a} ${sel_op} ${b} = ${ra + Math.ceil(Math.random()*9) - Math.ceil(Math.random()*9)}`
    }

    return [eq, out, sel_op]

}

function mathEngine(sDl, oDl, Cor) {
    // Not sure why I used these confusing variable names:
    // sDl is the digits length 1 is 1 2 is 2
    // oDl is the operation level 0 is +/- and 1 is x
    // Cor is whether this is TRUE or FALSE equations

    let d2, d1, d4, ans, equation
    let d3 = String(Math.ceil(Math.random()*2)) + String(Math.ceil(Math.random()*9))

    if (sDl === 2) {
        d4 = String(Math.ceil(Math.random()*2)) + String(Math.ceil(Math.random()*9))
        while (d4 === d3 ) {
            d4 = String(Math.ceil(Math.random()*2)) + String(Math.ceil(Math.random()*9))
        }
    } else {
        d4 = String(Math.ceil(Math.random()*9))
        while(d4 === '1'){
            d4 = String(Math.ceil(Math.random()*9))
        }
    }
    if (typeof Cor === 'undefined') {
        Cor = Math.random() > 0.5;
    }
    if (Math.random() > 0.5) {
        d1 = d3
        d2 = d4
    } else {
        d1 = d4
        d2 = d3
    }
    const dNoise = String(Math.round(Math.random()*2)) + String(Math.round(Math.random()*9))
    // random generation like this should be oaky since the sample pool is just too large.
    // There is chances that it might ended up having the same equation here and there;
    const operationsAll = ['+','-','×']
    let operation;
    if (oDl === 1) {
        operation = '×'
    } else if (oDl === 0) {
        operation = Math.random() > 0.5?'+':'-'
    } else {
        operation = operationsAll[Math.floor(Math.random() * operationsAll.length)];
    }
    if (operation === '+') {
        ans = parseInt(d1)+parseInt(d2)
    } else if (operation === '-') {
        ans = parseInt(d1)-parseInt(d2)
    } else if (operation === '×') {
        ans = parseInt(d1)*parseInt(d2)
    }

    if (Cor===true) {
        // randomize the placement of the longer digits (if it's the same then it's fine)
        equation = `${d1} ${operation} ${d2} = ${ans}`
    } else {
        equation = `${d1} ${operation} ${d2} = ${parseInt(ans)+parseInt(dNoise)}`
    }
    // returning Cor just to ensure backward compatibility when something is
    return [equation, Cor, operation]
}

function calScoreMath(dt) {
    console.log("Math Scoring V2")
    let rtScore  = (1-Math.pow(2, dt.rt/1000)) / 3
    if (rtScore > 0) {
        rtScore = 0
    } else if (rtScore < -5) {
        rtScore = -5
    }
    let dScore = 1 + ((dt.digitLength-1) * 2) + (dt.operationLevel * 2) + (5 + rtScore)
    console.log(`rt score: ${rtScore}, total score: ${dScore}`)
    dScore = Math.floor(dScore)
    //const dScore = ( ((dt.digitLength) * 1.6) + ((dt.operationLevel)*0.8) - (dt.rt / dt.maxRespTime) ) * 25
    return dScore
}



