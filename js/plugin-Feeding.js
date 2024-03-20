/*
 * Jiazhou Chen
 *
 * This plugin will run the gambling task with rank competition
 *
 *
 *
 */

jsPsychFeeding = (function(jspsych) {

    const info = {
        name: 'Feeding',
        description: '',
        parameters: {
            baseGrass: {
                type: jspsych.ParameterType.INT,
                default:20,
            },
            whichBetter: {
                type: jspsych.ParameterType.STRING,
                default: 'left',
            },
            difficulty: {
                type: jspsych.ParameterType.STRING,
                default: 'easy',
            },
            twist: {
                type: jspsych.ParameterType.STRING,
                default: false,
            },
            maxRespTime: {
                type: jspsych.ParameterType.INT,
                default: 4000,
            }
        }
    }

    class FeedingPlugIn {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.timing = {
                fade: 0,
                intro: 200,
                selDur: 1000,
                selDisDur: 1000,
                aniMove: 2000,
                fbDur:3000,
                iti:0,
            }
            this.keyMap = new keyMap()
            this.data = {
                taskName: 'Gamble',
                initTime: 0,
                fbOnsetTime: 0,
                endTime: 0,
                duration: 0,
                difficulty: '',
                twist: '',
                contingency: {},
                key: '',
                rt: 0,
                side: '',
                respType: '',
                fb: '',
                pts: '',
            }
        }

        trial(display_element, trial) {
            this.jsPsych.pluginAPI.clearAllTimeouts()
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            photonSwitch('')
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }

            this.data.difficulty = trial.difficulty
            this.data.twist = trial.twist
            this.data.baseGrass = trial.baseGrass
            this.data.whichBetter = trial.whichBetter


            this.timing.maxRespTime = trial.maxRespTime
            display_element.innerHTML = this.init()
            this.addGrass()
            const veil = document.getElementById('veil')
            veil.style.display = 'flex'
            const opening= veil.animate([
                {opacity: '100%'},
                {opacity: '0%'  },
            ],{duration: 0, delay: 1000, fill: 'forwards'}).finished
            opening.then(() => {

                this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: this.keyInput,
                    valid_responses: this.keyMap.allowedKeys(['left','right']),
                    rt_method: 'performance',
                })
                photonSwitch('f')
            })
        }

        init() {
            let html = ''
            html += `
            <style>
                .wrapLong {
                    display: flex;
                    opacity: 100%;
                    flex-direction: column;
                }
                .veil {
                    display: flex;
                }
                .sheep {
                    font-size: 10vh;
                    margin-top: 0;
                    margin-right: auto;
                    margin-left: auto;
                }
                .wolf {
                    position: absolute;
                    font-size: 10vh;
                    margin-left: auto;
                    margin-right: auto;
                    margin-top: auto;
                    padding: 0;
                }
                .grass {
                    font-size: 10vh;
                    margin-left: auto;
                    margin-right: auto;
                    margin-top: auto;
                    padding: 0;
                }
                #ranches {
                    width: 80vw;
                    height: 70vh;
                    margin: auto;
                    display: flex;
                    flex-direction: row;
                    border-width: 1px;

                }
                .grassContainer {
                    width: 10vh;
                    height: 10vw;
                }
                .ranch {
                    margin: auto;
                    display: flex;
                    width: 30vw;
                    height: 30vh;
                    background-color: #8d9c8a;
                    border-radius: 20px;
                    border-color: #4d2f02;
                    border-width: 2px;
                    overflow: hidden;
                }
                .ranchInner {
                    width: 85%;
                    height: 90%;
                    margin-top: auto;
                    margin-left: auto;
                    margin-right: auto;
                    background-color: #8d9c8a;
                    border-radius: 20px 20px 0px 0px;
                    border-width: 2px 2px 0 2px;
                    border-color: #6c756a;
     
                    
                }

                .checkerboard {
                  
                  background-color: grey;
                  background-image: linear-gradient(
                      45deg,
                      lightgray 25%,
                      transparent 25%,
                      transparent 75%,
                      lightgray 75%,
                      lightgray
                    ),
                    linear-gradient(
                      -45deg,
                      lightgray 25%,
                      transparent 25%,
                      transparent 75%,
                      lightgray 75%,
                      lightgray
                    );
                  background-size: 60px 60px;
                  background-repeat: repeat;
                }
                .ranchGrass {
                    opacity: 10%;
                }
                .goodGrass {
                    max-height: 6vh;
             
                }
                .badGrass {
                    max-height: 5.5vh;

                }
                .fence {
                    background-size: auto auto;
                    background-image: repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(140, 87, 3, 1) 20px, rgba(140, 87, 3, 1) 33px ),repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(197, 125, 8, 1) 19px, rgba(197, 125, 8, 1) 24px );
                }
                .red {
                    color: transparent;  
                    text-shadow: 0 0 0 red;
                }
                #sheepSpace {
                    border-width: 1px;
                    font-size: 10vh;
                    line-height: 15vh;
                    display: flex;
                }
            </style>
            <body>
                <div id="feedWrap" class="wrapLong">
                    
                    <div id="ranches" >
                        <div class="ranch fence">
                            <div id="leftRanch" class="ranchInner checkerboard">
                                
                            </div>
                        </div>
                        <div class="ranch fence">
                            <div id="rightRanch" class="ranchInner checkerboard">
                                
                            </div>
                        </div>
                    </div>
                    <div id="sheepSpace">
                        <span id="sheep" class="sheep">🐑</span>
                    </div>
                    
                    <h1 id="wolf" class="wolf">🐺</h1>
                    
                </div>
                <div id="veil" class="veil"></div>
            </body>
            `
            return html
        }
        addGrass() {
            const whichBetter = this.data.whichBetter
            const ranchBetter = document.getElementById(`${whichBetter}Ranch`)
            const ranchWorse = document.getElementById(`${whichBetter==='left'?'right':'left'}Ranch`)

            const grass = document.createElement('img')
            grass.src = 'img/grass.png'
            grass.className = 'ranchGrass goodGrass'
            const grassContainGood = document.createElement('div')
            const grassContainBad = document.createElement('div')



            for (let i=0; i < this.data.baseGrass+2; i++) {
                ranchBetter.appendChild(grass.cloneNode())
                ranchWorse.appendChild(grass.cloneNode())
            }

            for (let i=0; i < this.data.baseGrass; i++) {

            }

        }
        keyInput(e) {
            console.log('test')
            const sheep = document.getElementById('sheep')
            const action = this.keyMap.getAction(e.key)
            console.log(action)
            // calculate the new position of sheepy
            const ranch = document.getElementById(`${action}Ranch`)

            //reassure the containers so it doesn't move around;
            document.getElementById('sheepSpace').style.height = document.getElementById('sheepSpace').offsetHeight+'px'

            //first fix sheep at initial place;
            const sheepPos = [sheep.offsetTop,sheep.offsetLeft]
            sheep.style.position = 'absolute'
            sheep.style.left = sheepPos[0]+'px';
            sheep.style.top = sheepPos[1]+'px';

            sheep.animate([
                {top: sheepPos[0]+'px', left: sheepPos[1]+'px'},
                {top: (ranch.offsetTop + (ranch.offsetHeight /2) )+'px',left: (ranch.offsetLeft + (ranch.offsetWidth /2 ) - (sheep.offsetWidth /2))  +'px'}
            ],{duration: 1000, fill: 'forwards'})


        }







    }
    FeedingPlugIn.info = info;

    return FeedingPlugIn;
})(jsPsychModule);
