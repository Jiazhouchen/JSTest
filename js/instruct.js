function instBtClick(e,complicated) {
    let taskName;
    if (e.target) {
        taskName = String(e.target.id).substring(0,String(e.target.id).indexOf('@'))
    } else {
        taskName = e
    }
    // first flip the instruction
    const msgBox = document.getElementById('msgBox')
    reset_animation('msgBox')
    let secondPage;
    let currentPage = instMsgBox(taskName, complicated)
    if (complicated===true) {
        if(taskName === 'Maze') {
            secondPage = fbMsgBox('fbMaze')
        } else {
            secondPage = fbMsgBox('fb')
        }
    } else {
        secondPage = fbMsgBox(taskName)
    }


    purgeChildren('msgBox')
    msgBox.innerHTML = currentPage
    msgBox.style.animationPlayState = 'ongoing'

    document.getElementById('msgLeft').firstElementChild.style.display = 'none'
    document.getElementById('msgRight').firstElementChild.style.display = 'flex'
    document.getElementById('msgRight').firstElementChild.style.animation = 'hasInfoMax 1s ease-in-out infinite'

    const pracButton = document.createElement('button')
    pracButton.textContent = 'Start Practice'
    pracButton.id = 'pracButton'
    pracButton.style.display = 'none';
    console.log('button',taskName)
    pracButton.addEventListener('click',(e) => {
        resetElement('msgRight')
        pracButton.remove()
        console.log('task',taskName)
        document.removeEventListener('keydown', moveWithKey)
        setPractice(taskName)
    })
    document.getElementById('instructionRow').appendChild(pracButton)
    document.addEventListener('keydown', moveWithKey)

    if (taskName === 'emoTrain') {
        let emotions = emotionLabels('GoEmo')
        let emoSize = [7,4]
        for (let c = 0; c < emoSize[1]; c++) {
            const rowEL = document.createElement('div')
            document.getElementById('buttonWrap').appendChild(rowEL)
            for (let r = 0; r < emoSize[0]; r++) {
                const emo = emotions[((r*emoSize[1]) + c)]
                const emoDiv = document.createElement('div')
                emoDiv.className = 'emoDivIP'
                emoDiv.id = `${r}, ${c}`
                const emoButton = document.createElement('button')
                emoButton.id = 'button-' + emo
                emoButton.innerText = capFirst(emo)
                //document.getElementById('buttonWrap').append(emoButton)
                emoDiv.appendChild(emoButton)
                rowEL.appendChild(emoDiv)

            }
        }

        secondPage = instMsgBox('emoTrain2Key')
        currentPage = document.getElementById('msgBox').innerHTML
    }

    if (taskName === 'emoRateInfo') {
        document.getElementById('msgLeft').firstElementChild.style.display = 'none'
        document.getElementById('msgRight').firstElementChild.style.display = 'none'
        pracButton.style.display = 'inline';
        pracButton.textContent = 'Start'
        pracButton.style.animationPlayState = 'running'

    } else {
        document.getElementById('msgRight').addEventListener('click',(e)=>{
            console.log(taskName)
            document.getElementById('msgRight').firstElementChild.style.animationPlayState = 'paused'
            purgeChildren('msgBox')
            resetElement('msgRight')
            document.getElementById('msgRight').firstElementChild.style.display = 'none'
            msgBox.innerHTML = secondPage
            msgBox.style.animationPlayState = 'ongoing'
            document.getElementById('msgLeft').firstElementChild.style.display = 'flex'
            pracButton.style.display = 'inline';
            pracButton.style.animationPlayState = 'running'

        })

        document.getElementById('msgLeft').addEventListener('click',()=>{
            purgeChildren('msgBox')
            resetElement('msgLeft')
            document.getElementById('msgLeft').firstElementChild.style.display = 'none'
            msgBox.innerHTML = currentPage
            msgBox.style.animationPlayState = 'ongoing'
            document.getElementById('msgRight').firstElementChild.style.display = 'flex'
        })
    }

}

function moveWithKey(e) {
    console.log('key!', e.key)
    if (e.key === 'ArrowRight') {
        document.getElementById('msgRight').click()
    } else if (e.key === 'ArrowLeft') {
        document.getElementById('msgLeft').click()
    }
}

