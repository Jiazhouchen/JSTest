var jsPsychMaze = (function (jspsych) {
    'use strict';
    //
    const info = {
        name: 'rate_emotion',
        description: 'This is the rate emotion page',
        parameters: {
            maze_size: {
                type: jspsych.ParameterType.INT,
                default: 25,
            },
            show_step: {
                type: jspsych.ParameterType.INT,
                default: 0,
            },
            init_pos: {
                type: jspsych.ParameterType.INT,
                default: [13,12],
            },
            target_pos: {
                type: jspsych.ParameterType.INT,
                default: [13,19],
            },
            num_move: {
                type: jspsych.ParameterType.INT,
                default: 10,
            },
            condition_tags: {
                type: jspsych.ParameterType.STRING,
                default: '',
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
    class MazePlugIn {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }
        trial(display_element, trial) {

            // Display HTML.
            let keycount = 0;
            display_element.innerHTML = init_maze_page(display_element,trial);
            const mz_ls =aMazeMe(25)
            const maze1 = mz_ls[0]
            maze1.id = 'cur_maze';
            const maze_var = mz_ls[1]

            document.getElementById('wrap').appendChild(maze1)


            const c1 = document.createElement('div')
            c1.setAttribute('pos_r',trial.init_pos[0])
            c1.setAttribute('pos_c',trial.init_pos[1])
            c1.className = 'mzC1'
            c1.id = 'mzC1'
            c1.textContent = '👤'

            const infoBox = document.createElement('div')
            infoBox.innerHTML = get_innerHTML('counter',trial.num_move)
            infoBox.className = 'infoBox'
            infoBox.id = 'infoBox'
            document.getElementById('wrap').appendChild(infoBox)


            const fbBox = document.createElement('div')
            fbBox.className = 'fbBox'
            fbBox.id = 'fbBox'
            fbBox.innerHTML = get_innerHTML('feedback',[0,0])
            document.getElementById('veil').appendChild(fbBox)

            const prize = document.createElement('div')
            prize.setAttribute('pos_r', trial.target_pos[0])
            prize.setAttribute('pos_c', trial.target_pos[1])
            prize.className = 'mzPrize'
            prize.id = 'mzPrize'
            prize.textContent = '🎁'

            maze1.appendChild(c1)
            maze1.appendChild(prize)
            resize_maze()
            addEventListener("resize", resize_maze);



            let cur_count = 0;
            trial.score_count = 10;
            let out;
            let cur_pos = [Number(c1.getAttribute('pos_r')), Number(c1.getAttribute('pos_c'))]
            let seq = [];
            let keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: async function (e) {
                    // out = move_it('mzC1',maze_var,cur_pos, e.key)
                    cur_count+=1
                    // cur_pos = out[0];
                    infoBox.innerHTML = get_innerHTML('counter',trial.num_move - cur_count)
                    if (trial.num_move - cur_count === 0) {
                        infoBox.animate([
                            {backgroundColor: 'white'},
                            {backgroundColor: '#dbb5a0'}, {backgroundColor: 'white'},
                            ],
                            {duration:500,iterations: 1,delay:0,fill: 'forwards'})
                    }
                    if (trial.show_step === 1) {
                        out = move_it('mzC1',maze_var,cur_pos, e.key)
                        cur_pos = out[0];
                        c1.setAttribute('pos_r',cur_pos[0])
                        c1.setAttribute('pos_c',cur_pos[1])
                        if (out[2] === false) {trial.score_count-=1}
                        if (cur_count >= 10) {
                            jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener)
                            setTimeout(end_maze.bind(trial), 1000)
                        }
                    } else {
                        seq.push(e.key)
                        if (cur_count >= 10){
                            jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener)
                            for await (let ik of seq) {
                                out = move_it('mzC1',maze_var,cur_pos, ik)
                                cur_pos = out[0];
                                c1.setAttribute('pos_r',cur_pos[0])
                                c1.setAttribute('pos_c',cur_pos[1])
                                if (out[2] === false) {trial.score_count-=1}
                                await out[1].finished.then(()=>{return true})
                            }
                            setTimeout(end_maze.bind(trial), 1000)
                        }
                    }



                },
                valid_responses: ['w','a','s','d','arrowup','arrowright','arrowdown','arrowleft'],
                rt_method: 'performance',
                persist: true,
                allow_held_key: false,
            })



        }

    }
    MazePlugIn.info = info;

    return MazePlugIn;

})(jsPsychModule);

