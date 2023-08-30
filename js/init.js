function welcome_const_ele() {
    const wrap = document.getElementById('wrap')

    const msgBox = document.createElement('div')
    msgBox.id = 'msgBox'
    msgBox.className = 'msgBox'

    msgBox.appendChild(document.createElement('h1'))
    msgBox.appendChild(document.createElement('p'))
    msgBox.appendChild(document.createElement('p'))

    msgBox.childNodes[0].textContent = 'Welcome to the experiment.'
    msgBox.childNodes[1].textContent = 'You must first select timeline type.'
    msgBox.childNodes[2].textContent = 'Hover over the selection buttons for more details on each timeline options. ' +
        'Both timeline options will include stories and 7 different tasks. '+
        'Once you have decided, press on the button to make your selection.'

    const optionRow = document.createElement('div')
    optionRow.id = 'optionRow'
    optionRow.className = 'optionRow'

    optionRow.appendChild(document.createElement('button'))
    optionRow.appendChild(document.createElement('button'))

    optionRow.childNodes[1].textContent = 'Condensed'
    optionRow.childNodes[1].setAttribute('iH', `The 'Condensed' timeline contains less task time to accommodate more stories. The 
         total story number is <strong> 18 </strong> (for a total of x minutes) but the task time is greatly reduced to <strong>5</strong> minutes blocks.`)
    optionRow.childNodes[0].textContent = 'Balanced'
    optionRow.childNodes[0].setAttribute('iH', `The 'Balanced' timeline contains increased task time. The 
         total story number is <strong> 9 </strong> (for a total of x minutes). The task time is <strong>15</strong> minutes each.`)
    optionRow.childNodes[0].addEventListener('mouseover', float_box)
    optionRow.childNodes[0].addEventListener('mouseleave', float_box)
    optionRow.childNodes[1].addEventListener('mouseover', float_box)
    optionRow.childNodes[1].addEventListener('mouseleave', float_box)

    optionRow.childNodes[0].addEventListener('click', tl_onpress)
    optionRow.childNodes[1].addEventListener('click', tl_onpress)
    setTimeout(function () { msgBox.style.opacity = 1 }, 400);
    wrap.appendChild(msgBox)
    wrap.appendChild(optionRow)
}



function tl_onpress(e) {
    console.log(e.target.textContent)
    global_config.timelineType = e.target.textContent
    document.getElementById('optionRow').remove()

    if (document.getElementById('infoBox')) {
        document.getElementById('infoBox').remove()
    }

    const msgBox = document.getElementById('msgBox')
    msgBox.appendChild(document.createElement('p'))
    msgBox.appendChild(document.createElement('p'))
    msgBox.appendChild(document.createElement('p'))
    document.getElementById('msgBox').childNodes[0].textContent = `Thank you! You have selected ${e.target.textContent}`
    document.getElementById('msgBox').childNodes[1].textContent = `We will now go over the basics`
    document.getElementById('msgBox').childNodes[2].textContent = 'This experiment has two main components, one is story listening and another one is task. '
    document.getElementById('msgBox').childNodes[3].textContent = 'This is the Development Version, which means that you will see additional information on screen through out the experiment. '+
        'Information such as Time Elapsed, Skip, and Condition Information. Below are what they would look like when they are available:'
    document.getElementById('msgBox').childNodes[4].textContent = 'You can hover over them for more information. When you are done, press "Continue"'
    const functionRow = construct_function_row()
    document.getElementById('wrap').appendChild(functionRow)


    functionRow.childNodes[1].addEventListener('mouseover', float_box)
    functionRow.childNodes[1].addEventListener('mouseleave', float_box)

    functionRow.childNodes[2].addEventListener('mouseover', float_box)
    functionRow.childNodes[2].addEventListener('mouseleave', float_box)

    functionRow.childNodes[3].addEventListener('mouseover', float_box)
    functionRow.childNodes[3].addEventListener('mouseleave', float_box)
    functionRow.childNodes[3].style.animation = 'hasInfo 1s ease-in-out infinite'


    const contButton = document.createElement('button')
    contButton.style.position = 'absolute'
    contButton.style.bottom = '2%'
    contButton.style.right = '10%'
    contButton.textContent = 'Continue'
    contButton.addEventListener('click', function () {
        location.href = "instruction.html";
    })
    document.getElementById('wrap').appendChild(contButton)

}

function construct_function_row() {
    const functionRow = document.createElement('div')
    functionRow.id = 'functionRow'
    functionRow.className = 'functionRow'
    const functionRowBG = document.createElement('div')
    functionRowBG.className = 'functionRowBG'

    functionRow.appendChild(functionRowBG)

    const skipButton = document.createElement('div')
    skipButton.className = 'skipButton'
    skipButton.textContent = '⏭️'
    skipButton.id = 'skipButton'
    skipButton.setAttribute('iH', `The skip button functions as its name, skipping certain component of the experiment as you wish (when available). 
    Currently there is no save function available. Please use the skip function to return to your previous progress.`)

    functionRow.appendChild(skipButton)

    const timer = document.createElement('div')
    timer.className = 'timer'
    timer.id = 'timer'
    timer.setAttribute('iH', `The timer does not update in real time. Rather the timer only updates when an event had happened, i.e. end of trial. 
    The timer tracks two times: Scheduled and Elapsed. Scheduled timer informs the planned time and Elapsed informs real time.`)
    timer.appendChild(document.createElement('div'))
    timer.appendChild(document.createElement('div'))
    timer.firstChild.appendChild(document.createElement('h1'))
    timer.firstChild.appendChild(document.createElement('p'))
    timer.lastChild.appendChild(document.createElement('h1'))
    timer.lastChild.appendChild(document.createElement('p'))
    timer.firstChild.firstChild.textContent = 'Scheduled:'
    timer.firstChild.lastChild.innerHTML = `<strong>10</strong>min<strong>50</strong>sec`
    timer.lastChild.firstChild.textContent = 'Elapsed:'
    timer.lastChild.lastChild.innerHTML = `<strong>10</strong>min<strong>50</strong>sec`
    functionRow.appendChild(timer)

    const infoButton = document.createElement('div')
    infoButton.className = 'skipButton'
    infoButton.id = 'infoButton'
    infoButton.textContent = 'ℹ️'
    infoButton.setAttribute('iH', `The information button gives you a better idea on what's happening in the current trial by providing more information on task conditions. 
    Please note that the on going task will NOT suspend while reading information. The button will pop when there's information available.`)
    infoButton.addEventListener('mouseover', float_box)
    infoButton.addEventListener('mouseleave', float_box)
    functionRow.appendChild(infoButton)

    return functionRow
}