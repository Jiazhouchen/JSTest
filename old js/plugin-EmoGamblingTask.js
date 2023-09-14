let jsPsychEmoGambling = (function (jspsych) {
  'use strict';
  // 
  const info = {
    name: 'emo_gambling',
    description: 'This is the emotion gambling task',
    parameters: {
      canvas_dimensions: {
        type: jspsych.ParameterType.INT,
        default: [1280, 720],
        description: 'The dimensions [width, height] of the html canvas on which things are drawn'
      },
      color_options: {
        type: jspsych.ParameterType.STRING,
        default: {
          'background': '#878787',
          'gambling': '#e8e1cc',
          'safe':      '#e8e1cc',
          'cross': '#fafafa',
          'font': '#080808',
          'selected': '#edddbb',
          'confirmed': '#f2a407',
        },
        description: 'The colour of the background'
      },
      curve_degree: {
        type: jspsych.ParameterType.INT,
        default: 20,
        description: 'The colour of the background'
      },
      allowed_keys: {
        type: jspsych.ParameterType.STRING,
        default: ['f','j'],
      },
      max_dur: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
      emo_max_dur: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
      sel_dur: {
        type: jspsych.ParameterType.INT,
        default: 1,
      },
      iti: {
        type: jspsych.ParameterType.INT,
        default: 1500,
      },
      yoked: {
        type: jspsych.ParameterType.INT,
        default: 1,
      },
      which_side: {
        type: jspsych.ParameterType.STRING,
        pretty_name: 'GamblingWhichSide',
        default: 'right',
        description: 'Which side should we display the gambling option'
      },
      reward_text: {
        type: jspsych.ParameterType.STRING,
        pretty_name: 'RewardText',
        default: null,
        description: 'What are the gambling options'
      },
      gambling_result: {
        type: jspsych.ParameterType.INT,
        default: 0,
        description: 'Whether this is a win or loss trial'
      },
      cumulate_earning: {
        type: jspsych.ParameterType.INT,
        default: 0,
        description: 'How much has the participant earned at this point'
      },
      show_emo_rate: {
        type: jspsych.ParameterType.INT,
        default: 1,
        description: 'Whether to show emotional rating'
      },
      win_p: {
        type: jspsych.ParameterType.FLOAT,
        default: 0,
        description: 'Whether to show emotional rating'
      },
      yoke_p: {
        type: jspsych.ParameterType.FLOAT,
        default: 0,
        description: 'Whether to show emotional rating'
      },
      choice_type: {
        type: jspsych.ParameterType.STRING,
        default: 'unknown',
        description: 'The sets of emotions to be displayed. Options are GoEmo, Ekman and Sentiment'
      },
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
  Gambling component
  **/
  class EmoGamblingPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      let response = {
        rt: 0,
        key: '',
        selected: null,
        points: 0,
        options: {
          'safe': parseInt(trial.reward_text.safe[0]),
          'gam': [parseInt(trial.reward_text.gambling[0]),
            parseInt(trial.reward_text.gambling[1])],
        },
        yoked: trial.yoked,
        win_p: trial.win_p,
        yoke_p: trial.yoke_p,
        choice_type: trial.choice_type,
        emotion_type: trial.emotion,
        init_time: performance.now(),
        iti: trial.iti,
      }

      let x = 0;
      let last = performance.now()
      let dir = 1;
      let oppo_side = '';
      let criterion = 0;
      let animate;
      let new_html = `<canvas id="trial_canvas" width="${trial.canvas_dimensions[0]}" height="${trial.canvas_dimensions[1]}"></canvas>`;
      display_element.innerHTML = new_html;
      const ctx = document.getElementById('trial_canvas').getContext('2d');
      console.log('Start drawing trial options')
      response['drawtime_background']=DrawBackground(trial, ctx);
      response['drawtime_stimulus']=DrawOptions(trial, ctx)


      let keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: KeyPress,
        valid_responses: trial.allowed_keys,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });

      if (trial.max_dur !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          Result(trial,ctx,response);
          }, trial.max_dur);
      }

      // random select function:

      //Drawing functions here:


      function DrawSelected(trial, ctx, whichside,confirmed) {
        let x_pos = trial.canvas_dimensions[0]*0.095
        if (whichside === 'right') {
          x_pos = trial.canvas_dimensions[0] * 0.595
        }
        //draw selected box:
        if (confirmed === 1) {
          ctx.strokeStyle = trial.color_options.confirmed;
          cancelAnimationFrame(animate)
        } else {
          ctx.strokeStyle = trial.color_options.selected;
        }
        ctx.lineWidth = trial.canvas_dimensions[0]*0.01
        ctx.beginPath();
        ctx.roundRect(x_pos,trial.canvas_dimensions[1]*0.04,
            trial.canvas_dimensions[0]*0.31,trial.canvas_dimensions[1]*0.91,[trial.curve_degree]);
        ctx.stroke()

        return  x_pos
      }



      function moving_selection(timestamp) {
        let finished = false;
        DrawBackground(trial,ctx);
        DrawOptions(trial,ctx,trial.which_side,trial.reward_text)
        ctx.beginPath();
        ctx.roundRect(x,trial.canvas_dimensions[1]*0.04,
            trial.canvas_dimensions[0]*0.31,trial.canvas_dimensions[1]*0.91,[trial.curve_degree]);
        ctx.strokeStyle = trial.color_options.selected;;
        ctx.lineWidth = trial.canvas_dimensions[0]*0.01
        ctx.stroke()
        x += (timestamp - last) * 0.8 * dir;
        last = timestamp;
        if (dir > 0 && x >= criterion) {
          x = criterion;
          finished = true;
        } else if (dir < 0 && x <= criterion) {
          x = criterion;
          finished = true;
        }

        animate=requestAnimationFrame(moving_selection);
        if (finished) {
          DrawBackground(trial,ctx);
          DrawOptions(trial,ctx,trial.which_side,trial.reward_text)
          DrawSelected(trial,ctx,oppo_side,1)
          cancelAnimationFrame(animate);
          setTimeout(function() {
            Result(trial,ctx,response)
          },500)
        }
      }


      //feedback function:
      function KeyPress(info) {
        jsPsych.pluginAPI.cancelAllKeyboardResponses();
        jsPsych.pluginAPI.clearAllTimeouts();
        if (response.key != null) {
          response.rt  = info.rt;
          response.key = info.key;
        }
        console.log('Pressed...'+response.key+' key')
        response.yoked = trial.yoked;
        response.init_time = trial.init_time;
        response.selected = 'safe'
        if (jsPsych.pluginAPI.compareKeys(trial.allowed_keys[0], response.key)){
          x=DrawSelected(trial,ctx,'left')
          if (trial.which_side === 'left') {
            response.selected = 'gambling'
          }
          if (trial.yoked===1) {
            response.selected = 'gambling'
            if (trial.which_side === 'left') {
              response.selected = 'safe'
            }
            dir = 1;
            oppo_side = 'right';
            criterion = trial.canvas_dimensions[0] * 0.595;
            jsPsych.pluginAPI.setTimeout(function() {
              last = performance.now();
              requestAnimationFrame(moving_selection);
            }, 500);
          } else {
            jsPsych.pluginAPI.setTimeout(function() {
              DrawSelected(trial,ctx,'left',1)
              setTimeout(function() {
                Result(trial, ctx,response)
              },500)
            }, 500);
          }
        } else if (jsPsych.pluginAPI.compareKeys(trial.allowed_keys[1], response.key)){
          x=DrawSelected(trial,ctx,'right')
          if (trial.which_side === 'right') {
            response.selected = 'gambling'
          }
          if (trial.yoked===1) {
            response.selected = 'gambling'
            if (trial.which_side === 'right') {
              response.selected = 'safe'
            }
            dir = -1;
            oppo_side = 'left';
            criterion = trial.canvas_dimensions[0] * 0.095;
            jsPsych.pluginAPI.setTimeout(function() {
              last = performance.now();
              requestAnimationFrame(moving_selection);
            }, 500);
          } else {
            jsPsych.pluginAPI.setTimeout(function() {
              DrawSelected(trial,ctx,'right',1)
              setTimeout(function() {
                Result(trial,ctx,response)
              },500)
            }, 500);
          }

        }


      }

      function Result(trial,ctx,response) {
        jsPsych.pluginAPI.cancelAllKeyboardResponses();
        jsPsych.pluginAPI.clearAllTimeouts();
        DrawBackground(trial,ctx)
        DrawFixationCross(trial,ctx)
        jsPsych.pluginAPI.setTimeout(function() {
          Feedback(trial,ctx,response,display_element)
        }, 500);
      }




      trial['init_time'] = performance.now();
    };

  }
  EmoGamblingPlugin.info = info;

  return EmoGamblingPlugin;

})(jsPsychModule);
