function DrawBackground(trial, ctx){
    // draw the background
    ctx.fillStyle = trial.color_options.background;
    //ctx.fillRect(0, 0, trial.canvas_dimensions[0], trial.canvas_dimensions[1]);
    ctx.beginPath();
    ctx.roundRect(0,0, trial.canvas_dimensions[0], trial.canvas_dimensions[1], [trial.curve_degree]);
    ctx.fill();

    return  performance.now()
};

function DrawFixationCross(trial, ctx) {
    ctx.fillStyle = trial.color_options.cross;
    ctx.font = `${trial.canvas_dimensions[0]*0.15}px Arial`;
    ctx.fillText('+', trial.canvas_dimensions[0]*0.47, trial.canvas_dimensions[1]*0.6);
}

function DrawOptions(trial, ctx) {
    // right side default to gambling options
    let x_gam = trial.canvas_dimensions[0]*0.15;
    let x_fix= trial.canvas_dimensions[0]*0.65;
    if (trial.which_side === 'right') {
        x_gam = trial.canvas_dimensions[0]*0.65
        x_fix = trial.canvas_dimensions[0]*0.15
    }
    let box_size = [trial.canvas_dimensions[0]*0.2, trial.canvas_dimensions[0]*0.2]
    // two gambling options
    ctx.fillStyle = trial.color_options.gambling;
    ctx.beginPath();
    ctx.roundRect(x_gam,trial.canvas_dimensions[1]*0.09,box_size[0],box_size[1], [trial.curve_degree]);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(x_gam,trial.canvas_dimensions[1]*0.55,box_size[0],box_size[1], [trial.curve_degree]);
    ctx.fill();
    // one fixed income
    ctx.fillStyle = trial.color_options.safe;
    // ctx.fillRect(x_fix,trial.canvas_dimensions[1]*0.30,box_size[0],box_size[1])
    ctx.beginPath();
    ctx.roundRect(x_fix,trial.canvas_dimensions[1]*0.30,box_size[0],box_size[1], [trial.curve_degree]);
    ctx.fill();
    //add text:
    ctx.fillStyle = trial.color_options.font;
    ctx.font = `${trial.canvas_dimensions[0]*0.1}px Arial`;
    ctx.fillText(trial.reward_text.gambling[0], x_gam+trial.canvas_dimensions[0]*0.02, trial.canvas_dimensions[1]*0.335);
    ctx.fillText(trial.reward_text.gambling[1], x_gam+trial.canvas_dimensions[0]*0.02, trial.canvas_dimensions[1]*0.79);
    ctx.fillText(trial.reward_text.safe[0], x_fix+trial.canvas_dimensions[0]*0.02, trial.canvas_dimensions[1]*0.54);

    return  performance.now()
}

function Feedback(trial,ctx,response,display_element) {


    let text_1 = '          NO  RESPONSE'
    let text_2 = ``;
    let frame_color = "#383838";
    let font_color = "#000000";
    let outcome_num = 999;


    if (response.selected != null && response.selected === "gambling") {
        if (trial.gambling_result === 1) {
            frame_color = "#ccdea6";
            font_color = "#a1ba68";
            text_1 = ' GAMBLE OUTCOME: WIN';
            if (response.options.gam[0] > response.options.gam[1]) {
                outcome_num = response.options.gam[0]
            } else {
                outcome_num = response.options.gam[1]
            }
        } else {
            frame_color = "#cf9382";
            font_color = "#a67b6f";
            text_1 = 'GAMBLE OUTCOME: LOST';
            if (response.options.gam[0] > response.options.gam[1]) {
                outcome_num = response.options.gam[1]
            } else {
                outcome_num = response.options.gam[0]
            }
        }
    } else if (response.selected != null && response.selected === "safe") {
        frame_color = "#969687";
        font_color = '#61614e';
        outcome_num = parseInt(trial.reward_text.safe[0]);
        text_1 = '           SAFE  OPTION';
    }
    response.points = outcome_num;
    window.accumulative_earning += outcome_num;
    response.accum_pt_snapshot = window.accumulative_earning;
    if (outcome_num === 999) {
        // null response
        text_2 = ``;
    } else if (outcome_num === 0) {
        text_2 = `Your points didn't change`;
    } else if (outcome_num > 1) {
        text_2 = `     You earned ${outcome_num} points`;
    } else if (outcome_num > 0) {
        text_2 = `     You earned ${outcome_num}  point`;
    } else if (outcome_num < -1) {
        outcome_num = Math.abs(outcome_num)
        text_2 = `        You lost ${outcome_num} points`;
    } else {
        outcome_num = Math.abs(outcome_num)
        text_2 = `        You lost ${outcome_num}  point`;
    }

    DrawBackground(trial,ctx)
    ctx.beginPath();
    ctx.strokeStyle = frame_color;
    ctx.roundRect(trial.canvas_dimensions[1]*0.3,trial.canvas_dimensions[1]*0.04,
        trial.canvas_dimensions[0]*0.7,trial.canvas_dimensions[1]*0.9,[trial.curve_degree]);
    ctx.lineWidth = 20;
    ctx.stroke();
    ctx.fillStyle = font_color;
    ctx.font = `bold ${trial.canvas_dimensions[0]*0.05}px Arial`;
    ctx.fillText(text_1, trial.canvas_dimensions[0]*0.195, trial.canvas_dimensions[1]*0.2);
    ctx.fillText(text_2, trial.canvas_dimensions[0]*0.215, trial.canvas_dimensions[1]*0.55);
    setTimeout(function() {
        DrawBackground(trial,ctx)
        DrawFixationCross(trial,ctx)
    },2000)
    setTimeout(function() {
        // EndTrial(response)
       MoveOn(display_element, trial,response, ctx)
    },2800)
}