function setPractice(taskName) {
    if (taskName === 'emoRateInfo') {
        removeReturn()
    } else {
        if (!document.getElementById('display_element')) {
            const jsPsychDE = document.createElement('div')
            jsPsychDE.className = 'jsPsychDE'
            jsPsychDE.id = 'display_element'
            document.body.appendChild(jsPsychDE)
        }
        document.getElementById('display_element').style.display='inline'
        console.log(taskName)
        runPracticeProcedure(taskName)
    }
}

function removeReturn(taskName, dt) {
    console.log(PROLIFIC_PID)
    console.log(collectionName)
    console.log(complicated)
    practiceCounter += 1
    if (dt) {
        let gdt = {};
        for (let i=0; i<dt.trials.length; i++) {
            gdt[String(i)] = dt.trials[i]
        }
        const fdt = {}
        fdt[`${taskName}Compeleted`] = performance.now()
        fdt[`${taskName}Practice`] = gdt
        db.collection(collectionName).doc(PROLIFIC_PID).update(fdt)
    }
    if (document.getElementById('display_element')) {
        document.getElementById('display_element').remove()
    }
    if (practiceCounter < listOfGames.length) {
        instBtClick(listOfGames[practiceCounter],complicated)
    } else {
        document.getElementById('msgLeft').firstElementChild.style.display = 'none'
        document.getElementById('msgRight').firstElementChild.style.display = 'none'

        const msgBox = document.getElementById('msgBox')
        reset_animation('msgBox')

        msgBox.innerHTML = instMsgBox('fin','msgBox')
        document.getElementById('instructionRow').style.display = 'flex'
        msgBox.style.animationPlayState = 'ongoing'

        const startButton = document.createElement('button')
        startButton.textContent = 'Start'
        startButton.id = 'startButton'
        startButton.addEventListener('click',() => {
            location.href = `main.html?PROLIFIC_PID=${PROLIFIC_PID}&collectionName=${collectionName}&complicated=${complicated}`
        })
        document.getElementById('instructionRow').appendChild(startButton)
        startButton.style.animationPlayState = 'running'
    }


}

