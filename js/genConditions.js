





function pad(x, pad_to, pad_with) {
    if (typeof x === 'number') {
        x = x.toString()
    }
    if (x.length < pad_to) {
        return pad_with.repeat( (pad_to - x.length) ) + x.toString()
    } else {
        return x.toString()
    }
}

function fixed_iti(iti,t) {
    return new Array(t).fill(iti);
}

function genBehavContin(jsPsych, MazeInfo) {
    jsPsych.data.addProperties({pS: initPs(10,5)});
    let procedure = [];
    for (let i=0; i < 6; i++) {
        for (let g1 in ['better','worse']) {
            procedure.push({
                // Gamble
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
                timeline_variables:contingWrapGam(1,[0.7],g1,0.1,1)
            })
        }
        for (let m1 in ['a','b']) {
            procedure.push({
                timeline: [
                    {
                        type: jsPsychMath,
                        whichSide: jsPsych.timelineVariable('whichSide'),
                    },
                    {
                        type: jsPsychRateEmotion,
                        ShowEmo: jsPsych.timelineVariable('ShowEmo'),
                        emotion: "GoEmo",
                    },
                ],
                timeline_variables: [
                    { whichSide: '' ,ShowEmo: true},
                ]
            })
        }
        for (let tr in ['better','worse']) {
            procedure.push({
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
                timeline_variables: trustContin(1,tr,1),
            })
        }
        for (let mz in ['15','20','30']) {
            procedure.push({
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
                timeline_variables: [sample(continMaze('Condensed',MazeInfo,1))],
            })
        }

    }

    return shuffle(procedure)

}


