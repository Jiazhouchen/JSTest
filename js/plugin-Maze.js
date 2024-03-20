const jsPsychMaze = (function (jspsych) {
    'use strict';
    //
    const info = {
        name: 'Maze',
        description: '',
        parameters: {
            preset: {
                type: jspsych.ParameterType.INT,
                default: 0,
            },
            limit: {
                type: jspsych.ParameterType.STRING,
                default: 'time'
            },
            showStep: {
                type: jspsych.ParameterType.INT,
                default: false,
            },
            stepLimit: {
                type: jspsych.ParameterType.INT,
                default: 10,
            },
            timeLimit: {
                type: jspsych.ParameterType.INT,
                description: 'this is the time limit in ms',
                default: 10000,
            },
            stopAtBox: {
                type: jspsych.ParameterType.BOOL,
                description: 'to terminate at box or not',
                default: true,
            },
            reverse: {
                type: jspsych.ParameterType.BOOL,
                description: 'to reverse the points earning scheme or not',
                default: false,
            },
            difficulty: {
                type: jspsych.ParameterType.STRING,
                default: '',
            },
            twist: {
                type: jspsych.ParameterType.BOOL,
                default: '',
            },
            oldFb: {
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
    class MazePlugIn {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.timing = initTiming()
            this.timing.eosDur = 500
            this.timing.movement = 200
            this.timing.boxZoom = 500
            this.keyMap = new keyMap()
            this.data = initData('Maze')
            this.trialComplete = false
        }
        trial(display_element, trial) {
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()
            this.data.initTime = performance.now()
            // Display HTML.
            this.data.difficulty = trial.difficulty
            this.data.twist = trial.twist
            this.oldFb = trial.oldFb
            display_element.innerHTML = this.initMazePage(display_element,trial);
            if (trial.preset === 0) {
                trial.preset = {
                    cells_w: 25,
                    cells_h: 25,
                    c1Pos: [1,1],
                    prizePos: [1,2],
                }
            }

            if (!trial.preset.prizePos) {
                trial.preset.prizePos = trial.preset.pricePos
            }

            this.data.contingency = {
                size: trial.preset.cells_h,
                initPos: trial.preset.c1Pos,
                giftPos: trial.preset.prizePos,
                condiV: trial.preset.condiV,
                limit: trial.limit,
                reverse: trial.reverse,
                showStep: trial.showStep,
                stopAtBox: trial.stopAtBox,
                timeLimit: trial.timeLimit,
            }

            const curMaze = genMaze(trial.preset,'mazeWrap')
            curMaze.id = 'curMaze';
            const c1 = document.getElementById('mzC1')
            const infoBox = document.createElement('div')
            if (trial.limit === 'step') {
                infoBox.innerHTML = this.getInnerHTML('counter',trial.stepLimit)
            } else {
                infoBox.innerHTML = this.getInnerHTML('countdown', (650) / 1000)
            }
            infoBox.className = 'infoBox'
            infoBox.id = 'infoBox'
            document.getElementById('mazeWrap').appendChild(infoBox)

            resize_maze()
            addEventListener("resize", resize_maze);

            trial.validSteps = 0;
            trial.endPos = [Number(c1.getAttribute('pos_r')), Number(c1.getAttribute('pos_c'))]

            const stat1 = resolveAfter(this.timing.init,'',this.jsPsych)

            stat1.then(()=>{
                document.getElementById('veil').style.display = 'none'
                photonSwitch('maze-stim')
                this.data.stimOnset = performance.now()
                this.setUpMazeResp(display_element,trial)
            })







        }

        initMazePage() {
            let html = ''
            html += `
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Oswald">
            <style>
            .veil {
                background-color: whitesmoke;
            }
            .mzTight {
                /* table style */
                position: absolute;
                top: 5%;
                padding:16px;
                border-spacing: 0;
                border-radius: 10px;
                box-shadow: 5px 5px 10px rgb(224,224,224);
            }
            .mzTR {
                border: none;
                width: auto;
            }
            .mzW {
                /* wall cell */
                border: none;
                background-color: black;
            }
            
            .mzF {
                /* floor cell */
                border: 1px solid lightgrey; 
                padding: 0;
                margin: 0;
                border-spacing: 0;
                line-height: 0;
                background-color: white;
            }
            .mzC1 {
                position: absolute;              
                background-color: #c8e6d0;
                overflow: hidden;
                border-radius: 10px;
                scale: 80%;
                z-index: 99;
                opacity: 80%;
            }
            
            .mzPrize {
                position: absolute;
                border: 1px solid lightgoldenrodyellow; 
                background-color: gold;
                overflow: hidden;
                border-radius: 10px;
                scale: 90%;
                z-index: 98;
            }
            .infoBox {
                font-family: "Oswald", sans-serif;  
                position: absolute;
                display: flex;
                flex-direction: column;
                font-size: 3rem;
                backdrop-filter: blur(20px);
                line-height: 100%;
                align-items:center;
                justify-content:space-around;
                background-color: white;
                border-radius: 10px;
                box-shadow: 5px 5px 10px rgb(224,224,224);
                z-index: 2;
            }
            .infoBox div {
                margin: auto;
                width: 80%;
            }
            .infoBox p {
                margin: auto;
            }
            .infoBox strong {
                color: indianred;
                font-size: 3.4rem;
            }
            
            
            </style>
            <body>
            <div class = 'wrapLong' id = 'mazeWrap'>
                
            </div>
            <div class = 'veil' id = 'veil'>
            </div>    
            </body>
            `
            return html

        }


        setUpMazeResp(display_element,trial) {
            let curCount = 0;
            let elapsedTime = 0;
            this.data.sequence = [];
            let sIcd;
            let c1 = document.getElementById('mzC1')
            const infoBox = document.getElementById('infoBox')
            let mzKB = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: (e) => {
                    if (curCount===0) {
                        photonSwitch('maze-firstKey')
                        this.data.keyPressOnset = performance.now()
                    }
                    curCount+=1
                    this.data.sequence.push({'key': e.key, 'time_stamp': performance.now()})
                    const out = this.moveIt('mzC1',trial.preset,trial.endPos, e.key, trial.showStep)
                    trial.endPos = out[0];
                    c1.setAttribute('pos_r',trial.endPos[0])
                    c1.setAttribute('pos_c',trial.endPos[1])
                    if (out[1] === true) {trial.validSteps+=1}
                    infoBox.animate([
                        {transform: 'scale(1)'},
                        {transform: 'scale(0.95)'}
                    ], {duration:200, iterations:1, fill:"backwards"})
                    if (trial.limit === 'step') {
                        infoBox.innerHTML = this.getInnerHTML('counter',trial.stepLimit - curCount)
                        if (curCount >= trial.stepLimit) {
                            infoBox.animate([
                                    {backgroundColor: 'white'},
                                    {backgroundColor: '#dbb5a0'}, {backgroundColor: 'white'},
                                ],
                                {duration:500,iterations: 1,delay:0,fill: 'forwards'})
                            this.jsPsych.pluginAPI.cancelKeyboardResponse(mzKB)
                            if (trial.showStep === true) {
                                trial.endTime = performance.now()
                                this.jsPsych.pluginAPI.cancelKeyboardResponse(mzKB)
                                this.jsPsych.pluginAPI.setTimeout(()=> {

                                    this.endMaze(this.data)
                                }, this.timing.eosDur)
                            } else {
                                trial.endTime = performance.now()
                                const ix = this.moveSeq(trial.preset.c1Pos,trial,this.data.sequence)
                                ix.then((out)=> {
                                    trial.endPos = out[0]
                                    trial.validSteps = out[1]
                                    this.jsPsych.pluginAPI.setTimeout(()=>{

                                        this.endMaze(this.data)
                                    }, this.timing.eosDur)
                                })
                            }
                        }
                    }
                    if (trial.limit === 'time' && trial.stopAtBox === true && trial.endPos[0] === trial.preset.prizePos[0] && trial.endPos[1] === trial.preset.prizePos[1]) {
                        this.jsPsych.pluginAPI.clearAllTimeouts()
                        this.jsPsych.pluginAPI.cancelKeyboardResponse(mzKB)
                        clearInterval(sIcd)
                        this.data.endRespTime = performance.now()
                        if (trial.showStep !== true) {
                            photonSwitch('maze-begMove')
                            const ix = this.moveSeq(trial.preset.c1Pos,trial,this.data.sequence)
                            ix.then((out)=> {
                                this.data.endPos = out[0]
                                this.data.validSteps = out[1]
                                this.data.residualTime = (trial.timeLimit - elapsedTime) / 1000
                                this.jsPsych.pluginAPI.setTimeout(()=>{
                                    this.endMaze(trial)
                                }, this.timing.eosDur)
                            })
                        } else {
                            resolveAfter(this.timing.eosDur,'',this.jsPsych).then(this.endMaze)
                        }
                    }

                },
                valid_responses: this.keyMap.allowedKeys(['left','right','up','down']),
                rt_method: 'performance',
                persist: true,
                allow_held_key: false,
            })

            if (trial.limit === 'time') {

                sIcd = setInterval(() => {
                    elapsedTime += 100
                    document.getElementById('infoBox').innerHTML = this.getInnerHTML('countdown', (trial.timeLimit - elapsedTime) / 1000)
                    if (elapsedTime >= trial.timeLimit) {
                        clearInterval(sIcd)
                    }
                },100)
                this.jsPsych.pluginAPI.setTimeout(() => {
                    this.data.endRespTime = performance.now()
                    clearInterval(sIcd)
                    this.jsPsych.pluginAPI.clearAllTimeouts()
                    this.jsPsych.pluginAPI.cancelKeyboardResponse()
                    if (trial.showStep !== true) {
                        photonSwitch('maze-begMove')
                        const ix = this.moveSeq(trial.preset.c1Pos,trial,this.data.sequence)
                        ix.then((out)=> {
                            this.data.endPos = out[0]
                            this.data.validSteps = out[1]
                            this.data.residualTime = (trial.timeLimit - elapsedTime) / 1000
                            this.jsPsych.pluginAPI.setTimeout(()=>{
                                this.endMaze(trial)
                            }, this.timing.eosDur)
                        })
                    } else {
                        resolveAfter(this.timing.eosDur,'',this.jsPsych).then(this.endMaze)
                    }

                },trial.timeLimit)
            }
        }

        moveSeq(curPos,trial,seq) {
            if (trial.reverse===true) {
                document.getElementById('mzPrize').textContent = '💀'
                document.getElementById('mzPrize').style.backgroundColor = '#5a4a78'
                document.getElementById('mzPrize').style.borderColor = '#341a63'
            }
            return new Promise(async (resolve)=>{
                let validSteps = 0;
                if (seq.length < 1) {
                    this.jsPsych.pluginAPI.setTimeout( () => {
                        resolve([curPos,validSteps])
                    }, this.timing.movement)
                } else {
                    for (let ik of seq) {
                        const out = this.moveIt('mzC1',trial.preset,curPos, ik.key,true)
                        curPos = out[0];
                        document.getElementById('mzC1').setAttribute('pos_r',curPos[0])
                        document.getElementById('mzC1').setAttribute('pos_c',curPos[1])
                        if (out[1] === true) {
                            validSteps+=1
                        }
                        await out[2].finished
                    }
                    resolve([curPos,validSteps])
                }

            })
        }

        getInnerHTML(EleType,valueIn){
            switch (EleType) {
                case 'counter':
                    return `<div><strong>${valueIn}</strong></div> moves left</div>`
                case 'feedback':
                    return `<p>You earned</p><p><strong>${valueIn}</strong> points</p>`
                case 'countdown':
                    return `<div><strong>${valueIn.toFixed(1)}</strong> </div> <p>seconds remain</p>`
            }
        }

        moveIt(move_id, maze, init_pos,key, doMove) {
            // move id is the id of the moving div
            // maze id is the actual maze on display
            // maze array is the array of maze set up (with true / false )
            // init_pos is the starting pos of the move
            // key is which key did they press
            let dir = this.keyMap.getAction(key.toLowerCase())
            let new_pos = [0,0];
            let wiggle_dir = [0,0];
            switch (dir) {
                case 'up':
                    new_pos[0] = init_pos[0]-1;
                    new_pos[1] = init_pos[1]+0;
                    wiggle_dir = [5,0]
                    break;
                case 'down':
                    new_pos[0] = init_pos[0]+1;
                    new_pos[1] = init_pos[1]+0;
                    wiggle_dir = [-5,0]
                    break;
                case 'left':
                    new_pos[0] = init_pos[0]+0;
                    new_pos[1] = init_pos[1]-1;
                    wiggle_dir = [0,-5]
                    break;
                case 'right':
                    new_pos[0] = init_pos[0]+0;
                    new_pos[1] = init_pos[1]+1;
                    wiggle_dir = [0,5]
                    break;
            }

            const pass = !maze.maze_array[(new_pos[0]*maze.cells_w)+new_pos[1]]

            if (doMove===true) {
                let anipromise;
                const mov = document.getElementById(move_id)
                const maze1 = document.getElementById('curMaze')
                if (pass===true) {
                    anipromise = document.getElementById(move_id).animate([{
                        left:mov.offsetLeft+'px', top:mov.offsetTop+'px',
                    },{
                        left:maze1.rows[new_pos[0]].childNodes[new_pos[1]].offsetLeft+'px', top:maze1.rows[new_pos[0]].childNodes[new_pos[1]].offsetTop+'px',
                    }], {duration:this.timing.movement,iterations: 1,delay:0,fill: 'forwards'})
                } else {
                    new_pos = init_pos;
                    anipromise = document.getElementById(move_id).animate([{
                        transform: 'translate(0px, 0px) rotate(0deg)'
                    },{
                        transform: `translate(${wiggle_dir[0]}px, ${wiggle_dir[1]}px) rotate(-5deg)`
                    },{
                        transform: `translate(0px, 0px) rotate(5deg)`
                    },{
                        transform: `translate(${wiggle_dir[0]}px, ${wiggle_dir[1]}px) rotate(-5deg)`
                    }], {duration:this.timing.movement,iterations: 1,delay:0,fill: 'backwards'})
                }
                return [new_pos,pass,anipromise]
            } else {
                if (pass!==true) {
                    new_pos = init_pos;
                }
                return [new_pos,pass]
            }



        }

        endMaze(trial) {
            if (this.trialComplete === false) {
                this.trialComplete = true
                const veil = document.getElementById('veil')

                let aniCon, cSn
                let noResp = false;
                const endPos = trial.endPos;
                const prizePos = trial.preset.prizePos;
                const initPos = trial.preset.c1Pos;

                const ifBox = (endPos[0] === prizePos[0] && endPos[1] === prizePos[1]);
                const initDist = pythagoreanC( (prizePos[0] - initPos[0]), (prizePos[1] - initPos[1]));
                const endDist = pythagoreanC( (prizePos[0] - endPos[0]), (prizePos[1] - endPos[1]) )
                const travelDist = pythagoreanC((endPos[0] - initPos[0]), (endPos[1] - initPos[1]))
                let cfEnd = [
                    initPos[0] - (endPos[0] - initPos[0]),
                    initPos[1] - (endPos[1] - initPos[1])
                ]
                for (let i in [0,1]) {
                    if (cfEnd[i] < 0) {
                        cfEnd[i] = Math.abs(cfEnd[i]) + trial.preset.cells_h
                    }
                }
                let cfDist = pythagoreanC((prizePos[0] - cfEnd[0]), (prizePos[1] - cfEnd[1]))
                let cfifBox = false
                if (endDist > initDist && cfDist > initDist && !ifBox) {
                    // here is for when
                    cfEnd = prizePos
                    cfDist = 0
                    cfifBox = true
                }

                console.log(`Init Pos:',${initPos}, 'End Pos': ${endPos}, 'Gift Pos': ${prizePos}, 'CF Pos: ${cfEnd}`)
                let [totalScore, ifBbox] = mazeScore(initDist, endDist, travelDist, ifBox, trial.reverse)
                let cfPoints = mazeScore(initDist, cfDist, travelDist, cfifBox, trial.reverse)

                if (ifBbox > 0) {
                    aniCon = [
                        {scale:0.9},
                        {scale:2},
                    ]
                } else {
                    aniCon = [
                        {opacity:'100%'},
                        {opacity: '0%'}
                    ]
                }

                if (totalScore > 0) {
                    cSn = 0
                } else if (totalScore <0) {
                    cSn = 1
                } else if (totalScore === 0) {
                    cSn = 2
                }


                if (trial.preset.c1Pos[0] === trial.endPos[0] && trial.preset.c1Pos[1] === trial.endPos[1]) {
                    noResp = true
                    totalScore = -10
                    cfPoints = [10]
                    cSn = 3
                }

                const fbBox = standardFeedback('',totalScore,'',cfPoints[0],noResp,cSn,'',false,this.oldFb)
                fbBox.id = 'fbBox'

                veil.appendChild(fbBox)
                const prizePromise = document.getElementById('mzPrize').animate(aniCon,{
                    duration:this.timing.boxZoom,fill: 'forwards',delay:0,iterations:1
                })


                prizePromise.finished.then(()=> {
                    removeEventListener("resize", resize_maze);
                    veil.style.display = 'flex'
                    resolveAfter(this.timing.preFb,'',this.jsPsych).then(()=> {
                        this.jsPsych.pluginAPI.clearAllTimeouts()
                        this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                        fbBox.style.opacity = '100%'
                        photonSwitch('maze-fbOn')
                        this.data.fbOnset = performance.now()
                        resolveAfter(this.timing.fbDur,'',this.jsPsych).then(()=> {
                            this.jsPsych.pluginAPI.clearAllTimeouts()
                            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                            this.data.endTime = performance.now()
                            this.jsPsych.finishTrial(this.data)
                        })
                    })
                })
            }


        }
    }
    MazePlugIn.info = info;

    return MazePlugIn;

})(jsPsychModule);