function runPracticeProcedure(taskName) {
    let jsPsych = initJsPsych({
        override_safe_mode: true,
        display_element: 'display_element',
        on_finish: (dt) => {
            removeReturn(taskName,dt)
        },
    });

    let taskProcedure;

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
                        oldFb: jsPsych.timelineVariable('oldFb'),
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                        respType: 'key',
                    }
                ],
                timeline_variables: [
                    { whichSide: 'left',switch: false, win: false, opt: {fixed: 0, gam_1: 5, gam_2: -1} ,ShowEmo: true, oldFb: complicated},
                ]
            }
            jsPsych.run([taskProcedure])
            break;
        case 'Math':
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychMath,
                        whichSide: jsPsych.timelineVariable('whichSide'),
                        oldFb: jsPsych.timelineVariable('oldFb'),
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                        respType: 'key',
                    }
                ],
                timeline_variables: [
                    { whichSide: 'left' ,ShowEmo: true, oldFb: complicated},
                ]
            }
            jsPsych.run([taskProcedure])
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
                        respType: 'key',
                    }
                ],
                timeline_variables: [
                    { whichSide: 'left',switch: false, win: false, opt: {fixed: 1, gam_1: 5, gam_2: -1} ,ShowEmo: true},
                    { whichSide: 'right',switch: false, win: true, opt: {fixed: 3, gam_1: 5, gam_2: 2}, ShowEmo: true },
                    { whichSide: 'right',switch: true, win: true, opt: {fixed: 0, gam_1: 2, gam_2: -1}, ShowEmo: true },
                    { whichSide: 'left',switch: true, win: true, opt: {fixed: 1, gam_1: 3, gam_2: -8}, ShowEmo: true },
                ]
            }
            jsPsych.run([taskProcedure])
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
                        respType: 'key',
                    }
                ],
                timeline_variables: [
                    { whichSide: 'left',ShowEmo: true},
                    { whichSide: 'left', ShowEmo: true },
                    { whichSide: 'left', ShowEmo: true },
                ]
            }
            jsPsych.run([taskProcedure])
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
                        oldFb: jsPsych.timelineVariable('oldFb'),
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                        respType: 'key',
                    }
                ],
                timeline_variables: [
                    // 18 trials for short and 63 for long;
                    // the Long session will be allowed for full contin,
                    // short session can only do worse and match; i.e. partner getting worse.
                    { displayBio: 0,share: true, pts:5, player: 0,ShowEmo: true, oldFb: complicated},
                    { displayBio: 0,share: false, pts:5,player: 2, ShowEmo: true, oldFb: complicated},
                ]
            }
            jsPsych.run([taskProcedure])
            break;
        case 'Maze':
            getMazeConfig().then((MazeInfo) => {
                taskProcedure = {
                    timeline: [
                        {
                            type: jsPsychMaze,
                            preset: jsPsych.timelineVariable('preset'),
                            show_step: jsPsych.timelineVariable('num_move'),
                            timeLimit: jsPsych.timelineVariable('timeLimit'),
                            oldFb: jsPsych.timelineVariable('oldFb'),
                        },
                        {
                            type: jsPsychRateEmotion,
                            ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                            emotion: "GoEmo",
                            respType: 'key',
                        }
                    ],
                    timeline_variables: [
                        { preset: MazeInfo['15'][0], timeLimit:7500, show_step:0 ,ShowEmo: true, oldFb: complicated},
                    ]
                }
                jsPsych.run([taskProcedure])
            })
            break;
        case 'emoTrain':
            let emotions = emotionLabels('GoEmo');
            let newEmoOrder = [];
            let threeCount = 0;
            while (emotions.length !== 0) {
                emotions = shuffle(emotions);
                let sLen
                if (threeCount >= 5) {
                    sLen = 2
                } else {
                    sLen = Math.random() > 0.5 ? 2:3;
                }
                if (sLen === 3 ) {
                    threeCount++;
                }
                newEmoOrder.push({practiceClick: emotions.slice(0,sLen)})
                emotions.splice(0,sLen)
            }
            newEmoOrder.push({practiceClick:'',})
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: true,
                        respType: 'key',
                        practiceClick: jsPsych.timelineVariable('practiceClick'),
                        emotion: "GoEmo",
                    }
                ],
                timeline_variables: newEmoOrder
            }
            jsPsych.run([taskProcedure])
            break;
    }

}



// TO DO: make all of these into a json files for the cleanliness of the script, and more pipeline-y

