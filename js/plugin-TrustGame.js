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
        name: 'compete',
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
            player: {
                type: jspsych.ParameterType.INT,
                default: 0,
            },
            pts: {
                type: jspsych.ParameterType.INT,
                default: 10,
            },
            practice: {
                type: jspsych.ParameterType.BOOL,
                default: false,
            },
            maxRespTime: {
                type: jspsych.ParameterType.INT,
                default: 5000,
            }
        }
    }

    class TrustPlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.timing = {
                fade: 0,
                intro: 200,
                selDur: 2000,
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
                trial.jsPsych.endCurrentTimeline()
                trial.jsPsych.finishTrial()
                trial.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                trial.jsPsych.pluginAPI.clearAllTimeouts()
            })
            display_element.innerHTML = this.initTrustPage()
            updateInfo('Originally, the trust game should have some brief description on the partners.' +
                'However, after consideration, the amount of text might influence our analysis, similar to the ELI5 task. ' +
                'Therefore, instead of a description of the partners. Now we will present a summary statistics of how much they had shared.' +
                'This way, we still have the "good" partner and "bad" partner although still not exactly the same. ')
            this.drawTrustBio(display_element,trial)
        }

        initTrustPage(display_element, trial) {
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
                    border-radius: 20px 20px 0px 0px;
                    transition-duration: 1s;
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
                    transition-duration: 1s;
                }
                img.profile {
                    flex-shrink: 0;
                    min-height: 100%;
                    min-width: 100%;
                    scale: 0.9;
                    transition-duration: 1s;
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
                    transition-duration: 0s;
                }
                
                h1.profile {
                    position: absolute;
                    bottom: 5%;
                    left: 17%;
                    font-size: 4vw;
                    color: #73AD21;
                    transition-duration: 1s;
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
                div.npText {
                    position: absolute;
                    height: 10%;
                    width: 15%;
                    top: 17%;
                    left: 25%;
                    text-align: left;
                    font-size: 2vw;
                    font-weight: bold;
                    opacity: 0%;
                }
                
                div.qText {
                    position: absolute;
                    height: 5%;
                    width: 70%;
                    top: 45%;
                    left: 10%;
                    text-align: left;
                    font-size: 5vw;
                    opacity: 0%;
                }
                div.qText strong {
                    color: indianred;        
                }
                div.choiceBox {
                    position: absolute;
                    bottom: 10%;
                    height: 15%;
                    width: 20%;
                    font-size: 4vw;
                    font-weight: bolder;
                    padding-top: 2.5vw;
                    box-sizing: border-box;
                    border-radius: 20px;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                    opacity: 0;
                }
                div.chatBox {
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
                div.fb_box {
                    font-family: "Roboto Condensed", sans-serif;
                    position: absolute;
                    padding-top: 5%;
                    top: 20%;;
                    left: 25%;
                    width: 50%;
                    height: 10%;
                    border-radius: 20px;
                    opacity: 0;
                    transition-timing-function: ease-in;
                    font-size: 5vw;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                }
                
                
                
            </style>
            <body>
              
            </body>
            `
            return html
        }

        drawTrustBio(display_element, trial) {
            const wrap = document.createElement('div')
            wrap.className = 'wrap'
            wrap.id = 'trustWrap'
            wrap.style.backgroundColor = get_bios(0).colorLight

            const veil = document.createElement('div')
            veil.className = 'veil'
            veil.id = 'veil'

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
            display_element.appendChild(wrap)
            display_element.appendChild(veil)
            if (trial.displayBio === 0) {
                startTrust.click()
            }

            veil.style.display = 'inline'
            veil.style.backdropFilter = 'blur(30px)'
            veil.style.webkitBackdropFilter = 'blur(30px)'

            const stat1 = veil.animate([
                {backdropFilter: 'blur(30px)',webkitBackdropFilter: 'blur(30px)'},
                {backdropFilter: 'none',webkitBackdropFilter: 'none'},
            ], {duration:trial.unveilT,iterations: 1,delay:0,fill: 'forwards'}).finished.then(
                ()=>{veil.style.display='none'}
            )


        }

        drawTrustGame(display_element, trial) {
            const wrap = document.getElementById('trustWrap')
            // hide all the bio-element so when it's called, it will always start fresh
            document.getElementById(`bB-${trial.player + 1}`).click()
            wrap.style.backgroundColor = '#f2f1f0'
            document.getElementById('banner').style.opacity = '0%'
            document.getElementById('bioBox').style.opacity = '0%'
            const ani1_para = {duration:700,iterations: 1,delay:0,fill: 'forwards'}
            const ani2_para = {duration:200,iterations: 1,delay:800,fill: 'forwards'}
            const pfpic = document.getElementById('pf_pic')
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
            const pfName = document.getElementById('pf_name')
            pfName.animate([
                {
                    left: '17%',  bottom: '5%',
                },{
                    left: '25%', bottom: '58%',
                }],ani1_para)
            ani2_para.delay = 700
            const npText=document.createElement('div')
            npText.textContent = 'Now Playing With ...'
            npText.className = 'npText'
            npText.style.color = get_bios(trial.player).color
            wrap.appendChild(npText)
            npText.animate([{opacity: '0%'},{opacity: '100%'}],ani1_para)

            const offerText = document.createElement('div')
            offerText.innerHTML = `For <strong>${trial.pts}</strong> points`
            offerText.className = 'qText'
            offerText.id = 'offerText'
            wrap.appendChild(offerText)
            offerText.animate([{opacity: '0%'},{opacity: '100%'}],ani2_para)

            const qText=document.createElement('div')
            qText.innerHTML = 'Would you <b>SHARE</b> or <b>KEEP</b>?'
            qText.className = 'qText'
            qText.id = 'qText'
            qText.style.top = '60%'
            wrap.appendChild(qText)
            qText.animate([{opacity: '0%'},{opacity: '100%'}],ani2_para)

            const f_box = document.createElement('div')
            f_box.className = 'choiceBox'
            f_box.id = 'f_box'
            f_box.textContent = 'SHARE (F)'
            f_box.style.left = '10%'
            f_box.style.backgroundColor = get_bios(trial.player).colorLight

            ani2_para.delay += 400
            const j_box = document.createElement('div')
            j_box.className = 'choiceBox'
            j_box.id = 'j_box'
            j_box.textContent = 'KEEP (J)'
            j_box.style.right = '10%'
            j_box.style.backgroundColor = get_bios(trial.player).colorLight
            wrap.appendChild(f_box)
            wrap.appendChild(j_box)
            f_box.animate([{opacity: '0%'},{opacity: '100%'}],ani2_para)
            const opt_done = j_box.animate([{opacity: '0%'},{opacity: '100%'}],ani2_para).finished

            const chat_box = document.createElement('div')
            chat_box.className = 'chatBox'
            chat_box.id = 'chatBox'
            chat_box.style.backgroundColor = get_bios(trial.player).colorLight
            chat_box.style.borderColor = get_bios(trial.player).color
            chat_box.innerHTML = `${get_bios(trial.player).name} <b>Shared</b>!`
            wrap.appendChild(chat_box)

            opt_done.then(() => {
                trial.initTime = performance.now()
                const tKR = this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: (e) => {
                        this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
                        this.drawTrustFeedback(e,display_element,trial)
                    },
                    valid_responses: ['j','J','f','F'],
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                });
            })



        }

        drawTrustFeedback(e,display_element,trial) {
            console.log(e)
            let dt;
            if (e) {
                dt = e;
            } else {
                dt = {
                    key: "",
                    rt:  "",
                }
            }
            dt.initTime = trial.initTime
            dt.resp = dt.key==='j'?'share':'keep'
            dt.respPartner = trial.share?'share':'keep'
            dt.ptOffer = trial.pts;
            dt.ptWon = trial.pts;
            const a1c = {duration:300,iterations: 1,delay:0,fill: 'forwards'}
            const a2c = {duration:100,iterations: 1,delay:0,fill: 'forwards'}
            document.getElementById('qText').animate([{opacity: '100%'},{opacity: '0%'}],a1c)
            document.getElementById('offerText').animate([{opacity: '100%'},{opacity: '0%'}],a1c)
            const ani1 =document.getElementById(`${e.key}_box`).animate([{
                backgroundColor:get_bios(trial.player).colorLight, scale: '1',
            },{
                backgroundColor:get_bios(trial.player).color, scale: '1.3',
            }],{
                duration:300,iterations: 1,delay:0,fill: 'forwards'
            }).finished
            if (!trial.share) {
                document.getElementById('chatBox').style.backgroundColor = '#e0e0e0'
                document.getElementById('chatBox').style.borderColor = '#c0c1c2'
                document.getElementById('chatBox').innerHTML=`${get_bios(trial.player).name} <b>Kept</b>!`
            }
            ani1.then(() => {
                let ani2 = document.getElementById('chatBox').animate([
                    {opacity: '0%', scale: '1'},
                    {opacity: '100%', scale: '1.1'},
                    {opacity: '100%', scale: '1'}
                ],{duration:100,iterations: 1,delay:0,fill: 'forwards'}).finished
                ani2.then(()=>{
                    const ptBox = document.createElement('div')
                    ptBox.className = 'fb'
                    if (e.key === 'f' && trial.share) {
                        dt.ptWon = 2 * trial.pts
                        ptBox.style.backgroundColor = '#acdb86'
                        ptBox.innerHTML = `<h1>Won Double</h1><p><strong>${trial.pts * 2}</strong> pts</p>`
                    } else if (e.key === 'f' && !trial.share) {
                        dt.ptWon = 0
                        ptBox.style.backgroundColor = '#db9a86'
                        ptBox.innerHTML = `<p>You won <strong>nothing</strong><p>!`
                    } else if (e.key === 'j') {
                        ptBox.style.backgroundColor = '#d1d1d1'
                        ptBox.innerHTML = `<h1>Safe Option</h1> <p>You got <strong>${trial.pts}</strong> pts.</p>`
                    } else if (e.key === '') {
                        dt.ptWon = 0
                        ptBox.style.backgroundColor = '#d1d1d1'
                        ptBox.innerHTML = `No response`
                        dt.resp = ''
                    }
                    document.getElementById('veil').appendChild(ptBox)
                    this.jsPsych.pluginAPI.setTimeout(()=> {
                        document.getElementById('veil').style.display = 'flex'
                        document.getElementById('veil').animate([
                            {opacity: '0%'},
                            {opacity: '100%'},
                        ],{duration:this.timing.fade,iterations: 1,delay:this.timing.selDur,fill: 'forwards'})
                        ptBox.style.opacity = '100%'
                        ptBox.animate([{
                            opacity: '100%'
                        },{
                            opacity: '0%'
                        }],{duration:this.timing.fade,delay:this.timing.fbDur,fill:"forwards"}).finished.then(()=>{
                            trial.jsPsych.finishTrial(dt)
                        })
                    }, this.timing.selDur)




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
            color: '#94bf26',
            colorLight: '#cdd1b4',
            shareP: 100,
            bio: "depreciated",
        },
        {
            name: 'Matt',
            color: '#66bbcc',
            colorLight: '#c8d8db',
            shareP: 50,
            bio: "depreciated",
        },
        {
            name: 'Alex',
            color: '#4a26bf',
            colorLight: '#bab5c9',
            shareP: 20,
            bio: "depreciated",
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
    console.log(trustBio)
    let tPerC = Math.ceil( t / (trustType.length * trustBio.length))
    console.log(tPerC)
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
    allTrialT[0].displayBio = 1;
    return allTrialT
}
