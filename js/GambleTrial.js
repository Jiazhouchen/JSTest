function init_gamble_page() {
    let html = ''
    html += `
    <style>
        div {
            border: 1px solid #73AD21;
            
        }
        div.veil {
            position: absolute;
            top: 0%;
            left: 0%;
            width: 100%;
            height: 100%;
            opacity: 100%;
            backdrop-filter: blur(50px);
            -webkit-backdrop-filter: blur(50px);
        }
        h1.cross {
            position: absolute;
            top: 25%;
            left: 49%;
            font-size: 10vw;
        }
        div.option_wrapper {
            position: absolute;
            top: 1vw;
            left: 1vw;
            width: 98vw;
            height: 48vw;
            border-radius: 40px;
        }
        div.g_helper_text {
            position: absolute;
            bottom: 5%;
            left: 10%;
            width: 80%;
            height: 10%;
            font-size: 1em;
            text-align: center;
           }
        div.gam_opt {
            position: absolute;
            width: 70%;
            height: 40%;
            right: 15%;
            border-radius: 20px;
            background-color: #ded8ca;
            font-size: 10vw;
            font-weight: 900;
            text-align: center;
            vertical-align: middle;
            line-height: 16vw;
            opacity: 0%;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        }
        div.g_gam_sel {
            position: absolute;
            top: 1%;
            width: 25%;
            height: 80%;
            border: 10px solid transparent;
            border-radius: 40px;
            
        }
        div.g_fb_bg{
            width: 100%;
            height: 100%;
            border-radius: 40px;
        }
        div.g_fb_box {
            position: absolute;
            top: 20%;;
            left: 25%;
            width: 50%;
            height: 40%;
            border-radius: 40px;
            opacity: 0%;
            transition-timing-function: ease-in;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        }
        h1.g_fb_box{
            font-size: 7vw;
            font-weight: 1000;
            line-height: 4vw;
            text-align: center;
            vertical-align: middle;
        }
        h2.g_fb_box{
            font-size: 4vw;
            font-weight: 500;
            text-align: center;
            vertical-align: middle;
        }

        @keyframes sel_confirm {
            from {border-color: #dbcab6;}
            to {border-color:#d6954b}
        }
        div.rankboard {
            position: absolute;
            left: 20%;
            top: 0%;
            width: 60%;
            height: 100%;
            transition-timing-function: ease-in;
            border-radius: 40px;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        }
        div.rankentry {
            position: absolute;
            left: 0%;
            width: 100%;
            height: 10%;
            background-color: #a8c9e6;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        }
        div.rankname {
            position: absolute;
            top: 10%;
            left: 5%;
            height: 80%;
            width: 50%;
            background-color: ;
            border-radius: 40px;
            overflow: auto;
            color:white;
        }
        div.rankpt {
            position: absolute;
            right: 5%;
            top: 10%;
            height: 80%;
            width: 30%;
        }
       
        h1.pos {
            position: absolute;
            left: 5%;
            bottom: -17%;
        }
        h1.name{
            position: absolute;
            right: 5%;
            bottom: -17%;
        }
        h1.points {
            position: absolute;
            left: 5%;
            bottom: -17%; 
        }
        h1.deltapoints {
            position: absolute;
            right: 5%;
            bottom: -17%; 
        }
        .lottoTable {
            position: absolute;
            left: 23%;
            top: 5%;
            min-width: 54%;
            min-height: 90%;
            height: 90%;
            width: 54%;
            border-collapse: collapse;
        }
        .lottoTable td{
            width: 25%;
            height: 25%;
            border: 10px solid #aba78a;
            font-size: 7vw ;
        }
        .lottoTable tr:first-child td {
            border-top: none;
        }
        .lottoTable tr:last-child td {
            border-bottom: none;
        }
        .lottoTable tr td:first-child {
            border-left: none;
        }
        .lottoTable tr td:last-child {
            border-right: none;
        }
    </style>
    <body>
        
    </body>
    `
    return html
}

