function instBtClick(e) {
    let taskName = String(e.target.id).substring(0,String(e.target.id).indexOf('@'))
    console.log(taskName)
    // first flip the instruction
    const msgBox = document.getElementById('msgBox')
    reset_animation('msgBox')
    document.getElementById('infoButton').setAttribute('iH',
        'Read instruction then start the practice trials.')
    instMsgBox(undefined,'msgBox')
    document.getElementById('instructionRow').style.display = 'none'
    msgBox.innerHTML = instMsgBox(taskName,'msgBox')
    msgBox.style.height  = '80%'
    msgBox.style.animationPlayState = 'ongoing'
    msgBox.style.marginTop = '0'

    const pracButton = document.createElement('button')
    pracButton.textContent = 'Start Practice'
    pracButton.id = 'pracButton'
    pracButton.style.position = 'absolute'
    pracButton.addEventListener('click',() => {
        setPractice(taskName)
    })

    document.getElementById('wrap').appendChild(pracButton)
    pracButton.style.right = '45%'
    reset_animation('pracButton')
    pracButton.style.animationPlayState = 'running'
    pracButton.click()
}

async function setPractice(taskName) {
    let timeline = [];
    if (!document.getElementById('display_element')) {
        const jsPsychDE = document.createElement('div')
        jsPsychDE.className = 'jsPsychDE'
        jsPsychDE.id = 'display_element'
        document.body.appendChild(jsPsychDE)
    }
    let [jsPsych,taskProcedure] = await getPracticeProcedure(taskName)
    console.log(taskProcedure)
    jsPsych.run([taskProcedure]);
}

function removeReturn() {
    instView[this] = 1
    console.log(instView)
    document.getElementById(this+'@Button').setAttribute('visited', 'yes')
    document.getElementById('display_element').remove()
    const msgBox = document.getElementById('msgBox')
    reset_animation('msgBox')
    document.getElementById('infoButton').setAttribute('iH',
        'We are now back to do more instructions & practice.')
    msgBox.innerHTML = instMsgBox('init','msgBox')
    document.getElementById('instructionRow').style.display = 'flex'
    msgBox.style.height  = '60%'
    msgBox.style.animationPlayState = 'ongoing'
    msgBox.style.marginTop = '0'
    document.getElementById('pracButton').remove()

    document.getElementById(this+'@Button').className = 'completedButton'
    document.getElementById(this+'@Button').offsetWidth;
    if (Object.values(instView).reduce( (a, b) => a + b,0) === Object.values(instView).length) {
        console.log('works')
        document.getElementById('finishButton').style.display = 'inline'
    }
}