function fixedContingency(MazeInfo) {
    console.log(MazeInfo)
    let p1Seq = [
        // first patch
        {'type':'Maze','diff':'easy','twist':'false'},
        {'type':'Trust','diff':'hard','twist':'false'},
        {'type':'Gamble','diff':'easy','twist':'false'},
        {'type':'Math','diff':'hard','twist':'false'},
        {'type':'Gamble','diff':'hard','twist':'false'},
        {'type':'Math','diff':'easy','twist':'false'},
        {'type':'Maze','diff':'hard','twist':'false'},
        {'type':'Trust','diff':'easy','twist':'false'},
        // second patch;
        {'type':'Gamble','diff':'hard','twist':'false'},
        {'type':'Trust','diff':'easy','twist':'false'},
        {'type':'Maze','diff':'hard','twist':'false'},
        {'type':'Maze','diff':'easy','twist':'false'},
        {'type':'Math','diff':'hard','twist':'false'},
        {'type':'Trust','diff':'hard','twist':'false'},
        {'type':'Gamble','diff':'easy','twist':'false'},
        {'type':'Math','diff':'easy','twist':'false'},
        // third block;
        {'type':'Maze','diff':'hard','twist':'true'},
        {'type':'Gamble','diff':'hard','twist':'true'},
        {'type':'Maze','diff':'easy','twist':'true'},
        {'type':'Trust','diff':'hard','twist':'true'},
        {'type':'Gamble','diff':'easy','twist':'true'},
        {'type':'Math','diff':'hard','twist':'true'},
        {'type':'Trust','diff':'easy','twist':'true'},
        {'type':'Math','diff':'easy','twist':'true'},
        // Fourth block;
        {'type':'Maze','diff':'hard','twist':'true'},
        {'type':'Math','diff':'hard','twist':'true'},
        {'type':'Trust','diff':'easy','twist':'true'},
        {'type':'Maze','diff':'easy','twist':'true'},
        {'type':'Trust','diff':'hard','twist':'true'},
        {'type':'Math','diff':'easy','twist':'true'},
        {'type':'Gamble','diff':'easy','twist':'true'},
        {'type':'Gamble','diff':'hard','twist':'true'},
    ]
    let allProcedures = [];
    allProcedures.push({
        type: jsPsychRateEmotion,
        ShowEmo: true,
        emotion: "GoEmo",
        respType: 'key',
    })
    const MazeDiff = {'easy': [MazeInfo['20'][0], MazeInfo['20'][1], MazeInfo['20'][2], MazeInfo['20'][3]],
        'hard': [MazeInfo['20'][4], MazeInfo['20'][5], MazeInfo['20'][6], MazeInfo['20'][7]]}
    const GambleDiff = {
        'easy':[  // easy abs(EV - fixed) = 1.5 Gamble is always the preferred action
            {fixed: -1,gam_1: -3,gam_2: 4 ,},
            {fixed: 0,gam_1: -2,gam_2: 5 ,},
            {fixed: 1,gam_1: -1,gam_2: 6 ,},
            {fixed: 2,gam_1: 0,gam_2:  7,},
        ],
        'hard': [ // hard abs(EV - fixed) = 0.5 Gamble is always the preferred action
            {fixed: -1,gam_1: -3,gam_2: 2 ,},
            {fixed: 0,gam_1: -2,gam_2: 3 ,},
            {fixed: 1,gam_1: -1,gam_2: 4 ,},
            {fixed: 2,gam_1: 0,gam_2: 5,},
        ]}
    const TrustDiff = {'easy':[0], 'hard':[2]}

    let ProcedureIndex = {
        'Maze': {easy:0, hard: 0},
        'Gamble': {easy:0, hard: 0},
        'Trust': {easy:0, hard: 0},
        'Math': {easy:0, hard: 0},
    }

    for (let x of p1Seq) {
        let taskIns = {
            'type': '',
            'difficulty': x.diff,
            'twist': false,
        }
        switch (x.type) {
            case 'Maze':
                taskIns.type = jsPsychMaze
                taskIns.preset = MazeDiff[x.diff][ProcedureIndex[x.type][x.diff]]
                taskIns.reverse = false
                taskIns.timeLimit = 10000
                taskIns.limit = 'time'
                break;
            case 'Math':
                taskIns.type = jsPsychMath
                break;
            case 'Trust':

                taskIns.type = jsPsychTrust
                taskIns.displayBio =  0
                taskIns.player = x.diff==='easy'?0:1
                taskIns.pts = 5

                if (x.diff === 'easy') {
                    taskIns.share = Math.random() > 0.11
                } else {
                    taskIns.share = Math.random() > 0.55
                }

                break;
            case 'Gamble':
                taskIns.type = jsPsychGamble
                taskIns.whichSide= Math.random() > 0.5 ? 'left':'right'
                taskIns.win = Math.random() > 0.5
                taskIns.opt = GambleDiff[x.diff][ProcedureIndex[x.type][x.diff]]
                break;
        }

        allProcedures.push(taskIns)
        allProcedures.push({
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
            respType: 'key',
        })
        ProcedureIndex[x.type][x.diff] += 1
    }
    console.log(ProcedureIndex)
    return allProcedures

}
function fixedContingencyComplicated(MazeInfo) {
    console.log(MazeInfo)
    let p1Seq = [
        // first patch
        {'type':'Maze','diff':'easy','twist':'false'},
        {'type':'Trust','diff':'easy','twist':'false'},
        {'type':'Gamble','diff':'easy','twist':'false'},
        {'type':'Math','diff':'hard','twist':'false'},
        {'type':'Maze','diff':'hard','twist':'true'},
        {'type':'Gamble','diff':'hard','twist':'true'},
        {'type':'Maze','diff':'easy','twist':'true'},
        {'type':'Trust','diff':'hard','twist':'true'},
        {'type':'Math','diff':'easy','twist':'false'},
        {'type':'Gamble','diff':'easy','twist':'true'},
        {'type':'Math','diff':'hard','twist':'true'},
        {'type':'Gamble','diff':'hard','twist':'false'},
        {'type':'Trust','diff':'easy','twist':'true'},
        {'type':'Maze','diff':'hard','twist':'false'},
        {'type':'Math','diff':'easy','twist':'true'},
        {'type':'Trust','diff':'hard','twist':'false'},
        // second patch;
        {'type':'Gamble','diff':'hard','twist':'false'},
        {'type':'Trust','diff':'easy','twist':'false'},
        {'type':'Maze','diff':'hard','twist':'true'},
        {'type':'Math','diff':'hard','twist':'true'},
        {'type':'Maze','diff':'hard','twist':'false'},
        {'type':'Gamble','diff':'hard','twist':'true'},
        {'type':'Maze','diff':'easy','twist':'false'},
        {'type':'Trust','diff':'hard','twist':'true'},
        {'type':'Math','diff':'easy','twist':'true'},
        {'type':'Gamble','diff':'easy','twist':'true'},
        {'type':'Math','diff':'hard','twist':'false'},
        {'type':'Trust','diff':'hard','twist':'false'},
        {'type':'Gamble','diff':'easy','twist':'false'},
        {'type':'Trust','diff':'easy','twist':'true'},
        {'type':'Maze','diff':'easy','twist':'true'},
        {'type':'Math','diff':'easy','twist':'false'},
    ]
    let allProcedures = [];
    allProcedures.push({
        type: jsPsychRateEmotion,
        ShowEmo: true,
        emotion: "GoEmo",
        respType: 'key',
    })
    const MazeDiff = {'easy': [MazeInfo['20'][0], MazeInfo['20'][1], MazeInfo['20'][2], MazeInfo['20'][3]],
                                       'hard': [MazeInfo['20'][4], MazeInfo['20'][5], MazeInfo['20'][6], MazeInfo['20'][7]]}
    const GambleDiff = {
        'easy':[  // easy abs(EV - fixed) = 1.5 Gamble is always the preferred action
            {fixed: -1,gam_1: -3,gam_2: 4 ,},
            {fixed: 0,gam_1: -2,gam_2: 5 ,},
            {fixed: 1,gam_1: -1,gam_2: 6 ,},
            {fixed: 2,gam_1: 0,gam_2:  7,},
        ],
        'hard': [ // hard abs(EV - fixed) = 0.5 Gamble is always the preferred action
            {fixed: -1,gam_1: -3,gam_2: 2 ,},
            {fixed: 0,gam_1: -2,gam_2: 3 ,},
            {fixed: 1,gam_1: -1,gam_2: 4 ,},
            {fixed: 2,gam_1: 0,gam_2: 5,},
        ]}
    const TrustDiff = {'easy':[0], 'hard':[2]}

    let ProcedureIndex = {
        'Maze': {easy:0, hard: 0},
        'Gamble': {easy:0, hard: 0},
        'Trust': {easy:0, hard: 0},
        'Math': {easy:0, hard: 0},
    }

    for (let x of p1Seq) {
        let taskIns = {
            'type': '',
            'difficulty': x.diff,
            'twist': x.twist,
            'oldFb': true,
        }
        switch (x.type) {
            case 'Maze':
                taskIns.type = jsPsychMaze
                taskIns.preset = MazeDiff[x.diff][ProcedureIndex[x.type][x.diff]]
                taskIns.reverse = x.twist==='true'
                taskIns.timeLimit = 10000
                taskIns.limit = 'time'
                break;
            case 'Math':
                taskIns.type = jsPsychMath
                break;
            case 'Trust':
                taskIns.type = jsPsychTrust
                taskIns.displayBio =  0
                taskIns.share = x.twist === 'false'
                taskIns.player = x.diff==='easy'?0:2
                taskIns.pts = 5
                break;
            case 'Gamble':
                taskIns.type = jsPsychGamble
                taskIns.whichSide= Math.random() > 0.5 ? 'left':'right'
                taskIns.switch= x.twist==='true'
                taskIns.win = Math.random() > 0.5
                taskIns.opt = GambleDiff[x.diff][ProcedureIndex[x.type][x.diff]]
                break;
        }

        allProcedures.push(taskIns)
        allProcedures.push({
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
            respType: 'key',
        })
        ProcedureIndex[x.type][x.diff] += 1
    }
    console.log(ProcedureIndex)
    return allProcedures

}


