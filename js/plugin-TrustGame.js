/*
 * Jiazhou Chen
 *
 * This plugin will run the gambling task with rank competition
 *
 *
 *
 */

jsPsychTrust = (function(jspsych) {

    const info = {
        name: 'Trust',
        description: '',
        parameters: {
            displayBio: {
                type: jspsych.ParameterType.INT,
                default: 0,
            },
            share: {
                type: jspsych.ParameterType.INT,
                default: true,
            },
            difficulty: {
                type: jspsych.ParameterType.STRING,
                default: '',
            },
            twist: {
                type: jspsych.ParameterType.BOOL,
                default: '',
            },
            player: {
                type: jspsych.ParameterType.INT,
                default: 0,
            },
            pts: {
                type: jspsych.ParameterType.INT,
                default: 5,
            },
            practice: {
                type: jspsych.ParameterType.BOOL,
                default: false,
            },
            maxRespTime: {
                type: jspsych.ParameterType.INT,
                default: 4000,
            },
            animate: {
                type: jspsych.ParameterType.BOOL,
                default: false,
            },
            oldFb: {
                type: jspsych.ParameterType.BOOL,
                default: true,
            }
        }
    }

    class TrustPlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.timing = initTiming()
            this.keyMap = new keyMap()
            this.data = initData('Trust')

            this.keys = {
                share: 'left',
                keep: 'right',
            }
        }

        trial(display_element, trial) {
            this.jsPsych.pluginAPI.clearAllTimeouts()
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }
            this.data.initTime = performance.now()
            if (trial.maxRespTime > 0) {
                this.timing.maxRespTime = trial.maxRespTime
            }
            this.data.difficulty = trial.difficulty
            this.data.twist = trial.twist
            this.data.contingency = {
                player: get_bios(trial.player),
                partnerResp: trial.share?'share':'keep',
                ptsOffer: trial.pts,
            }
            this.data.side = 'left' //it's always left share;
            this.oldFb = trial.oldFb
            display_element.innerHTML = this.initTrustPage()
            this.drawTrustBio(display_element,trial)
        }

        initTrustPage() {
            let html = ''
            html += `
            <style>
                div.banner {
                    position: absolute;
                    top: 0;
                    left: 0;
                    background-color: #f2f1f0;
                    width: 100%;
                    height: 10%;
                    border-radius: 20px 20px 0 0;
                }
                div.profile {
                    position: absolute;
                    border-color: #73AD21;
                    border-width: 10px;
                    top: 15%;
                    left: 10%;
                    height: 60%;
                    width: 20%;
                    border-radius: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                }
                img.profile {
                    flex-shrink: 0;
                    min-height: 100%;
                    min-width: 100%;
                    scale: 0.9;
                }
                div.bioBox {
                    position: absolute;
                    background-color: white;
                    top: 25%;
                    right: 10%;
                    height: 40%;
                    width: 50%;
                    font-size: 5vmin;
                    border-radius: 20px;
                    box-shadow: inset 0 0 10px ;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                }
                
                h1.profile {
                    position: absolute;
                    bottom: 5%;
                    left: 17%;
                    font-size: 4vw;
                    color: #73AD21;
                }
        
                div.bannerButton {
                    position: absolute;
                    height: 100%;
                    width: 25%;
                    font-size: 2vw;
                    text-align: center;
                    font-weight: bold;
                    padding-top: 20px;
                    box-sizing: border-box;
                }
                .npText {
                    position: absolute;
                    display: flex;
                    top: 30%;
                    left: 25%;
                    opacity: 0;
                }
                .npText * {
                    margin-top: auto;
                    margin-bottom: auto;
                    font-size: 2rem;
                }
                
                .qText {
                    position: absolute;
                    display: flex;
                    justify-content: space-around;
                    width: 80%;
                    top: 50%;
                    left: 10%;
                    opacity: 0;
                }
                .qText * {
                    margin-top: auto;
                    margin-bottom: auto;
                    font-size: 6rem;
                }
                .qText strong {
                    color: indianred;        
                }
                .arrowBoxes {
                    position: absolute;
                    bottom: 10%;
                    left: 10%;
                    width: 80%;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    font-size: 3vmin;
                    font-weight: bolder;
                    align-items: center;
                }
                .choiceBox {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    border-radius: 10px;
                    background-color: whitesmoke;
                    height: 5vw;
                    aspect-ratio: auto 3 / 1;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                    opacity: 0;
                }
                .choiceBox * {
                    margin: auto;
                }
                .chatBox {
                    position: absolute;
                    top: 5%;
                    right: 10%;
                    height: 30%;
                    width: 45%;
                    border-width: 10px;
                    border-radius: 20px;
                    font-size: 6vmin;
                    padding-top: 5vw;
                    box-sizing: border-box;
                    opacity: 0;
                }
                
                
                
                
            </style>
            <body>
            <div class='wrapLong' id="trustWrap"></div>
            <div class='veil' id = 'veil'></div>
            </body>
            `
            return html
        }

        drawTrustBio(display_element, trial) {
            const wrap = document.getElementById('trustWrap')
            wrap.style.backgroundColor = get_bios(0).colorLight

            const veil = document.getElementById('veil')

            const banner = document.createElement('div')
            banner.className = 'banner'
            banner.id = 'banner'

            const pf_picc = document.createElement('div')
            pf_picc.className = 'profile'
            pf_picc.id = 'pf_pic'
            pf_picc.style.borderColor = get_bios(0).color
            const pf_pic = document.createElement('img')
            pf_pic.className = 'profile'
            pf_pic.src = 'img/pfpic.webp'

            const pf_name = document.createElement('h1')
            pf_name.className = 'profile'
            pf_name.id = 'pf_name'
            pf_name.style.color = get_bios(0).color
            pf_name.textContent = get_bios(0).name

            const bioBox = document.createElement('div')
            bioBox.className = 'bioBox'
            bioBox.id = 'bioBox'
            if (trial.practice) {
                bioBox.innerHTML = `<p style="color: ${get_bios(0).colorLight}">Share Percentage:</p><h1 style="color: ${get_bios(0).color}"> ??? %</h1>`
            } else {
                bioBox.innerHTML = `<p style="color: ${get_bios(0).colorLight}">Share Percentage:</p><h1 style="color: ${get_bios(0).color}">${get_bios(0).shareP}%</h1>`
            }

            const startTrust = document.createElement('div')
            startTrust.className = 'bannerButton'
            startTrust.id = 'startTrust'
            startTrust.style.right = '0%'
            startTrust.style.borderRadius = '0px 20px 0px 0px'
            startTrust.style.backgroundColor = '#e6c975'
            startTrust.textContent = 'Start Game'
            startTrust.style.display = 'none'
            let ifClicked = [1, 0, 0]
            for (let i = 1; i < 4; i++) {
                const x = document.createElement('div')
                x.className = 'bannerButton'
                x.id = `bB-${i}`
                x.style.left = `${(i-1) * 25}%`
                x.style.borderRadius = (i !== 1)?'0px 0px 0px 0px':'20px 0px 0px 0px';
                x.style.backgroundColor = get_bios(i-1).colorLight
                x.textContent = get_bios(i-1).name
                x.onclick = function (e) {
                    const x = (e.target.id.match(/\d+/)[0])-1
                    e.target.animate([
                        {backgroundColor:get_bios(x).colorLight, scale: 1},
                        {backgroundColor:get_bios(x).color, scale: 1},
                        {backgroundColor:get_bios(x).colorLight, scale: 1},
                    ],{duration:700,delay:0,fill:"forwards"})
                    if (trial.practice) {
                        bioBox.innerHTML = `<p style="color: ${get_bios(x).colorLight}">Share Percentage:</p><h1 style="color: ${get_bios(x).color}"> ??? %</h1>`
                    } else {
                        bioBox.innerHTML = `<p style="color: ${get_bios(x).colorLight}">Share Percentage:</p><h1 style="color: ${get_bios(x).color}">${get_bios(x).shareP}%</h1>`
                    }
                    document.getElementById('pf_name').textContent = get_bios(x).name
                    document.getElementById('pf_name').style.color = get_bios(x).color
                    document.getElementById('pf_pic').style.borderColor = get_bios(x).color
                    document.getElementById('trustWrap').style.backgroundColor = get_bios(x).colorLight
                    ifClicked[x] = 1;
                    if (ifClicked.reduce((partialSum, a) => partialSum + a, 0) === 3) {
                        document.getElementById('startTrust').style.display = 'inline'
                    }
                }
                banner.appendChild(x)
            }
            startTrust.onclick = () => {this.drawTrustGame(display_element, trial)}
            pf_picc.appendChild(pf_pic)
            banner.appendChild(startTrust)
            wrap.appendChild(banner)
            wrap.appendChild(pf_picc)
            wrap.appendChild(pf_name)
            wrap.appendChild(bioBox)

            if (trial.displayBio === 0) {
                startTrust.click()
            } else {
                veil.style.display = 'none'
            }



        }

        drawTrustGame(display_element, trial) {
            document.getElementById('veil').style.display = 'flex'
            const wrap = document.getElementById('trustWrap')
            // hide all the bio-element so when it's called, it will always start fresh
            document.getElementById(`bB-${trial.player + 1}`).click()
            wrap.style.backgroundColor = '#f2f1f0'
            document.getElementById('banner').style.opacity = '0%'
            document.getElementById('bioBox').style.opacity = '0%'

            const pfpic = document.getElementById('pf_pic')
            const pfName = document.getElementById('pf_name')
            //pfName.textContent += `:

            const npText=document.createElement('div')
            npText.innerHTML = `<span>Share rate: <strong>${get_bios(trial.player).shareP}%</strong></span>`
            npText.className = 'npText'
            npText.style.color = get_bios(trial.player).color
            wrap.appendChild(npText)

            const offerText = document.createElement('div')
            offerText.innerHTML = `<span><strong>${trial.pts}</strong> points</span>`
            offerText.className = 'qText'
            offerText.id = 'offerText'
            wrap.appendChild(offerText)

            const qText=document.createElement('div')
            qText.innerHTML = 'Would you <b>SHARE</b> or <b>KEEP</b>?'
            qText.className = 'qText'
            qText.id = 'qText'
            qText.style.top = '60%'
            // wrap.appendChild(qText)

            const ChoiceRow = document.createElement('div')
            ChoiceRow.className = 'arrowBoxes'


            const left_box = document.createElement('div')
            left_box.className = 'choiceBox'
            left_box.id = 'left_box'
            left_box.textContent = 'SHARE (⇦)'
            left_box.style.left = '10%'
            //arrowleft_box.style.backgroundColor = get_bios(trial.player).colorLight


            const right_box = document.createElement('div')
            right_box.className = 'choiceBox'
            right_box.id = 'right_box'
            right_box.textContent = 'KEEP (⇨)'
            right_box.style.right = '10%'
            //arrowright_box.style.backgroundColor = get_bios(trial.player).colorLight
            ChoiceRow.appendChild(left_box)
            ChoiceRow.appendChild(right_box)
            wrap.appendChild(ChoiceRow)


            let opt_done;
            if (trial.animate === true) {
                const ani1_para = {duration:700,iterations: 1,delay:0,fill: 'forwards'}
                const ani2_para = {duration:200,iterations: 1,delay:800,fill: 'forwards'}
                pfpic.animate([
                    {
                        height: '60%', width: '20%', top: '15%', left: '10%',
                    },{
                        height: '30%', width: '12%', top: '5%', left: '10%',
                    }],ani1_para)
                pfpic.firstElementChild.animate([
                    {
                        scale: '0.9',
                    },{
                        scale: '0.4',
                    }],ani1_para)

                pfName.animate([
                    {
                        left: '17%',  bottom: '5%',
                    },{
                        left: '25%', bottom: '70%',
                    }],ani1_para)
                ani2_para.delay = 700

                npText.animate([{opacity: '0%'},{opacity: '100%'}],ani1_para)


                offerText.animate([{opacity: '0%'},{opacity: '100%'}],ani2_para)


                qText.animate([{opacity: '0%'},{opacity: '100%'}],ani2_para)

                ani2_para.delay += 400

                right_box.animate([{opacity: '0%'},{opacity: '100%'}],ani2_para)
                opt_done = left_box.animate([{opacity: '0%'},{opacity: '100%'}],ani2_para).finished
            } else {
                pfpic.style.height = '30%'
                pfpic.style.width = '12%'
                pfpic.style.top = '5%'
                pfpic.style.left = '10%'
                pfpic.style.scale = '0.9'
                pfpic.firstElementChild.style.scale = '0.4'

                pfName.style.left = '25%'
                pfName.style.bottom = '70%'

                npText.style.opacity = '100%'
                offerText.style.opacity = '100%'
                qText.style.opacity = '100%'
                left_box.style.opacity = '100%'
                right_box.style.opacity = '100%'

                opt_done = resolveAfter(this.timing.init,'',this.jsPsych)
            }



            opt_done.then(() => {
                document.getElementById('veil').style.display = 'none'
                photonSwitch('trust-stim')
                this.data.stimOnset = performance.now()
                this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: (e) => {
                        this.drawTrustFeedback(e,display_element,trial)
                    },
                    valid_responses: this.keyMap.allowedKeys(['left','right']),
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                });
                this.jsPsych.pluginAPI.setTimeout(()=> {
                    this.drawTrustFeedback(undefined,display_element,trial)
                },this.timing.maxRespTime)
            })



        }

        drawTrustFeedback(e) {
            photonSwitch('trust-resp')
            this.data.keyPressOnset = performance.now()
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
            this.jsPsych.pluginAPI.clearAllTimeouts()
            let ani1;
            if (e) {
                this.data.key = this.keyMap.getAction(e.key.toLowerCase())
                this.data.rt = e.rt
                this.data.respType = this.data.key === this.keys.share?'share':'keep'

                ani1 = document.getElementById(`${this.data.key}_box`).animate([
                    {backgroundColor: 'whitesmoke', },
                    {backgroundColor:'#eda532', offset:0.2,},
                    {backgroundColor:'#eda532',},
                ],{
                    duration:this.timing.selDur,iterations: 1,delay:0,fill: 'forwards'
                }).finished
            } else {
                document.getElementById('trustWrap').innerHTML = ''
                ani1 = new Promise((resolve) => {
                    this.jsPsych.pluginAPI.setTimeout( () => {
                        resolve(true)
                    }, this.timing.selDur)
                })
            }

            ani1.then(() => {
                const veil = document.getElementById('veil')
                let uChoice, cfChoice, cfPoints, cSn
                let noResp = false
                if (this.data.respType === 'share' && this.data.contingency.partnerResp === 'share') {
                    // both shared
                    this.data.pts = 2 * this.data.contingency.ptsOffer
                    uChoice = 'Share'
                    cfChoice = 'Keep'
                    cfPoints = this.data.contingency.ptsOffer
                    cSn = 0
                    this.data.fb = 'share-share'
                } else if (this.data.respType === 'share' && this.data.contingency.partnerResp === 'keep') {
                    // share / kept
                    this.data.pts = 0
                    uChoice = 'Share'
                    cfChoice = 'Keep'
                    cfPoints = this.data.contingency.ptsOffer
                    cSn = 1
                    this.data.fb = 'share-keep'
                    // <div >${get_bios(trial.player).name} won ${trial.pts} pts</div>
                } else if (this.data.respType === 'keep') {
                    // kept / whatever
                    this.data.pts = this.data.contingency.ptsOffer
                    uChoice = 'Keep'
                    cfChoice = 'Share'
                    cSn = 2
                    if (this.data.contingency.partnerResp === 'share') {
                        cfPoints = 2 * this.data.contingency.ptsOffer
                        this.data.fb = 'keep-share'
                    } else {
                        cfPoints = 0
                        this.data.fb = 'keep-keep'
                    }

                    //<div >${get_bios(trial.player).name} won ${0} pts</div>
                } else if (this.data.key === '') {
                    // no response
                    this.data.pts = -10
                    uChoice = 'did not respond'
                    cSn = 3
                    if (this.data.contingency.partnerResp === 'share') {
                        cfChoice = 'Share'
                        cfPoints = 2 * this.data.contingency.ptsOffer
                        this.data.fb = 'noresp-share'
                    } else {
                        cfChoice = 'Keep'
                        cfPoints = this.data.contingency.ptsOffer
                        this.data.fb = 'noresp-keep'
                    }
                    noResp = true
                }

                const ptBox = standardFeedback(uChoice.toUpperCase(),this.data.pts,
                    cfChoice.toUpperCase(),cfPoints,
                    noResp,cSn,'',false,this.oldFb)
                ptBox.id = 'ptBox'
                //ptBox.style.backgroundColor = bgColor
                veil.appendChild(ptBox)
                veil.style.display = 'flex'
                veil.style.opacity = '100%'

                const fb1 = resolveAfter(this.timing.preFb,'',this.jsPsych)
                fb1.then(()=> {
                    ptBox.style.opacity = '100%'
                    photonSwitch('trust-fbOn')
                    this.data.fbOnset = performance.now()

                    this.jsPsych.pluginAPI.setTimeout(()=> {
                        this.data.endTime = performance.now()
                        this.data.duration = this.data.endTime - this.data.initTime
                        this.jsPsych.pluginAPI.clearAllTimeouts()
                        this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                        this.jsPsych.finishTrial(this.data)
                    }, this.timing.fbDur)

                })






            })

        }




    }
    TrustPlugin.info = info;

    return TrustPlugin;
})(jsPsychModule);