function MoveOn(display_element, trial, response, ctx) {

    if(trial.show_emo_rate === 1) {
        let [html, emotions, upper_limit, startTime] = initEmoPage(trial);
        display_element.innerHTML=html
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

                if(emo_grid[emo] == 1) {
                    deselectEmo(emo)
                } else {
                    selectEmo(emo)
                }
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
        if (trial.emo_max_dur !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                var submit_time = performance.now();
                var trialdata = {
                    "submit_time": submit_time,
                    "emo_grid": emo_grid,
                    "click_history": click_history,
                    "init_time": startTime,
                    "time_out": true,
                };
                iti_cross(display_element,trial,EndTrial.bind(this,response,trialdata))
            }, trial.emo_max_dur);
        }
        display_element.querySelector('#RateEmo').addEventListener('submit', function(event) {

            // Wait for response
            event.preventDefault();
            if (num_sel_emo > 0 & num_sel_emo < (upper_limit + 1)) {
                // Measure response time
                var submit_time = performance.now();

                // Store data
                var trialdata = {
                    "submit_time": submit_time,
                    "emo_grid": emo_grid,
                    "click_history": click_history,
                    "init_time": startTime,
                    "time_out": false,
                };

                // Update screen
                iti_cross(display_element,trial,EndTrial.bind(this,response,trialdata))

            } else if (num_sel_emo < 1) {
                if (trial.alerttype == "prompt") {
                    alert("You must select AT LEAST ONE emotion label");
                } else if (trial.alerttype == "inpage") {
                    resetwarning()
                    document.getElementById('last-button-row').style['margin-bottom'] = '55px';
                    document.getElementById('toolittle').style.display = 'block';
                }

            } else if (num_sel_emo > (upper_limit)) {
                if (trial.alerttype == "prompt") {
                    alert(`You can select AT MOST ${ul_text} emotion labels`);
                } else if (trial.alerttype == "inpage") {
                    resetwarning()
                    document.getElementById('last-button-row').style['margin-bottom'] = '55px';
                    document.getElementById('toomany').style.display = 'block';
                }
            }
        });

    } else {
        iti_cross(display_element,trial,EndTrial.bind(this,response,null))

    }
}

function iti_cross(display_element,trial,callback) {
    let new_html = `<canvas id="iti_canvas" width="${trial.canvas_dimensions[0]}" height="${trial.canvas_dimensions[1]}"></canvas>`;
    display_element.innerHTML = new_html;
    let ctx = document.getElementById('iti_canvas').getContext('2d');
    DrawBackground(trial,ctx)
    DrawFixationCross(trial,ctx)
    setTimeout(function() {
        callback()
        console.log('iti: '+trial.iti+'ms done')
    },trial.iti)
}
function EndTrial(response,emodata) {
    // clear keyboard listener
    jsPsych.pluginAPI.cancelAllKeyboardResponses();
    // kill any remaining setTimeout handlers
    jsPsych.pluginAPI.clearAllTimeouts();
    // gather the data to store for the trial
    // move on to the next trial
    let no_emo = emodata === null
    let dt = {'gambling': response, 'emo_labeling': emodata, display_emo: !no_emo}
    jsPsych.finishTrial(dt);
}