function fixedContingencyOLD(jsPsych, MazeInfo) {
    let timeline = [
        //0
        {
            type: jsPsychMaze,
            preset: MazeInfo['20'][0],
            reverse: true,
            show_step: false,
            limit: 'time',
            timeLimit: 10000,
            stopAtBox: true,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        //1
        {
            type: jsPsychTrust,
            displayBio: 0,
            share: true,
            player: 0,
            pts: 5,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        //2
        {
            type: jsPsychGamble,
            whichSide: 'left',
            switch: false,
            win: true,
            opt: {
                fixed: -1,
                gam_1: -5,
                gam_2: 2 ,
            },
            iti: 0,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        //3
        {
            type: jsPsychMath,
            whichSide: 'left',
            digitLength: 2,
            operationLevel: 0,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        //4
        {
            type: jsPsychMaze,
            preset: MazeInfo['20'][4], // easy
            reverse: true,
            show_step: false,
            limit: 'time',
            timeLimit: 10000,
            stopAtBox: true,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        //5
        {
            type: jsPsychGamble,
            whichSide: 'right',
            switch: true,
            win: true,
            opt: {
                fixed: 0,
                gam_1: 2,
                gam_2: -4 ,
            },
            iti: 0,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        //6
        {
            type: jsPsychMaze,
            preset: MazeInfo['20'][1],
            reverse: true,
            show_step: false,
            limit: 'time',
            timeLimit: 10000,
            stopAtBox: true,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        //7
        {
            type: jsPsychTrust,
            displayBio: 0,
            share: true,
            player: 2,
            pts: 5,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        //8
        {
            type: jsPsychMath,
            whichSide: 'left',
            digitLength: 1,
            operationLevel: 0,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        //9
        {
            type: jsPsychGamble,
            whichSide: 'right',
            switch: true,
            win: true,
            opt: {
                fixed: 1,
                gam_1: 5,
                gam_2: -1 ,
            },
            iti: 0,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        //10
        {
            type: jsPsychMath,
            whichSide: 'left',
            digitLength: 2,
            operationLevel: 1,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        //11
        {
            type: jsPsychGamble,
            whichSide: 'left',
            switch: false,
            win: true,
            opt: {
                fixed: 5,
                gam_1: 7,
                gam_2: 2 ,
            },
            iti: 0,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        //12
        {
            type: jsPsychTrust,
            displayBio: 0,
            share: false,
            player: 2,
            pts: 5,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychMaze,
            preset: MazeInfo['20'][5], // hard
            reverse: false,
            show_step: false,
            limit: 'time',
            timeLimit: 10000,
            stopAtBox: true,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: jsPsych.timelineVariable('ShowEmo'),
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychMath,
            whichSide: 'left',
            digitLength: 1,
            operationLevel: 1,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychTrust,
            displayBio: 0,
            share: false,
            player: 0,
            pts: 5,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        //// Round 2 here  /////////
        ////
        {
            type: jsPsychMaze,
            preset: MazeInfo['20'][6],
            reverse: false,
            show_step: false,
            limit: 'time',
            timeLimit: 10000,
            stopAtBox: true,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        {
            type: jsPsychTrust,
            displayBio: 0,
            share: true,
            player: 0,
            pts: 5,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychGamble,
            whichSide: 'right',
            switch: false,
            win: true,
            opt: {
                fixed: 2,
                gam_1: 3,
                gam_2:  0, //ev = 1.5 + 0 = 1.5 less than
            },
            iti: 0,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ///
        {
            type: jsPsychMath,
            whichSide: 'left',
            digitLength: 2,
            operationLevel: 0,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychMaze,
            preset: MazeInfo['20'][7],
            reverse: true,
            show_step: false,
            limit: 'time',
            timeLimit: 10000,
            stopAtBox: true,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychGamble,
            whichSide: 'left',
            switch: true,
            win: true,
            opt: {
                fixed: 4,
                gam_1: 2,
                gam_2:  5, // ev = 1 + 2.5 = 3.5 less than
            },
            iti: 0,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychMaze,
            preset: MazeInfo['20'][2],
            reserve: false,
            show_step: false,
            limit: 'time',
            timeLimit: 10000,
            stopAtBox: true,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        /////
        {
            type: jsPsychTrust,
            displayBio: 0,
            share: true,
            player: 2,
            pts: 5,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ///
        {
            type: jsPsychMath,
            whichSide: 'left',
            digitLength: 1,
            operationLevel: 0,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychGamble,
            whichSide: 'right',
            switch: true,
            win: true,
            opt: {
                fixed: 6,
                gam_1: 9,
                gam_2: 4 , // 2 + 4.5 = 6.5 greater than
            },
            iti: 0,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychMath,
            whichSide: 'left',
            digitLength: 2,
            operationLevel: 1,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychTrust,
            displayBio: 0,
            share: false,
            player: 0,
            pts: 5,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        ////
        {
            type: jsPsychGamble,
            whichSide: 'left',
            switch: false,
            win: true,
            opt: {
                fixed: -1,
                gam_1: 2,
                gam_2: -3 , //eV -1.5 + 1 = 0.5 greater than
            },
            iti: 0,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychTrust,
            displayBio: 0,
            share: false,
            player: 2,
            pts: 5,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychMaze,
            preset: MazeInfo['20'][3],
            reserve: true,
            show_step: false,
            limit: 'time',
            timeLimit: 10000,
            stopAtBox: true,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: jsPsych.timelineVariable('ShowEmo'),
            emotion: "GoEmo",
        },
        ////
        {
            type: jsPsychMath,
            whichSide: 'left',
            digitLength: 1,
            operationLevel: 1,
        },
        {
            type: jsPsychRateEmotion,
            ShowEmo: true,
            emotion: "GoEmo",
        },





    ]
    return timeline
}