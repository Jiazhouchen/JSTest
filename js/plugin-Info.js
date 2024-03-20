const jsPsychInfo = (function (jspsych) {
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
            showCounter: {
                type: jspsych.ParameterType.BOOL,
                default: false,
            },
            addWave: {
                type: jspsych.ParameterType.BOOL,
                default: false,
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
            this.majorMsg = '';
            this.minorMsg = '';
            this.postMajor = '';
            this.data = {
                taskName: 'information',
                taskType: '',
            }
            this.countdownDuration = 0;
        }
        trial(display_element, trial) {
            this.majorMsg = trial.majorMsg
            this.minorMsg = trial.minorMsg
            this.postMajor = trial.postMajor
            this.counterDisplayText = trial.showCounter?'flex':'none'
            this.data.showCountdown = trial.showCounter
            this.countdownDuration = parseInt(trial.countDown)
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()

            display_element.innerHTML = this.initInfoHTML()

            let audioIP, canvas;
            if (trial.audio !== '') {
                console.log('audio')
                audioIP = document.createElement("audio");
                canvas = document.createElement('canvas');

                audioIP.id = `audioPlayer`
                audioIP.controls = false;
                audioIP.preload = 'auto';
                audioIP.src = trial.audio;
                audioIP.textContent = 'Download Audio'
                document.getElementById('infoWrap').appendChild(audioIP)
                document.getElementById('infoWrap').appendChild(canvas);
                this.data.taskType += 'audio'
                this.data.audioFile = trial.audio

                if (trial.addWave) {
                    let wave = new Wave(audioIP, canvas);
                    wave.addAnimation(new wave.animations.Wave());
                }
                //

                audioIP.addEventListener("loadeddata", () => {
                    console.log("Audio data loaded");
                    console.log("Audio duration: " + audioIP.duration);
                    this.countdownDuration = Math.ceil(audioIP.duration);
                    this.DoCountdown(audioIP)
                });
            } else if (this.countdownDuration > 0) {
                this.DoCountdown(audioIP)
            } else {
                this.data.taskType += 'info'
                this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: () => {
                        this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                        this.jsPsych.pluginAPI.clearAllTimeouts()
                        this.jsPsych.finishTrial(this.data)
                    },
                    valid_responses: [' ','enter','j','f'],
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                })

            }

        }

        initInfoHTML() {
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
                    <div class = 'majorMsg' id="majorMsg">${this.majorMsg}</div>
                    <div class = 'minorMsg' id="minorMsg">${this.minorMsg}</div>
                    <div class = 'counterDowner' id="counterDowner">
                        <p id="cDt" class="tD" style="width: 20vmin">200</p>
                        <p> sec</p>
                    </div>
                </div>
            </body>
            `
        }

        DoCountdown(audioIP) {
            this.data.taskType += 'countdown'

            this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: () => {
                    document.getElementById('minorMsg').childNodes[0].textContent = 'listen to the story now'
                    document.getElementById('counterDowner').style.display = this.counterDisplayText
                    let endTime = this.countdownDuration;
                    let elapsedTime = 0;
                    document.getElementById('cDt').textContent = String(endTime - elapsedTime)
                    audioIP.play().then(()=> {
                        photonSwitch('audio-beg')
                        let intervalIndex = setInterval(() => {
                            elapsedTime += 1
                            document.getElementById('cDt').textContent = String(endTime - elapsedTime)
                            if (endTime === elapsedTime) {
                                clearInterval(intervalIndex)
                                photonSwitch('audio-end')
                                this.timerOver()
                            }
                        },1000)
                    })
                },
                valid_responses: [' ','enter','j','f'],
                rt_method: 'performance',
                persist: false,
                allow_held_key: false
            })
        }

        timerOver() {
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()
            const audio = document.getElementById('audioPlayer')
            if (audio) {
                audio.pause()
            }
            document.getElementById('counterDowner').style.display = 'none'
            document.getElementById('majorMsg').innerHTML = this.postMajor
            document.getElementById('minorMsg').innerHTML = `
                    <p> When you are ready, press the 'space bar' or 'enter' to continue. </p>
                    `
            document.getElementById('minorMsg').style.display = 'block'
            this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: () => {
                    this.jsPsych.finishTrial(this.data)
                },
                valid_responses: [' ','enter','j','f'],
                rt_method: 'performance',
                persist: false,
                allow_held_key: false
            })
        }
    }
    InfoPlugIn.info = info;

    return InfoPlugIn;

})(jsPsychModule);


