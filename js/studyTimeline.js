function getTimeline(tlType,tlNum,MazeInfo) {

    let taskProcedure;
    let tlvb;
    let jsPsych = initJsPsych({
        override_safe_mode: true,
        display_element: 'display_element',
        MazeInfo: MazeInfo,
        on_finish: () => {
            document.getElementById('display_element').style.display = 'none'
            if (tlNum+1 <= 3) {
                setUpSession(tlType,tlNum+1)
            } else {
                alert('ALL DONE!')
            }

        }
    });
    if (tlType === 'Balanced') {
        tlvb = [
            'SetUp@15','Story@1','Cali@2','Story@2', // 2 stories with calibration in between
            'Break@5','Cali@2', // break & calibration
            'TaskSet1',    // Task Set
            'Cali@2','Story@3','Cali@2','Story@4',
            'Break@5','Cali@2', // break & calibration,
            'TaskSet2',
        ]
    } else {
        tlvb = [
            'SetUp@15','Story@1','Cali@2','Story@2', // 2 stories with calibration in between
            'Break@3','Cali@2', // break & calibration
            'TaskSet1', // Task Set
            'Cali@2','Story@3','Cali@2','Story@4',
            'Break@3','Cali@2', // break & calibration,
            'TaskSet2',
            'Cali@2','Story@5','Cali@2','Story@6',
        ]
    }
    taskProcedure = [];
    for (let tlInfo of tlvb) {
        taskProcedure.push(getTimelineComponent(tlInfo, tlNum, tlType,jsPsych))
    }
    return [jsPsych, taskProcedure]

}
function getTimelineComponent(tlInfo, tlNum, tlType,jsPsych) {
    let [tlComp, tlVb] = tlInfo.split('@')
    let tlx;
    switch (tlComp) {
        case 'SetUp':
            tlx = {
                type: jsPsychInfo,
                countDown: parseInt(tlVb)*60,
                majorMsg: 'We are setting up the MEG Machine for you.',
                postMajor: 'Done! The study will begin now.',
                minorMsg: 'This should take about 15 minutes.',
                audio: '',
            }
            break;
        case 'Cali':
            tlx = {
                type: jsPsychInfo,
                countDown: parseInt(tlVb)*60,
                majorMsg: 'Placeholder: Calibration',
                postMajor: 'Done! The study will continue now. The next task will start after key press.',
                minorMsg: 'This is a placeholder for calibration. ',
                audio: '',
            }
            break;
        case 'Break':
            tlx = {
                type: jsPsychInfo,
                countDown: parseInt(tlVb)*60,
                majorMsg: 'A quick 5 minutes break!',
                postMajor: 'Break is over, time to continue the study!',
                minorMsg: 'Feel free to move around. When the timer hits 0. The study will continue.',
                audio: '',
            }
            break;
        case 'Story':
            let storyInfo = getStoryInfo()

            stInfo = storyInfo[String(tlNum)][tlVb]
            tlx = {
                type: jsPsychInfo,
                countDown: 0,
                majorMsg: 'Story: '+ stInfo.pName,
                postMajor: 'Thank you for listening!',
                minorMsg: "Press 'space' or 'enter' to start listening, once started you will NOT be able to pause. " +
                    'We will add Jades assessment after this.',
                audio: 'audio/'+stInfo.name+'.wav',
                info: stInfo.info,
            }
            break;
        case 'TaskSet1':
            switch (String(tlNum)) {
                case '1':

                    tlx = pluginInfo('Math',tlType,jsPsych)

                    break;
                case '2':
                    tlx = pluginInfo('Gamble II',tlType,jsPsych)

                    break;
                case '3':
                    tlx=pluginInfo('Maze',tlType,jsPsych)
                    break;

            }
            break;
        case 'TaskSet2':
            switch (String(tlNum)) {
                case '1':
                    tlx=pluginInfo('Gamble',tlType,jsPsych)
                    break;
                case '2':
                    tlx=pluginInfo('Trust',tlType,jsPsych)
                    break;
                case '3':
                    tlx = pluginInfo('Math II',tlType,jsPsych)
                    break;
            }
            break;
    }
    return tlx
}