function get_innerHTML(EleType,valueIn){
    switch (EleType) {
        case 'counter':
            return `<p><strong>${valueIn}</strong> moves left</p>`
        case 'feedback':
            return `
            <p style="text-align: left">Distance Traveled: </p><p id='fbnum1' style="text-align: right; opacity: 0%">+ <strong style="color: indianred">${valueIn[0]}</strong></p>
            <p style="text-align: left">Gift Box Bonus: </p><p id='fbnum2' style="text-align: right; opacity: 0%">+ <strong style="color: indianred">${valueIn[1]}</strong></p>
            <p style="text-align: left; bottom: 0; left: 0">Total: </p><p id='fbnum3' style="text-align: right; opacity: 0%">+ <strong style="color: indianred">${valueIn.reduce((partialSum, a) => partialSum + a, 0)}</strong></p>
            `
    }
}

function resize_maze(){
    let size_const;
    const wrap = document.getElementById('wrap')
    const maze1 = document.getElementById('cur_maze')
    const infoBox = document.getElementById('infoBox')
    const c1 = document.getElementById('mzC1')
    const prize = document.getElementById('mzPrize')
    let x_pos = [Number(c1.getAttribute('pos_r')), Number(c1.getAttribute('pos_c'))]
    let p_pos = [Number(prize.getAttribute('pos_r')), Number(prize.getAttribute('pos_c'))]
    if (wrap.offsetHeight > wrap.offsetWidth) {
        size_const = wrap.offsetWidth
        infoBox.style.width =  (0.4*(0.90*size_const))+'px';
        infoBox.style.maxHeight = (wrap.offsetHeight - (0.90*size_const)) /2 + 'px'
        infoBox.style.bottom = (0.2* (wrap.offsetHeight - (0.90*size_const) - infoBox.offsetHeight))+'px';
        infoBox.style.right = 0.5*wrap.offsetWidth - 0.5*infoBox.offsetWidth + 'px'
    } else {
        size_const = wrap.offsetHeight
        infoBox.style.maxHeight = 'none'
        infoBox.style.width =  (0.8*((wrap.offsetWidth - (0.90*size_const))/2))+'px';
        infoBox.style.right = (0.1*((wrap.offsetWidth - (0.90*size_const))/2))+'px';
        infoBox.style.bottom = 0.5*wrap.offsetHeight - 0.5*infoBox.offsetHeight + 'px'
    }

    maze1.style.height = (0.90*size_const)+'px';
    maze1.style.width = (0.90*size_const)+'px';
    maze1.style.left = (wrap.offsetWidth-(0.9*size_const))/2+'px'; // to center it do (100% - x) / 2



    c1.style.height = maze1.rows[x_pos[0]].childNodes[x_pos[1]].offsetHeight+'px'
    c1.style.width = maze1.rows[x_pos[0]].childNodes[x_pos[1]].offsetWidth+'px'
    c1.style.left = maze1.rows[x_pos[0]].childNodes[x_pos[1]].offsetLeft+'px'
    c1.style.top = maze1.rows[x_pos[0]].childNodes[x_pos[1]].offsetTop+'px'
    c1.animate([{
        left:0, top:0,
    },{
        left:maze1.rows[x_pos[0]].childNodes[x_pos[1]].offsetLeft+'px', top:maze1.rows[x_pos[0]].childNodes[x_pos[1]].offsetTop+'px',
    }], {duration:0,iterations: 1,delay:0,fill: 'forwards'})

    prize.style.height = maze1.rows[p_pos[0]].childNodes[p_pos[1]].offsetHeight+'px'
    prize.style.width = maze1.rows[p_pos[0]].childNodes[p_pos[1]].offsetWidth+'px'
    prize.style.left = maze1.rows[p_pos[0]].childNodes[p_pos[1]].offsetLeft+'px'
    prize.style.top = maze1.rows[p_pos[0]].childNodes[p_pos[1]].offsetTop+'px'
    prize.animate([{
        left:0, top:0,
    },{
        left:maze1.rows[p_pos[0]].childNodes[p_pos[1]].offsetLeft+'px', top:maze1.rows[p_pos[0]].childNodes[p_pos[1]].offsetTop+'px',
    }], {duration:0,iterations: 1,delay:0,fill: 'forwards'})
}
function move_it(move_id, maze, init_pos,key) {
    // move id is the id of the moving div
    // maze id is the actual maze on display
    // maze array is the array of maze set up (with true / false )
    // init_pos is the starting pos of the move
    // key is which key did they press
    const keymap = new Map()
    keymap.set('a','left')
    keymap.set('arrowleft','left')
    keymap.set('w','up')
    keymap.set('arrowup','up')
    keymap.set('d','right')
    keymap.set('arrowright','right')
    keymap.set('s','down')
    keymap.set('arrowdown','down')

    let dir = keymap.get(key.toLowerCase())
    let new_pos = [0,0];
    let wiggle_dir = [0,0];
    switch (dir) {
        case 'up':
            new_pos[0] = init_pos[0]-1;
            new_pos[1] = init_pos[1]+0;
            wiggle_dir = [5,0]
            break;
        case 'down':
            new_pos[0] = init_pos[0]+1;
            new_pos[1] = init_pos[1]+0;
            wiggle_dir = [-5,0]
            break;
        case 'left':
            new_pos[0] = init_pos[0]+0;
            new_pos[1] = init_pos[1]-1;
            wiggle_dir = [0,-5]
            break;
        case 'right':
            new_pos[0] = init_pos[0]+0;
            new_pos[1] = init_pos[1]+1;
            wiggle_dir = [0,5]
            break;
    }

    const pass = !maze.maze_array[(new_pos[0]*maze.cells_w)+new_pos[1]]
    let anipromise;
    const mov = document.getElementById(move_id)
    const maze1 = document.getElementById('cur_maze')
    if (pass===true) {
        anipromise = document.getElementById(move_id).animate([{
            left:mov.offsetLeft+'px', top:mov.offsetTop+'px',
        },{
            left:maze1.rows[new_pos[0]].childNodes[new_pos[1]].offsetLeft+'px', top:maze1.rows[new_pos[0]].childNodes[new_pos[1]].offsetTop+'px',
        }], {duration:100,iterations: 1,delay:0,fill: 'forwards'})
    } else {
        new_pos = init_pos;
        anipromise = document.getElementById(move_id).animate([{
            transform: 'translate(0px, 0px) rotate(0deg)'
        },{
            transform: `translate(${wiggle_dir[0]}px, ${wiggle_dir[1]}px) rotate(-5deg)`
        },{
            transform: `translate(0px, 0px) rotate(5deg)`
        },{
            transform: `translate(${wiggle_dir[0]}px, ${wiggle_dir[1]}px) rotate(-5deg)`
        }], {duration:100,iterations: 1,delay:0,fill: 'backwards'})
    }
    return [new_pos,anipromise,pass]


}