async function getPracticeProcedure(taskName) {
    let jsPsych = initJsPsych({
        override_safe_mode: true,
        display_element: 'display_element',
        on_finish: removeReturn.bind(taskName),
    });
    let taskProcedure;
    const MazeInfo = await getMazeConfig()
    switch (taskName) {
        case 'Gamble':
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychGamble,
                        whichSide: jsPsych.timelineVariable('whichSide'),
                        switch: jsPsych.timelineVariable('switch'),
                        win: jsPsych.timelineVariable('win'),
                        opt: jsPsych.timelineVariable('opt'),
                        iti: 0,
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                    }
                ],
                timeline_variables: [
                    { whichSide: 'left',switch: false, win: false, opt: {fixed: 0, gam_1: 5, gam_2: -1} ,ShowEmo: true},
                    { whichSide: 'right',switch: false, win: true, opt: {fixed: 4, gam_1: 5, gam_2: 3}, ShowEmo: false },
                    { whichSide: 'right',switch: true, win: true, opt: {fixed: -4, gam_1: 6, gam_2: -9}, ShowEmo: false },
                    { whichSide: 'left',switch: true, win: true, opt: {fixed: 2, gam_1: 3, gam_2: -8}, ShowEmo: true },
                ]
            }
            break;
        case 'Math':
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychMath,
                        whichSide: jsPsych.timelineVariable('whichSide'),
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                    }
                ],
                timeline_variables: [
                    { whichSide: 'left' ,ShowEmo: true},
                    { whichSide: 'right', ShowEmo: false },
                    { whichSide: 'left', ShowEmo: false },
                    { whichSide: 'right', ShowEmo: true },
                ]
            }
            break;
        case 'Gamble II':
            jsPsych.data.addProperties({pS: initPs(10,5)});
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychGamble,
                        whichSide: jsPsych.timelineVariable('whichSide'),
                        switch: jsPsych.timelineVariable('switch'),
                        win: jsPsych.timelineVariable('win'),
                        opt: jsPsych.timelineVariable('opt'),
                        iti: 0,
                    },
                    {
                        type: jsPsychShowRank,
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                    }
                ],
                timeline_variables: [
                    { whichSide: 'left',switch: false, win: false, opt: {fixed: 1, gam_1: 5, gam_2: -1} ,ShowEmo: true},
                    { whichSide: 'right',switch: false, win: true, opt: {fixed: 3, gam_1: 5, gam_2: 2}, ShowEmo: false },
                    { whichSide: 'right',switch: true, win: true, opt: {fixed: 0, gam_1: 2, gam_2: -1}, ShowEmo: false },
                    { whichSide: 'left',switch: true, win: true, opt: {fixed: 1, gam_1: 3, gam_2: -8}, ShowEmo: true },
                ]
            }
            break;
        case 'Math II':
            jsPsych.data.addProperties({pS: initPs(10,5)});
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychMath,
                        whichSide: jsPsych.timelineVariable('whichSide'),
                    },
                    {
                        type: jsPsychShowRank,
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                    }
                ],
                timeline_variables: [
                    { whichSide: 'left',ShowEmo: true},
                    { whichSide: 'right', ShowEmo: false },
                    { whichSide: 'left', ShowEmo: false },
                ]
            }
            break;
        case 'Trust':
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychTrust,
                        displayBio: jsPsych.timelineVariable('displayBio'),
                        share: jsPsych.timelineVariable('share'),
                        player: jsPsych.timelineVariable('player'),
                        pts: jsPsych.timelineVariable('pts'),
                        practice: true,
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                    }
                ],
                timeline_variables: [
                    // 18 trials for short and 63 for long;
                    // the Long session will be allowed for full contin,
                    // short session can only do worse and match; i.e. partner getting worse.
                    { displayBio: 1,share: true, player: 0, pts:10 ,ShowEmo: true},
                    { displayBio: 0,share: true, player: 1, pts:10 ,ShowEmo: false},
                    { displayBio: 0,share: false, player: 2, pts:10 ,ShowEmo: true},
                ]
            }
            break;
        case 'Maze':
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychMaze,
                        preset: jsPsych.timelineVariable('preset'),
                        init_pos:jsPsych.timelineVariable('init_pos'),
                        target_pos: jsPsych.timelineVariable('target_pos'),
                        num_move: jsPsych.timelineVariable('num_move'),
                        show_step: jsPsych.timelineVariable('num_move'),
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                    }
                ],
                timeline_variables: [
                    { preset: MazeInfo['15'][0],init_pos: [13,12], target_pos: [9,12], num_move:10, show_step:0 ,ShowEmo: false},
                    { preset: MazeInfo['10'][0],init_pos: [3,5], target_pos: [5,9], num_move:10, show_step:0 ,ShowEmo: false},

                    { preset: MazeInfo['25'][0],init_pos: [13,12], target_pos: [8,17], num_move:10, show_step:1 ,ShowEmo: true},
                ]
            }
            break;
    }
    return [jsPsych, taskProcedure]
}


