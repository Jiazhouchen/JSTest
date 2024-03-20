/*
 * Jiazhou Chen
 *
 * This plugin will run the math task
 *
 *
 *
 */

jsPsychMathSimp = (function(jspsych) {

    const info = {
        name: 'MathSimp',
        description: '',
        parameters: {
            equation: {
                type: jspsych.ParameterType.STRING,
                default: '1 + 1 = 2',
            },
            correctness: {
                type: jspsych.ParameterType.BOOL,
                default: true,
            }
        }
    }

    class dualPlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }

            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()

            // Draw Phase
            display_element.innerHTML = this.initPage(trial.equation)

            //awaits for response
            const hasDecision = new Promise(resolve => {
                while (window.decision==='') {
                    console.log(window.decision)
                    resolve(true)
                }
            })
            hasDecision.then(()=> {
               console.log('start')
            })


            // awaits for the go ahead for the selection:






        }
        initPage(eq) {
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
                .equation {
                    
                    flex: 1;
                    align-items: center;
                    align-content: center;
                 
                
                }
                .equation span {
                    text-align: center;
                    font-family: "Rubik", sans-serif;
                    font-size: 4em;
                    font-weight: bold;
                    
                    line-height: 4em;
                }
                
                .selection {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    min-height: 80%;
                }
                .resp {
                    display: flex;
                    height: 5vh;
                    width: 10vh;
                    justify-content: center;
                    line-height: 5vh;
                    font-weight: bold;
                    border-radius: 10px;
                    border-color: darkgrey;
                    border-width: 3px;
                }
                .wrapNew {
                    display: flex;
                    height: 100%;
                    width: 100%;
                    flex-direction: column;

                }
                
            </style>
            <body>
                <div class="wrapNew">
                    <div class="equation">
                        <span>${eq}</span>
                    </div>
                    <div class="selection">
                        <div class="resp">TRUE</div>
                        <div class="resp">FALSE</div>
                    </div>
                </div>
                
            </body>
            `


        }

        setUpTask() {
            switch (taskIn) {
                case 'math':
                    // code

            }
        }


    }
    dualPlugin.info = info;

    return dualPlugin;
})(jsPsychModule);





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
