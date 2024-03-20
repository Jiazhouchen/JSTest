const jsPsychLocalizer = (function (jspsych) {
    'use strict';
    //
    const info = {
        name: 'localizer',
        description: 'This is Jiazhous custom information page',
        parameters: {
            localType: {
                type: jspsych.ParameterType.string,
                default: 'audio',
            },
            audioNumThres: {
                type: jspsych.ParameterType.INT,
                default: 3,
            },
            visualNumThres: {
                type: jspsych.ParameterType.INT,
                default: 3,
            }
        }
    }

    class InfoPlugIn {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.majorMsg = '';
            this.minorMsg = '';
            this.postMajor = '';
            this.data = {
                taskName: 'localizer',
                localType: ''
            }
            this.alphabet = "abcdefghijklmnopqrstuvwxyz";
        }

        trial(display_element, trial) {
            this.data.localType = trial.localType
            this.data.initTime = performance.now()
            this.data.sequence = []
            this.data.audioNumThres = trial.audioNumThres
            this.data.visualNumThres = trial.visualNumThres
            display_element.innerHTML = this.initLocalize()

            // blue is auditory localizer
            if (this.data.localType === 'audio') {
                document.getElementById('infoWrap').style.borderColor = 'navy'
                document.getElementById('infoWrap').style.borderWidth = '2px'
                this.stopAudio = false
                this.audioCounter = 0
                this.audioSignature = document.createElement("audio");
                this.audioSignature.controls = false;
                this.audioSignature.preload = 'auto';
                this.audioSignature.src = 'beeps/1000Hz_44100_0_300008.wav';
                this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: () => {
                        this.audioPlay(2000)
                        this.jsPsych.pluginAPI.getKeyboardResponse({
                            callback_function: () => {
                                console.log('STOP')
                                this.stopAudio = true
                                this.jsPsych.pluginAPI.setTimeout(()=> {
                                    this.endTrial()
                                }, 2000)
                            },
                            valid_responses: [' ','enter'],
                            rt_method: 'performance',
                            persist: false,
                            allow_held_key: false
                        })
                    },
                    valid_responses: [' ','enter'],
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                })
            }

            if (this.data.localType === 'visual') {
                document.getElementById('infoWrap').style.borderColor = 'orange'
                document.getElementById('infoWrap').style.borderWidth = '2px'

                this.stopVisual = false;
                this.visualCounter = 0;

                document.getElementById('infoWrap').style.backgroundColor = 'white'
                this.newString()

                this.infoWrap = document.getElementById('infoWrap')
                this.txtD = document.createElement('div')
                this.crossD = document.getElementById('centerCross')

                this.txtD.className = 'txtDisplay'
                this.txtD.id = 'txtDisplay'
                this.txtD.innerText = this.displayString.toUpperCase()
                this.txtD.style.display = 'none'


                this.infoWrap.appendChild(this.txtD)

                this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: () => {
                        this.visualDisplay(2000)
                        this.jsPsych.pluginAPI.getKeyboardResponse({
                            callback_function: () => {
                                console.log('STOP')
                                this.stopVisual = true
                                this.jsPsych.pluginAPI.setTimeout(()=> {
                                    this.endTrial()
                                }, 2000)
                            },
                            valid_responses: [' ','enter'],
                            rt_method: 'performance',
                            persist: false,
                            allow_held_key: false
                        })
                    },
                    valid_responses: [' ','enter'],
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                })

            }


        }

        visualDisplay(timeOut) {
            this.crossD.style.display = 'none'
            this.txtD.style.display = 'flex'
            photonSwitch('localVisual-beg')
            this.data.sequence.push({
                type: 'visual-display',
                time: performance.now()
            })
            this.visualCounter = this.visualCounter + 1

            const pvPromise = new Promise((resolve) => {
                this.jsPsych.pluginAPI.setTimeout(() => {
                    this.crossD.style.display = 'flex'
                    this.txtD.style.display = 'none'
                    this.newString()
                    this.txtD.innerText = this.displayString.toUpperCase()
                    resolve(true)
                }, 500)
            })
            pvPromise.then(()=> {
                if (this.visualCounter >= this.data.visualNumThres) {
                    this.stopVisual = true
                    this.jsPsych.pluginAPI.setTimeout(()=> {
                        this.endTrial()
                    }, 2000)
                }
                if (this.stopVisual !== true) {
                    this.jsPsych.pluginAPI.setTimeout(()=>{
                        this.visualDisplay(timeOut)
                    }, timeOut)
                }
            })

        }
        newString() {
            this.displayString = "";
            while (this.displayString.length < 5) {
                this.displayString += this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
            }
            console.log(this.displayString.toUpperCase())
        }
        audioPlay(timeOut) {
            photonSwitch('localAudio-beg')
            this.data.sequence.push({
                type: 'audio-play',
                time: performance.now()
            })
            const au = this.audioSignature.play()
            this.audioCounter = this.audioCounter + 1
            if (this.audioCounter >= this.data.audioNumThres) {
                this.stopAudio = true
                this.jsPsych.pluginAPI.setTimeout(()=> {
                    this.endTrial()
                }, 2000)
            }
            if (this.stopAudio !== true) {
                au.then(()=> {
                    this.jsPsych.pluginAPI.setTimeout(()=>{
                        this.audioPlay(timeOut)
                    }, timeOut)
                })
            }

        }
        endTrial() {
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()
            this.jsPsych.finishTrial(this.data)

        }
        initLocalize() {
            return `
                <style>
                body {
                    user-select: none;
                }
                .wrapLong {
                    display: flex;
                }
                .centerCross {
                    font-size: 10rem;
                    font-family: "Orbitron", sans-serif;
                    margin: auto;
                }
                .txtDisplay {
                    font-size: 10rem;
                    font-family: "Orbitron", sans-serif;
                    margin: auto;
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
                        <div class="centerCross" id="centerCross">
                            +
                        </div>
                    </div>
                </body>
            `
        }
    }
    InfoPlugIn.info = info;

    return InfoPlugIn;

})(jsPsychModule);