function get_bios(num) {
    const players = [
        {
            name: 'Jeff',
            color: '#ad7547',
            colorLight: '#e0cdbc',
            shareP: 88,
            bio: "High",
        },
        {
            name: 'Matt',
            color: '#66bbcc',
            colorLight: '#c8d8db',
            shareP: 55,
            bio: "Mid",
        },
        {
            name: 'Alex',
            color: '#4a26bf',
            colorLight: '#bab5c9',
            shareP: 12,
            bio: "Low",
        },
    ]

    if (typeof num != 'undefined') {
        return players[num]
    } else {
        return players
    }

}

function trustContin(t, trustType, emoInt) {
    const trustBio = get_bios()
    let tPerC = Math.ceil( t / (trustType.length * trustBio.length))
    let allTrialT = [];
    let totalTCount = 0;
    for (let t = 0; t < trustType.length; t ++) {
        for (let p = 0; p < trustBio.length; p++) {
            let pWinP = parseInt( trustBio[p].shareP )
            allTrialT.push([]) // important don't delete
            for (let i = 0; i < tPerC; i++) {
                if (trustType === 'better') {
                    pWinP += 20;
                } else if (trustType === 'worse') {
                    pWinP -= 20;
                }
                if (pWinP >= 100) {pWinP = 90}
                if (pWinP <= 0) {pWinP = 10}
                allTrialT[allTrialT.length-1].push({
                    displayBio:0,
                    share: (Math.random() * 100) <= pWinP,
                    player: p,
                    trustType: trustType[t],
                    trustWinP: pWinP,
                    pts: 10,
                    ShowEmo: (totalTCount % emoInt) === 0,
                })
                totalTCount+=1
            }
        }
    }
    allTrialT = shuffle(allTrialT);
    allTrialT = flatten_array(allTrialT)
    if (emoInt !== 1) {
        allTrialT[0].displayBio = 1;
    }

    return allTrialT
}
