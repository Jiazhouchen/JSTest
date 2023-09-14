var jsPsychRateEmotion = (function (jspsych) {
  'use strict';
  // 
  const info = {
    name: 'rate_emotion',
    description: 'This is the rate emotion page',
    parameters: {
      emotion: {
        type: jspsych.ParameterType.STRING,
        pretty_name: 'EmotionSet',
        default: 'GoEmo',
        description: 'The sets of emotions to be displayed. Options are GoEmo, Ekman and Sentiment'
      },
      alertType: {
        type: jspsych.ParameterType.STRING,
        pretty_name: 'AlertType',
        default: 'inpage',
        description: 'How are the alerts beings display, Options are prompt or inpage, or none. None will show no alert'
      },
      ShowEmo: {
        type: jspsych.ParameterType.BOOL,
        default: '',
      },
      unveilT: {
        type: jspsych.ParameterType.INT,
        pretty_name: 'iti',
        default: 200,
      },
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
  class RateEmotionPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      // Scroll to top of screen.
      window.onbeforeunload = function () {
        window.scrollTo(0, 0);
      }

      if (trial.ShowEmo === '') {
        trial.ShowEmo = Math.random() > 0.5
      }
      if (trial.ShowEmo === false) {
        return this.jsPsych.finishTrial({display: false})
      }
      let [html, emotions, upper_limit, startTime] = this.initEmoPage(trial);
      // Display HTML.
      display_element.innerHTML = html;

      const veil = document.createElement('div')
      veil.className = 'veil'
      document.body.append(veil)
      veil.style.backdropFilter = 'blur(30px)'
      veil.style.webkitBackdropFilter = 'blur(30px)'
      veil.style.display = 'inline'
      veil.animate([
            {backdropFilter: 'blur(30px)',webkitBackdropFilter: 'blur(30px)'},
            {backdropFilter: 'blur(0px)',webkitBackdropFilter: 'blur(0px)'}
          ],
          {duration:trial.unveilT,iterations: 1,delay:0,fill: 'forwards'}).finished.then(() => {
            veil.remove()
      })

      //---------------------------------------//
      // Response handling.
      //---------------------------------------//



      let emo_grid = {}
      let click_history =  []
      let num_sel_emo = 0
      // initialize the emotions:
      emotions.forEach(emo => {
        emo_grid[emo] = 0
      })
      emotions.forEach(emo => {
        document.getElementById('button-' + emo).addEventListener('click', function() {
          //console.log(emo_grid[emo])
          if(emo_grid[emo] == 1) {
            deselectEmo(emo)
          } else {
            selectEmo(emo)
          }
          //console.log(click_history)
        });
      });

      // functions below:
      function selectEmo(emo) {
        document.getElementById('button-' + emo).style.background = '#f2a407';
        emo_grid[emo] = 1
        click_history.push({
          'emotion': emo,
          'rt': performance.now() - startTime,
          'selected': 1,
        })
        num_sel_emo = Object.values(emo_grid).reduce((a, b) => a + b, 0);
      }

      function deselectEmo(emo) {
        document.getElementById('button-' + emo).style.background = '#F0F0F0';
        emo_grid[emo] = 0
        click_history.push({
          'emotion': emo,
          'rt':  performance.now() - startTime,
          'selected': 0,
        })
        num_sel_emo = Object.values(emo_grid).reduce((a, b) => a + b, 0);
      }
      function  resetWarning() {
        document.getElementById('warningMsg').textContent = '';
        document.getElementById('warningMsg').style.opacity = '0';
      }
      display_element.querySelector('#RateEmo').addEventListener('submit', (e) => {
        // Wait for response
        e.preventDefault();
        if (num_sel_emo > 0 & num_sel_emo < (upper_limit+1)) {
          // Measure response time
          var submit_time = performance.now() - startTime;

          // Store data
          var trialdata = {
            "submit_time": submit_time,
            "emo_grid": emo_grid,
            "click_history": click_history,
            "init_time": startTime,
          };

          // Update screen
          const veil = document.createElement('div')
          veil.className = 'veil'
          veil.style.display = 'inline'
          veil.style.backdropFilter = 'blur(0px)'
          veil.style.webkitBackdropFilter = 'blur(0px)'
          document.body.append(veil)
          veil.animate(
              [
                {backdropFilter: 'blur(0px)',webkitBackdropFilter: 'blur(0px)'},
                {backdropFilter: 'blur(50px)',webkitBackdropFilter: 'blur(50px)'}
              ],
              {duration:trial.unveilT,iterations: 1,delay:0,fill: 'forwards'}
          ).finished.then(()=>{
            veil.remove()

            this.jsPsych.finishTrial(trialdata)
          })

        } else if (num_sel_emo < 1) {
          if (trial.alertType == "prompt") {
            alert ("You must select AT LEAST ONE emotion label");
          } else if (trial.alertType == "inpage") {
            resetWarning()
            document.getElementById('warningMsg').textContent = `!!   You must select AT LEAST ONE emotion label   !!`
            document.getElementById('warningMsg').style.opacity = '1';
          }

        } else if (num_sel_emo > (upper_limit)) {
          if (trial.alertType == "prompt") {
            alert (`You can select AT MOST ${upper_limit} emotion labels`);
          } else if (trial.alertType == "inpage") {
            resetWarning()
            document.getElementById('warningMsg').textContent = `!!   You can select AT MOST ${upper_limit} emotion labels   !!`
            document.getElementById('warningMsg').style.opacity = '1';
          }
        }
        

      });

    };

    initEmoPage(trial) {
      // Define HTML
      let html = '';

      // Insert CSS.
      html += `<style>
      h1 {
        padding: 1%;
        margin: 0;
      }
      .jspsych-content {
        max-width: 1152px;
        margin: 1% auto auto auto;
        font-size: 2vmin;
      }
      a:link {
        color: #29a3a3;
      }
      .button-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
       
      }
      .button-row button {
        background-color: #F0F0F0;
        height: unset;
        aspect-ratio: unset;
        min-width: 16vmin;
        min-height: 6vmin;
        padding: 2px;
        margin: 12px;
        color: black;
        font-size: 2vmin;
        font-weight:bold;
        border-radius: 10px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 5px 10px 0 rgba(0, 0, 0, 0.19);
      }
      .button-row button:hover {
        filter: brightness(90%);
        -webkit-filter: brightness(90%);
        background-color: #f2dbac;
      }
      
      .warning-message {
        height: 3vmin;
        text-align: center;
        font-size: 3vmin;
        font-weight: bold;
        color: #f54e16;
        margin-top: 3vmin;
        opacity: 0;
        transition-duration: 0.5s;
      }
      input[type=submit] {
        min-width: 16vmin;
        min-height: 6vmin;
        background-color: #c1d6c6;
        color: black;
        padding: 10px 10px 10px 10px;
        margin-top: 3vmin;
        border-radius: 10px;
        font-size: 20px;
        font-weight:bold
      }
      input[type=submit]:hover {
        filter: brightness(90%);
        -webkit-filter: brightness(90%);
      }
      </style>`
      // Add paragraph 1.
      html += '<h1>Label Your Emotion</h1>'
      html += '<hr>';
      // add counter-factual; one or two gamble; re-frame the switch; add robbing; detailed outline of the task
      // neutral to safe to safe // add interleve or block
      // Add button row.
      let emotions, upper_limit, ul_text
      if (trial.emotion === 'GoEmo') {

        emotions = ['admiration','amusement','anger','annoyance','approval',
          'caring','confusion','curiosity','desire','disappointment',
          'disapproval','disgust', 'embarrassment','excitement','fear',
          'gratitude','grief','joy','love','nervousness',
          'optimism','pride','realization','relief','remorse',
          'sadness','surprise', 'neutral'];
        upper_limit = 3
        ul_text = 'THREE'
        html += '<p>Please select 1-3 labels that best describe your current emotion(s).</p>'
        html += '<div class="button-row" id="button-row1">';
        html += '<button id="button-admiration" style="font-weight:bold;">Admiration</button>';
        html += '<button id="button-amusement" style="font-weight:bold;">Amusement</button>';
        html += '<button id="button-anger" style="font-weight:bold;">Anger</button>';
        html += '<button id="button-annoyance" style="font-weight:bold;">Annoyance</button>';
        html += '<button id="button-approval" style="font-weight:bold;">Approval</button>';
        html += '</div>';
        html += '<div class="button-row" id="button-row2">';
        html += '<button id="button-caring" style="font-weight:bold;">Caring</button>';
        html += '<button id="button-confusion" style="font-weight:bold;">Confusion</button>';
        html += '<button id="button-curiosity" style="font-weight:bold;">Curiosity</button>';
        html += '<button id="button-desire" style="font-weight:bold;">Desire</button>';
        html += '<button id="button-disappointment" style="font-weight:bold;">Disappointment</button>';
        html += '</div>';
        html += '<div class="button-row" id="button-row3">';
        html += '<button id="button-disapproval" style="font-weight:bold;">Disapproval</button>';
        html += '<button id="button-disgust" style="font-weight:bold;">Disgust</button>';
        html += '<button id="button-embarrassment" style="font-weight:bold;">Embarrassment</button>';
        html += '<button id="button-excitement" style="font-weight:bold;">Excitment</button>';
        html += '<button id="button-fear" style="font-weight:bold;">Fear</button>';
        html += '</div>';
        html += '<div class="button-row" id="button-row4">';
        html += '<button id="button-gratitude" style="font-weight:bold;">Gratitude</button>';
        html += '<button id="button-grief" style="font-weight:bold;">Grief</button>';
        html += '<button id="button-joy" style="font-weight:bold;">Joy</button>';
        html += '<button id="button-love" style="font-weight:bold;">Love</button>';
        html += '<button id="button-nervousness" style="font-weight:bold;">Nervousness</button>';
        html += '</div>';
        html += '<div class="button-row" id="button-row5">';
        html += '<button id="button-optimism" style="font-weight:bold;">Optimism</button>';
        html += '<button id="button-pride" style="font-weight:bold;">Pride</button>';
        html += '<button id="button-realization" style="font-weight:bold;">Realization</button>';
        html += '<button id="button-relief" style="font-weight:bold;">Relief</button>';
        html += '<button id="button-remorse" style="font-weight:bold;">Remorse</button>';
        html += '</div>';
        html += '<div class="button-row" id="last-button-row">';
        html += '<button id="button-sadness" style="font-weight:bold;">Sadness</button>';
        html += '<button id="button-surprise" style="font-weight:bold;">Surprise</button>';
        html += '<button id="button-neutral" style="font-weight:bold;">Neutral</button>';
        html += '</div>';
      } else if (trial.emotion === 'Ekman') {
        emotions = ['anger','disgust', 'fear','joy','sadness','surprise', 'neutral'];
        upper_limit = 1
        ul_text = 'ONE'

        html += '<p>Please select 1 label that best describe your current emotion(s).</p>'
        html += '<div class="button-row" id="button-row1">';
        html += '<button id="button-anger" style="font-weight:bold;">Anger</button>';
        html += '<button id="button-disgust" style="font-weight:bold;">Disgust</button>';
        html += '<button id="button-fear" style="font-weight:bold;">Fear</button>';
        html += '<button id="button-joy" style="font-weight:bold;">Joy</button>';
        html += '</div>';
        html += '<div class="button-lastrow" id="last-button-row">';
        html += '<button id="button-sadness" style="font-weight:bold;">Sadness</button>';
        html += '<button id="button-surprise" style="font-weight:bold;">Surprise</button>';
        html += '<button id="button-neutral" style="font-weight:bold;">Neutral</button>';
        html += '</div>';
      } else if (trial.emotion === 'Sentiment')  {
        emotions = ['positive','negative', 'ambiguous','neutral'];
        upper_limit = 1
        ul_text = 'ONE'

        html += '<p>Please select 1 label that best describe your current emotion(s).</p>'
        html += '<div class="button-lastrow" id="last-button-row">';
        html += '<button id="button-positive" style="font-weight:bold;">Positive</button>';
        html += '<button id="button-negative" style="font-weight:bold;">Negative</button>';
        html += '<button id="button-ambiguous" style="font-weight:bold;">Ambiguous</button>';
        html += '<button id="button-neutral" style="font-weight:bold;">Neutral</button>';
        html += '</div>';
      }

      // Add Warning Message:
      html += '<div class="warning-message" id="warningMsg">';
      html += '</div>'


      // Add submit button:
      html += '<form id="RateEmo">';
      html += `<center><input type="submit" id="RateEmo" value="Confirm" style="font-weight:bold;"></input><center>`;
      html += '</form>';
      return  [html, emotions, upper_limit, performance.now()]
    }
  }
  RateEmotionPlugin.info = info;

  return RateEmotionPlugin;

})(jsPsychModule);


