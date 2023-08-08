/*
 * Jiazhou Chen
 *
 * This plugin will run the gambling task with rank competition
 *
 *
 *
 */

jsPsychReddit = (function(jspsych) {

    const info = {
        name: 'compete',
        description: '',
        parameters: {
            read_bio: {
                type: jspsych.ParameterType.BOOL,
                default: true,
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

    class RedditPlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            window.onbeforeunload = function () {
                window.scrollTo(0, 0);
            }
            let trial_t = performance.now()
            trial.earning = 100;
            let html = init_reddit_story(trial)
            // replace RPE engine here to generate
            display_element.innerHTML = html
            console.log(init_time - trial_t)

            const sv = drawReddit(display_element,trial,r_eli5)


        }
    }
    RedditPlugin.info = info;

    return RedditPlugin;
})(jsPsychModule);
function init_reddit_story(trial) {
    let html = ''
    html += `
    <style>
    div {
        border: 0px solid #73AD21; 
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
        display: none; 
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
        height: 48vw;
        border-radius: 40px;
        background-color: #f2f1f0;
    }
    div.redditList {
        position: absolute;
        top: 0%;
        left: 13%;
        width: 70%;
        height: 100%;
        overflow-y: scroll;
        overflow-x: visible;
        padding-left: 2%;
        padding-right: 2%;
        margin-top: 0%;
    }
    .currencyBox {
        position: absolute;
        top: 0%;
        left: 0%;
        width: 15%;
        height: 20%;
    }
    .currencyBox h1 {
        text-align: left;
        padding-left: 10%; 
        font-size: 3vh;
    }
    .currencyBox p {
        text-align: left;
        color: indianred;
        font-size: 3vh;
        font-weight: bold;
        padding-left: 25%;
        line-height: 0;
        opacity: 0%;
    }
    .redditEntry {
        font-family: Arial,serif;
        position: relative;
        border-radius: 10px;
        background-color: #fafafa;
        margin-bottom: 20px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        overflow: hidden;
    }
    .redditEntry h1 {
        font-size: 20px;
        text-align: left;
        margin: 1.62% 2% 2% 2%;
    }
    .redditEntry .Tag{
        font-size: 10px;
        font-weight: bolder;
        color: white;
        width: max-content;
        float: left;
        min-width: 7%;
        margin-left: 2%;
        margin-right: 1%;
        margin-top: 2%;
        line-height: 20px;
        display: inline;
        border-radius: 40px;
        padding: 0 5px 0 5px;
    }
    .redditEntry p {
        display: block;
        position: relative;
        margin-left: 2%;
        margin-right: 2%;
        text-align: left;
    }
    .redditEntry .upvote{
        font-size: 15px;
        font-weight: bold;
        color: darkgreen;
    }
    div.Mask {
        position: absolute;
        top: 0%;
        left: 1%;
        width: 98%;
        height: 100%;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 10px;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19);
        font-size: 3vh;
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none;
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
        <div class = 'redditList' id = 'redditList'>
            <div style="height: 2%"></div>    
        </div>
        <div class = 'currencyBox' id = 'currencyBox'>
            <h1>${`🪙  `+String(trial.earning)}</h1>
            <p>-999</p>
        </div>
        <button id = 'done' onclick='done_next()'> DONE </button>
    </div>
    <div class = 'veil' id = 'veil'></div>    
    </body>
    `
    return html

}
function drawReddit(display_element, trial,rdf) {
    const rlist = rdf()
    let click_once = false;
    for (const ri of rlist) {
        const re = document.createElement('div')
        re.className = 'redditEntry'
        const re_tag = document.createElement('div')
        re_tag.className = 'Tag'
        re_tag.textContent = ri.tag
        re_tag.style.backgroundColor = cat2color(ri.tag)
        const re_h1 = document.createElement('h1')
        re_h1.textContent = ri.title

        const re_body = document.createElement('p')
        re_body.textContent = ri.explain
        const re_mask  = document.createElement('div')
        re_mask.className = 'Mask'
        re_mask.setAttribute('upvote',ri.upvote)
        re_mask.setAttribute('balance',trial.earning)
        re_mask.innerHTML = `🪙 <b>${String(cal_cost(ri.upvote))}</b>  to view`
        re_mask.onclick=mask_onclick

        const re_upvote = document.createElement('p')
        re_upvote.className = 'upvote'
        re_upvote.textContent = `⬆ ${ri.upvote<1000 ? ri.upvote:String(Math.round(ri.upvote/100)/10)+'K'}`

        re.appendChild(re_tag)
        re.appendChild(re_h1)
        re.appendChild(re_body)
        re.appendChild(re_mask)
        re.appendChild(re_upvote)
        document.getElementById('redditList').appendChild(re)
        re_mask.style.top = `${re_body.offsetTop-10}px`;
        re_mask.style.height = `${re_body.offsetHeight+20}px`;
        re_mask.style.lineHeight = `${re_body.offsetHeight+10}px`;
        addEventListener("resize", (event) => {
            re_mask.style.top = `${re_body.offsetTop-10}px`;
            re_mask.style.height = `${re_body.offsetHeight+20}px`;
            re_mask.style.lineHeight = `${re_body.offsetHeight+10}px`;
        });
    }

}

function r_eli5() {
    return rlist = [
        {
            tag : 'Biology',
            upvote: 20,
            title: 'Why do some medications say to not consume grapefruit while taking them?',
            explain: 'Some medications rely on the liver function to either make them active or to eliminate them from the body. ' +
            'Grapefruit can interfere with both processes which means either your dosage will be potentially too low to be effective because not enough of the drug has been activated or too high because not enough is being inactivated (eliminated).'+
            'Either case can be dangerous',
        },
        {
            tag: 'Economics',
            upvote: 4500,
            title: 'How does a country like North Korea seem to have endless money for its army and develop nuclear weapons despite being one of the most sanctionned country in the world?',
            explain: 'A key aspect of the NK Army is that most of their soldiers are working in state run industries like farming, manufacturing, ect.\n' +
                '\n' +
                'They are not training for war, which is expensive, but rather making money for the government. Imagine if the 101st airborne was deployed to planting rice in Louisiana most of the time instead of practicing air assault.'
        },
        {
            tag: 'Engineering',
            upvote: 46,
            title: 'Where does all the fire from a nuclear bomb come from?',
            explain: 'It is not a fireball ie a ball of hot gas created by combustion. It is a ball of hot gas created by a nuclear reaction.\n' +
                '\n' +
                'Both the material in the bomb and the air around it will be heated. Hot material emits visible light and that is what you see.\n' +
                '\n' +
                'Compare it to lighting. It is hot ionized air you see the glow and emit the light. It will rapidly cool own because the hot air is a thing and long with a large surface area compared to the volume. In a nuclear exposition, the volume is large compared to the surface area so it cools down a lot slower.'
        },
        {
            tag: 'Engineering',
            upvote: 4600,
            title: 'How are astronauts on the ISS so confident that they aren\'t going to collide with any debris, shrapnel or satellites whilst travelling through orbit at 28,000 kilometres per hour?',
            explain: 'Objects in this orbit (where the ISS is, around 410 km) decay rather quickly and thus this orbital altitude is a relatively clear of debris. The ISS is required to perform several orbit raising maneuvers per year to maintain the low orbit. There are still objects in higher eccentric orbits that cross the ISS orbit, but the risk of a collision from a human made object is significantly less.\n' +
                'Natural space debris… well you take your chances, but space is big, really really big.'

        }
    ]
}

function cat2color(cat) {
    if (cat === 'Biology') {
        return 'darkgreen'
    } else if (cat === 'Economics') {
        return 'navy'
    } else if (cat === 'Technology') {
        return 'darkgrey'
    } else if (cat === 'Engineering') {
        return '#c48443'
    } else {
        return Math.floor(Math.random()*16777215).toString(16);
    }
}

function cal_cost(upvote){
    let rcost = upvote
    rcost = rcost * 1 + 0 + ((rcost^2) * 1)
    if (rcost > 300) {
        rcost = 300
    } else if (rcost < 10) {
        rcost = 10
    }
    return rcost
}

function convertPXToVW(px) {
    return px * (100 / document.documentElement.clientWidth);
}

function mask_onclick(e) {
    const cost = cal_cost(e.target.getAttribute('upvote'))
    const balance = e.target.getAttribute('balance')
    // check for balance:
    if (cost <= balance) {
        const ani1 = {duration:500,iterations: 1,delay:0,fill: 'forwards'};
        const ani2 = {duration:500,iterations: 1,delay:200,fill: 'forwards'};
        for (el of document.getElementsByClassName('Mask')) {
            el.innerHTML = '<b>🔒</b>'
            el.onclick = ''
        }
        e.target.textContent = ''

        e.target.animate([
            {backdropFilter: 'blur(20px)',webkitBackdropFilter: 'blur(20px)'},
            {backdropFilter: 'blur(0px)',webkitBackdropFilter: 'blur(0px)'}
        ],ani1)
        const subtract = document.getElementById('currencyBox').childNodes[3]
        subtract.textContent = `- ${cost>99?'':' '}${cost}`
        const a1a = subtract.animate([
            {opacity: '0%'},
            {opacity: '100%'},
        ],ani1).finished
        a1a.then(()=>{
            subtract.animate([
                {opacity: '100%'},
                {opacity: '0%'}],ani2).finished.then(()=>{
                    document.getElementById('currencyBox').childNodes[1].textContent = `🪙  ${String(balance - cost)}`
                    document.getElementById('currencyBox').childNodes[1].animate([
                        {color: 'black'},
                        {color: 'indianred',offset: 0.2},
                        {color: 'indianred',offset: 0.7},
                        {color: 'black'}
                    ],{duration:800,iterations: 1,delay:0,fill: 'forwards'}).finished.then(()=>{
                        document.getElementById('done').style.display='block'
                    })
            })

        })
    } else {
        let cur_text = e.target.innerHTML;
        e.target.textContent = ''
        e.target.style.color = 'indianred'
        e.target.textContent = 'Insufficient Fund'
        setTimeout(function (){
            e.target.textContent = ''
            e.target.style.color = 'black'
            e.target.innerHTML = cur_text
        },600)
    }
}

function done_next() {
    console.log('done')
    jsPsych.finishTrial()
}