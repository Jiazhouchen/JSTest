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
            win: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: 'winning',
                default: true,
            },
            maxRespTime: {
                type: jspsych.ParameterType.INT,
                default: 5000,
            }
        }
    }

    class GamblePlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.timing = {
                fade: 0,
                intro: 200,
                selDur: 500,
                fbDur:2000,
                iti:0,
            }
        }

        trial(display_element, trial) {
            trial.jsPsych = this.jsPsych
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }

            resetSkipButton()
            document.getElementById('skipButton').addEventListener('click',()=> {
                alert("Skipping entire task block")
                this.jsPsych.endCurrentTimeline()
                this.jsPsych.finishTrial()
                this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                this.jsPsych.pluginAPI.clearAllTimeouts()
            })

            //No longer use in module generation, instead the plugIns are exclusively used for display purpose;

            display_element.innerHTML = this.initGamPage()

            const stat1 = this.drawGamOptions(display_element,trial)

            stat1.then(()=>{
                trial.initTime = performance.now()
                this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: (e) => {
                        this.gamKeypress(e, trial)
                    },
                    valid_responses: ['j','J','f','F'],
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                });

                this.jsPsych.pluginAPI.setTimeout((e) => {
                    this.gamKeypress(e, trial)
                }, trial.maxRespTime);

            })
        }

        initGamPage() {
            let html = ''
            html += `
            <style>
                div.option_wrapper {
                    position: absolute;
                    top: 1vw;
                    left: 1vw;
                    width: 98vw;
                    height: 48vw;
                    border-radius: 40px;
                }
                div.g_helper_text {
                    position: absolute;
                    bottom: 5%;
                    left: 10%;
                    width: 80%;
                    height: 10%;
                    font-size: 1em;
                    text-align: center;
                   }
                div.gam_opt {
                    position: absolute;
                    width: 70%;
                    height: 40%;
                    right: 15%;
                    border-radius: 20px;
                    background-color: #ded8ca;
                    font-size: 10vw;
                    font-weight: 900;
                    text-align: center;
                    vertical-align: middle;
                    line-height: 16vw;
                    opacity: 0%;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
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
                    position: absolute;
                    font-family: "Oswald", sans-serif; 
                    top: 20%;;
                    left: 25%;
                    width: 50%;
                    height: 40%;
                    font-size: 5rem;
                    border-radius: 40px;
                    opacity: 0%;
                    transition-timing-function: ease-in;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                }
                .points {
                    font-size: 6rem;
                }
                h1.g_fb_box{
                    font-size: 7rem;
                    font-weight: 1000;
                    line-height: 4vw;
                    text-align: center;
                    vertical-align: middle;
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
                
            </body>
            `
            return html
        }

        drawGamOptions(display_element,trial) {

            const wrap = document.createElement('div')
            wrap.className = 'option_wrapper'
            wrap.style.backgroundColor = '#f2f1f0'
            wrap.id = 'g_option_wrapper'

            const help_txt = document.createElement('div')
            help_txt.className = 'g_helper_text'
            help_txt.id = 'g_helper_text'
            const hleft = document.createElement('h1')
            const hright = document.createElement('h1')
            hleft.style.position = 'absolute'
            hright.style.position = 'absolute'
            hleft.textContent = 'Press F'
            hleft.style.left = '11%'
            hright.textContent = 'Press J'
            hright.style.right = '11%'
            help_txt.appendChild(hleft)
            help_txt.appendChild(hright)

            const opt_gam_f_t = document.createElement('div')
            const opt_gam_f_c = document.createElement('div')
            const opt_gam_f_b = document.createElement('div')
            const opt_gam_j_t = document.createElement('div')
            const opt_gam_j_c = document.createElement('div')
            const opt_gam_j_b = document.createElement('div')
            const opt_gam_sel_f = document.createElement('div')
            const opt_gam_sel_j = document.createElement('div')


            opt_gam_f_t.className = 'gam_opt'
            opt_gam_f_t.id = 'gopt_ft'
            opt_gam_f_t.style.top = '7%'

            opt_gam_f_c.className = 'gam_opt'
            opt_gam_f_c.id = 'gopt_fc'
            opt_gam_f_c.style.top = '30%'

            opt_gam_f_b.className = 'gam_opt'
            opt_gam_f_b.id = 'gopt_fb'
            opt_gam_f_b.style.bottom = '7%'

            opt_gam_j_t.className = 'gam_opt'
            opt_gam_j_t.id = 'gopt_jt'
            opt_gam_j_t.style.top = '7%'

            opt_gam_j_c.className = 'gam_opt'
            opt_gam_j_c.id = 'gopt_jc'
            opt_gam_j_c.style.top = '30%'

            opt_gam_j_b.className = 'gam_opt'
            opt_gam_j_b.id = 'gopt_jb'
            opt_gam_j_b.style.bottom = '7%'


            opt_gam_sel_f.className = 'g_gam_sel'
            opt_gam_sel_f.id = 'gam_sel_f'
            opt_gam_sel_f.style.left = '10%'

            opt_gam_sel_j.className = 'g_gam_sel'
            opt_gam_sel_j.id = 'gam_sel_j'
            opt_gam_sel_j.style.right = '10%'


            opt_gam_sel_f.appendChild(opt_gam_f_c)
            opt_gam_sel_f.appendChild(opt_gam_f_b)
            opt_gam_sel_f.appendChild(opt_gam_f_t)

            opt_gam_sel_j.appendChild(opt_gam_j_c)
            opt_gam_sel_j.appendChild(opt_gam_j_b)
            opt_gam_sel_j.appendChild(opt_gam_j_t)

            const veil = document.createElement('div')
            veil.className = 'veil'
            veil.id = 'veil'
            veil.style.display = 'flex'
            const cross = document.createElement('h1')
            cross.id = 'cross'
            cross.className = 'cross'
            cross.textContent = ''

            const view = document.createElement('div')
            view.id = 'view'
            view.className = 'option_wrapper'
            view.appendChild(cross)
            veil.appendChild(view)

            wrap.appendChild(help_txt)
            wrap.appendChild(opt_gam_sel_f)
            wrap.appendChild(opt_gam_sel_j)

            display_element.append(wrap)
            display_element.append(veil)

            if (trial.whichSide === 'left') {
                document.getElementById('gopt_jc').style.opacity = '100%'
                document.getElementById('gopt_ft').style.opacity = '100%'
                document.getElementById('gopt_fb').style.opacity = '100%'
                document.getElementById('gopt_jc').textContent = trial.opt.fixed
                document.getElementById('gopt_ft').textContent = trial.opt.gam_1
                document.getElementById('gopt_fb').textContent = trial.opt.gam_2

                document.getElementById('gopt_jt').style.opacity = '0%'
                document.getElementById('gopt_jb').style.opacity = '0%'
                document.getElementById('gopt_fc').style.opacity = '0%'
            } else {
                document.getElementById('gopt_jc').style.opacity = '0%'
                document.getElementById('gopt_ft').style.opacity = '0%'
                document.getElementById('gopt_fb').style.opacity = '0%'


                document.getElementById('gopt_fc').style.opacity = '100%'
                document.getElementById('gopt_jt').style.opacity = '100%'
                document.getElementById('gopt_jb').style.opacity = '100%'
                document.getElementById('gopt_fc').textContent = trial.opt.fixed
                document.getElementById('gopt_jt').textContent = trial.opt.gam_1
                document.getElementById('gopt_jb').textContent = trial.opt.gam_2
            }


            const glassAni = [{backdropFilter: 'blur(30px)', webkitBackdropFilter: 'blur(30px)'},
                {backdropFilter: 'blur(0px)', webkitBackdropFilter: 'blur(0px)'}]

            return veil.animate([
                    {opacity: '100%'},
                    {opacity: '0%'},
                ],
                {duration: this.timing.fade, iterations: 1, delay: this.timing.intro, fill: 'forwards'}).finished
        }

        gamKeypress(e,trial) {

            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()
            let resp = {
                key: '',
                keyPressed: '',
                switch: trial.switch,
                rt: '',
                opt: trial.opt,
                type: '',
                fb: '',
                pt: '',
                showRank: trial.showRank,
                iti: trial.iti,
                initTime: trial.initTime,
            }
            // set up feedback background & box
            const fb_box = document.createElement('div')
            fb_box.id = 'fb_box'
            fb_box.className = 'g_fb_box'
            // set up feedback text
            const fb_textKey = document.createElement('h1')
            const fb_textSup = document.createElement('p')
            fb_textKey.className = 'g_fb_box'
            fb_textSup.className = 'g_fb_box'
            fb_box.appendChild(fb_textKey)
            fb_box.appendChild(fb_textSup)
            document.getElementById('view').appendChild(fb_box)
            if (e) {
                // if there is a response:
                resp.key = e.key
                resp.keyPressed = e.key
                resp.rt = e.rt
                // draw selection box:
                let sel_box = document.getElementById(`gam_sel_${resp.key}`).cloneNode(false)
                sel_box.id = 'temp_remove'
                document.getElementById('g_option_wrapper').appendChild(sel_box)
                // set selection animation:
                let sel_ani_opt = {
                    duration: 2000,
                    iterations: 1,
                    fill: 'forwards'
                }
                let sel_ani;
                if (trial.switch === false) {
                    sel_ani = [
                        {borderColor: '#dbcab6'},
                        {borderColor: '#dbcab6',offset: 0.8},
                        {borderColor: '#d6954b'},
                    ];
                    sel_ani_opt.duration = 1000
                } else if (resp.key==='j') {
                    sel_ani = [
                        {borderColor: '#dbcab6', right: '10%',},
                        {borderColor: '#dbcab6', right: '10%',offset: 0.6},
                        {borderColor: '#dbcab6', right: '63.5%',offset: 0.90},
                        {borderColor: '#d6954b', right: '63.5%'},
                    ]
                    resp.key = 'f'
                } else if (resp.key==='f') {
                    sel_ani = [
                        {borderColor: '#dbcab6', left: '10%'},
                        {borderColor: '#dbcab6', left: '10%',offset: 0.6},
                        {borderColor: '#dbcab6', left: '63.5%',offset: 0.90},
                        {borderColor: '#d6954b', left: '63.5%'},
                    ]
                    resp.key = 'j'
                }
                // figure out what feedback to give based on contingency and key press
                let opt_str
                if (trial.whichSide === 'left' && resp.key === 'f' || trial.whichSide === 'right' && resp.key === 'j') {
                    // gamble side is pressed:
                    resp.type = 'gamble'
                    if (trial.win === true) {
                        opt_str = (trial.opt.gam_1 > trial.opt.gam_2) ? 'gam_1':'gam_2';
                        fb_box.style.backgroundColor = '#acdb86'
                        fb_textKey.textContent = `Won!`
                        resp.fb = 'won'
                    } else {
                        opt_str = (trial.opt.gam_1 < trial.opt.gam_2) ? 'gam_1':'gam_2';
                        fb_box.style.backgroundColor = '#db9a86'
                        fb_textKey.textContent = `Lost!`
                        resp.fb = 'lost'
                    }

                } else {
                    resp.type = 'fixed'
                    // safe side is pressed
                    opt_str = 'fixed'
                    fb_box.style.backgroundColor = '#ded8ca'
                    fb_textKey.textContent = `Safe Option`
                }
                resp.pt = trial.opt[opt_str]
                fb_textSup.innerHTML = `<strong>${(trial.opt[opt_str] < 0) ? '-' : '+'} ${Math.abs(trial.opt[opt_str])}</strong> points`

                // animate the background + feedback box
                sel_box.animate(sel_ani,sel_ani_opt).finished.then((x) => {

                    document.getElementById('veil').animate(
                        [
                            {opacity: '0%'},
                            {opacity: '100%'},
                        ],
                        {duration:this.timing.fade,iterations: 1,delay:this.timing.selDur,fill: 'forwards'}
                    )
                    fb_box.animate(
                        [{opacity: '0%'},{opacity: '100%'}],
                        {duration:this.timing.fade,iterations: 1,delay:this.timing.selDur,fill: 'forwards'}
                    ).finished.then((x) => {
                        this.jsPsych.pluginAPI.setTimeout(() => {
                            resp.fbOnset = performance.now()
                            this.EndTrial(resp,trial)
                        }, this.timing.fbDur);
                    })

                })
            } else {
                // no response
                resp.key = 'na'
                resp.keySelect = 'na'
                resp.type = 'no-resp'
                fb_box.style.backgroundColor = '#d1d1d1'
                fb_textKey.textContent = 'No Response'

                document.getElementById('veil').animate(
                    [
                        {opacity: '0%'},
                        {opacity: '100%'},
                    ],
                    {duration:this.timing.fade,iterations: 1,delay:0,fill: 'forwards'}
                )
                fb_box.animate(
                    [{opacity: '0%'},{opacity: '100%'}],
                    {duration:this.timing.fade,iterations: 1,delay:0,fill: 'forwards'}
                ).finished.then((x) => {
                    this.jsPsych.pluginAPI.setTimeout(() => {
                        resp.fbOnset = performance.now()
                        this.EndTrial(resp,trial)
                    }, this.timing.fbDur);
                })
            }

        }

        EndTrial(dt,trial) {

            if (dt.key !== 'na') {
                document.getElementById('temp_remove').remove()
            }
            let fixcross = document.getElementById('fixcross')
            if (!fixcross) {
                fixcross = document.createElement('h1')
                fixcross.textContent = ''
                fixcross.style.fontSize = '5vw'
            }

            document.getElementById('fb_box').animate(
                [
                    {opacity: '100%'},
                    {opacity: '0%'},
                ],
                {duration:this.timing.fade,iterations: 1,delay:0,fill: 'forwards'}
            ).finished.then(()=>{
                trial.jsPsych.pluginAPI.setTimeout(() => {
                    trial.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                    trial.jsPsych.pluginAPI.clearAllTimeouts()
                    trial.jsPsych.finishTrial(dt)
                }, trial.iti);
            })

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

        let lsSVs = [];

        for (let iSV of sub_arKeys) {
            for (let iRV of ar_dict[String(iSV)]) {
                if (sv < Math.max(...iRV) && sv > Math.min(...iRV)) {
                    allComb.push({'sv': sv, 'rx': iRV, 'ev': iSV})
                }
            }
        }
    }
    console.log(ar_dict)
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
    t = Math.round(numTrial / p_c.length)
    let all_info = [];
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