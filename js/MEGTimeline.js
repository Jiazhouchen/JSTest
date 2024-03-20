
function getMEGContingency(sess, e) {
    const [type, n] = e.split('@')
    let runComp
    if (type === 'story') {
        const info = getStoryInfo(sess,n)
        console.log(info)
        runComp = [
            {
                type: jsPsychInfo,
                countDown: 0,
                majorMsg: 'Story: '+ info.pName,
                postMajor: 'Thank you for listening!',
                minorMsg: "Press 'enter' or 'space' to start listening.",
                audio: 'audio/'+info.name+'.wav',
            }
        ]

    }
    if (type === 'task') {
        runComp = MEGTaskContingency(window.MazeInfo,sess,n)
    }
    if (type === 'localizer') {
        runComp = [
            {
                type: jsPsychLocalizer,
                localType: n,
                audioNumThres: 20,
                visualNumThres: 20,
            }
        ]
    }
    return runComp
}

function MEGTaskContingency(MazeInfo, sess, n) {
    const config = allMEGConfig(sess, n)
    console.log(sess, n)
    let allProcedures = [];
    allProcedures.push({
        type: jsPsychRateEmotion,
        ShowEmo: true,
        emotion: "GoEmo",
        respType: 'key',
    })
    let ProcedureIndex = {
        'Maze': {easy:0, hard: 0},
        'Gamble': {easy:0, hard: 0},
        'Trust': {easy:0, hard: 0},
        'Math': {easy:0, hard: 0},
    }
    for (let x of config.order) {
        let taskIns = {
            'type': '',
            'difficulty': x.diff,
            'twist': x.twist,
	        'oldFb': true,
        }
        switch (x.type) {
            case 'Maze':
                taskIns.type = jsPsychMaze
                taskIns.preset = config.MazeDiff[x.diff][ProcedureIndex[x.type][x.diff]]
                taskIns.reverse = x.twist==='true'
                taskIns.timeLimit = 10000
                taskIns.limit = 'time'
                break;
            case 'Math':
                taskIns.type = jsPsychMath
                taskIns.whichSide = 'left'
                taskIns.twist = x.twist==='true'
                break;
            case 'Trust':
                taskIns.type = jsPsychTrust
                taskIns.displayBio =  0
                taskIns.player = x.diff==='easy'?0:2
                if (x.diff === 'easy') {
                    taskIns.share = x.twist !== 'true'
                } else {
                    taskIns.share = x.twist === 'true'
                }
                taskIns.pts = 5
                break;
            case 'Gamble':
                taskIns.type = jsPsychGamble
                taskIns.whichSide= Math.random() > 0.5 ? 'left':'right'
                taskIns.switch= x.twist==='true'
                taskIns.win = Math.random() > 0.5
                taskIns.opt = config.GambleDiff[x.diff][ProcedureIndex[x.type][x.diff]]
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

function allMEGConfig(sess, n) {
    const allConfig = {
        '1': {
            '1': {
                'order': [
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
                ],
                'MazeDiff': {
                    'easy': [MazeInfo['20'][0], MazeInfo['20'][1]],
                    'hard': [MazeInfo['20'][10], MazeInfo['20'][11], ]
                },
                'GambleDiff': {
                    'easy':[  // easy abs(EV - fixed) = 1.5 Gamble is always the preferred action
                        {fixed: -1,gam_1: -3,gam_2: 4 ,},
                        {fixed: 0,gam_1: -2,gam_2: 5 ,},
                    ],
                    'hard': [ // hard abs(EV - fixed) = 0.5 Gamble is always the preferred action
                        {fixed: -1,gam_1: -3,gam_2: 2 ,},
                        {fixed: 0,gam_1: -2,gam_2: 3 ,},
                    ]
                },

            },
            '2': {
                'order': [
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
                ],
                'MazeDiff': {
                    'easy': [MazeInfo['20'][2], MazeInfo['20'][3]],
                    'hard': [MazeInfo['20'][12], MazeInfo['20'][13]]
                },
                'GambleDiff': {
                    'easy':[  // easy abs(EV - fixed) = 1.5 Gamble is always the preferred action
                        {fixed: 1,gam_1: -1,gam_2: 6 ,},
                        {fixed: 2,gam_1: 0,gam_2:  7,},
                    ],
                    'hard': [ // hard abs(EV - fixed) = 0.5 Gamble is always the preferred action
                        {fixed: 1,gam_1: -1,gam_2: 4 ,},
                        {fixed: 2,gam_1: 0,gam_2: 5,},
                    ]
                },

            }
        },
        '2': {
            '1': {
                'order': [
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
                ],
                'MazeDiff': {
                    'easy': [MazeInfo['20'][4], MazeInfo['20'][5]],
                    'hard': [MazeInfo['20'][14], MazeInfo['20'][15], ]
                },
                'GambleDiff': {
                    'easy':[  // easy abs(EV - fixed) = 1.5 Gamble is always the preferred action
                        {fixed: 1,gam_1: 0,gam_2: 5 ,},
                        {fixed: 2,gam_1: 1,gam_2: 6 ,},
                    ],
                    'hard': [ // hard abs(EV - fixed) = 0.5 Gamble is always the preferred action
                        {fixed: 1,gam_1: -2,gam_2: 5 ,},
                        {fixed: 2,gam_1: -3,gam_2: 8 ,},
                    ]
                },

            },
            '2': {
                'order': [
                    {'type':'Math','diff':'hard','twist':'true'},
                    {'type':'Gamble','diff':'hard','twist':'false'},
                    {'type':'Trust','diff':'easy','twist':'false'},
                    {'type':'Maze','diff':'hard','twist':'true'},
                    {'type':'Gamble','diff':'hard','twist':'true'},
                    {'type':'Maze','diff':'easy','twist':'false'},
                    {'type':'Trust','diff':'hard','twist':'true'},
                    {'type':'Maze','diff':'hard','twist':'false'},
                    {'type':'Math','diff':'easy','twist':'true'},
                    {'type':'Gamble','diff':'easy','twist':'true'},
                    {'type':'Math','diff':'hard','twist':'false'},
                    {'type':'Trust','diff':'hard','twist':'false'},
                    {'type':'Gamble','diff':'easy','twist':'false'},
                    {'type':'Math','diff':'easy','twist':'false'},
                    {'type':'Trust','diff':'easy','twist':'true'},
                    {'type':'Maze','diff':'easy','twist':'true'},
                ],
                'MazeDiff': {
                    'easy': [MazeInfo['20'][6], MazeInfo['20'][7]],
                    'hard': [MazeInfo['20'][16], MazeInfo['20'][17]]
                },
                'GambleDiff': {
                    'easy':[  // easy abs(EV - fixed) = 1.5 Gamble is always the preferred action
                        {fixed: -1,gam_1: -2,gam_2: 3 ,},
                        {fixed: -2,gam_1: -6,gam_2: 5},
                    ],
                    'hard': [ // hard abs(EV - fixed) = 0.5 Gamble is always the preferred action
                        {fixed: -1,gam_1: -3,gam_2: 2 ,},
                        {fixed: -2,gam_1: -5,gam_2: 2,},
                    ]
                },

            }
        },
        '3': {
            '1': {
                'order': [
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
                ],
                'MazeDiff': {
                    'easy': [MazeInfo['20'][8], MazeInfo['20'][9]],
                    'hard': [MazeInfo['20'][18], MazeInfo['20'][19], ]
                },
                'GambleDiff': {
                    'easy':[  // easy abs(EV - fixed) = 1.5 Gamble is always the preferred action
                        {fixed: 3,gam_1: 1,gam_2: 8 ,},
                        {fixed: 4,gam_1: 2,gam_2: 9 ,},
                    ],
                    'hard': [ // hard abs(EV - fixed) = 0.5 Gamble is always the preferred action
                        {fixed: 3,gam_1: 2,gam_2: 5 ,},
                        {fixed: 4,gam_1: 3,gam_2: 6 ,},
                    ]
                },

            },
            '2': {
                'order': [
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
                ],
                'MazeDiff': {
                    'easy': [MazeInfo['20'][20], MazeInfo['20'][21]],
                    'hard': [MazeInfo['20'][25], MazeInfo['20'][26]]
                },
                'GambleDiff': {
                    'easy':[  // easy abs(EV - fixed) = 1.5 Gamble is always the preferred action
                        {fixed: -3,gam_1: -5,gam_2: 2,},
                        {fixed: -4,gam_1: -8,gam_2:  3,},
                    ],
                    'hard': [ // hard abs(EV - fixed) = 0.5 Gamble is always the preferred action
                        {fixed: -3,gam_1: -9,gam_2: 4 ,},
                        {fixed: -4,gam_1: -8,gam_2: 1,},
                    ]
                },

            }
        }
    }
    console.log(allConfig)
    return allConfig[sess][n]
}

function getStoryInfo(sess, n) {
    // The overall idea is that we will all start with a major sad story then reduce in intensity and move on to
    // a less intensely sad (sometimes just mixed feeling) one right before the first task.

    const AllStories = {
        '1': { // Math & Gamble 77 mins
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
        '2': { // Gam II & Trust 69 mins in total;
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
        '3': { // Maze & Math II 70 mins
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
    if (sess && n) {
        return AllStories[sess][n]
    } else {
        return AllStories
    }

}