function draw_gamble_options(display_element,trial) {

    const wrap = document.createElement('div')
    wrap.className = 'option_wrapper'
    wrap.style.backgroundColor = '#f2f1f0'
    wrap.id = 'g_option_wrapper'

    const help_txt = document.createElement('div')
    help_txt.className = 'g_helper_text'
    help_txt.id = 'g_helper_text'
    const hleft = document.createElement('h1')
    const hright = document.createElement('h1')
    hleft.style.position = 'absolute'
    hright.style.position = 'absolute'
    hleft.textContent = 'Press F'
    hleft.style.left = '11%'
    hright.textContent = 'Press J'
    hright.style.right = '11%'
    help_txt.appendChild(hleft)
    help_txt.appendChild(hright)

    const opt_gam_f_t = document.createElement('div')
    const opt_gam_f_c = document.createElement('div')
    const opt_gam_f_b = document.createElement('div')
    const opt_gam_j_t = document.createElement('div')
    const opt_gam_j_c = document.createElement('div')
    const opt_gam_j_b = document.createElement('div')
    const opt_gam_sel_f = document.createElement('div')
    const opt_gam_sel_j = document.createElement('div')


    opt_gam_f_t.className = 'gam_opt'
    opt_gam_f_t.id = 'gopt_ft'
    opt_gam_f_t.style.top = '7%'

    opt_gam_f_c.className = 'gam_opt'
    opt_gam_f_c.id = 'gopt_fc'
    opt_gam_f_c.style.top = '30%'

    opt_gam_f_b.className = 'gam_opt'
    opt_gam_f_b.id = 'gopt_fb'
    opt_gam_f_b.style.bottom = '7%'

    opt_gam_j_t.className = 'gam_opt'
    opt_gam_j_t.id = 'gopt_jt'
    opt_gam_j_t.style.top = '7%'

    opt_gam_j_c.className = 'gam_opt'
    opt_gam_j_c.id = 'gopt_jc'
    opt_gam_j_c.style.top = '30%'

    opt_gam_j_b.className = 'gam_opt'
    opt_gam_j_b.id = 'gopt_jb'
    opt_gam_j_b.style.bottom = '7%'


    opt_gam_sel_f.className = 'g_gam_sel'
    opt_gam_sel_f.id = 'gam_sel_f'
    opt_gam_sel_f.style.left = '10%'

    opt_gam_sel_j.className = 'g_gam_sel'
    opt_gam_sel_j.id = 'gam_sel_j'
    opt_gam_sel_j.style.right = '10%'


    opt_gam_sel_f.appendChild(opt_gam_f_c)
    opt_gam_sel_f.appendChild(opt_gam_f_b)
    opt_gam_sel_f.appendChild(opt_gam_f_t)

    opt_gam_sel_j.appendChild(opt_gam_j_c)
    opt_gam_sel_j.appendChild(opt_gam_j_b)
    opt_gam_sel_j.appendChild(opt_gam_j_t)

    const veil = document.createElement('div')
    veil.className = 'veil'
    veil.id = 'veil'
    const cross = document.createElement('h1')
    cross.id = 'cross'
    cross.className = 'cross'
    cross.textContent = '+'

    const view = document.createElement('div')
    view.id = 'view'
    view.className = 'option_wrapper'
    view.appendChild(cross)
    veil.appendChild(view)

    wrap.appendChild(help_txt)
    wrap.appendChild(opt_gam_sel_f)
    wrap.appendChild(opt_gam_sel_j)

    display_element.append(wrap)
    display_element.append(veil)

    if (trial.which_side === 'left') {
        document.getElementById('gopt_jc').style.opacity = '100%'
        document.getElementById('gopt_ft').style.opacity = '100%'
        document.getElementById('gopt_fb').style.opacity = '100%'
        document.getElementById('gopt_jc').textContent = trial.opt.fixed
        document.getElementById('gopt_ft').textContent = trial.opt.gam_1
        document.getElementById('gopt_fb').textContent = trial.opt.gam_2

        document.getElementById('gopt_jt').style.opacity = '0%'
        document.getElementById('gopt_jb').style.opacity = '0%'
        document.getElementById('gopt_fc').style.opacity = '0%'
    } else {
        document.getElementById('gopt_jc').style.opacity = '0%'
        document.getElementById('gopt_ft').style.opacity = '0%'
        document.getElementById('gopt_fb').style.opacity = '0%'


        document.getElementById('gopt_fc').style.opacity = '100%'
        document.getElementById('gopt_jt').style.opacity = '100%'
        document.getElementById('gopt_jb').style.opacity = '100%'
        document.getElementById('gopt_fc').textContent = trial.opt.fixed
        document.getElementById('gopt_jt').textContent = trial.opt.gam_1
        document.getElementById('gopt_jb').textContent = trial.opt.gam_2
    }
    cross.animate(
        [
            {opacity: '100%'},
            {opacity: '0%'},
        ],
        {duration:400,iterations: 1,delay:0,fill: 'forwards'}
    )

    const sv = veil.animate([
            {backdropFilter: 'blur(100px)',webkitBackdropFilter: 'blur(100px)'},
            {backdropFilter: 'none',webkitBackdropFilter: 'none'}
        ],
        {duration:400,iterations: 1,delay:0,fill: 'forwards'}).finished



    return sv
}