function genMaze(MzPreset,wrapName) {
    const oldMaze = document.getElementById('curMaze')
    const newMaze = aMazeMe(0,0,MzPreset).displayMaze()
    newMaze.id = 'curMaze'
    if (oldMaze) {
        oldMaze.parentNode.replaceChild(newMaze, oldMaze);
    } else {
        document.getElementById(wrapName).appendChild(newMaze)
    }

    const c1 = document.createElement('div')
    c1.setAttribute('pos_r',MzPreset.c1Pos[0])
    c1.setAttribute('pos_c',MzPreset.c1Pos[1])
    c1.className = 'mzC1'
    c1.id = 'mzC1'
    c1.textContent = '👤'

    const prize = document.createElement('div')
    prize.setAttribute('pos_r', MzPreset.prizePos[0])
    prize.setAttribute('pos_c', MzPreset.prizePos[1])
    prize.className = 'mzPrize'
    prize.id = 'mzPrize'
    prize.textContent = '🎁'

    newMaze.appendChild(c1)
    newMaze.appendChild(prize)


    return newMaze

}

function mazeScore(initDist, endDist, travelDist, ifBox,reverse) {
    console.log('Maze Score Calculation Version 2')

    if (!reverse) {
        reverse = false
    }


    console.log(`Reached Box: ${ifBox}, Initial Distance: ${initDist}, Ending Distance: ${endDist}, 
    Traveled Distance: ${travelDist},`)

    // total score is equal to the distance traveled and distance to the prize and prize winning
    let totalScore;
    if (reverse === false) {
        console.log('regular calculation')
        // in regular cases, max point is 10, closer to box grants some points
        totalScore = ((initDist - endDist) / (initDist) * 5) + (ifBox*5)
    } else {
        console.log('reverse calculation')
        // in reverse cases, max point is 10, min point is -10, let's be discrete and just split it into two cases:
        if (endDist <= initDist) {
            // in this case they got closer to the trap & get -5 for reaching it
            totalScore = ((endDist-initDist) / (initDist) * 5) + (ifBox*-5)
        } else {
            let soFar = 0;
            // in this case they ran away:
            if (travelDist >= initDist) {
                // if they ran so far that it was further than the og pos and gift they get a bonus
                soFar = 1;
                travelDist = initDist
            }
            totalScore = ((travelDist) / (initDist) * 5) + (soFar*5)
        }
    }
    totalScore = Math.round(totalScore)
    console.log(`Distance Change: ${endDist - initDist}`)
    console.log(`Total score: ${totalScore}`)
    return [totalScore, ifBox]
}

