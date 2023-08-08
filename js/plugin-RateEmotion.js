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
      alerttype: {
        type: jspsych.ParameterType.STRING,
        pretty_name: 'AlertType',
        default: 'inpage',
        description: 'How are the alerts beings display, Options are prompt or inpage, or none. None will show no alert'
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

      let [html, emotions, upper_limit, startTime] = gen_rate_emo_page(trial);


      // Display HTML.
      display_element.innerHTML = html;

      const veil = document.createElement('div')
      veil.className = 'veil'
      document.body.append(veil)

      veil.animate([
            {backdropFilter: 'blur(50px)',webkitBackdropFilter: 'blur(50px)'},
            {backdropFilter: 'none',webkitBackdropFilter: 'none'}
          ],
          {duration:300,iterations: 1,delay:0,fill: 'forwards'}).finished.then(() => {
            veil.remove()
      })

      console.log(veil)
      //---------------------------------------//
      // Response handling.
      //---------------------------------------//

      // Scroll to top of screen.
      window.onbeforeunload = function () {
        window.scrollTo(0, 0);
      }

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
      function  resetwarning() {
        document.getElementById('toolittle').style.display = 'none';
        document.getElementById('toomany').style.display = 'none';
      }

      display_element.querySelector('#RateEmo').addEventListener('submit', function(event) {

        // Wait for response
        event.preventDefault();
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

          veil.style.backdropFilter = 'none'
          veil.style.webkitBackdropFilter = 'none'
          document.body.append(veil)
          veil.animate(
              [
                {backdropFilter: 'none',webkitBackdropFilter: 'none'},
                {backdropFilter: 'blur(50px)',webkitBackdropFilter: 'blur(50px)'}
              ],
              {duration:400,iterations: 1,delay:0,fill: 'forwards'}
          ).finished.then(()=>{
            veil.remove()
            function da() {
              jsPsych.finishTrial(this)
            }
            jsPsych.pluginAPI.setTimeout(da.bind(trialdata), this.iti);
          })

        } else if (num_sel_emo < 1) {
          if (trial.alerttype == "prompt") {
            alert ("You must select AT LEAST ONE emotion label");
          } else if (trial.alerttype == "inpage") {
            resetwarning()
            document.getElementById('last-button-row').style['margin-bottom'] = '55px';
            document.getElementById('toolittle').style.display = 'block';
          }

        } else if (num_sel_emo > (upper_limit)) {
          if (trial.alerttype == "prompt") {
            alert (`You can select AT MOST ${ul_text} emotion labels`);
          } else if (trial.alerttype == "inpage") {
            resetwarning()
            document.getElementById('last-button-row').style['margin-bottom'] = '55px';
            document.getElementById('toomany').style.display = 'block';
          }
        }
        

      });

    };
  }
  RateEmotionPlugin.info = info;

  return RateEmotionPlugin;

})(jsPsychModule);