async function end_maze() {
    console.log('done')
    const veil = document.getElementById('veil')
    const fbBox = document.getElementById('fbBox')
    fbBox.innerHTML = get_innerHTML('feedback',[this.score_count,0])
    veil.style.display = 'inline'
    const ani1 = document.getElementById('veil').animate([
        {backdropFilter: 'blur(0px)',webkitBackdropFilter: 'blur(0px)'},
        {backdropFilter: 'blur(50px)',webkitBackdropFilter: 'blur(50px)'},
    ],{duration: 200, iterations: 1, delay: 0, fill: 'forwards'}).finished
    ani1.then(async ()=>{
        id='fbnum1'
        for (let i = 1; i<4; i+=1) {
            await document.getElementById(`fbnum${i}`).animate([
                {opacity: '0%'},
                {opacity: '100%'}
            ],{duration: 300, iterations: 1, delay: 0, fill: 'forwards'}).finished.then(()=>{return true})
        }
        setTimeout(function () {jsPsych.finishTrial(this)},1000)

    })
}

function init_maze_page(display_element,trial) {
    let html = ''
    html += `
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Oswald">
    <style>
    div {
        
    }
    div.veil {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(0px);
        -webkit-backdrop-filter: blur(0px);
        display: none; 
        z-index: 999;
    }
    h1.cross {
        position: absolute;
        top: 25%;
        left: 49%;
        font-size: 10vw;
    }
    div.wrap {
        position: absolute;
        top: 1vw;
        left: 1vw;
        width: 98vw;
        height: 90vh;
        border-radius: 40px;
        background-color: #f2f1f0;
    }
    .mzTight {
        /* table style */
        position: absolute;
        top: 5%;
        padding:16px;
        border-spacing: 0px;
        border-radius: 10px;
        box-shadow: 5px 5px 10px rgb(224,224,224);
    }
    .mzTR {
        border: none;
        width: auto;
    }
    .mzW {
        /* wall cell */
        border: none;
        background-color: black;
    }
    
    .mzF {
        /* floor cell */
        border: 1px solid lightgrey; 
        padding: 0;
        margin: 0;
        border-spacing: 0;
        line-height: 0;
        background-color: white;
    }
    .mzC1 {
        position: absolute;
        background-color: #c8e6d0;
        font-weight: bold;
        font-size: 2.5vh;
        overflow: hidden;
        z-index: 99;
        opacity: 80%;
    }
    
    .mzPrize {
        position: absolute;
        border: 1px solid lightgoldenrodyellow; 
        background-color: gold;
        font-weight: bold;
        font-size: 2.5vh;
        overflow: hidden;
        z-index: 98;
    }
    
    .infoBox {
        font-family: "Oswald", sans-serif;  
        position: absolute;
        display: flex;
        aspect-ratio: auto 2 / 1;
        backdrop-filter: blur(20px);
        line-height: 100%;
        align-items:center;
        justify-content:center;
        font-size: 5vh;
        background-color: white;
        border-radius: 10px;
        box-shadow: 5px 5px 10px rgb(224,224,224);
    }
    .infoBox p strong {
        color: indianred;
    }
    .fbBox {
        position: absolute;
        font-family: "Oswald", sans-serif;  
        padding-left: 5%;
        padding-right: 5%;
        font-size: 200%;
        height: 45%;
        width: 50%;
        left: 20%;
        top: 20%;
        border-radius: 10px;
        background-color: rgb(239 240 238 / 0.45);
    }
    .wrap button {
        position: absolute;
        font-family: Arial,serif;
        font-size: 2vh;
        font-weight: bold;
        color: #465878;
        border-color: #465878;
        bottom: 2%;
        right: 1%;
        height: 10%;
        width: 10%;
        border-radius: 40px;
        display: none;
    }
    .wrap button:hover {
        filter: brightness(90%);
        -webkit-filter: brightness(90%);
        background-color: #465878;
        color: white;
    }
    </style>
    <body>
    <div class = 'wrap' id = 'wrap'>
        
    </div>
    <div class = 'veil' id = 'veil'></div>    
    </body>
    `
    return html

}