function pythagoreanC(a, b) {
    return Math.sqrt( Math.pow(a,2) + Math.pow(b, 2))
}

function resize_maze(){
    let size_const;
    const wrap = document.getElementById('mazeWrap')
    const maze1 = document.getElementById('curMaze')
    const infoBox = document.getElementById('infoBox')
    const c1 = document.getElementById('mzC1')
    const prize = document.getElementById('mzPrize')
    let x_pos = [Number(c1.getAttribute('pos_r')), Number(c1.getAttribute('pos_c'))]
    let p_pos = [Number(prize.getAttribute('pos_r')), Number(prize.getAttribute('pos_c'))]

    if (infoBox) {
        if (wrap.offsetHeight > wrap.offsetWidth) {
            size_const = wrap.offsetWidth
            infoBox.style.width =  (0.36*size_const)+'px';
            infoBox.style.maxHeight = (wrap.offsetHeight - (0.90*size_const)) /2 + 'px'
            infoBox.style.bottom = (0.2* (wrap.offsetHeight - (0.90*size_const) - infoBox.offsetHeight))+'px';
            infoBox.style.right = 0.5*wrap.offsetWidth - 0.5*infoBox.offsetWidth + 'px'
        } else {
            size_const = wrap.offsetHeight
            infoBox.style.maxHeight = "none"
            infoBox.style.width =  (0.6* ((wrap.offsetWidth - (0.90*size_const))/2) )+'px';
            infoBox.style.right =
                ((((wrap.offsetWidth - (0.90*size_const))/2) - infoBox.offsetWidth)/2)
                +'px';
            infoBox.style.bottom = 0.5*wrap.offsetHeight - 0.5*infoBox.offsetHeight + 'px'
        }
    } else {
        if (wrap.offsetHeight > wrap.offsetWidth) {
            size_const = wrap.offsetWidth

        } else {
            size_const = wrap.offsetHeight
        }
    }


    maze1.style.height = (0.90*size_const)+'px';
    maze1.style.width = (0.90*size_const)+'px';
    maze1.style.left = (wrap.offsetWidth-(0.9*size_const))/2+'px'; // to center it do (100% - x) / 2


    if (c1) {
        c1.style.height = maze1.rows[x_pos[0]].childNodes[x_pos[1]].offsetHeight+'px'
        c1.style.width = maze1.rows[x_pos[0]].childNodes[x_pos[1]].offsetWidth+'px'
        c1.style.left = maze1.rows[x_pos[0]].childNodes[x_pos[1]].offsetLeft+'px'
        c1.style.top = maze1.rows[x_pos[0]].childNodes[x_pos[1]].offsetTop+'px'
        c1.style.fontSize = c1.offsetHeight+'px';
        c1.style.lineHeight = c1.offsetHeight+'px';
        c1.animate([{
            left:0, top:0,
        },{
            left:maze1.rows[x_pos[0]].childNodes[x_pos[1]].offsetLeft+'px', top:maze1.rows[x_pos[0]].childNodes[x_pos[1]].offsetTop+'px',
        }], {duration:0,iterations: 1,delay:0,fill: 'forwards'})
    }

    if (prize) {
        prize.style.height = maze1.rows[p_pos[0]].childNodes[p_pos[1]].offsetHeight+'px'
        prize.style.width = maze1.rows[p_pos[0]].childNodes[p_pos[1]].offsetWidth+'px'
        prize.style.left = maze1.rows[p_pos[0]].childNodes[p_pos[1]].offsetLeft+'px'
        prize.style.top = maze1.rows[p_pos[0]].childNodes[p_pos[1]].offsetTop+'px'
        prize.style.fontSize = prize.offsetHeight+'px';
        prize.style.lineHeight = prize.offsetHeight+'px';
        prize.animate([{
            left:0, top:0,
        },{
            left:maze1.rows[p_pos[0]].childNodes[p_pos[1]].offsetLeft+'px', top:maze1.rows[p_pos[0]].childNodes[p_pos[1]].offsetTop+'px',
        }], {duration:0,iterations: 1,delay:0,fill: 'forwards'})
    }


}