function gam_keypress(e) {
    "use strict";
    jsPsych.pluginAPI.cancelAllKeyboardResponses()
    jsPsych.pluginAPI.clearAllTimeouts()

    let resp = {
        key: '',
        keyPressed: '',
        switch: this.switch,
        rt: '',
        opt: this.opt,
        type: '',
        fb: '',
        pt: '',
        showRank: this.showRank,
        iti: this.iti,
    }
    // set up feedback background & box
    const fb_box = document.createElement('div')
    fb_box.id = 'fb_box'
    fb_box.className = 'g_fb_box'
    // set up feedback text
    const fb_textKey = document.createElement('h1')
    const fb_textSup = document.createElement('h2')
    fb_textKey.className = 'g_fb_box'
    fb_textSup.className = 'g_fb_box'
    fb_box.appendChild(fb_textKey)
    fb_box.appendChild(fb_textSup)
    document.getElementById('view').appendChild(fb_box)
    if (e) {
        // if there is a response:
        resp.key = e.key
        resp.keyPressed = e.key
        resp.rt = e.rt
        // draw selection box:
        let sel_box = document.getElementById(`gam_sel_${resp.key}`).cloneNode(false)
        sel_box.id = 'temp_remove'
        document.getElementById('g_option_wrapper').appendChild(sel_box)
        // set selection animation:
        let sel_ani_opt = {
            duration: 2000,
            iterations: 1,
            fill: 'forwards'
        }
        let sel_ani;
        console.log(this.switch === false)
        if (this.switch === false) {
            sel_ani = [
                {borderColor: '#dbcab6'},
                {borderColor: '#dbcab6',offset: 0.8},
                {borderColor: '#d6954b'},
            ];
            sel_ani_opt.duration = 1000
        } else if (resp.key==='j') {
            sel_ani = [
                {borderColor: '#dbcab6', right: '10%',},
                {borderColor: '#dbcab6', right: '10%',offset: 0.6},
                {borderColor: '#dbcab6', right: '63.5%',offset: 0.90},
                {borderColor: '#d6954b', right: '63.5%'},
            ]
            resp.key = 'f'
        } else if (resp.key==='f') {
            sel_ani = [
                {borderColor: '#dbcab6', left: '10%'},
                {borderColor: '#dbcab6', left: '10%',offset: 0.6},
                {borderColor: '#dbcab6', left: '63.5%',offset: 0.90},
                {borderColor: '#d6954b', left: '63.5%'},
            ]
            resp.key = 'j'
        }
        // figure out what feedback to give based on contingency and key press
        let opt_str
        if (this.which_side === 'left' && resp.key === 'f' || this.which_side === 'right' && resp.key === 'j') {
            // gamble side is pressed:
            resp.type = 'gamble'
            if (this.win === 'win') {
                opt_str = (this.opt.gam_1 > this.opt.gam_2) ? 'gam_1':'gam_2';
                fb_box.style.backgroundColor = '#acdb86'
                fb_textKey.textContent = `Won!`
                resp.fb = 'won'
            } else {
                opt_str = (this.opt.gam_1 < this.opt.gam_2) ? 'gam_1':'gam_2';
                fb_box.style.backgroundColor = '#db9a86'
                fb_textKey.textContent = `Lost!`
                resp.fb = 'lost'
            }

        } else {
            resp.type = 'fixed'
            // safe side is pressed
            opt_str = 'fixed'
            fb_box.style.backgroundColor = '#ded8ca'
            fb_textKey.textContent = `Safe Option`
        }
        resp.pt = this.opt[opt_str]
        fb_textSup.innerHTML = `<b>${(this.opt[opt_str] < 0) ? '-' : '+'} ${Math.abs(this.opt[opt_str])}</b> points`

        // animate the background + feedback box
        sel_box.animate(sel_ani,sel_ani_opt).finished.then((x) => {
            document.getElementById('veil').animate(
                [
                    {backdropFilter: 'none',webkitBackdropFilter: 'none'},
                    {backdropFilter: 'blur(30px)',webkitBackdropFilter: 'blur(30px)'}
                ],
                {duration:600,iterations: 1,delay:500,fill: 'forwards'}
            )
            fb_box.animate(
                [{opacity: '0%'},{opacity: '100%'}],
                {duration:700,iterations: 1,delay:600,fill: 'forwards'}
            ).finished.then((x) => {
                jsPsych.pluginAPI.setTimeout(EndTrial.bind(resp), 1000);
            })

        })
    } else {
        // no response
        resp.key = 'na'
        resp.keySelect = 'na'
        resp.type = 'no-resp'
        fb_box.style.backgroundColor = '#d1d1d1'
        fb_textKey.textContent = 'No Response'
        document.getElementById('veil').animate(
            [
                {backdropFilter: 'none',webkitBackdropFilter: 'none'},
                {backdropFilter: 'blur(30px)',webkitBackdropFilter: 'blur(30px)'}
            ],
            {duration:600,iterations: 1,delay:0,fill: 'forwards'}
        )
        fb_box.animate(
            [{opacity: '0%'},{opacity: '100%'}],
            {duration:700,iterations: 1,delay:100,fill: 'forwards'}
        ).finished.then((x) => {
            jsPsych.pluginAPI.setTimeout(EndTrial.bind(resp), 500);
        })
    }

}

