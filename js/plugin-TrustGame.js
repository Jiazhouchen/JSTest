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
                default: 1,
            },
            share: {
                type: jspsych.ParameterType.INT,
                pretty_name: 'whichside',
                default: 1,
            },
            player: {
                type: jspsych.ParameterType.INT,
                pretty_name: 'switch',
                default: 1,
            },
        }
    }

    class TrustPlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }
            let html = init_trust_page()
            // replace RPE engine here to generate
            display_element.innerHTML = html
            const sv = draw_trust_bio(display_element,trial)
			

        }
    }
    TrustPlugin.info = info;

    return TrustPlugin;
})(jsPsychModule);