function getMazeConfig() {
    return ensure_uid_set().then(async ()=>{
        let gc = await db.collection('MazeConfig').get()
        let output = {};
        for (let dc of gc.docs) {
            output[dc.id] = dc.data()
        }
        return output
    })
}

function continMaze(tlType,MazeInfo,emoInt) {
    let mazeProb = [];
    if (tlType === 'Condensed') {
        // Condense will have 12 trials: 3 sizes (10, 15, 20, 4 condits
        const condiALL = []
        for (let sa of ['10','15','20']) {
            condiALL.push({})
            for (let gx of Object.keys(MazeInfo[sa])) {
                const presetSX = MazeInfo[sa][gx]
                if (condiALL[condiALL.length-1][presetSX.condiV]) {
                    condiALL[condiALL.length-1][presetSX.condiV].push(presetSX)
                } else {
                    condiALL[condiALL.length-1][presetSX.condiV] = [presetSX];
                }
            }
        }
        let iCount = 0;
        for (let sb of condiALL) {
            for (let rb of Object.keys(sb)) {
                const mzIrb =sample(sb[rb])

                mazeProb.push(
                    { preset: mzIrb,init_pos: mzIrb.c1Pos, target_pos: mzIrb.pricePos, num_move:10, show_step:0 ,
                        ShowEmo: (iCount % emoInt) === 0,}
                )
                iCount++
            }
        }
    } else {
        // Condense will have 12 trials: 3 sizes (10, 15, 20, 4 condits
        const condiALL = []
        for (let sa of ['10','15','20','25','30']) {
            condiALL.push({})
            for (let gx of Object.keys(MazeInfo[sa])) {
                const presetSX = MazeInfo[sa][gx]
                if (condiALL[condiALL.length-1][presetSX.condiV]) {
                    condiALL[condiALL.length-1][presetSX.condiV].push(presetSX)
                } else {
                    condiALL[condiALL.length-1][presetSX.condiV] = [presetSX];
                }
            }
        }
        let iCount = 0;
        for (let sb of condiALL) {
            for (let rb of Object.keys(sb)) {
                for (let i=0; i<2; i++) {
                    const mzIrb =sample(sb[rb])

                    mazeProb.push(
                        { preset: mzIrb,init_pos: mzIrb.c1Pos, target_pos: mzIrb.pricePos, num_move:10, show_step:0 ,
                            ShowEmo: (iCount % emoInt) === 0,}
                    )
                    iCount++
                }

            }
        }
    }
    return mazeProb
}
