/*
 * Jiazhou Chen
 *
 * This plugin will run the gambling task with rank competition
 *
 *
 *
 */

jsPsychShowRank = (function(jspsych) {

    const info = {
        name: 'compete',
        description: '',
        parameters: {
            updateMethod: {
                type: jspsych.ParameterType.STRING,
                default: 'better',
            },
            showRank: {
                type: jspsych.ParameterType.BOOL,
                default: true,
            },
            iti: {
                type: jspsych.ParameterType.INT,
                pretty_name: 'iti',
                default: 500,
            },
            unveilT: {
                type: jspsych.ParameterType.INT,
                pretty_name: 'iti',
                default: 200,
            }
        }
    }

    class ShowRankPlugIn {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            trial.jsPsych = this.jsPsych;
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }

            trial.pS = this.jsPsych.data.dataProperties.pS;

            let dt = this.jsPsych.data.getLastTrialData().values()[0]
            console.log('Previous Trial Data:',dt)
            display_element.innerHTML = this.initRankPage()
            this.drawRank(display_element,trial)
            let out;
            switch (dt.trial_type) {
                case 'Gamble':
                    trial.pS=updatePerformanceGam(trial.pS, dt)
                    console.log('Updated Gambling Performance Score',trial.pS)
                    break;
                case 'Math':
                    trial.pS=updatePerformanceMath(trial.pS, dt)
                    console.log('Updated Math Performance Score',trial.pS)
                    break;
            }
            out = this.refreshBoard(trial.pS)
            trial.mePos = out[0];
            trial.targetPos = out[1];
            trial.diff = out[2];
            this.animate_movement(display_element,trial)
        }

        initRankPage(trial) {
            const html = `
            <style>
                .rankBoard {
                    position: absolute;
                    left: 20%;
                    margin-top: 1%;
                    margin-bottom: 1%;
                    top: 0;
                    width: 60%;
                    height: 80%;
                    transition-timing-function: ease-in;
                    border-radius: 0;
                }
                .rankEntry {
                    position: absolute;
                    font-family: 'Roboto Condensed', sans-serif;
                    left: 0;
                    width: 100%;
                    height: 10%;
                    background-color: rgba(161, 173, 179, .5);
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                }
                .rankEntryMe {
                     background-color: rgba(168, 179, 161, .6)!important;
                }
                .rankName {
                    position: absolute;
                    top: 10%;
                    left: 5%;
                    height: 80%;
                    width: 50%;
                    overflow: auto;
                    color:white;
                }
                div.rankPt {
                    position: absolute;
                    right: 5%;
                    top: 10%;
                    height: 80%;
                    width: 30%;
                }
                
                h1.pos {
                    position: absolute;
                    left: 5%;
                    bottom: -17%;
                }
                h1.name{
                    position: absolute;
                    right: 5%;
                    bottom: -17%;
                }
                h1.points {
                    position: absolute;
                    left: 5%;
                    bottom: -17%;
                }
                h1.deltaPoints {
                    position: absolute;
                    right: 5%;
                    bottom: -17%;
                }
            </style>
            <body>
                <div id = 'board' class="rankBoard"></div>
                <div id = 'veil' class="veil"></div>
            </body>
            `
            return html;
        }

        animate_movement(display_element, trial) {
            const veil = document.getElementById('veil')
            veil.style.backdropFilter = 'blur(30px)'
            veil.style.webkitBackdropFilter = 'blur(30px)'
            veil.style.display = 'inline'
            const ani1 = document.getElementById('veil').animate([
                    {backdropFilter: 'blur(30px)',webkitBackdropFilter: 'blur(30px)'},
                    {backdropFilter: 'blur(0px)',webkitBackdropFilter: 'blur(0px)'},],
                {duration:trial.unveilT,iterations: 1,delay:0,fill: 'forwards'}).finished
            ani1.then(()=> {
                for (let i = 1; i < 11; i++) {
                    let ani2;
                    if (i !== trial.mePos) {
                        document.getElementById(`pos-${i}`).animate([
                            {scale: "none"},{scale: "0.9"}
                        ],{duration:400,iterations: 1,delay:200,fill: 'forwards'})

                    } else {
                        document.getElementById(`cgtext-${i}`).textContent = '+' + trial.diff
                        ani2 = document.getElementById(`cgtext-${i}`).animate([
                            {opacity: "0%", scale: "1"}, {opacity: "100%", scale: "1.5"},
                            {opacity: "100%", scale: "0.9"}, {opacity: "100%", scale: "1.5"},
                            {opacity: "100%", scale: "1.4"}, {opacity: "0%", scale: "1.5"}
                        ], {duration: 600, iterations: 1, delay: 200, fill: 'forwards'}).finished

                        ani2.then(() => {
                            document.getElementById(`rpointtxt-${i}`).textContent = `${trial.pS[trial.targetPos-1].pS} pts`
                            const an2 = document.getElementById(`rpointtxt-${i}`).animate([
                                {opacity: "100%", scale: "none"},{opacity: "100%", scale:"1.1"},
                            ],{duration:600,iterations: 1,delay:200,fill: 'forwards'}).finished
                            an2.then(()=> {
                                const an3 = document.getElementById(`pos-${trial.mePos}`).animate([
                                    {top: `${10*(trial.mePos-1)}%`},
                                    {top: `${10*(trial.targetPos-1)}%`}
                                ],{duration:600,iterations: 1,delay:200,fill: 'forwards'}).finished
                                document.getElementById(`rpostxt-${trial.mePos}`).textContent = trial.targetPos

                                if (trial.mePos > trial.targetPos) {
                                    // me moving up, what do others do:
                                    for (let ix = trial.targetPos; ix < 11; ix++) {
                                        if (ix === trial.mePos) {break;}
                                        document.getElementById(`rpostxt-${ix}`).textContent = ix+1
                                        document.getElementById(`pos-${ix}`).animate([
                                            {top: `${10*(ix-1)}%`},
                                            {top: `${10*(ix)}%`}
                                        ],{duration:600,iterations: 1,delay:200,fill: 'forwards'})
                                    }
                                    if (trial.targetPos === 1) {
                                        document.getElementById(`pos-1`).style.borderRadius = 'unset'
                                        document.getElementById(`pos-${trial.mePos}`).style.borderRadius = '20px 20px 0 0'
                                    }
                                } else if (trial.mePos < trial.targetPos) {
                                    for (let iy = trial.mePos+1; iy <= trial.targetPos; iy++) {
                                        if (iy === trial.mePos) {break;}
                                        document.getElementById(`rpostxt-${iy}`).textContent = iy-1
                                        document.getElementById(`pos-${iy}`).animate([
                                            {top: `${10*(iy-1)}%`},
                                            {top: `${10*(iy-2)}%`}
                                        ],{duration:600,iterations: 1,delay:200,fill: 'forwards'})
                                    }
                                    if (trial.targetPos === 10) {
                                        document.getElementById(`pos-10`).style.borderRadius = 'unset'
                                        document.getElementById(`pos-${trial.mePos}`).style.borderRadius = '0 0 20px 20px'
                                    }
                                }



                                an3.then(()=> {
                                    for (let ie = 1; ie < 11; ie++) {
                                        document.getElementById(`pos-${ie}`).animate([
                                            {scale: "0.9"},{scale: "1"}
                                        ],{duration:400,iterations: 1,delay:200,fill: 'forwards'})
                                    }
                                    trial.jsPsych.pluginAPI.setTimeout(function() {
                                        trial.jsPsych.finishTrial({})
                                    }, 2000+trial.iti);
                                })
                            })
                        })
                    }
                }
            })
        }

        drawRank(display_element, trial) {
            const board = document.getElementById('board')

            updateInfo(`This ranking board is set to display 10 ranks. 
    Participants starts at rank 5 and progressively they will either reduce in rank or increase in rank.`)

            for (let i =1; i < 11; i++) {
                const x = document.createElement('div')
                x.className='rankEntry'
                x.style.top = `${10*(i-1)}%`
                x.id = `pos-${i}`

                if (i === 1) {
                    x.style.borderRadius = '20px 20px 0px 0px'
                }
                if (i === 10) {
                    x.style.borderRadius = '0px 0px 20px 20px'
                }
                if (trial.pS[i-1].name === 'YOU') {
                    x.className = 'rankEntry rankEntryMe'
                }

                const name = document.createElement('div')
                name.className = 'rankName'
                name.id = `rna-${i}`

                const nametext = document.createElement('h1')
                nametext.className = 'name'
                nametext.id = `rnametext-${i}`
                nametext.textContent = trial.pS[i-1].name


                const pt = document.createElement('div')
                pt.className = 'rankPt'
                pt.id = `rpt-${i}`

                const pos_txt = document.createElement('h1')
                pos_txt.id = `rpostxt-${i}`
                pos_txt.className = 'pos'
                pos_txt.textContent = i

                const pt_text = document.createElement('h1')
                pt_text.id = `rpointtxt-${i}`
                pt_text.className = `points`
                pt_text.textContent = `${trial.pS[i-1].pS} pts`


                const ch_text = document.createElement('h1')
                ch_text.id = `cgtext-${i}`
                ch_text.className = `deltaPoints`
                ch_text.textContent = '+50'
                ch_text.style.opacity = '0%'

                name.appendChild(pos_txt)
                name.appendChild(nametext)
                pt.appendChild(pt_text)
                pt.appendChild(ch_text)
                x.appendChild(name)
                x.appendChild(pt)
                board.appendChild(x)
            }
        }

        refreshBoard(pS) {
            let j = 0;
            let mePosOld;
            let targetPos = pS.findIndex(obj => obj.name === 'YOU') + 1;
            let diff = pS.find(obj => obj.name === 'YOU').diff;
            for (let i = 1; i < 11; i++) {
                if (document.getElementById(`rnametext-${i}`).textContent !== 'YOU') {
                    if (pS[j].name === 'YOU' ) {
                        j ++;
                    }
                    document.getElementById(`rpointtxt-${i}`).textContent = `${pS[j].pS} pts`
                    document.getElementById(`rnametext-${i}`).textContent = pS[j].name
                    j ++;
                } else {
                    mePosOld = i;
                    if (pS[j].name === 'YOU' ) {
                        j ++;
                    }
                }
            }
            console.log(`j highest: ${j}`+ ` | mePos: ${mePosOld}` + ` | targetPos: ${targetPos}` + ` | diff: ${diff}` )
            return [mePosOld, targetPos, diff]
        }


    }
    ShowRankPlugIn.info = info;

    return ShowRankPlugIn;
})(jsPsychModule);





