/*
 * Jiazhou Chen
 *
 * This plugin will run the gambling task with rank competition
 *
 *
 *
 */

jsPsychGamble = (function(jspsych) {

    const info = {
        name: 'Gamble',
        description: '',
        parameters: {
            whichSide: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'whichSide',
                default: 'right',
            },
            switch: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: 'switch',
                default: true,
            },
            opt: {
                type: jspsych.ParameterType.INT,
                default: {
                    fixed: 1,
                    gam_1: 5,
                    gam_2: -2,
                },
            },
            difficulty: {
                type: jspsych.ParameterType.STRING,
                default: '',
            },
            twist: {
                type: jspsych.ParameterType.STRING,
                default: '',
            },
            win: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: 'winning',
                default: true,
            },
            maxRespTime: {
                type: jspsych.ParameterType.INT,
                default: -1,
            },
            oldFb: {
                type: jspsych.ParameterType.BOOL,
                default: false,
            }
        }
    }

    class GamblePlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.timing = {
                maxRespTime: 5000,
                init: 500,
                selDur: 1000,
                preFb: 500,
                fbDur:1000,
            }
            this.keyMap = new keyMap()
            this.data = initData('Gamble')
        }

        trial(display_element, trial) {
            this.jsPsych.pluginAPI.clearAllTimeouts()
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }
            this.data.initTime = performance.now()
            if (trial.twist !== '') {
                trial.switch = trial.twist === 'true'
            }
            if (trial.maxRespTime > 0) {
                this.timing.maxRespTime = trial.maxRespTime
            }
            this.data.difficulty = trial.difficulty
            this.data.twist = trial.twist
            this.data.contingency = {
                opt: trial.opt,
                switch: trial.switch,
                win: trial.win,
                whichSide: trial.whichSide,
            }
            this.oldFb = trial.oldFb

            display_element.innerHTML = this.initGamPage()
            const stat1 = this.drawGamOptions()
            console.log(this.keyMap.allowedKeys(['left','right']))
            stat1.then(()=>{
                document.getElementById('veil').style.display = 'none'
                photonSwitch('gam-stim')
                this.data.stimOnset = performance.now()
                console.log(this.data)
                this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: this.gamKeypress,
                    valid_responses: this.keyMap.allowedKeys(['left','right']),
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                });

                this.jsPsych.pluginAPI.setTimeout(() => {
                    this.gamKeypress('')
                }, this.timing.maxRespTime);

            })
        }

        initGamPage() {
            let html = ''
            html += `
            <style>
                .wrap  {
                   display: flex;
                   flex-direction: column;
                   justify-content: space-around;
                }
                
                
                .optionBox {
                    margin: auto;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;

                    width: 85%;
                    height: 80%;
                }
                .optionRow h2 {
                    margin: 0;
                    position: absolute;
                    bottom: 0;
                }
                .optionSide {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .optionSide h2 {
                    margin-top: auto;
                }
                .optionSel {
                    display: flex;
                    flex-direction: column;
                    aspect-ratio: auto 1/1.7;
                    margin: auto;
                    max-height: 80%;
                    min-height: 80%;
                    justify-content: space-between;
                    border: 10px solid transparent;
                    border-radius: 40px;
                }
                
                .helperTxt {
                    position: relative;
                    bottom: 0;
                    font-size: 2rem;
                    font-weight: bold;
                   
                }
                
                .gamOpt {
                    display: flex;
                    aspect-ratio: auto 1/1;
                    border-radius: 20px;
                    background-color: #ded8ca;
                    width: 65%;
                    margin: auto;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                }
                .gamOpt * {
                    margin: auto;
                    font-size: 7rem;
                    font-weight: 900;
                }
                .selBox {
                    border: 10px solid black;
                    border-radius: 40px;
                }
                
                div.g_gam_sel {
                    position: absolute;
                    top: 1%;
                    width: 25%;
                    height: 80%;
                    border: 10px solid transparent;
                    border-radius: 40px;
                    
                }
                div.g_fb_bg{
                    width: 100%;
                    height: 100%;
                    border-radius: 40px;
                }
                div.g_fb_box {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: absolute;
                    font-family: "Oswald", sans-serif; 
                    padding: 2%;
                    top: 20%;
                    left: 25%;
                    min-width: 50%;
                    font-size: 5rem;
                    border-radius: 40px;
                    line-height: 5rem;
                    opacity: 0;
                    transition-timing-function: ease-in;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                }
                .points {
                    font-size: 6rem;
                }
                @keyframes sel_confirm {
                    from {border-color: #dbcab6;}
                    to {border-color:#d6954b}
                }
        
                .lottoTable {
                    position: absolute;
                    left: 23%;
                    top: 5%;
                    min-width: 54%;
                    min-height: 90%;
                    height: 90%;
                    width: 54%;
                    border-collapse: collapse;
                }
                .lottoTable td{
                    width: 25%;
                    height: 25%;
                    border: 10px solid #aba78a;
                    font-size: 7vw ;
                }
                .lottoTable tr:first-child td {
                    border-top: none;
                }
                .lottoTable tr:last-child td {
                    border-bottom: none;
                }
                .lottoTable tr td:first-child {
                    border-left: none;
                }
                .lottoTable tr td:last-child {
                    border-right: none;
                }
            </style>
            <body>
                <div id="gambleWrap" class="wrap">
                    
                    <div id="optionBox" class="optionBox">
                        <div class="optionSide">
                            <div id="optionLeft" class="optionSel"></div>
                            <div class="helperTxt">Press LEFT key</div>
                        </div>
                        <div class="optionSide">
                            <div id="optionRight" class="optionSel"></div>
                            <div class="helperTxt">Press RIGHT key</div>
                        </div>
                    </div>
                        
                        
                    </div>
                    
                </div>
                <div id="veil" class="veil">
                    
                </div>
            </body>
            `
            return html
        }

        drawGamOptions() {
            const optionLeft = document.getElementById('optionLeft')
            const optionRight = document.getElementById('optionRight')


            const optGam1 = document.createElement('div')
            const optGam2 = document.createElement('div')
            const optFixed = document.createElement('div')

            optGam1.className = 'gamOpt'
            optGam1.innerHTML = `<p>${this.data.contingency.opt.gam_1}</p>`
            optGam2.className = 'gamOpt'
            optGam2.innerHTML = `<p>${this.data.contingency.opt.gam_2}</p>`
            optFixed.className = 'gamOpt'
            optFixed.innerHTML = `<p>${this.data.contingency.opt.fixed}</p>`

            if (this.data.contingency.whichSide === 'left') {
                optionLeft.appendChild(optGam1)
                optionLeft.appendChild(optGam2)
                optionRight.appendChild(optFixed)
                optionRight.style.justifyContent = 'center'
            } else {
                optionRight.appendChild(optGam1)
                optionRight.appendChild(optGam2)
                optionLeft.appendChild(optFixed)
                optionLeft.style.justifyContent = 'center'
            }
            return resolveAfter(this.timing.init,'',this.jsPsych,'',this.jsPsych)


        }

        gamKeypress(e) {
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()
            photonSwitch('gam-resp')
            this.data.keyPressOnset = performance.now()
            // too many keys to change, use remap:
            // set up feedback background & box
            let promiseToGo;
            let cfChoice, cfPoints, noResp, cSn, otherSide

            if (e !== '') {
                noResp = false
                // if there is a response:

                this.data.key = this.keyMap.getAction(e.key.toLowerCase())
                this.data.rt = e.rt
                if (this.data.key === 'left') {
                    this.data.side = 'Left'
                    otherSide = 'Right';
                } else if (this.data.key === 'right') {
                    this.data.side = 'Right'
                    otherSide = 'Left';
                }
                // draw selection box:
                const optionSel = document.getElementById(`option${this.data.side}`)
                const oppSel = document.getElementById(`option${otherSide}`)
                const selBox = document.createElement('div')
                selBox.className = 'selBox'
                selBox.id = 'temp_remove'
                selBox.style.height = optionSel.scrollHeight+'px'
                selBox.style.width  = optionSel.scrollWidth+'px'
                selBox.style.position = 'absolute'
                selBox.style.left = optionSel.offsetLeft+'px'
                selBox.style.top = optionSel.offsetTop+'px'
                document.getElementById('gambleWrap').appendChild(selBox)
                // set selection animation:
                let selAni;
                if (this.data.contingency.switch === false) {
                    selAni = [
                        {borderColor: '#dbcab6'},
                        {borderColor: '#dbcab6',offset: 0.8},
                        {borderColor: '#d6954b'},
                    ];

                } else {
                    selAni = [
                        {borderColor: '#dbcab6', left: optionSel.offsetLeft+'px'},
                        {borderColor: '#dbcab6', left: optionSel.offsetLeft+'px',offset: 0.6},
                        {borderColor: '#dbcab6', left: oppSel.offsetLeft+'px',offset: 0.90},
                        {borderColor: '#d6954b', left: oppSel.offsetLeft+'px'},
                    ]
                    this.data.side = otherSide;
                }
                // figure out what feedback to give based on contingency and key press
                let optStr
                if (this.data.contingency.whichSide === this.data.side.toLowerCase()) {
                    // gamble side is pressed:
                    this.data.respType = 'gamble'
                    if (this.data.contingency.win === true) {
                        optStr = (this.data.contingency.opt.gam_1 > this.data.contingency.opt.gam_2) ? 'gam_1':'gam_2';
                        this.data.fb = 'won'
                        cSn = 0
                    } else {
                        optStr = (this.data.contingency.opt.gam_1 < this.data.contingency.opt.gam_2) ? 'gam_1':'gam_2';
                        this.data.fb = 'lost'
                        cSn = 1
                    }
                    cfChoice = 'safe'
                    cfPoints = this.data.contingency.opt.fixed
                } else {
                    this.data.respType = 'safe'
                    this.data.fb = 'safe'
                    // safe side is pressed
                    optStr = 'fixed'
                    cSn = 2
                    cfChoice = 'gamble'
                    if (this.data.contingency.win === true) {
                        cfPoints = (this.data.contingency.opt.gam_1 > this.data.contingency.opt.gam_2) ? this.data.contingency.opt.gam_1:this.data.contingency.opt.gam_2;
                    } else {
                        cfPoints = (this.data.contingency.opt.gam_1 < this.data.contingency.opt.gam_2) ? this.data.contingency.opt.gam_1:this.data.contingency.opt.gam_2;
                    }
                }
                this.data.pts = this.data.contingency.opt[optStr]
                promiseToGo = selBox.animate(selAni,{
                    duration: this.timing.selDur,
                    iterations: 1,
                    fill: 'forwards'
                }).finished
            } else {
                // no response
                noResp = true
                this.data.respType = 'noresp'
                //this.data.pts = Math.min(...Object.values(this.data.contingency.opt))
                this.data.pts = -10
                cSn = 3

                document.getElementById('optionBox').remove()

                promiseToGo = new Promise((resolve) => {
                    this.jsPsych.pluginAPI.setTimeout( () => {
                        resolve(true)
                    }, this.timing.selDur)
                })
                if (this.data.contingency.win === true) {
                    cfChoice = 'gamble'
                    cfPoints = (this.data.contingency.opt.gam_1 > this.data.contingency.opt.gam_2) ? this.data.contingency.opt.gam_1:this.data.contingency.opt.gam_2;
                } else {
                    cfChoice = 'safe'
                    cfPoints = this.data.contingency.opt.fixed
                }

            }

            //set cSn to undefined for score based feedback
            // cSn = undefined

            const fbBox = standardFeedback(this.data.respType,this.data.pts,
                cfChoice,cfPoints,noResp,cSn,'',false,this.oldFb)
            fbBox.id = 'fbBox'
            document.getElementById('veil').appendChild(fbBox)

            promiseToGo.then(() => {
                document.getElementById('veil').style.display = 'flex'
                document.getElementById('veil').style.opacity = '100%'
                const promVeil = resolveAfter(this.timing.preFb,'',this.jsPsych)
                promVeil.then(() => {
                    fbBox.style.opacity = '100%'
                    photonSwitch('gam-fbOn')
                    this.data.fbOnsetTime = performance.now()
                    const promFb = resolveAfter(this.timing.fbDur,'',this.jsPsych)
                    promFb.then(this.EndTrial)
                })

            })


        }

        EndTrial() {
            if (this.data.key !== '') {
                document.getElementById('temp_remove').remove()
            }
            let fixcross = document.getElementById('fixcross')
            if (!fixcross) {
                fixcross = document.createElement('h1')
                fixcross.textContent = ''
                fixcross.style.fontSize = '5vw'
            }



            this.data.endTime = performance.now()
            this.data.duration = this.data.endTime - this.data.initTime

            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()
            this.jsPsych.finishTrial(this.data)



        }


    }
    GamblePlugin.info = info;

    return GamblePlugin;
})(jsPsychModule);