function fbMsgBox(task) {
    switch (task) {
        case 'Gamble':
            return  `
                <h1>Gamble Task - Feedback </h1>
                <p>After you make a response, you will receive feedback. </p>
                <p>You will see four different types of feedback <strong style="color: #acdb86">Win</strong>, <strong style="color: #db9a86">Lose</strong> or <strong style="color: #ada89c">Safe</strong>.</p>
                <p>Below are examples of all possible outcomes.</p>
                <div style="display: flex; flex-direction: row; justify-content: space-around; padding: 1% 0% 1% 0%; width: 80%; margin: auto;">
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #acdb86; border-color: #8fb570">
                                <p style="color: #506143">✔</p>
                            </div>
                        </div>     
                        <span>You gambled and won.</span>
                        <span>Earn the highest possible points.</span>
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #db9a86; border-color: #b07d6d">
                                <p style="color: #614840">✖</p>
                            </div>
                            
                        </div>     
                        <span>You gambled but lost.</span>
                        <span>Lose points or earn less points.</span>
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #ded8ca; border-color: #ada89c">
                                <p style="color: #59564f">◎</p>
                            </div>
                            
                        </div>     
                        <span>You played safe.</span>
                        <span>Earn safe option points.</span>
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: black; border-color: #8f8f8f; color: white">
                                <p style="color: #b0b0b0">--</p>
                            </div>
                        </div>     
                        <span>No response in 4 seconds</span> 
                        <span> </span>
                        <span>Lose 10 point</span>
                    </div>
                </div>
                `
        case 'Trust':
            return  `
                <h1>Trust Task - Feedback </h1>
                <p>After you make a response, you will receive feedback. </p>
                <p>You will see four different types of feedback <strong style="color: #acdb86">You Share - Your partner Share</strong>, <strong style="color: #db9a86">You Share - Your Partner Keep</strong> or <strong style="color: #ada89c">You Keep - Your Partner Share/Keep</strong>.</p>
                <p>Below are examples of all possible outcomes.</p>
                <div style="display: flex; flex-direction: row; justify-content: space-around; padding: 1% 0% 1% 0%; width: 80%; margin: auto;">
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #acdb86; border-color: #8fb570">
                                <p style="color: #506143">✔</p>
                            </div>
                        </div>     
                        <span>You shared and your partner shared</span>
                        <span>Earn double the points</span>
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #db9a86; border-color: #b07d6d">
                                <p style="color: #614840">✖</p>
                            </div>
                            
                        </div>     
                        <span>You shared but your partner did not share</span> 
                        <span>Earn ZERO point</span> 
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #ded8ca; border-color: #ada89c">
                                <p style="color: #59564f">◎</p>
                            </div>
                            
                        </div>     
                        <span>You kept and regardless of your partner's choice</span> 
                        <span>Earn base points</span> 
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: black; border-color: #8f8f8f; color: white">
                                <p style="color: #b0b0b0">--</p>
                            </div>
                        </div>     
                        <span>No response in 4 seconds</span> 
                        <span> </span>
                        <span> </span>
                        <span>Lose 10 point</span>
                    </div>
                </div>
                `
        case 'Math':
            return  `
                <h1>Math Task - Feedback </h1>
                <p>After you make a response, you will receive feedback. </p>
                <p>You will see three different types of feedback <strong style="color: #acdb86">Correct</strong> or <strong style="color: #db9a86">Incorrect</strong>.</p>
                <p>Below are examples of all possible outcomes.</p>
                <div style="display: flex; flex-direction: row; justify-content: space-around; padding: 1% 0% 1% 0%; width: 80%; margin: auto;">
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #acdb86; border-color: #8fb570">
                                <p style="color: #506143">✔</p>
                            </div>
                        </div>     
                        <span>Your response was correct.</span>
                        <span>Earn points</span>
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #db9a86; border-color: #b07d6d">
                                <p style="color: #614840">✖</p>
                            </div>
                            
                        </div>     
                        <span>Your response was incorrect.</span> 
                        <span>Lose point</span> 
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: black; border-color: #8f8f8f; color: white">
                                <p style="color: #b0b0b0">--</p>
                            </div>
                        </div>     
                        <span>No response in 4 seconds</span> 
                        <span> </span>
                        <span>Lose 10 point</span>
                    </div>
                </div>
                `
        case 'Maze':
            return  `
                <h1>Maze Task - Feedback </h1>
                <p>After you make a response, you will receive feedback. </p>
                <p>You will see three different types of feedback <strong style="color: #acdb86">ARRIVED AT GIFT</strong> or <strong style="color: #db9a86">DID NOT ARRIVE AT GIFT</strong>.</p>
                <p>Below are examples of all possible outcomes.</p>
                <div style="display: flex; flex-direction: row; justify-content: space-around; padding: 1% 0% 1% 0%; width: 80%; margin: auto;">
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #acdb86; border-color: #8fb570">
                                <p style="color: #506143">✔</p>
                            </div>
                        </div>     
                        <span>You have landed at the gift.</span>
                        <span>Earn points</span>
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #db9a86; border-color: #b07d6d">
                                <p style="color: #614840">✖</p>
                            </div>
                            
                        </div>     
                        <span>You did not land at the gift.</span> 
                        <span>Lose point</span> 
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: black; border-color: #8f8f8f; color: white">
                                <p style="color: #b0b0b0">--</p>
                            </div>
                        </div>     
                        <span>No response at all.</span> 
                        <span> </span>
                        <span>Lose 10 point</span>
                    </div>
                </div>
                `
        case 'fb':
            return `
                <h1>Feedback </h1>
                <p>After you make a response, you will receive feedback. </p>
                <p>You will see four different types of feedback <strong style="color: #acdb86">Win</strong>, <strong style="color: #db9a86">Lose</strong>, <strong style="color: #ada89c">No change in points</strong> or <strong>No response</strong>.</p>
                <p>The top colored box indicates your actual earning. </p> 
                <p>The bottom grey box indicates what you would have gotten if you had made a different choice. </p>
                <p>Below are examples of all possible outcomes.</p>
                <div style="display: flex; flex-direction: row; justify-content: space-around; padding: 1% 0% 1% 0%; width: 80%; margin: auto;">
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #acdb86; border-color: #8fb570">
                                <p>5</p>
                            </div>
                            <div class='fbNum' style="background-color: #dbdbdb; border-color: transparent;">
                                <p>-1</p>
                            </div>
                        </div>     
                        <span>You earn 5 points, would have lost 1 point.</span> 
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #db9a86; border-color: #b07d6d">
                                <p>-4</p>
                            </div>
                            <div class='fbNum' style="background-color: #dbdbdb; border-color: transparent;">
                                <p>3</p>
                            </div>
                        </div>     
                        <span>You lose -4 points, would have earned 3 points.</span> 
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #ded8ca; border-color: #ada89c">
                                <p>0</p>
                            </div>
                            <div class='fbNum' style="background-color: #dbdbdb; border-color: transparent;">
                                <p>2</p>
                            </div>
                        </div>     
                        <span>No change in points, would have earned 2 points.</span> 
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: black; border-color: #8f8f8f; color: white">
                                <p>-10</p>
                            </div>
                            <div class='fbNum' style="background-color: #dbdbdb; border-color: transparent;">
                                <p>4</p>
                            </div>
                        </div>     
                        <span>No response, lose 10 points, could earn 10 points.</span> 
                    </div>
                </div>
                
                
               
                `
        case 'fbMaze':
            return `
                <h1>Feedback </h1>
                <p>After you make a response, you will receive feedback. </p>
                <p>You will see four different types of feedback<strong style="color: #acdb86">Win</strong>, <strong style="color: #db9a86">Lose</strong>, <strong style="color: #ada89c">No change in points</strong> or <strong>No response</strong>.</p>
                <p>The top colored box indicates your actual earning. </p> 
                <p>The bottom grey box indicates what you would have gotten if you had made a different choice. </p>
                <p>In this task, if you decided to move toward the gift box, the alternative choice is if you had stayed away from it, and vice versa. </p>
                <p>Below are examples of all possible outcomes.</p>
                <div style="display: flex; flex-direction: row; justify-content: space-around; padding: 1% 0% 1% 0%; width: 80%; margin: auto;">
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #acdb86; border-color: #8fb570">
                                <p>5</p>
                            </div>
                            <div class='fbNum' style="background-color: #dbdbdb; border-color: transparent;">
                                <p>-1</p>
                            </div>
                        </div>     
                        <span>You earned 5 points, would have lost 1 point.</span> 
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #db9a86; border-color: #b07d6d">
                                <p>-4</p>
                            </div>
                            <div class='fbNum' style="background-color: #dbdbdb; border-color: transparent;">
                                <p>3</p>
                            </div>
                        </div>     
                        <span>You lost -4 points, would have earned 3 points.</span> 
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: #ded8ca; border-color: #ada89c">
                                <p>0</p>
                            </div>
                            <div class='fbNum' style="background-color: #dbdbdb; border-color: transparent;">
                                <p>2</p>
                            </div>
                        </div>     
                        <span>No change in points, would have earned 2 points.</span> 
                    </div>
                    <div class = 'fbWrap'">
                        <div class="fb" style="margin: auto;  opacity: 100%; line-height: 3rem;">
                            <div class='fbNum' style="background-color: black; border-color: #8f8f8f; color: white">
                                <p>-10</p>
                            </div>
                            <div class='fbNum' style="background-color: #dbdbdb; border-color: transparent;">
                                <p>4</p>
                            </div>
                        </div>     
                        <span>No response, lost 10 points, could earn 4 points.</span> 
                    </div>
                </div>
                
               
                `

    }
}

