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

function setPractice(taskName) {
    let timeline = [];
    if (!document.getElementById('display_element')) {
        const jsPsychDE = document.createElement('div')
        jsPsychDE.className = 'jsPsychDE'
        jsPsychDE.id = 'display_element'
        document.body.appendChild(jsPsychDE)
    }
    let [jsPsych,taskProcedure] = getProcedure(taskName)
    jsPsych.run([taskProcedure]);
}

function removeReturn() {

    instView[this] = 1
    console.log(instView)
    document.getElementById(this+'@Button').setAttribute('visited', 'yes')
    document.getElementById('display_element').remove()
    const msgBox = document.getElementById('msgBox')
    reset_animation('msgBox')
    document.getElementById('infoButton').setAttribute('iH','We are now back to do more instructions & practice.')
    msgBox.innerHTML = instMsgBox('init','msgBox')
    document.getElementById('instructionRow').style.display = 'flex'
    msgBox.style.height  = '60%'
    msgBox.style.animationPlayState = 'ongoing'
    msgBox.style.marginTop = '0'
    document.getElementById('pracButton').remove()

    document.getElementById(this+'@Button').className = 'completedButton'
    document.getElementById(this+'@Button').offsetWidth;
}

function getProcedure(taskName) {
    let jsPsych = initJsPsych({
        override_safe_mode: true,
        display_element: 'display_element',
        on_finish: removeReturn.bind(taskName),
    });
    let taskProcedure;
    switch (taskName) {
        case 'Gamble':
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychGamble,
                        which_side: jsPsych.timelineVariable('which_side'),
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
                    { which_side: 'left',switch: false, win: false, opt: {fixed: 0, gam_1: 5, gam_2: -1} ,ShowEmo: true},
                    { which_side: 'right',switch: false, win: true, opt: {fixed: 4, gam_1: 5, gam_2: 3}, ShowEmo: false },
                    { which_side: 'right',switch: true, win: true, opt: {fixed: -4, gam_1: 6, gam_2: -9}, ShowEmo: false },
                    { which_side: 'left',switch: true, win: true, opt: {fixed: 2, gam_1: 3, gam_2: -8}, ShowEmo: true },
                ]
            }
            break;
        case 'Math':
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychMath,
                        which_side: jsPsych.timelineVariable('which_side'),
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                    }
                ],
                timeline_variables: [
                    { which_side: 'left' ,ShowEmo: true},
                    { which_side: 'right', ShowEmo: false },
                ]
            }
            break;
        case 'Gamble II':
            jsPsych.data.addProperties({pS: initPs(10,5)});
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychGamble,
                        which_side: jsPsych.timelineVariable('which_side'),
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
                    { which_side: 'left',switch: false, win: false, opt: {fixed: 0, gam_1: 5, gam_2: -1} ,ShowEmo: true},
                    { which_side: 'right',switch: true, win: true, opt: {fixed: -4, gam_1: 6, gam_2: -9}, ShowEmo: true },
                ]
            }
            break;
        case 'Math II':
            jsPsych.data.addProperties({pS: initPs(10,5)});
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychMath,
                        which_side: jsPsych.timelineVariable('which_side'),
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
                    { which_side: 'left',switch: false, win: false, opt: {fixed: 0, gam_1: 5, gam_2: -1} ,ShowEmo: true},
                    { which_side: 'right',switch: true, win: true, opt: {fixed: -4, gam_1: 6, gam_2: -9}, ShowEmo: true },
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
                <p>Click on each of the bottoms below to view the instructions for each game.</p>
                <p>If you wish to review again, press any buttons for any instructions as many times as you wish.</p>
                <p>You may only continue after all instructions are viewed.</p>
                `
            case 'Gamble':
                return `
                <h1>The Gamble Game - part I</h1>
                <p>In each instance of this game, you will decide whether to gamble or not. </p>
                <p>When you gamble, you have a certain chance of winning the higher points. 
                If you lose the gamble, you might win less or even lose points.</p>
                <p>If you choose not to gamble, you are guaranteed to win the points. 
                Sometimes, you could lose points even in the not safe option.</p>
                <p>The side with two numbers stacked vertically is the gamble side. </p>
                <p>The gamble option sometimes will be on the left side and sometimes on the right side. </p>
                <p>Use the 'F' key to select option on the left and 'J' key for the option on the right. </p>
                <p>In each instance you will have 5 seconds to make a decision.</p>
                <p>In some instances, you will choose one options but the game will instead confirm to the opposite.</p>
                `
            case 'Math':
                return `
                <h1>The Math Game - part I</h1>
                <p>As the name suggests, you will be asked to answer whether a math equation on display is accurate.</p>
                <p>The math equations contains at most two numbers, each with up to two digits.</p>
                <p>The math operation between the two numbers can be either addition ('+'), subtraction ('-'), 
                multiplication ('x'). There will be no division. </p>
                <p>You will use your keyboard to make a response. </p>
                <p>Press <strong>'F'</strong> key to choose the button on the left, and <strong>'J'</strong> key for the right one. </p>
                <p>Sometimes 'Correct' button is on the left and sometimes right, please check before making a response.</p>
                `
            case 'Gamble II':
                return `
                <h1>Gamble Game - Part II</h1>
                <p>In the second part of the Gamble Game, while how you would play the game has not changed, 
                your performance data will be now compared to participants that had played this game previously.</p>
                <p>A quick recap on the Gamble Game, you will choose whether to gamble or be safe.</p>
                <p>After each instance, you will now be informed about your current performance, 
                ranked amongst <strong>10</strong> previous participants.</p>
                <p>Your performance score depends on your <strong>total earning, speed of responses, and 
                gamble difficulty </strong>.</p>
                <p>Your ranking resets for each game. That is, your performance in the Gamble Game I or in the Math Game would not impact your ranking here.</p>
                `
            case 'Math II':
                return `
                <h1>Math Game - Part II</h1>
                <p>In the second part of the Math Game, while how you would play the game has not changed, 
                your performance data will be now compared to all participants that had played this game.</p>
                <p>After each instance, you will now be informed about your current ranking amongst everyone.</p>
                <p>A quick recap on the Math Game, you will answer whether math equations are accurate.</p>
                <p>You might notice some discrepancy between your game earning and performance scores.</p>
                <p>That's because the game also taken how responsive you are 
                and the difficulty of the math equations into account.</p>
                <p>Your performance ranking is done separately for each game, even they are the same games.</p>
                <p>That is, your performance in the previous Math Game session or in the Gamble Game would not impact your ranking here.</p>
                `
            case 'Trust':
                return `
                <h1>The Trust Game</h1>
                <p>In this game, you will play with participants who have pre-recorded their responses.</p>
                <p>Your partners in this game were asked to briefly describe themselves and tell a life story
                that best represent them as a person. You will have a chance to read these stories before you start the game play.</p>
                <p>You will be playing with one person at a time. Each different partner will have a different color.</p>
                <p>During the game, you will have two choices: <strong>SHARE</strong> or <strong>KEEP</strong>. 
                Those are the same choices your partner were offered. </p>
                <p>If you both choose to <strong>SHARE</strong> then your points merge, 
                double and split evenly between you and your partner. 
                In the case that you choose to <strong>SHARE</strong>, but your partner don't, then you will get no points. 
                If you choose to <strong>KEEP</strong>, you will keep your points regardless of your partner's decision.</p>
                <p>Regardless of your decision, you will know what your partner's decision.</p>
                <p>You will provide your response with the 'F' (<strong>SHARE</strong>) and 'J' (<strong>KEEP</strong>) keys. </p>
                `
            case 'Maze':
                return `
                <h1>The Maze Game </h1>
                <p>During the maze game, you will be placed in a maze.</p>
                <p>You will use directional arrow keys, or 'A', 'W', 'D', 'S' keys to navigate.</p>
                <p>Your goal is to reach a gift box that is randomly placed in the maze. </p>
                <p>There is a set number of moves you must make in each instance. </p>
                <p>You will be asked to make those moves at altogether. 
                You will not see the movment of your character until all moves have been made.</p>
                <p>You will be rewarded with large sum of points if you <strong>LAND</strong> on the gift box 
                but not simply passing it.</p>
                <p>Base points will also be given for making movements without hitting walls.</p>
                `
        }
    }

}