function getStoryInfo() {
    // The overall idea is that we will all start with a major sad story then reduce in intensity and move on to
    // a less intensely sad (sometimes just mixed feeling) one right before the first task.

    const tlStories = {
            '1': { // Math & Gamble
                '1': {name: 'adollshouse', pName: "A Doll's House",
                    info: "The theme is parental issues. The story tellers are not happy, and there's something to do with their parents. " +
                        "Both stories are filled with confusion and resentment. Both ending screams God Bless their therapists."},
                '2': {name: 'theclosetthatateeverything', pName: "The Closet That Ate Everything"},
                '3': {name: 'haveyoumethimyet', pName: "Have You Met Him Yet", info: 'The theme here is a satisfying journey to a happy ending.' +
                        'This pair of stories are delivered in a bright tone. ' +
                        'With spikes of very specific emotion through out the story, ' +
                        'they both reached a heart warming conclusion.'},
                '4': {name: 'adventuresinsayingyes', pName: "Adventures in Saying Yes"},
                '5': {name: 'legacy', pName: "Legacy", info: 'This pair of stories are tales of confidence, ' +
                        'a father to his daughter that shares same life struggle, and a young woman gaining confidence at a unexpected place.' +
                        'Both ends with a bright tone.'},
                '6': {name: 'naked', pName: "Naked"},
            },
            '2': { // Gam II & Trust
                '1': {name: 'itsabox', pName: "It's a Box", info: "There are no confusion on how we feel about these stories: dark and helpless. " +
                        "At the end, the story tellers both reached a point where they had made peace with the reality yet you can feel that they " +
                        "hurt no less."},
                '2': {name: 'undertheinfluence', pName: "Under the Influence"},
                '3': {name: 'hangtime', pName: "Hang Time", info: "A pair of wonderful stories.  While one took on a once a life time experience and another take on " +
                        " daily chores with a new outlook of life, both filled with optimism and excitement throughout the story. " +
                        "Both told by grown men but full of boy-ish wonder."},
                '4': {name: 'buck', pName: "Buck"},
                '5': {name: 'alternateithicatom', pName: "Alternate Ithica Tom", info: "The theme is probably best described as 'mid-life crisis'. " +
                        "The anchor sentiment is that curiosity, wondering the what ifs for the past. While one eventually made peace and realize that " +
                        "there's no perfect life choices, another embark on a new journey in life."},
                '6': {name: 'howtodraw', pName: "How to Draw"},
            },
            '3': { // Maze & Math II
                '1': {name: 'wheretheressmoke', pName: "Where There's Smoke", info: "Here we have two stories " +
                        "that deal with aftermaths. The trauma is there, the sadness is there but the story tellers are trying to move on." +
                        "Their solution might not be perfect but that's the best they can do."},
                '2': {name: 'sloth', pName: "Sloth"},
                '3': {name: 'tildeath', pName: "'Til Death'", info: "This pair of stories carry a hilarious undertone but deal with " +
                        "two quiet serious and life changing realizations."},
                '4': {name: 'souls', pName: "Souls"},
                '5': {name: 'thatthingonmyarm', pName: "That Thing on my Arm", info: "This is the 'self empowerment' stories. " +
                        "Two women faced death and disease but won the match. They grew stronger and used this experience to propel further."},
                '6': {name: 'inamoment', pName: "In a Moment"},
            },
        }
    return tlStories
}



function pluginInfo(taskName,tltype,jsPsych) {

    let taskProcedure;
    switch (taskName) {
        case 'Gamble':
            console.log(tltype)
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
                timeline_variables:
                    // 18 trials for short, 60 for long;

                    contingWrapGam(tltype==='Condensed'?18:60,[0.6],
                        ['better','worse','same'],0.1,3)

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
                    { whichSide: '' ,ShowEmo: true},
                    { whichSide: '', ShowEmo: false },
                    { whichSide: '', ShowEmo: false },
                ],
                repetitions: tltype==='Balanced'?10:30,
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
                timeline_variables: // 18 trials for short, 60 for long;
                    contingWrapGam(tltype==='Condensed'?15:50,[0.7],
                        ['better','worse','same'],0.1,3)
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
                    { whichSide: '' ,ShowEmo: true},
                    { whichSide: '', ShowEmo: false },
                    { whichSide: '', ShowEmo: false },
                ],
                repetitions: tltype==='Condensed'?7:24,
            }
            break;
        case 'Trust':
            let tlb;
            if (tltype === 'Condensed') {
                tlb = trustContin(18,['match','worse'],3)
            } else {
                tlb = trustContin(63,['match','worse','better'],3)
            }
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychTrust,
                        displayBio: jsPsych.timelineVariable('displayBio'),
                        share: jsPsych.timelineVariable('share'),
                        player: jsPsych.timelineVariable('player'),
                        pts: jsPsych.timelineVariable('pts'),
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                    }
                ],
                timeline_variables:tlb,
            }
            break;
        case 'Maze':
            const MazeInfo = jsPsych.getInitSettings().MazeInfo
            taskProcedure = {
                timeline: [
                    {
                        type: jsPsychMaze,
                        preset: jsPsych.timelineVariable('preset'),
                        init_pos:jsPsych.timelineVariable('init_pos'),
                        target_pos: jsPsych.timelineVariable('target_pos'),
                        num_move: jsPsych.timelineVariable('num_move'),
                        show_step: jsPsych.timelineVariable('show_step'),
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                    }
                ],
                timeline_variables: continMaze(tltype,MazeInfo,3),
            }
            break;
    }
    return taskProcedure
}