// TO DO: make all of these into a json files for the cleanliness of the script, and more pipeline-y
function instMsgBox(whatMsg,msgBoxId) {
    const msgBox = document.getElementById(msgBoxId);
    if (!whatMsg) {
        // purge mode
        while (msgBox.firstChild) {
            msgBox.removeChild(msgBox.lastChild);
        }
    } else {

        switch (whatMsg) {
            case 'init':
                return `
                <h1>Welcome to our study.</h1>
                <p>In this experiment, you will listen to stories and play several computer games.</p>
                <p>You will also label your emotion after these activities. </p>
                <p>Before we start, we want you to familiarize yourself with the games you will play. </p>
                <p>Click on each of the buttons below to view the instructions for each game.</p>
                <p>If you like to have more practice on any particular game, you can return to them.</p>
                <p>You may only continue after all instructions are reviewed at least once.</p>
                <p>Completed ones will appear green.</p>
                `
            case 'Gamble':
                return `
                <h1>The Gamble Game - part I</h1>
                <p>In this game, your goal is to get as many points as possible. Two options will be presented in each instance: <strong>CERTAIN</strong> or <strong>GAMBLE</strong> </p>
                <p>With the <strong>CERTAIN</strong> option, you receive the outcome on display.</p>
                <p>With the <strong>GAMBLE</strong> option, you will have two outcomes on display, one outcome will yield higher points than the other. You will receive one of the two outcomes when you gamble. </p>
                <p>The gamble option is on the side with two outcomes stacked vertically, which could be on the right or left side. </p>
                <p>Press <strong>'F'</strong> key to choose the option on the left, and <strong>'J'</strong> key for the one on the right. </p>
                <p>You will have 5 seconds to make a decision. </p>
                <p>In some instances, you will choose one options but the game will instead confirm to the opposite.</p>
                `
            case 'Math':
                return `
                <h1>The Math Game - part I</h1>
                <p>You will be asked to answer whether a math equation on display is accurate.</p>
                <p>The math equations contain at most two numbers, each with up to two digits.</p>
                <p>The math operation between the two numbers can be either addition ('+'), subtraction ('-'), or
                multiplication ('x'). </p>
                <p>You will use your keyboard to choose between CORRECT and WRONG. </p>
                <p>The side on which the options are might change from instance to instance. </p>
                <p>Press <strong>'F'</strong> key to choose the option on the left, and <strong>'J'</strong> key for the one on the right. </p>
                `
            case 'Gamble II':
                return `
                <h1>Gamble Game - Part II</h1>
                <p>In the second part of the Gamble Game, the instructions are the same as the first part.</p>
                <p> Your goal is to get as many points as possible. Two options will be presented in each instance: <strong>CERTAIN</strong> or <strong>GAMBLE</strong>.</p>
                <p> Your performance data will be now compared to participants that have previously played this game.</p>
                <p>After each instance, you will now be informed about your current performance,
                ranked amongst <strong>10</strong> previous participants.</p>
                <p>Your performance score depends on your <strong>total earning, speed of responses, and
                gamble difficulty </strong>.</p>
                <p> Your performance in the Gamble Game I or in the Math Game does not impact your ranking in this game.</p>        
                `
            case 'Math II':
                return `
                <h1>Math Game - Part II</h1>
                <p>In the second part of the Math Game, the instructions are the same as the first part.</p>
                <p> You will be asked to answer whether a math equation on display is accurate.</p>
                <p> Your performance data will be now compared to participants that have previously played this game. </p>
                <p>After each instance, you will now be informed about your current performance,
                ranked amongst <strong>10</strong> previous participants.</p>
                <p>You might notice some discrepancy between your game earning and performance scores.</p>
                <p>That's because the game also takes how responsive you are and the difficulty of the math equations into account.</p>
                <p>Your performance in the previous Math Game session or in the Gamble Game does not impact your ranking in this game.</p>      `
            case 'Trust':
                return `
                <h1>The Trust Game</h1>
                <p> You will play with participants who have pre-recorded their responses.</p>
                <p>Your partners in this game were asked to briefly describe themselves and tell a life story
                that best represents them as a person. You will have to read these stories before you start to play the game by clicking on the names of the different partners.</p>
                <p>You will be playing with one person at a time. Each partner will have an assigned color.</p>
                <p>During the game, you will have two choices: <strong>SHARE</strong> or <strong>KEEP</strong>.
                Those are the same choices your partner was offered. </p>
                <p>If you both choose to <strong>SHARE</strong> then your points merge,
                double and split evenly between you and your partner, such that the points increase for you and your partner.
                In the case that you choose to <strong>SHARE</strong>, but your partner doesn't, then you will get no points.
                If you choose to <strong>KEEP</strong>, you will keep your points regardless of your partner's decision.</p>
                <p>Regardless of your decision, you will learn about your partner's decision.</p>
                <p>You will provide your response with the 'F' (<strong>SHARE</strong>) and 'J' (<strong>KEEP</strong>) keys. </p>
                `
            case 'Maze':
                return `
                <h1>The Maze Game </h1>
                <p> You will be placed in a maze.</p>
                <p>You can use directional arrow keys, OR 'A', 'W', 'D', 'S' keys to navigate.</p>
                <p>Your goal is to reach a gift box that is randomly placed in the maze. </p>
                <p>There is a set number of moves you MUST make in each instance. </p>
                <p>You will be asked to make those moves altogether.
                You will not see the movements of your character until all moves have been made.</p>
                <p>You will be rewarded with a large sum of points if you <strong>LAND</strong> on the gift box
                but not if you pass over it.</p>
                <p>Base points will also be given for making movements without hitting walls.</p>
                `
        }
    }

}

