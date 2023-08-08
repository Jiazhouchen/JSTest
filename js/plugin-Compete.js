/*
 * Jiazhou Chen
 *
 * This plugin will run the gambling task with rank competition
 *
 *
 *
 */

jsPsychShowRank = (function(jspsych) {

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
                default: 500,
            },
        }
    }

    class ShowRankPlugIn {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        async trial(display_element, trial) {
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }
            let html = init_gamble_page()

            trial.mepos = 4
            trial.targetpos = 2

            trial.opponents = [100,9,]
            trial.showRank = true
            display_element.innerHTML = html
            const sv = await drawRank(display_element,trial)
            animate_movement(display_element,trial)
        }
    }
    ShowRankPlugIn.info = info;

    return ShowRankPlugIn;
})(jsPsychModule);

function animate_movement(display_element, trial) {

    document.getElementById(`rnametext-${trial.mepos}`).textContent = 'YOU'

    document.getElementById('veil').animate([
        {opacity: '100%'},{opacity: '0%'}],{
        duration:200,iterations: 1,delay:200,fill: 'forwards'
    }).finished.then(()=> {
        for (let i = 1; i < 11; i++) {
            if (i != trial.mepos) {
                document.getElementById(`pos-${i}`).animate([
                    {scale: "none"},{scale: "0.8"}
                ],{duration:400,iterations: 1,delay:200,fill: 'forwards'})

            } else {
                const an1 = document.getElementById(`cgtext-${i}`).animate([
                    {opacity: "0%", scale: "1"},{opacity: "100%", scale:"1.5"},
                    {opacity: "100%", scale:"0.9"},{opacity: "100%", scale:"1.5"},
                    {opacity: "100%", scale:"1.5"},{opacity: "0%", scale:"1.5"}
                ],{duration:600,iterations: 1,delay:200,fill: 'forwards'}).finished
                an1.then(() => {
                    document.getElementById(`rpointtxt-${i}`).textContent = '75 pts'
                    const an2 = document.getElementById(`rpointtxt-${i}`).animate([
                        {opacity: "100%", scale: "none"},{opacity: "100%", scale:"1.1"},
                    ],{duration:600,iterations: 1,delay:200,fill: 'forwards'}).finished.then(()=> {
                        const an3 = document.getElementById(`pos-${trial.mepos}`).animate([
                            {top: `${10*(trial.mepos-1)}%`},{top: `${10*(trial.targetpos-1)}%`}
                        ],{duration:600,iterations: 1,delay:200,fill: 'forwards'}).finished
                        document.getElementById(`rpostxt-${trial.mepos}`).textContent = trial.targetpos
                        for (let ix = trial.targetpos; ix < (trial.mepos); ix++) {
                            document.getElementById(`rpostxt-${ix}`).textContent = ix+1
                            document.getElementById(`pos-${ix}`).animate([
                                {top: `${10*(ix-1)}%`},{top: `${10*(ix)}%`}
                            ],{duration:600,iterations: 1,delay:200,fill: 'forwards'})
                        }
                        an3.then(()=> {
                            for (let ie = 1; ie < 11; ie++) {
                                document.getElementById(`pos-${ie}`).animate([
                                    {scale: "0.8"},{scale: "1"}
                                ],{duration:400,iterations: 1,delay:200,fill: 'forwards'})
                            }
							jsPsych.pluginAPI.setTimeout(function() {
								jsPsych.finishTrial({})
							}, 600+trial.iti);
                        })
                    })
                })
            }
        }
    })
}

function drawRank(display_element, trial) {
    const bg = document.createElement('div')
    bg.className = 'option_wrapper'
    bg.id = 'bg'
    bg.style.backgroundColor = ''

    const veil = document.createElement('div')
    veil.className = 'veil'
    veil.id = 'veil'


    const board = document.createElement('div')
    board.className = 'rankboard'
    board.id = 'board'
    bg.appendChild(board)

    for (let i =1; i < 11; i++) {
        const x = document.createElement('div')
        x.className='rankentry'
        x.style.top = `${10*(i-1)}%`
        x.id = `pos-${i}`

        if (i === 1) {
            x.style.borderRadius = '40px 40px 0px 0px'
        }
        if (i === 10) {
            x.style.borderRadius = '0px 0px 40px 40px'
        }

        const name = document.createElement('div')
        name.className = 'rankname'
        name.id = `rna-${i}`

        const nametext = document.createElement('h1')
        nametext.className = 'name'
        nametext.id = `rnametext-${i}`
        nametext.textContent = `PLACEHOLDER${i}`

        const pt = document.createElement('div')
        pt.className = 'rankpt'
        pt.id = `rpt-${i}`

        const pos_txt = document.createElement('h1')
        pos_txt.id = `rpostxt-${i}`
        pos_txt.className = 'pos'
        pos_txt.textContent = `${(i===10) ? '':''}${i}`

        const pt_text = document.createElement('h1')
        pt_text.id = `rpointtxt-${i}`
        pt_text.className = `points`
        pt_text.textContent = `${Math.round(100/(i))} pts`

        const ch_text = document.createElement('h1')
        ch_text.id = `cgtext-${i}`
        ch_text.className = `deltapoints`
        ch_text.textContent = '+50'
        ch_text.style.opacity = '0%'

        name.appendChild(pos_txt)
        name.appendChild(nametext)
        pt.appendChild(pt_text)
        pt.appendChild(ch_text)
        x.appendChild(name)
        x.appendChild(pt)
        board.appendChild(x)
    }


    display_element.appendChild(bg)
    display_element.appendChild(veil)

}