function instMsgBox(whatMsg, ifTwist) {

    switch (whatMsg) {
        case 'init':
            return `
                <h1>Welcome!</h1>
                <p>In this experiment, we want to understand what kinds of emotions four different games evoke.</p>
                <p>In each game, you will be able to earn points. Try to earn as many points as possible. </p>
                <hr>
                <p>We first show you how to report the emotions you experience during the games, and then we'll show you the games. </p>
               <hr>
               
                `
        case 'Gamble':
            let out = `
                <h1>The Gamble Game</h1>
                <p>In this game, you will have to make a choice:  </p>
                <div class="wrap gamWrap">
                    <div style="width: 20%; display: flex; flex-direction: column;justify-content: space-around">
                        <div class="gamInstOpt">5</div>
                        <div class="gamInstOpt">-2</div>
                    </div>
                    <div style="width: 20%; display: flex; flex-direction: column;justify-content: space-around">
                        <div class="gamInstOpt">0</div>
                    </div>
                </div>
                <p>Press <strong>'LEFT arrow'</strong> key to choose the left option, and the <strong>'RIGHT arrow'</strong> to choose the right option. </p>
                <p>If you choose the option with <strong>TWO</strong> numbers (here on the left), you will randomly get one of those two numbers as your points. </p>
                <p>If you choose the option with <strong>ONE</strong> number (here on the right), you will get the number of points as indicated.</p>
                <p>Your goal is to get as many points as possible.</p>
				<p>You have <strong>4 seconds</strong> to respond. </p>
                
                `
            if (ifTwist) {
                out = out + `
                <p>Sometimes, the computer is programmed to alter your choice. </p> 
                <p>On these trials, you will see the selection box move across from your choice to the other option. </p>                `
            }
            return out
        case 'Math':
            return `
                <h1>The Math Game</h1>
                <p>In this game, we will show you equations, like this:</p>
                <div style='
                    font-family: "Rubik", sans-serif;
                    font-size: 5rem;
                    flex: 0 1;
                    font-weight: bold;
                    align-items: flex-start;
                    padding: 0;
                    max-height: fit-content;
                '>
                    21 + 23 = 44
                </div>
                <p>Your aim is to tell us whether the equation is <strong>TRUE</strong> or <strong>FALSE</strong></p>
                <p>Press <strong>'LEFT arrow'</strong> key to indicate TRUE, and <strong>'RIGHT arrow'</strong> key for FALSE. </p>
                <p>You will get more points if you get harder questions right, and lose more points if you get easier questions wrong.</p>
                <p>You have <strong>4 seconds</strong> to respond. </p>
                `

        case 'Trust':
            return `
                <h1>The Trust Game</h1>
                <p>In this game, you will need to decide whether to trust a partner or not.</p>
                <p>On each trial, you and your partner will both be offered the same initial points. </p>
				<p>Each of you then chooses to either SHARE or KEEP.</p>
                <p>If you KEEP, you get the initial points no matter what your partner decides to do. </p>
				<p>If you SHARE, then your reward will depend on your partner's choice: </p>
				    <ul>
				    <li>If you BOTH share, you BOTH get DOUBLE the initial points.</li>
                    <li>If you share but your partner does not, then YOU get ZERO points. Your partner still gets the initial points.</li>
                    </ul>
                <p>You will play with three different partners. Some partners tend to share a lot, some share rarely. 
                 We will always tell you how much your current partner tends to share.</p>
                <p>Press <strong>'LEFT arrow'</strong> to SHARE, and <strong>'RIGHT arrow'</strong> to KEEP. </p>
                <p>You will have <strong>4 seconds</strong> to decide. </p>
                `
        case 'Maze':
            let outM =  `
                <h1>The Maze Game </h1>
                <p>On each round, you will be placed at the center of a maze, and your goal is to reach the gift box.</p>
                <div class="mzWrap"> 
                    <div class="mzContain">
                        <div class="mzElement" style="background-color: #c8e6d0">👤</div>
                        <p>You</p>
                    </div>
                    <div class="mzContain">
                        <div class="mzElement" style="background-color: gold; border: 1px solid lightgoldenrodyellow">🎁</div>
                        <p>Gift Box</p>
                    </div>
                    
		            
                </div>
                <p>Use the <strong>direction arrow</strong> keys to navigate.</p>
				<p>To make it more interesting, you will have to navigate 'blind'. </p>
				<p>That means that you will need to put in your response, but you will only see all your movements at the end. </p>
				<p>There is a time-limit, and the round ends when you reach the gift box, or when time is up. </p>
                <p>You will have more time with larger mazes and less with smaller ones.</p>
				<p>You earn a  bonus for reaching the gift box.</p>
                `
            if (ifTwist) {
                outM = outM + `
		<br>
                <p>Sometimes, the gift box has a skull inside.</p>
                <div class="mzWrap"> 
                    <div class="mzContain" style="justify-content: center">
                        <div class="mzElement" style="background-color: #5a4a78; border: 1px solid #341a63">💀</div>
                        <p>skull</p>
                    </div>
                </div>
                <p>In these cases, all is reversed: you loose points by getting to the skull and earn the most points by moving as far away from it as possible.</p>
                <p>Unfortunately, the gift box with bonus points and skulls look the same, so you won't know what kind of maze you are playing. You will have to guess.</p>
                `
            }
            return outM
        case 'emoRateInfo':
            return `
                <h1>Label Your Emotions</h1>
				<p>The overall aim of this experiment is to understand what emotions the various games elicit in you. </p>
				<p>After playing each game, we will repeatedly ask you to report how you feel in that very moment. </p>
                <p>We will show you a screen with a grid of different emotion labels, as one just interacted with.</p>
				<p>Please reflect very carefully on how you feel when prompted, and use your <strong>KEYBOARD</strong> to select those labels that best fit your current emotion state.</p>
				<p>The emotion labels are organized alphabetically. </p>
               
                `
		case 'emoTrain':
            return `
                <h1>Emotion Labeling</h1>
                <p>To find out about your emotions, we will show you a screen like one below:</p>
                <div id='buttonWrap' class='buttonRowIP'> 
					
				</div>
                <p>Please read through them carefully and remember roughly where each emotion is.</p>
                `
		case 'emoTrain2':
			return `
				<h1>Emotion Labeling Practice</h1>
				<p>To familiarize yourself with the full range of labels that are available, we ask you to do a practice first.</p>
                <p>We will show you two or three emotions on top. Please find each of them in the grid below, using your mouse to select them.</p>
                <p>Once all listed emotions have been selected, you will see the button to continue. </p>
				<p>Please try to get a good sense of what emotions labels are available and where they are in the grid. </p>
                <p>At the end of this practice, you will see what the labeling screen looks like. </p>
			`
        case 'emoTrain2Key':
            return `
				<h1>Emotion Labeling</h1>
				<p>You will use your <strong>KEYBOARD</strong> to make a response.</p>
				<p>A selection box will initialize on a random label, you will use <strong>UP, DOWN, LEFT, RIGHT</strong> arrow keys to move the selection box.</p>
				<p>Use <strong>SPACE BAR</strong> to select and deselect emotion labels.</p>
				<p>When you are done, use <strong>ENTER</strong> key to submit. You must select AT LEAST 1 emotion.</p>
				<br>
				<p>For you to familiarize with the full range of labels that are available, we ask you to do a little practice first.</p>
                <p>We will show you two or three emotions on top, and we would like you to find them in the grid below and select them.</p>
                <p>Once all listed emotions have been selected, you may continue by pressing the ENTER key. </p>
				<p>Please try to get a good sense of what emotions labels are available and where they are in the grid. </p>
                <p>At the end of this practice, you will see what the labeling screen looks like. </p>
			`
        case 'fin':
            return `
                <h1>Ready? </h1>
                <p>You have completed all the instructions and practice.</p>
                <p>If you missed out on some information and wish to revisit, use the buttons below.</p>
                <div class="instructionRow" style="margin: 0; flex: 0 1; width: unset">
                    <button style="animation-play-state: running" onclick="instBtClick('Math',${complicated})">Math</button>
                    <button style="animation-play-state: running" onclick="instBtClick('Gamble',${complicated})">Gamble</button>
                    <button style="animation-play-state: running" onclick="instBtClick('Trust',${complicated})">Trust</button>
                    <button style="animation-play-state: running" onclick="instBtClick('Maze',${complicated})">Maze</button>
                </div>
                <p>When you are ready, press the START STUDY button to continue.</p>
                `
    }


}

