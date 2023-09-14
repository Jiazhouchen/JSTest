var jsPsychMaze = (function (jspsych) {
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
            this.timing = {
                fade: 0,
                movement: 200,
                eosPause: 1000,
                boxZoom: 500,
                fbDur: 2000,
            };
        }
        trial(display_element, trial) {
            trial.jsPsych = this.jsPsych;
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()
            // Display HTML.
            let keycount = 0;
            display_element.innerHTML = this.initMazePage(display_element,trial);
            updateInfo("The Maze task now has static maze with configuration " +
                "saved in Google FireStore. " +
                "This ensures that all participants receives the same stimulus." +
                "The configuration has a size of 11/15/21/25/31 (must be odd numbers)" +
                "Each has 15 variations for different choices.")

            let skipButton = resetSkipButton()
            if (skipButton) {
                skipButton.addEventListener('click',()=> {
                    alert("Skipping entire task block")
                    trial.jsPsych.endCurrentTimeline()
                    trial.jsPsych.finishTrial()
                    trial.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                    trial.jsPsych.pluginAPI.clearAllTimeouts()
                })
            }

            console.log(trial.preset)
            if (trial.preset === 0) {
                trial.preset = {
                    cells_w: 25,
                    cells_h: 25,
                    c1Pos: [1,1],
                    prizePos: [1,2],
                }
            }
            const curMaze = genMaze(trial.preset,'mazeWrap')
            curMaze.id = 'curMaze';

            const c1 = document.getElementById('mzC1')

            const infoBox = document.createElement('div')
            //
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



            let curCount = 0;
            let elapsedTime = 0;
            trial.validSteps = 0;
            trial.endPos = [Number(c1.getAttribute('pos_r')), Number(c1.getAttribute('pos_c'))]
            let sIcd;
            let seq = [];
            let mzKB = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: (e) => {
                    curCount+=1
                    seq.push(e.key)
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
                                this.jsPsych.pluginAPI.cancelKeyboardResponse(mzKB)
                                this.jsPsych.pluginAPI.setTimeout(()=> {
                                    this.endMaze(trial)
                                }, 1000)
                            } else {
                                const ix = this.moveSeq(trial.preset.c1Pos,trial,seq)
                                ix.then((out)=> {
                                    console.log(out)
                                    trial.endPos = out[0]
                                    trial.validSteps = out[1]
                                    this.jsPsych.pluginAPI.setTimeout(()=>{
                                        this.endMaze(trial)
                                    }, this.timing.eosPause)
                                })
                            }
                        }
                    }
                    if (trial.limit === 'time' && trial.stopAtBox === true && trial.endPos[0] === trial.preset.prizePos[0] && trial.endPos[1] === trial.preset.prizePos[1]) {
                        this.jsPsych.pluginAPI.clearAllTimeouts()
                        this.jsPsych.pluginAPI.cancelKeyboardResponse(mzKB)
                        clearInterval(sIcd)
                        if (trial.showStep !== true) {
                            const ix = this.moveSeq(trial.preset.c1Pos,trial,seq)
                            ix.then((out)=> {
                                console.log(out)
                                trial.endPos = out[0]
                                trial.validSteps = out[1]
                                trial.residualTime = (trial.timeLimit - elapsedTime) / 1000
                                this.jsPsych.pluginAPI.setTimeout(()=>{
                                    this.endMaze(trial)
                                }, this.timing.eosPause)
                            })
                        } else {
                            this.endMaze(trial)
                        }
                    }

                },
                valid_responses: ['w','a','s','d','arrowup','arrowright','arrowdown','arrowleft'],
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
                    this.jsPsych.pluginAPI.clearAllTimeouts()
                    this.jsPsych.pluginAPI.cancelKeyboardResponse(mzKB)
                    if (trial.showStep !== true) {
                        const ix = this.moveSeq(trial.preset.c1Pos,trial,seq)
                        ix.then((out)=> {
                            console.log(out)
                            trial.endPos = out[0]
                            trial.validSteps = out[1]
                            this.jsPsych.pluginAPI.setTimeout(()=>{
                                this.endMaze(trial)
                            }, this.timing.eosPause)
                        })
                    } else {
                        this.endMaze(trial)
                    }

                },trial.timeLimit)
            }



        }

        initMazePage(display_element,trial) {
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
                <div class="fb" style='opacity: 100%;' id = 'fbBox'></div>
            </div>    
            </body>
            `
            return html

        }

        moveSeq(curPos,trial,seq) {
            return new Promise(async (resolve)=>{
                let validSteps = 0;
                for (let ik of seq) {
                    const out = this.moveIt('mzC1',trial.preset,curPos, ik,true)
                    curPos = out[0];
                    document.getElementById('mzC1').setAttribute('pos_r',curPos[0])
                    document.getElementById('mzC1').setAttribute('pos_c',curPos[1])
                    if (out[1] === true) {
                        validSteps+=1
                    }
                    await out[2].finished
                }
                resolve([curPos,validSteps])
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
            const keymap = new Map()
            keymap.set('a','left')
            keymap.set('arrowleft','left')
            keymap.set('w','up')
            keymap.set('arrowup','up')
            keymap.set('d','right')
            keymap.set('arrowright','right')
            keymap.set('s','down')
            keymap.set('arrowdown','down')

            let dir = keymap.get(key.toLowerCase())
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
            console.log('Maze Complete')
            const veil = document.getElementById('veil')
            const fbBox = document.getElementById('fbBox')
            let aniCon;
            const [totalScore, ifBbox] = mazeScore(
                trial.preset.c1Pos, trial.endPos, trial.preset.prizePos,
                trial.preset.cells_h,trial.validSteps, trial.residualTime)
            if (ifBbox > 0) {
                aniCon = [
                    {scale:0.9},
                    {scale:2},
                ]
                fbBox.style.backgroundColor = '#acdb86'
            } else {
                aniCon = [
                    {opacity:'100%'},
                    {opacity: '0%'}
                ]
            }

            const prizePromise = document.getElementById('mzPrize').animate(aniCon,{
                duration:this.timing.boxZoom,fill: 'forwards',delay:0,iterations:1
            })

            fbBox.innerHTML = this.getInnerHTML('feedback',totalScore)
            prizePromise.finished.then(()=> {
                trial.fbOnset = performance.now()
                veil.style.display = 'flex'
                const ani1 = document.getElementById('veil').animate([
                    {opacity: 0},
                    {opacity: 1},
                ],{duration: this.timing.fade, iterations: 1, delay: 0, fill: 'forwards'}).finished
                ani1.then( ()=>{
                    this.jsPsych.pluginAPI.setTimeout(() => {
                        this.jsPsych.finishTrial(trial)
                    },this.timing.fbDur)
                })
            })

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

function mazeScore(initPos, endPos, prizePos, mzSize, validStep, residualTime) {
    console.log('init:',initPos)
    console.log('end:',endPos)
    console.log('prize:',prizePos)
    if (!residualTime) {residualTime = 0}
    const ifBox = (endPos[0] === prizePos[0] && endPos[1] === prizePos[1]) ? 2.5:0;
    const boxScore = Math.sqrt(Math.pow(prizePos[0] - initPos[0],2) + Math.pow(prizePos[1] - initPos[1],2));
    const dPScore  = Math.sqrt(Math.pow(prizePos[0] - endPos[0],2) + Math.pow(prizePos[1] - endPos[1],2));
    const dTScore  = Math.sqrt(Math.pow(endPos[0] - initPos[0],2) + Math.pow(endPos[1] - initPos[1],2));
    console.log(`ifBox: ${ifBox}, boxScore: ${boxScore}, dTscore: ${dTScore}, dPScore: ${dPScore},`)
    // total score is equal to the distance traveled and distance to the prize and prize winning
    const totalScore = Math.round((((((dTScore) - (dPScore) + boxScore + (ifBox*boxScore))/(mzSize)) ) * 4) + (residualTime * 0.2))
    console.log(totalScore)
    return [totalScore, ifBox]
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
        console.log('working')
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
        console.log(mazeProb)
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
                for (i=0; i<2; i++) {
                    const mzIrb =sample(sb[rb])

                    mazeProb.push(
                        { preset: mzIrb,init_pos: mzIrb.c1Pos, target_pos: mzIrb.pricePos, num_move:10, show_step:0 ,
                            ShowEmo: (iCount % emoInt) === 0,}
                    )
                    iCount++
                }

            }
        }
        console.log(mazeProb)
    }
    return mazeProb
}
