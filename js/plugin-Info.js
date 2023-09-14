var jsPsychInfo = (function (jspsych) {
    'use strict';
    //
    const info = {
        name: 'Info',
        description: 'This is Jiazhous custom information page',
        parameters: {
            countDown: {
                type: jspsych.ParameterType.INT,
                default: 0,
            },
            majorMsg: {
                type: jspsych.ParameterType.STRING,
                default: '',
            },
            minorMsg: {
                type: jspsych.ParameterType.STRING,
                default: '',
            },
            postMajor: {
                type: jspsych.ParameterType.STRING,
                default: '',
            },
            audio: {
                type: jspsych.ParameterType.STRING,
                default: '',
            },
            acFunc: {
                type: jspsych.ParameterType.STRING,
                default: '',
            }
        }
    }

    /**
     * RateEmo
     *
     * plugin for labeling emotions
     * Modified from original script listed @ https://github.com/nivlab/jspsych-demos/tree/main/tasks/self-report
     *
     *
     **/
    class InfoPlugIn {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }
        trial(display_element, trial) {
            trial.jsPsych = this.jsPsych;
            display_element.innerHTML = initInfoHTML(display_element, trial)
            let intervalIndex,  TargetTime, tElapsed;
            if (trial.acFunc !== '') {
                trial.acFunc()
            }

            if (trial.info) {
                updateInfo(trial.info)
            }

            display_element.dispatchEvent(new KeyboardEvent('keydown', {'key': ' '}));
            if (trial.audio==='' && trial.countDown > 0) {
                document.getElementById('counterDowner').style.display = 'flex'
                TargetTime = parseInt(trial.countDown);
                tElapsed = 0;
                document.getElementById('cDt').textContent = (TargetTime - tElapsed)
                intervalIndex = setInterval(() => {
                    tElapsed += 1
                    document.getElementById('cDt').textContent = (TargetTime - tElapsed)
                    if (TargetTime === tElapsed) {
                        clearInterval(intervalIndex)
                        timerOver(trial)

                    }
                },1000)

            } else if (trial.audio !== '') {
                const audio = document.createElement("audio");
                audio.id = `audioPlayer`
                audio.controls = false;
                audio.src = trial.audio;
                audio.textContent = 'Download Audio'
                document.getElementById('infoWrap').appendChild(audio)

                trial.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: () => {
                        document.getElementById('counterDowner').style.display = 'flex'
                        TargetTime = Math.round(audio.duration)+10;
                        tElapsed = 0;
                        document.getElementById('cDt').textContent = (TargetTime - tElapsed)
                        intervalIndex = setInterval(() => {
                            tElapsed += 1
                            document.getElementById('cDt').textContent = (TargetTime - tElapsed)
                            if (TargetTime === tElapsed) {
                                clearInterval(intervalIndex)
                                timerOver(trial)

                            }
                        },1000)
                        audio.play()

                    },
                    valid_responses: [' ','enter','j','f'],
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                })
            } else {
                trial.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: () => {
                        trial.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                        trial.jsPsych.pluginAPI.clearAllTimeouts()
                        trial.jsPsych.finishTrial()
                    },
                    valid_responses: [' ','enter','j','f'],
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                })

            }
            resetSkipButton()
            document.getElementById('skipButton').addEventListener('click',()=> {
                clearInterval(intervalIndex)
                timerOver(trial)
            })

        }

    }
    InfoPlugIn.info = info;

    return InfoPlugIn;

})(jsPsychModule);


function timerOver(trial) {
    trial.jsPsych.pluginAPI.cancelAllKeyboardResponses()
    trial.jsPsych.pluginAPI.clearAllTimeouts()
    const audio = document.getElementById('audioPlayer')
    if (audio) {
        audio.pause()
    }
    document.getElementById('counterDowner').style.display = 'none'
    document.getElementById('majorMsg').innerHTML = trial.postMajor
    document.getElementById('minorMsg').innerHTML = `
                    <p> When you are ready, press the 'space bar' or 'enter' to continue. </p>
                    `
    document.getElementById('minorMsg').style.display = 'block'
    trial.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: () => {
            trial.jsPsych.finishTrial()
        },
        valid_responses: [' ','enter','j','f'],
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
    })
}

function initInfoHTML(display_element, trial) {
    return `

    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Michroma">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Orbitron">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto Condensed">
    <style>
    body {
        user-select: none;
    }
    .majorMsg {
        position: relative;
        font-size: 12vmin;
        font-weight: bolder;
        line-height: 12vmin;
        margin-top: 15vmin;
    }
    .minorMsg {
        position: relative;
        margin-top: 5vmin;
        font-size: 2.5vmin;
        line-height: 2.5vmin;
    }
    .counterDowner {
        justify-content: space-evenly;
        margin-top: 5vmin;
        font-size: 15vmin;
        line-height: 15vmin;
        display: none;
    }
    .counterDowner p {
        font-family: "Orbitron", sans-serif;
        padding: 0;
        margin: 0;
    }

    .counterDowner .tD {
        font-family: "Orbitron", sans-serif;
        font-weight: bolder;
        color: indianred;
    }
    </style>
    <body>
        <div class = 'wrapLong' id="infoWrap">
            <div class = 'majorMsg' id="majorMsg">${trial.majorMsg}</div>
            <div class = 'minorMsg' id="minorMsg">${trial.minorMsg}</div>
            <div class = 'counterDowner' id="counterDowner">
                <p id="cDt" class="tD" style="width: 20vmin">200</p>
                <p> sec</p>
            </div>

        </div>
    </body>
    `
}