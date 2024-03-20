/*
 * Jiazhou Chen
 *
 * This plugin will run the gambling task with rank competition
 *
 *
 *
 */

jsPsychEmoGrade= (function(jspsych) {

    const info = {
        name: 'compete',
        description: '',
        parameters: {
            iti: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: 'iti',
                default: 1000,
            },
            dTxt: {
                type: jspsych.ParameterType.STRING,
                default: [],
            },
            preset: {
                type: jspsych.ParameterType.STRING,
                default: '',
            }
        }
    }

    class emotionGradingPlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.allowedEmotion = ['admiration','amusement','anger','annoyance','approval',
                'caring','confusion','curiosity','desire','disappointment',
                'disapproval','disgust', 'embarrassment','excitement','fear',
                'gratitude','grief','joy','love','nervousness',
                'optimism','pride','realization','relief','remorse',
                'sadness','surprise', 'neutral'];
        }

        trial(display_element, trial) {
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }

            let presetTxt = [];
            if (trial.preset!=='') {
                presetTxt.push(`Please describe your emotion by filling the blank: `) // header
                console.log(trial.preset)
                if (trial.preset.resp === 'label') {
                    presetTxt.push(`You <strong>MUST TYPE</strong> your response and use only the suggested emotions.`)
                    trial.displayL1 = ``
                    trial.displayL2 = `style='display: none'`
                    console.log('here')
                } else if (trial.preset.resp === 'explain') {
                    presetTxt.push(`Please type to fill in the text boxes. When you are done, press ENTER to confirm.`)
                    trial.displayL1 = `style='display: none'`
                    trial.displayL2 = ``
                }

                if (trial.preset.presp === 'none') {
                    presetTxt.push(``)
                } else if (trial.preset.presp === 'time') {
                    presetTxt.push(`In the past 5 minutes...`)
                } else if (trial.preset.presp === 'intensity') {
                    presetTxt.push(`Think about a moment when you felt (an) emotion(s) most intensively...`)
                } else if (trial.preset.presp === 'entropy') {
                    presetTxt.push(`Think about a moment when you felt a lot of emotions...`)
                }

            } else {
                presetTxt = [
                    `Please describe your emotion by filling the blank: `, //show in H1
                    `You <strong>MUST TYPE</strong> your response and use only the suggested emotions.`,
                    ``,
                ]

                trial.displayL1 = ``
                trial.displayL2 = `style='display: none'`
            }
            if (trial.dTxt.length < 3) {
                trial.dTxt = presetTxt;
            }
            display_element.innerHTML = this.initEmoGradePage(trial)


            document.getElementById('egInput1').addEventListener('input',this.validateInput)
            document.getElementById('egWrap').addEventListener('click',function (e) {
                if (document.getElementById('egSuggestBox')){
                    document.getElementById('egSuggestBox').remove()
                }
            })

            document.getElementById('egInput1').addEventListener('click',this.validateInput)
            document.getElementById('egInput1').addEventListener('change',this.confirmSelection)
            document.getElementById('egInput1').addEventListener('keyup',this.confirmSelection)
            document.getElementById('egInput2a').addEventListener('keyup',this.confirmFreeText)
            document.getElementById('egInput2b').addEventListener('keyup',this.confirmFreeText)
            document.getElementById('submitButtionEG').addEventListener('click',this.submitBehavior)
        }

        // internal function call just call this.jsPsych
        // ToDo: need to figure out which functions have only internal usage.
        initEmoGradePage(trial) {
            return`
            <style>
                button {
                    padding: 0.5% 2% 0.5% 2%;
                    color: #525c50;
                    background-color: #f2f1f0;
                    border-color: #becfc7;
                    border-width: 5px;
                }
                button:hover {
                    padding: 0.5% 2% 0.5% 2%;
                    color: #525c50;
                    background-color: #c1cfbe;
                    border-color: #525c50;
                }
                .egContent {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    margin: 2% 10% 0 10%;
                    height: 90%;
                }
               
                .egContent p {
                    font-size: 3vmin;
                    margin-bottom: 5%;
                }
                .egQuestion {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    margin: 0 10% 0 10%;
                    font-size: 3vmin;
                }
                .egQuestion h1 {
                    margin: 0;
                    padding: 2%;
                }
                .egQuestion * {
                    margin-left: 1%;
                }
                .egQuestion input {
                    padding-left: 20px;
                    padding-right: 20px;
                    border-radius: 10px;
                    border-width: 5px;
                    border-color: #becfc7;
                    
                    border-style: solid;
                    font-size: 3vmin;  
                    color: black;
                    font-weight: bold;   
                    z-index: 700;    
                             
                }
                .egQuestion input:focus {
                    outline: none;
                    border-color: #525c50; 
                    
                }
                .layout2 {
                    justify-content: space-around;
                    margin-top: 1%;
                }
                .layout2 input {
                    width: 60%;
                    flex: max-content;
                }
                .egSuggestBox {
                    font-size: 3vmin;
                    font-weight: bolder;
                    overflow-y: scroll;
                    background-color: #c1cfbe;
                    box-shadow: 5px 5px 10px rgb(224,224,224);
                }
                .egSuggestBox * {
                    padding-top: 5%;
                    padding-bottom: 5%;
                }
                .emoBox {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .emoBox div {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    border-style: solid;
                    background-color: #becfc7;
                    border-width: 3px;
                    border-radius: 10px;
                    border-color: #becfc7;
                    padding: 0.5% 1% 0.5% 1%;
                    margin: 1%;
                }
                .emoBox div div {
                    display: flex;
                    flex-direction: column;
                    font-size: 3vmin;
                    justify-content: center;
                    border: none;
                    font-weight: bold;
                }
                .emoBox div button {
                    min-height: unset;
                    margin-left: 15px;
                    aspect-ratio: 1/1;
                    border-radius: 100px;
                    background-color: #c1cfbe;
                    border-color: #525c50;
                    color: #525c50;
                }
                .emoBox div button:hover {
                    border-color: white;
                    color: whitesmoke;
                }
                
            </style>
            <body>
                <div id="egWrap" class="wrapLong">
                    <div id="egContent" class="egContent">
                        <h1>${trial.dTxt[0]}</h1>
                        <p>${trial.dTxt[1]}</p>
                        <div id="emoBox" class="emoBox">
                        </div>
                        
                        <div id="modQ"><h1>${trial.dTxt[2]}</h1></div>
                        <div id="egQuestionL1" ${trial.displayL1} class="egQuestion">
                            <h1>I felt </h1>
                            <input id="egInput1" placeholder="Type here...">
                        </div>
                        
                        <div id="egQuestionL2a" ${trial.displayL2} class="egQuestion layout2">
                            <h1>I felt</h1>
                            <input id="egInput2a" placeholder="Type here...">
                            <h1>,</h1>
                        </div>
                        <div id="egQuestionL2b" ${trial.displayL2} class="egQuestion layout2">
                            <h1>because </h1>
                            <input id="egInput2b" placeholder="Type here...">
                        </div>
                        
                        <div style="margin-top: auto">
                            <button id="submitButtionEG"> Submit </button>
                        </div>
                        
                    </div>
                </div>
                <div id="veil" class="veil"></div>
            </body> 
            `
        }

        validateInput(e) {
            e.stopPropagation();
            const inputField = document.getElementById('egInput1');
            const curValue = inputField.value.toLowerCase()


            let suggestBox = document.getElementById('egSuggestBox')
            if (suggestBox) {
                suggestBox.remove()
            }
            suggestBox = document.createElement('div')
            document.getElementById('egWrap').appendChild(suggestBox)
            suggestBox.style.width = (inputField.offsetWidth-40)+'px'
            suggestBox.style.position = 'absolute'
            suggestBox.style.left = (inputField.offsetLeft+20)+'px'
            suggestBox.style.top = (inputField.offsetTop+inputField.offsetHeight+10)+'px'
            suggestBox.style.maxHeight = (document.getElementById('egWrap').offsetHeight-suggestBox.offsetTop-100)+'px'
            suggestBox.id = 'egSuggestBox'
            suggestBox.className = 'egSuggestBox'

            for (let sgItem of this.allowedEmotion) {
                if (sgItem.startsWith(curValue)) {
                    const sgiX = document.createElement('div')
                    sgiX.textContent = sgItem
                    suggestBox.appendChild(sgiX)
                }
            }
            if (suggestBox.childNodes.length < 1) {
                suggestBox.remove()
            }
        }


        confirmFreeText(e) {
            if (e.key === 'Enter') {
                e.target.disabled = true;
                e.target.style.borderColor = 'black'
            }
        }

        confirmSelection(e) {
            let existLS=[];
            if (e.type === 'keyup' && e.key !== 'Enter') {
                    return '';
            }
            if (e.type === 'keyup' && e.key === 'Esc') {
                document.getElementById('egSuggestBox').remove()
                return '';
            }
            for (let rb of document.getElementById('emoBox').childNodes) {
                if (rb.firstChild) {
                    existLS.push(rb.firstChild.textContent)
                }
            }
            console.log(existLS)
            if (this.allowedEmotion.includes( e.target.value ) && !existLS.includes(e.target.value)) {
                const ax = document.createElement('div')
                ax.innerHTML = `<div>${e.target.value}</div><button onclick="this.parentNode.remove()">✖</button>`
                document.getElementById('emoBox').appendChild(ax)
                document.getElementById('egInput1').value = ''
                document.getElementById('egInput1').dispatchEvent(new Event('input'))
            } else {
                document.getElementById('egInput1').animate([
                    {color:'black'},
                    {color:'indianred'},
                    {color:'indianred'},
                    {color:'black'}
                ], {duration:1000,delay:0,iterations:1,fill:"forwards"})
            }
        }

        submitBehavior(){
            this.jsPsych.finishTrial()
        }

    }
    emotionGradingPlugin.info = info;

    return emotionGradingPlugin;
})(jsPsychModule);


