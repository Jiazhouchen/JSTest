const jsPsychRateEmotion = (function (jspsych) {
  'use strict';
  // 
  const info = {
    name: 'RateEmotion',
    description: 'This is the rate emotion page',
    parameters: {
      emotion: {
        type: jspsych.ParameterType.STRING,
        pretty_name: 'EmotionSet',
        default: 'GoEmo',
        description: 'The sets of emotions to be displayed. Options are GoEmo, Ekman and Sentiment'
      },
      ShowEmo: {
        type: jspsych.ParameterType.BOOL,
        default: '',
      },
      practiceClick: {
        type: jspsych.ParameterType.STRING,
        default: '',
      },
      maxRespTime: {
        type: jspsych.ParameterType.INT,
        default: -1,
      },
      respType: {
        type: jspsych.ParameterType.STRING,
        default: 'mouse',
      },
      initPos: {
        type: jspsych.ParameterType.INT,
        default: '',
      },
      enhanceTracking: {
        type: jspsych.ParameterType.STRING,
        default: 'none', // options are 'none' 'hover' 'hd'
      }
    }
  }

  /**
  * RateEmo
  *
  * plugin for labeling emotions
  *  ver 3:
   *  Mouse responsive again
   *  Mouse tracking options
   *  Data unification
  *
  **/
  class RateEmotionPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
      this.timing = {
        fade: 0,
        intro: 1000,
        feelTxt: 2000,
        maxRespTime: 20000,
      };
      this.keyMap = new keyMap()
      this.data = {
        taskName: 'RateEmotion',
        initTime: 0,
        endTime: 0,
        duration: 0,
        emoGrid: {},
        posGrid: {},
        selectHistory: [],
        lowerLimit: 0,
        upperLimit: 0,
        numSelected: 0,
        verifyMode: false,
        respType: '',
      }
      this.curPos = [0,0];
      this.emoSize = [7,4];
      this.ready2MoveOn = false;
    }
    trial(display_element, trial) {
      // Scroll to top of screen.
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
      this.jsPsych.pluginAPI.clearAllTimeouts()
      this.data.initTime = performance.now()

      window.onbeforeunload = function () {
        window.scrollTo(0, 0);
      }
      // default options:
      this.data.respType = trial.respType
      if (trial.ShowEmo === '') {
        trial.ShowEmo = Math.random() > 0.5
      }
      if (trial.initPos === '') {
        this.curPos = [parseInt(Math.round(Math.random()*6)),parseInt(Math.round(Math.random()*3))]
      } else {
        this.curPos = trial.initPos
      }
      if (trial.maxRespTime > 0) {
        this.timing.maxRespTime = trial.maxRespTime
      }

      if (this.data.respType === 'mouse') {
        this.enhanceTracking = trial.enhanceTracking
        if (this.enhanceTracking !== 'none') {
          this.data.mouseTracking = {
            pixelGrid: {},
            hover: [],
          }
        }
        if (this.enhanceTracking === 'hd') {
          this.data.mouseTracking.movement = [];
        }
      }


      // set up the task:
      if (trial.ShowEmo === false) {
        // kill the task if ShowEmo is false
        return this.jsPsych.finishTrial({display: false})
      }
      display_element.innerHTML = this.initEmoPage(trial);

      const veilAniOpt = {duration:this.timing.fade,iterations: 1,delay:this.timing.intro,fill: 'forwards'}


      // Display HTML.
      const veil = document.getElementById('veil')
      veil.style.display = 'flex'
      const init1 = resolveAfter(this.timing.intro,'',this.jsPsych)
      init1.then(()=> {
        let init2;


      })





      let initPromise
      if (trial.practiceClick !== '') {
        this.data.verifyMode = true
        this.practiceClick = trial.practiceClick
        this.verifiedCount = trial.practiceClick.length
        initPromise = resolveAfter(this.timing.intro,'',this.jsPsych)
        initPromise.then(()=> {
          this.drawEmoRate(trial)
          photonSwitch('emo-stim')
          veil.style.display = 'none'
        })
      } else {
        resolveAfter(this.timing.intro,'',this.jsPsych).then(()=> {
          photonSwitch('emo-feelTxtOn')
          this.data.feelTxtOnset = performance.now()
          document.getElementById('vh1').innerText = 'How do you feel right now?'
          initPromise = resolveAfter(this.timing.feelTxt,'',this.jsPsych)
          initPromise.then(()=> {
            this.drawEmoRate(trial)
            photonSwitch('emo-stim')
            veil.style.display = 'none'
          })
        })
      }









    };

    initEmoPage() {
      // Define HTML
      return  `
      <style>
      .veil * {
        margin: auto;
        font-size: 7vmin;
      }
      h1 {
        font-family: "Roboto Condensed", sans-serif;
        margin: 0;
      }
     
      a:link {
        color: #29a3a3;
      }
      button {
        transition-duration: 0s;
        animation-name: unset;
      }
      .buttonRow {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 70%;
        margin: auto;
        border-width: 5px;
        border-color: black;
        border-radius: 10px;
      }
      .buttonRow div {
        display: flex;
        flex-direction: column;
        row-gap: 1vmin;
        margin: auto;
        
      }
      .emoDiv {
        display: flex;
        justify-content: space-around;
        border-width: 8px;
        border-radius: 10px;
        border-color: transparent;
        padding: 2%;
      }
      .emoDiv button {
        background-color: #F0F0F0;
        min-height: 6vh;
        min-width: 12vw;
        aspect-ratio: unset;
        color: black;
        font-size: 2vmin;
        font-weight:bold;
        border-radius: 10px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 5px 10px 0 rgba(0, 0, 0, 0.19); 
      }
      
      .buttonRow button:hover {
        //filter: brightness(90%);
        //-webkit-filter: brightness(90%);
      }
      .emoLabs {
        font-family: "Roboto Condensed", sans-serif;
        font-weight: bold;
        font-size: 3rem;
      }
      .warningMsg {
        height: 3vmin;
        text-align: center;
        font-size: 3vmin;
        font-weight: bold;
        color: #f54e16;
        margin-top: 3vmin;
        opacity: 0;
        transition-duration: 0.5s;
      }
      .confirmButton {
        min-width: 16vmin;
        min-height: 6vmin;
        max-height: 6vmin;
        max-width: 16vmin;
        background-color: #c1d6c6;
        color: black;
        padding: 10px 10px 10px 10px;
        margin-top: 1vh;
        border-radius: 10px;
        font-size: 2vmin;
        font-weight:bold;
        display: none;
      }
      .confirmButton:hover {
        background-color: #c1d6c6;
        color: black;
        filter: brightness(90%);
        -webkit-filter: brightness(90%);
      }
      .questionEmos {
        margin: auto;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        padding: 1% 15% 1% 15%;
      }
      .questionEmos * {
        padding: 1.5%;
        margin: auto;
      }
      .questionEmos div {
        font-family: "Roboto Condensed", sans-serif;
        border-radius: 10px;
        border-width: 3px;
        background-color: whitesmoke;
        border-color: #acacad;
        font-size: 3vmin;
        font-weight: bold;
        min-width: 10vw;
        line-height: 3vmin;
        transition-duration: 1s;
      }

      </style>
      <body>
      <div class="wrapLong">
        <div style="min-height: 12vh; display: flex" id="emoHeader">
            <h1 style="margin: auto; font-size: 3vmin" id="h1Txt"></h1>
        </div>
        <p id="helperTxt"></p>
        <div id="buttonWrap" class="buttonRow"></div>
        
        <button class="confirmButton" id="confirmButton">Confirm</button>
      </div>
      <div class="veil" id="veil">
        <h1 id="vh1"></h1>
      </div>
      </body>
      `
    }
    drawEmoRate(trial) {
      // get emotions and set up grid for reference
      const emotions = emotionLabels(trial.emotion)
      emotions.forEach(emo => {
        this.data.emoGrid[emo] = 0
      })

      // set up default for upperLimit and lowerLimit if there is none:
      if (this.data.upperLimit === 0) {
        this.data.upperLimit = emotions.length
      }
      if (this.data.lowerLimit === 0) {
        this.data.lowerLimit = 1
      }

      for (let c = 0; c < this.emoSize[1]; c++) {
        const rowEL = document.createElement('div')
        document.getElementById('buttonWrap').appendChild(rowEL)
        for (let r = 0; r < this.emoSize[0]; r++) {
          const emo = emotions[((r*this.emoSize[1]) + c)]
          const emoDiv = document.createElement('div')
          emoDiv.className = 'emoDiv'
          emoDiv.id = `${r}, ${c}`
          const emoButton = document.createElement('button')
          emoButton.id = 'button-' + emo
          emoButton.innerText = capFirst(emo)

          emoDiv.appendChild(emoButton)
          rowEL.appendChild(emoDiv)
          this.data.posGrid[`${r}, ${c}`] = emo

        }
      }



      if (this.data.respType === 'mouse') {

        emotions.forEach(emo => {
          const emoButton = document.getElementById('button-' + emo)
          // standard response handling
          emoButton.addEventListener('click', () => {
            let type;
            if(this.data.emoGrid[emo] === 1) {
              type = 'deselect'
              this.deselectEmo(emo)
            } else {
              type = 'select'
              this.selectEmo(emo)
            }
            this.data.selectHistory.push({
              type: type,
              time: performance.now(),
              emotion: emo,
            })
          });
          if (this.enhanceTracking !== 'none') {
            this.data.mouseTracking.pixelGrid[emo] = {
              left: emoButton.offsetLeft,
              top:  emoButton.offsetTop,
              width: emoButton.offsetWidth,
              height: emoButton.offsetHeight,
            }
            emoButton.addEventListener('mouseenter', () => {
              this.data.mouseTracking.hover.push({
                type: 'enter',
                time: performance.now(),
                emotion: emo,
              })
            })
            emoButton.addEventListener('mouseleave', () => {
              this.data.mouseTracking.hover.push({
                type: 'leave',
                time: performance.now(),
                emotion: emo,
              })
            })
          }


        })
        if (this.enhanceTracking === 'hd') {
          document.getElementById('buttonWrap').addEventListener('mousemove',  (e) => {
            this.data.mouseTracking.movement.push({
              time: performance.now(),
              x: e.screenX,
              y: e.screenY,
            })
          })
        }
        // standard handling
        document.getElementById('confirmButton').addEventListener('click', (e) => {
          if (this.ready2MoveOn) {
            this.confirmSubmit(e)
          } else {
            this.noPassHandle()
          }
        })
        document.getElementById('confirmButton').style.display = 'inline'
      } else if (this.data.respType === 'key') {
        // use keyboard response here:
        document.getElementById(`${this.curPos[0]}, ${this.curPos[1]}`).style.borderColor = '#e3a934'
        this.data.selectHistory.push({
          type: 'init',
          emotion: this.data.posGrid[`${this.curPos[0]}, ${this.curPos[1]}`],
          pos: `${this.curPos[0]}, ${this.curPos[1]}`,
          key: 'na',
          rt: 0,
        })
        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: this.emoKeyResp,
          valid_responses: this.keyMap.allowedKeys(),
          rt_method: 'performance',
          persist: true,
          allow_held_key: false
        });
      } else {
        document.getElementById('display_element').innerHTML = `
            <h1> Unsupported Response Typing for Emotion Rating </h1>
        `
      }

      if (this.data.verifyMode) {
        document.getElementById('h1Txt').innerText = 'Find the Emotion Labels:'
        document.getElementById('confirmButton').style.display = 'none'
        const hpTxt = document.getElementById('helperTxt')
        const emoW = document.createElement('div')
        emoW.className = 'questionEmos'
        document.getElementById('emoHeader').style.minHeight = '6vh'
        hpTxt.parentElement.replaceChild(emoW,hpTxt)
        trial.practiceClick.forEach(em => {
          const emP = document.createElement('div')
          emP.id = em+'-verify'
          emP.innerText = capFirst(em)
          emoW.appendChild(emP)
        })
      } else {
        this.jsPsych.pluginAPI.setTimeout(() => {
          this.confirmSubmit('')
        }, this.timing.maxRespTime)
      }
    }
    emoKeyResp(e) {
      let type;
      const keyType = this.keyMap.getAction(e.key.toLowerCase())
      if (['up','down','left','right'].includes(keyType)) {
        // movement
        type = 'move'
        document.getElementById(`${this.curPos[0]}, ${this.curPos[1]}`).style.borderColor = 'transparent'
        switch (keyType) {
          case 'left':
            if (this.curPos[1] !==  0) {
              this.curPos[1] = this.curPos[1] - 1
            } else {
              this.curPos[1] = this.emoSize[1] - 1
            }
            break;
          case 'right':
            if (this.curPos[1] !==  (this.emoSize[1]-1)) {
              this.curPos[1] = this.curPos[1] + 1
            } else {
              this.curPos[1] = 0
            }
            break;
          case 'up':
            if (this.curPos[0] !==  0) {
              this.curPos[0] = this.curPos[0] - 1
            } else {
              this.curPos[0] = this.emoSize[0] - 1
            }
            break;
          case 'down':
            if (this.curPos[0] !==  (this.emoSize[0] - 1)) {
              this.curPos[0] = this.curPos[0] + 1
            } else {
              this.curPos[0] = 0
            }
            break;
        }
        document.getElementById(`${this.curPos[0]}, ${this.curPos[1]}`).style.borderColor = '#e3a934'
      } else if (keyType === 'select') {
        // selection
        document.getElementById('confirmButton').style.display = 'none'
        if (this.data.emoGrid[this.data.posGrid[`${this.curPos[0]}, ${this.curPos[1]}`]] === 1) {
          type = 'deselect'
          this.deselectEmo(this.data.posGrid[`${this.curPos[0]}, ${this.curPos[1]}`])
        } else {
          type = 'select'
          this.selectEmo(this.data.posGrid[`${this.curPos[0]}, ${this.curPos[1]}`])
        }
      } else if (keyType === 'confirm') {
        // confirm
        if (this.ready2MoveOn) {
          type = 'confirm'
          this.confirmSubmit('')
        } else {
          type = 'ReqNotMet'
          this.noPassHandle()
        }
      }

      this.data.selectHistory.push({
        type: type,
        emotion: this.data.posGrid[`${this.curPos[0]}, ${this.curPos[1]}`],
        pos: `${this.curPos[0]}, ${this.curPos[1]}`,
        key: e.key,
        keyType: keyType,
        rt: e.rt,
      })

    }
    selectEmo(emo) {
      document.getElementById('button-' + emo).style.background = '#f2a407';
      this.data.emoGrid[emo] = 1
      if (this.data.verifyMode) {
        if (this.practiceClick.includes(emo.toLowerCase())) {
          document.getElementById(`${emo}-verify`).style.backgroundColor = '#acdb86'
          document.getElementById(`${emo}-verify`).style.borderColor = '#8fb570'
          this.verifiedCount -= 1
        } else {
          this.verifiedCount += 1
        }
      }
      this.verifyInput()
    }
    deselectEmo(emo) {
      document.getElementById('button-' + emo).style.background = '#F0F0F0';
      this.data.emoGrid[emo] = 0
      if (this.data.verifyMode) {
        if (this.practiceClick.includes(emo.toLowerCase())) {
          document.getElementById(`${emo}-verify`).style.backgroundColor = 'whitesmoke'
          document.getElementById(`${emo}-verify`).style.borderColor = '#acacad'
          this.verifiedCount += 1
        } else {
          this.verifiedCount -= 1
        }
      }
      this.verifyInput()
    }
    verifyInput() {
      this.data.numSelected = Object.values(this.data.emoGrid).reduce((a, b) => a + b, 0);
      if (this.data.verifyMode) {
        if (this.verifiedCount === 0) {
          document.getElementById('confirmButton').style.display = 'inline'
          if (this.data.respType === 'mouse') {
            document.getElementById('h1Txt').innerText = "Press the 'Confirm' button to submit"
          } else {
            document.getElementById('h1Txt').innerText = "Press 'Enter' to confirm your choices"
          }

          document.getElementById('h1Txt').animate([
            {color: 'black', scale: 1},
            {color: 'indianred', scale: 1.2},
            {color: 'indianred', scale: 1.1},
            {color: 'black', scale: 1}
          ], {duration: 1000, iterations: 1, fill:'forwards'})
          this.ready2MoveOn = true
        } else {
          document.getElementById('confirmButton').style.display = 'none'
          document.getElementById('h1Txt').innerText = 'Find the Emotion Labels:'
          this.ready2MoveOn = false
        }
      } else {
        if (this.data.numSelected >= this.data.lowerLimit && this.data.numSelected <= this.data.upperLimit) {
          this.ready2MoveOn = true
        }
      }
      return this.ready2MoveOn
    }
    noPassHandle() {
      // currently just gonna shake the thing
      document.getElementById('buttonWrap').animate([
        {transform: 'translate(0px, 0px) rotate(0deg)'},
        {transform: 'translate(0px, 0px) rotate(0.5deg)'},
        {transform: 'translate(0px, 0px) rotate(-0.5deg)'},
        {transform: 'translate(0px, 0px) rotate(0.5deg)'},
        {transform: 'translate(0px, 0px) rotate(-0.5deg)'},
        {transform: 'translate(0px, 0px) rotate(0deg)'}
      ],{duration: 500, iterations: 1, fill:'forwards'})
    }
    confirmSubmit(e) {
      // Wait for response
      if (e !== '') {
        // mouse here:
        e.preventDefault();
      }

      this.jsPsych.pluginAPI.cancelAllKeyboardResponses()
      this.jsPsych.pluginAPI.clearAllTimeouts()
      this.data.endTime = performance.now()
      this.data.duration = this.data.endTime - this.data.initTime
      photonSwitch('emo-done')
      this.jsPsych.finishTrial(this.data)
    }

  }
  RateEmotionPlugin.info = info;

  return RateEmotionPlugin;

})(jsPsychModule);


function emotionLabels(dtSet) {
  let emotions
  switch (dtSet) {
    case 'GoEmo':
      emotions = ['admiration','amusement','anger','annoyance','approval',
        'caring','confusion','curiosity','desire','disappointment',
        'disapproval','disgust', 'embarrassment','excitement','fear',
        'gratitude','grief','joy','love','nervousness', 'neutral',
        'optimism','pride','realization','relief','remorse',
        'sadness','surprise'];
      break;
    case 'Sentiment':
      emotions = ['positive','negative', 'ambiguous'];
      break;
    case 'Ekman':
      emotions = ['anger','disgust', 'fear','joy','sadness','surprise'];
      break;
  }
  return emotions
}