//Below are the contingency generation;

function gen_trial_contin(t, win_p, ct_type, yoke_por,
                          fuzz_match,no_neg,
                          withinDiff,betweenDiff,
                          left_p,emo_int,iti_func) {
    const [ar_dict, full_range]  = get_gam_dict(win_p,fuzz_match,no_neg,withinDiff)
    /* default to no shuffling in the generation, just appending 1s to 0s do that outside */
    let t_i = [...Array(t).keys()]
    let yoke_all = new Array(Math.round(t_i.length * parseFloat(yoke_por))).fill(true);
    yoke_all=yoke_all.concat(new Array(t_i.length - yoke_all.length).fill(false))
    yoke_all=shuffle(yoke_all)
    let win_all = new Array(Math.round(t_i.length * parseFloat(win_p))).fill(true);
    win_all=win_all.concat(new Array(t_i.length - win_all.length).fill(false))
    win_all=shuffle(win_all)
    let lr_all = new Array(Math.round(t_i.length * parseFloat(left_p))).fill('left');
    lr_all=lr_all.concat(new Array(t_i.length - lr_all.length).fill('right'))
    lr_all=shuffle(lr_all)
    let iti_all = new Array(t).fill(1500);
    if (iti_func) {
        iti_all = iti_func()
    }
    let ar_keys = Object.keys(ar_dict).map((x) => {return(parseFloat(x))})
    let contin_all = []
    let ix = 0;

    let allComb = [];

    for (let sv of ar_keys) {
        let sub_arKeys;
        if (ct_type === 'worse') {
            // gamble is worse, meaning EV < SV
            sub_arKeys = ar_keys.filter(function (x) {
                return x < sv && Math.abs(x - sv) < betweenDiff
            })
        } else if (ct_type === 'better') {
            sub_arKeys = ar_keys.filter(function (x) {
                return x > sv && Math.abs(x - sv) < betweenDiff
            })
        } else {
            sub_arKeys = [sv];
        }


        for (let iSV of sub_arKeys) {
            for (let iRV of ar_dict[String(iSV)]) {
                if (sv < Math.max(...iRV) && sv > Math.min(...iRV)) {
                    allComb.push({'sv': sv, 'rx': iRV, 'ev': iSV})
                }
            }
        }
    }
    for (ix in t_i) {
            let alC = sample(allComb)
        let rx = alC.rx;
        let sv = Math.round(alC.sv)
        let ev = alC.ev
        /* show emo labeling? */
        if (ix % emo_int === 0 ) {
            rate_emo = 1
        }
        /* gen trial level contingencies */

        contin_all.push( {
            switch: yoke_all[ix],
            whichSide: lr_all[ix],
            opt:  {
                'gam_1': rx[0],
                'gam_2': rx[1],
                'fixed':sv,
            },
            win: win_all[ix],
            ShowEmo: rate_emo,
            iti: iti_all[ix],
            gam_ev: ev,
            win_p: win_p,
            yoke_p: yoke_por,
            withinDiffMax: withinDiff,
            betweenDiffMax: betweenDiff,
            choice_type: ct_type,
        } )
    }

    return contin_all

}
function contingWrapGam(numTrial,winP,ChoiceTypes, YokePorp, EmoInt) {
    let p_c = [];
    for (let ctx in ChoiceTypes) {
        for (let wpx in winP) {
            p_c.push([ChoiceTypes[ctx],winP[wpx]])
        }
    }
    let t = Math.round(numTrial / p_c.length)
    let all_timeline = [];
    for (let az in p_c) {
        const [winX, maxP] = frac_hack(p_c[az][1])
        let tr = gen_trial_contin(
            t, (winX/maxP),p_c[az][0], YokePorp,
            true, false,
            7,7,
            0.5, EmoInt, undefined)

        all_timeline.push(tr)
    }
    all_timeline = flatten_array(all_timeline)
    return all_timeline
}
function get_gam_dict(win_p,fuzz_match,no_neg,withinDiff) {
    console.log(`generating all pairs for win p = ${win_p}`)
    let pos_range = [...Array(10).keys()]
    let neg_range=  pos_range.map(function(x) {return x * -1})
    let full_range = unique(pos_range.concat(neg_range));
    if (no_neg) {
        full_range = pos_range;
    }

    let full_range_pairs = full_range.reduce( (acc, v, i) =>
            acc.concat(full_range.slice(i+1).map( w => [v,w] )),
        []);
    if (withinDiff !== 0) {
        full_range_pairs = full_range_pairs.filter(function (x) {
            return Math.abs(x[0] - x[1]) < withinDiff
        })
    }
    let [winP, maxP] = frac_hack(win_p)
    let expected_value = [];
    for (let temp_x of full_range_pairs) {
        if(temp_x[0] > temp_x[1]) {
            expected_value.push( `${((temp_x[0] * winP) + (temp_x[1] * (maxP-winP)))}` )
        } else {
            expected_value.push( `${((temp_x[1] * winP) + (temp_x[0] * (maxP-winP)))}` )
        }
    }
    let sel_pairs = {};
    for (let uqev of [... new Set(expected_value)]) {
        if (fuzz_match) {
            uqev = Math.round(parseInt(uqev)/maxP)
        } else {
            uqev = (parseInt(uqev)/maxP)
        }
        sel_pairs[uqev] = [];

        for (let ix in expected_value) {
            let ixEV = expected_value[ix]
            if (fuzz_match) {
                ixEV = Math.round(parseInt(ixEV)/maxP)
            } else {
                ixEV = (parseInt(ixEV)/maxP)
            }
            if (ixEV === uqev) {
                sel_pairs[uqev].push(full_range_pairs[ix])
            }
        }

    }

    if (Object.keys(sel_pairs).length===0) {
        alert (`You use win p = ${winP/maxP} & fuzz match = ${fuzz_match} & no loss = ${no_neg}. 
        This combination resulted in no condition generated. Please reconsider.`);
    }
    return [sel_pairs, full_range]
}