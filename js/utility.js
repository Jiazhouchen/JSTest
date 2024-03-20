function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}
function happen_p(p){
    let num=Math.random();
    if(num < p) {
        return 1;
    } else {
        return 0;
    }
}

function resolveAfter(delay, value,jsPsych) {
    if (jsPsych) {
        return new Promise(resolve => {
            setTimeout(() => resolve(value), delay);
        });
    } else {
        return new Promise(resolve => {
            jsPsych.pluginAPI.setTimeout(() => resolve(value), delay);
        });
    }

}
function initTiming() {
    const ti = {
        init: 500,
        selDur: 1000,
        preFb: 1000,
        fbDur:2000,
        maxRespTime: 4000,
    }
    return ti
}


function initData(tskName) {
    const dt = {
        taskName: tskName,
        // time related;
        initTime: 0,
        stimOnset: 0,
        keyPressOnset: 0,
        fbOnset: 0,
        endTime: 0,
        // contingency
        contingency: {},
        difficulty: '',
        twist: '',
        // response related
        key: '',
        rt: 0,
        respType: '',
        // feedback related
        fb: '',
        pts: '',
    }
    return dt
}

function get_config(window) {
    /**
     * JavaScript Client Detection
     * (C) viazenetti GmbH (Christian Ludwig)
     */
    {
        let unknown = '-';

        // screen
        let screenSize = '';
        if (screen.width) {
            const width = (screen.width) ? screen.width : '';
            const height = (screen.height) ? screen.height : '';
            screenSize += '' + width + " x " + height;
        }

        // browser
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browser = navigator.appName;
        var version = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

        // Opera
        if ((verOffset = nAgt.indexOf('Opera')) != -1) {
            browser = 'Opera';
            version = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Opera Next
        if ((verOffset = nAgt.indexOf('OPR')) != -1) {
            browser = 'Opera';
            version = nAgt.substring(verOffset + 4);
        }
        // Legacy Edge
        else if ((verOffset = nAgt.indexOf('Edge')) != -1) {
            browser = 'Microsoft Legacy Edge';
            version = nAgt.substring(verOffset + 5);
        }
        // Edge (Chromium)
        else if ((verOffset = nAgt.indexOf('Edg')) != -1) {
            browser = 'Microsoft Edge';
            version = nAgt.substring(verOffset + 4);
        }
        // MSIE
        else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(verOffset + 5);
        }
        // Chrome
        else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
            browser = 'Chrome';
            version = nAgt.substring(verOffset + 7);
        }
        // Safari
        else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
            browser = 'Safari';
            version = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Firefox
        else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
            browser = 'Firefox';
            version = nAgt.substring(verOffset + 8);
        }
        // MSIE 11+
        else if (nAgt.indexOf('Trident/') != -1) {
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(nAgt.indexOf('rv:') + 3);
        }
        // Other browsers
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browser = nAgt.substring(nameOffset, verOffset);
            version = nAgt.substring(verOffset + 1);
            if (browser.toLowerCase() == browser.toUpperCase()) {
                browser = navigator.appName;
            }
        }
        // trim the version string
        if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

        majorVersion = parseInt('' + version, 10);
        if (isNaN(majorVersion)) {
            version = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        // mobile version
        var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

        // cookie
        var cookieEnabled = (navigator.cookieEnabled) ? true : false;

        if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
            document.cookie = 'testcookie';
            cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
        }

        // system
        var os = unknown;
        var clientStrings = [
            {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
            {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
            {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
            {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
            {s:'Windows Vista', r:/Windows NT 6.0/},
            {s:'Windows Server 2003', r:/Windows NT 5.2/},
            {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
            {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
            {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
            {s:'Windows 98', r:/(Windows 98|Win98)/},
            {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
            {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
            {s:'Windows CE', r:/Windows CE/},
            {s:'Windows 3.11', r:/Win16/},
            {s:'Android', r:/Android/},
            {s:'Open BSD', r:/OpenBSD/},
            {s:'Sun OS', r:/SunOS/},
            {s:'Chrome OS', r:/CrOS/},
            {s:'Linux', r:/(Linux|X11(?!.*CrOS))/},
            {s:'iOS', r:/(iPhone|iPad|iPod)/},
            {s:'Mac OS X', r:/Mac OS X/},
            {s:'Mac OS', r:/(Mac OS|MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
            {s:'QNX', r:/QNX/},
            {s:'UNIX', r:/UNIX/},
            {s:'BeOS', r:/BeOS/},
            {s:'OS/2', r:/OS\/2/},
            {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
        ];
        for (var id in clientStrings) {
            var cs = clientStrings[id];
            if (cs.r.test(nAgt)) {
                os = cs.s;
                break;
            }
        }

        var osVersion = unknown;

        if (/Windows/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
        }

        switch (os) {
            case 'Mac OS':
            case 'Mac OS X':
            case 'Android':
                osVersion = /(?:Android|Mac OS|Mac OS X|MacPPC|MacIntel|Mac_PowerPC|Macintosh) ([\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'iOS':
                osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                break;
        }

        // flash (you'll need to include swfobject)
        /* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
        var flashVersion = 'no check';
        if (typeof swfobject != 'undefined') {
            var fv = swfobject.getFlashPlayerVersion();
            if (fv.major > 0) {
                flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release;
            }
            else  {
                flashVersion = unknown;
            }
        }
        return {
            screen: screenSize,
            browser: browser,
            browserVersion: version,
            browserMajorVersion: majorVersion,
            mobile: mobile,
            os: os,
            osVersion: osVersion,
            cookies: cookieEnabled,
            flashVersion: flashVersion,
            userAgent: navigator.userAgent,
        };
    }


};

function unique(x) {
    var a = x.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};


function fix_boolean_url(x) {
    if (x.filter) {
        x.map(fix_boolean_url)
    } else {
        if (x === 'true') {
            x = true
        } else if (x === 'false') {
            x = false
        }
    }
    return x
}

function get_params(params, v_string, def) {
    let x = params.getAll(v_string);
    if (x.length===0) {
        return def
    } else if (x.length===1) {
        if (v_string.includes('[]')){
            return fix_boolean_url(x)
        } else {
            return fix_boolean_url(x[0])
        }
    } else {
        return fix_boolean_url(x)
    }
}

function flatten_array(a) {
    let aflat = [];
    for (let ax in a){
        for (let ab in a[ax]) {
            aflat.push(a[ax][ab])
        }
    }
    return aflat
}

function sample(arx){
    return arx[Math.floor(Math.random() * arx.length)];
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}


function frac_hack(x, assign_back){
    if (typeof x === 'string' || x instanceof String) {
        if (x.indexOf('.')) {
            x = parseFloat(x)
        } else {
            x = parseInt(x)
        }
    }
    // javascript literally can't do math right if it's not int...so you can't use p as 0.8, must do 8 then divide by 10...
    if (x < 0) {
        x = Math.abs(x)
        let neg = true
    } // don't want no negative probability
    let d_length = x.toString().length
    let maxP = parseInt('1'+'0'.repeat(d_length))
    if (x < 1 && x > 0) {
        d_length = d_length - 2 // that's 0 & the .
        maxP = parseInt('1'+'0'.repeat(d_length))
        x = x * maxP
    }
    if (assign_back) {
        x = x * -1
    }
    return [x, maxP]
}

function float_box(e) {
    const wrap = document.getElementById('wrap')
    //adjust offset here:
    e.target.style.animationPlayState = 'paused'
    let el = e.target
    let osT = e.target.offsetTop
    let osH = e.target.offsetHeight
    let osL = e.target.offsetLeft
    let osW = e.target.offsetWidth
    while (el.offsetParent.id !== 'wrap') {
        osT += el.offsetParent.offsetTop
        osL += el.offsetParent.offsetLeft

        el = el.offsetParent
    }

    if (e && e.type === 'mouseover')  {
        const infoBox = document.createElement('div')
        infoBox.className = 'infoBox'
        infoBox.id = 'infoBox'
        wrap.appendChild(infoBox)
        infoBox.style.bottom = (wrap.offsetHeight - osT + (osH/2))+'px'
        infoBox.style.left = (osL - (infoBox.clientWidth /2) + (osW / 2))+'px'
        infoBox.innerHTML = e.target.getAttribute('iH')
    } else if (e && e.type === 'mouseleave') {
        document.getElementById('infoBox').remove()
    }

}

function reset_animation(Id) {
    let el = document.getElementById(Id);
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null;
}

function updateInfo(strX) {
    const infoButton = document.getElementById('infoButton')
    if (infoButton) {
        infoButton.setAttribute('iH', strX)
        infoButton.style.animation = '1s ease-in-out infinite hasInfo'
    }
}

function updateTimer() {
    const timer = document.getElementById('timer')
    if (timer) {
        timer.childNodes[0].childNodes[1].innerHTML = `<strong>${timer.getAttribute('sTimerMin')}</strong>min<strong>${timer.getAttribute('sTimerSec')}</strong>sec`
        let diffTime =   ms2MinNSec(parseInt(performance.now() - parseInt(timer.getAttribute('initTime'))))
        console.log(performance.now() - parseInt(timer.getAttribute('sTimerMin')))
        timer.childNodes[1].childNodes[1].innerHTML = `<strong>${diffTime[0]}</strong>min<strong>${diffTime[1]}</strong>sec`
    }
}
function ms2MinNSec(millis) {
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return [minutes, seconds]
}
function resetSkipButton() {
    // too lazy to change all that, just do a wrapper and generalize this;
    return resetElement('skipButton')
}

function resetElement(elementID) {
    let element = document.getElementById("elementID");
    let new_element;
    if (element) {
        new_element = element.cloneNode(true);
        element.parentNode.replaceChild(new_element, element);
    }
    return new_element
}

function purgeChildren(elementID) {
    const ele = document.getElementById(elementID);
    while (ele.firstChild) {
        ele.removeChild(ele.lastChild);
    }
}

function standardFeedback(uChoice, uPoints, cfChoice, cfPoints, noResp, cSn, actionWord,fullV, CounterFactual) {
    const fb = document.createElement('div')
    let symb = ''
    if (!actionWord) {
        actionWord = 'chose'
    }
    if (typeof cSn === 'undefined') {
        if (noResp) {
            cSn = 3
        } else if (uPoints > 0 ) {
            cSn = 0
        } else if (uPoints < 0) {
            cSn = 1
        } else if (uPoints === 0) {
            cSn = 2
        }
    }
    const symbList = ['✔', '✖', '◎','--']
    const colorScheme = ['#acdb86','#db9a86','#ded8ca','black']
    const colorDarkScheme = ['#8fb570','#b07d6d','#ada89c','#8f8f8f']
    const colorDarkerScheme = ['#506143','#614840','#59564f','#b0b0b0']
    const colorFont = ['black','black','black','white']

    if (fullV) {
        fb.className = 'fb'
        fb.style.backgroundColor = colorScheme[cSn]
        fb.innerHTML = `
        <div>
            ${
            noResp ? `<p><strong>No Response</strong></p>`:`<p>You ${actionWord} <strong>${uChoice}</strong></p>`
        }
            <p>You got <strong>${uPoints}</strong> points</p>
        </div>
        <div class="cfFB">
            <p>If you had ${actionWord} <strong>${cfChoice}</strong></p>
            <p>You would get <strong>${cfPoints}</strong> points</p>
        </div>
        `

    } else if (CounterFactual) {
        console.log('FEEDBACK ON')
        fb.style.backgroundColor = 'transparent'
        fb.className = 'fb fbCompact'
        fb.innerHTML = `
        <div class="fbNum" style="color: ${colorFont[cSn]}; border-color: ${colorDarkScheme[cSn]}; background-color: ${colorScheme[cSn]}">
            <p><strong>${uPoints}</strong></p>
        </div>
        <div class="fbNum" style="border-color:transparent; background-color: #dbdbdb;">
            <p><strong>${cfPoints}</strong></p>
        </div>
        `
    } else {

        console.log('SIMPLE FEEDBACK ON')
        fb.style.backgroundColor = 'transparent'
        fb.className = 'fb fbCompact'
        fb.innerHTML = `
        <div class="fbNum" style="color: ${colorFont[cSn]}; border-color: ${colorDarkScheme[cSn]}; background-color: ${colorScheme[cSn]}">
            <p style="color: ${colorDarkerScheme[cSn]}"><strong>${symbList[cSn]}</strong></p>
        </div>
        `
    }

    return fb
}

function capFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function photonSwitch(className, duration) {

    if (window.doingMEG) {
        if (!window.photonLog) {
            window.photonLog = []
        }
        let photonEL = document.getElementById('photonEL')
        if (!photonEL) {
            console.log('text')
            photonEL = document.createElement('div')
            photonEL.id = 'photonEL'
            photonEL.className = 'photonEL'
            document.body.appendChild(photonEL)
        }
        if (window.doingMEG === 'switch') {
            if (className) {
                if (className === 'revert' || className === 'off') {
                    photonEL.className = 'photonEL'
                    window.photonLog.push({
                        time: performance.now(),
                        origin: performance.timeOrigin,
                        type: 'off',
                        taskName: taskName,
                    })
                } else {
                    photonEL.className = `photonEL ${className}`
                    window.photonLog.push({
                        time: performance.now(),
                        origin: performance.timeOrigin,
                        type: className,
                        taskName: taskName,
                    })
                }

            }
        }
        if (window.doingMEG === 'flash') {
            if (className) {

                photonEL.className = 'photonEL'
                photonEL.className = 'photonEL on'
                let timeOn = performance.now()
                if (!duration) {
                    if (className === 'trial') {
                        duration = 150
                    } else {
                        duration = 100
                    }
                }
                //let myEvent = new CustomEvent('jspsych', {
                //    detail:{
                //        target : 'parallel',
                //        action : 'trigger',
                //        payload: 255
                //    }
                //});
                //document.dispatchEvent(myEvent);
                setTimeout(function () {
                    photonEL.className = 'photonEL'
                    window.photonLog.push({
                        timeOff: performance.now(),
                        timeOn: timeOn,
                        duration: duration,
                        origin: performance.timeOrigin,
                        type: 'flash',
                        tagName: className,
                    })
                    console.log(window.photonLog)
                },duration)


            }

        }

    } else {
        console.log('MEG triggers disabled')
    }

}

function saveData(name, data){
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'write_data.php'); // 'write_data.php' is the path to the php file described above.
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({filedata: data}));
}

function onExpEnd(dt, MEG,ptInfo,jsPsych) {
    window.successFinish = true
    const gdt = jsDt2Fire(dt)
    console.log(gdt)
    const de = document.getElementById('display_element')
    if (MEG === true) {

        setTimeout(() => {
            photonSwitch('on',1000)
            de.innerHTML = `
                        <div id='msgFIN' style="display: flex; flex-direction: column; justify-content: space-around">
                            <h1 style="margin: auto;">We are done with this block. Please take a short Break.</h1>
                            <h1 style="margin: auto;">We will resume shortly. </h1>
                            <button style="margin: auto;" onclick="resetMEG()"> Continue </button>
                        </div>
                        `
            setTimeout(()=> {
                window.ptInfo['triggerTiming'] = window.photonLog
                jsPsych.data.addProperties(window.ptInfo)
                jsPsych.data.get().localSave('csv', `MEG_${window.ptInfo.ID}_${window.ptInfo.Session}_${window.ptInfo.Block}_COMPLETE.csv`);
                const ie = db.collection('MEGP1').doc(window.ptInfo.ID).collection(window.ptInfo.Session).doc(window.ptInfo.Block).set(gdt)
            }, 1500)

        }, 1000)

    } else {
        de.innerHTML = `
                        <div id='msgFIN' style="display: flex; flex-direction: column; justify-content: space-around">
                            <h1 style="margin: auto;">All done! Thank you for your participation!</h1>
                            <h1 style="margin: auto;">Please wait and DO NOT CLOSE the browser window, your data is uploading... </h1>
                        </div>
                        `
    }
}

function resetMEG() {
    const de = document.getElementById('display_element')
    de.innerHTML = ``
    de.style.display = 'none'
    document.getElementById('msgBox').innerHTML = `
        <h1> <strong>ID:</strong> ${window.ptInfo.ID} </h1>
        <h1> <strong>Session:</strong> ${window.ptInfo.Session} </h1>
    `
    document.getElementById('loadingText').style.display = 'none'
    document.getElementById('optionRow').style.display = 'flex'
}

function jsDt2Fire(dt) {
    let gdt = {};
    for (let i=0; i<dt.trials.length; i++) {
        gdt[String(i)] = dt.trials[i]
    }
    return gdt
}

class keyMap {
    constructor(expType) {
        this.expType = expType
        if (!expType) {
            if (window.doingMEG) {
                this.expType = 'MEG'
            } else {
                this.expType = 'behave'
            }
        }
        this.keymap = new Map()
        if (this.expType === 'behave') {
            this.keymap.set('a','left')
            this.keymap.set('w','up')
            this.keymap.set('d','right')
            this.keymap.set('s','down')

            this.keymap.set('arrowup','up')
            this.keymap.set('arrowright','right')
            this.keymap.set('arrowleft','left')
            this.keymap.set('arrowdown','down')

            this.keymap.set(' ','select')
            this.keymap.set('enter','confirm')
        } else if (this.expType === 'MEG') {
            // MEG set up
            this.keymap.set('2','up')
            this.keymap.set('3','down')
            this.keymap.set('1','left')
            this.keymap.set('4','right')

            this.keymap.set('6','select')
            this.keymap.set('8','confirm')
            this.keymap.set('0','confirm')
            this.keymap.set('0','confirm')
        } else {
	    this.keymap.set('1','up')
            this.keymap.set('2','down')
            this.keymap.set('6','left')
            this.keymap.set('7','right')

            this.keymap.set('3','select')
            this.keymap.set('4','confirm')
            this.keymap.set('8','confirm')
            this.keymap.set('9','confirm')
	}
    }

    allowedKeys(allowedList) {
        this.allkeys = []
        if (allowedList) {
            for (const [k, v] of this.keymap) {
                if (allowedList.includes(v)) {
                    this.allkeys.push(k)
                }
            }
        } else {
            for (const [k, v] of this.keymap) {
                this.allkeys.push(k)
            }
        }
        return this.allkeys
    }

    getAction(key) {
        return this.keymap.get(key.toLowerCase())
    }


}