function initDemoEmoGrade() {
    return `
    <style>
    .content {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        width: 80%;
    }
    .content button {
        aspect-ratio: unset;
        font-size: 3vmin;
        padding: 1%;
        min-width: 15%;
    }
    button.selE {
        background-color: #465878;
        color: whitesmoke;
    }
    .content div {
        display: flex;
        justify-content: space-around;
        padding-left: 5%;
        padding-right: 5%;
        align-items: center;
    }
    .content h1 {
        align-self: center;
        margin-top: 1%;
        margin-bottom: 1%;
    }
    .content p {
        align-self: center;
        margin: 0;
        padding: 0;
    }
    .content h2 {
        padding-bottom: 0;
        margin-bottom: 1%;
    }
    .vt {
        display: flex;
        flex-direction: column;
    }
    .vt * {
        margin: 1%;
    }
    .vt input {
        min-width: 90%;
        font-size: 3vmin;
        padding: 10px 20px 10px 20px;
        border-width: 3px;
        border-style: solid;
        border-radius: 10px;
        border-color: #465878;
    }
    </style>
    <body>
        <div class="wrapLong" style = '
        display: flex;
        justify-content: center;
        font-size: 2.5vmin;' id="testWrap">
            <div class="content">
                <h1>Hello, this is the demo for grading emotion.</h1>
                <p>Choose a combination of presets</p>
                <h2>Response Type: </h2>
                <div id="resp">
                    <button onclick="demoEGBP(this)">label</button>
                    <button onclick="demoEGBP(this)">explain</button>
                </div>
                <h2>Question Type: </h2>
                <div id="presp">
                    <button onclick="demoEGBP(this)">none</button>
                    <button onclick="demoEGBP(this)">time</button>
                    <button onclick="demoEGBP(this)">intensity</button>
                    <button onclick="demoEGBP(this)">entropy</button>
                </div>
                <h1>OR</h1>
                <p>Type in customized prompts below. Note: Using customized prompts will always overwrite presets. </p>
                <div id="txt" class="vt">
                    <input placeholder="Top of the screen, styled H1. Mostly used as title.">
                    <input placeholder="Middle of the screen, styled p, used mostly for response type assist words.">
                    <input placeholder="Right before response boxes, usually used for prompts (time etc).">
                </div>
                <hr>
                <button onclick="demoEGSS()">Submit & Start</button>
            </div>
        </div>
        <div class="jsPsychDE" style='display: none' id="display_element"></div>
    </body>
    `
}

function demoEGBP(e) {
    for (let rt of e.parentNode.childNodes) {
        rt.className=''
    }
    e.setAttribute('sel',true)
    e.className = 'selE'
}

function demoEGSS() {
    let conX = {
        resp: '',
        presp : '',
    }
    for (let rt of document.getElementById('resp').childNodes) {
        if (rt.className==='selE') {
            conX.resp = rt.textContent
        }
    }
    for (let ry of document.getElementById('presp').childNodes) {
        if (ry.className==='selE') {
            conX.presp = ry.textContent
        }
    }
    if (conX.resp === '' && conX.presp ==='') {
        conX = ''
    }
    let txt = [];
    for (let rz of document.getElementById('txt').childNodes) {
        if (rz.placeholder && rz.value !== '') {
            txt.push(rz.value)
        }
    }
    console.log(conX)
    console.log(txt)
    document.getElementById('display_element').style.display = 'inline'
    jsPsych.run([{
        type: jsPsychEmoGrade,
        dTxt: txt,
        preset: conX,
    }])
}