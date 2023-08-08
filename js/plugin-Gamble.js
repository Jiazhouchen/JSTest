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
        name: 'compete',
        description: '',
        parameters: {
            rank: {
                type: jspsych.ParameterType.BOOL,
                default: undefined,
                array: false,
                no_function: false,
                description: '',
            },
            which_side: {
                type: jspsych.ParameterType.STRING,
                pretty_name: 'whichside',
                default: 'right',
            },
            switch: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: 'switch',
                default: true,
            },
            iti: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: 'iti',
                default: 1000,
            },
        }
    }

    class GamblePlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }
            let html = init_gamble_page()
            // replace RPE engine here to generate
            trial['opt'] = {
                fixed: 1,
                gam_1: 5,
                gam_2: -2,
            }
            display_element.innerHTML = html
            const sv = draw_gamble_options(display_element,trial)
            sv.then(()=>{
                let keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: gam_keypress.bind(trial),
                    valid_responses: ['j','J','f','F'],
                    rt_method: 'performance',
                    persist: false,
                    allow_held_key: false
                });

                jsPsych.pluginAPI.setTimeout(gam_keypress.bind(trial), 5000);
            })


        }
    }
    GamblePlugin.info = info;

    return GamblePlugin;
})(jsPsychModule);