//  <div id = 'veil' class="veil" style="display: inline; backdrop-filter: blur(30px);-webkit-backdrop-filter: blur(30px)"></div>


function calScoreGam(dt) {
    let score;
    if (dt.rt === '') {
        score = 0
    } else {
        score = (10 - (parseInt(dt.rt) / 1000)) + parseInt(dt.pt) + (1*(dt.switch===true ? 1:0))
    }
    return Math.round((score + Number.EPSILON) * 5)
}

function updatePerformanceGam(pS, dt) {
    updateInfo('For Gambling, the performance score is calculated as: '+
        'Score = Points Earned + RT + Switch Bonus. '+
        'Switch Bonus is given to trials with switch mechanics.')
    for (let i=0; i<pS.length; i++) {
        if (pS[i].name === 'YOU') {
            pS[i].diff = calScoreGam(dt)
            pS[i].pS += pS[i].diff
        } else if (i < (pS.length)) {
            pS[i].pS += calScoreGam({
                rt:500*(i+2)+Math.random()*500,
                switch:dt.switch,
                pt: Math.random() > 0.5?dt.opt.gam_1:dt.opt.gam_2})
        } else {
            pS[i].pS += calScoreGam({rt:1000+Math.random()*500,switch:dt.switch,pt: dt.opt.gam_2})
        }
        pS[i].ogPos = i+1;
    }
    return pS.sort(function(a, b){return b.pS - a.pS});
}



function updatePerformanceMath(pS, dt) {
    updateInfo('For math, the performance score is calculated as: '+
    'Score = Difficulty + RT + Operation Bonus. '+
    'Difficulty Score is calculated 0 when 0 / 1 is involved. Otherwise is '+
    'the number of digits'+
    'Operation Bonus is given to multiplications.')
    for (let i=0; i<pS.length; i++) {
        if (pS[i].name === 'YOU') {
            pS[i].diff = calScoreMath(dt)
            pS[i].pS += pS[i].diff
        } else if (i < (pS.length)) {
            pS[i].pS += calScoreMath({
                rt:250*(i+1)+250*Math.random(),
                actualCor: Math.random()>0.4,
                equation:dt.equation,
                operation: dt.operation,})
        }
        pS[i].ogPos = i+1;
    }
    return pS.sort(function(a, b){return b.pS - a.pS});
}

function initPs(num, mePos) {
    let pS = [];
    for (let i = 1; i < (num+1); i++) {
        if (i === mePos) {
            pS.push({
                name: 'YOU',
                pS: 0,
            });
        } else {
            pS.push({
                name: `Player ${i}`,
                pS: 0,
            });
        }

    }
    return pS
}