function RPE_engine() {
    // use this to generate reinforcing RPE:

    // calculate expected value currently:
    let dt = [{pt:5,type:'gamble'},{pt:2, type:'gamble'}];

}


function EndTrial() {
    console.log(this)
    const dt = this;
    if (this.key != 'na') {
        document.getElementById('temp_remove').remove()
    }
    let fixcross = document.getElementById('fixcross')
    if (fixcross) {

    } else {
        fixcross = document.createElement('h1')
        fixcross.textContent = '+'
        fixcross.style.fontSize = '5vw'
    }

    document.getElementById('veil').animate([
            {backdropFilter: 'blur(30px)',webkitBackdropFilter: 'blur(30px)'},
            {backdropFilter: 'blur(50px)',webkitBackdropFilter: 'blur(50px)'}
        ],
        {duration:400,iterations: 1,delay:0,fill: 'forwards'})
    const fb_box_ani = document.getElementById('fb_box').animate(
        [
            {opacity: '100%'},
            {opacity: '0%'},
        ],
        {duration:400,iterations: 1,delay:0,fill: 'forwards'}
    )

    document.getElementById('cross').animate(
        [
            {opacity: '0%'},
            {opacity: '100%'},
        ],
        {duration:400,iterations: 1,delay:0,fill: 'forwards'}
    ).finished.then(()=>{
        function da() {
            jsPsych.finishTrial(this)
        }
        jsPsych.pluginAPI.setTimeout(da.bind(dt), this.iti);
    })

}
