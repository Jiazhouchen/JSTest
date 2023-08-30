function gen_rate_emo_page(trial) {
    // Define HTML
    let html = '';
    let col_gap = '20px';
    let bom_mar = '30px';
    // Last Rows have 3:
    let col_gap_last = '220px';
    let bom_mar_last = '150px';
    // Variable Style for Rows
    if (trial.emotion == 'GoEmo') {
        // Regular Rows have 5:
        col_gap = '20px'
        bom_mar = '30px';
        col_gap_last = '220px';
        bom_mar_last = '150px';
    } else if (trial.emotion == 'Ekman') {
        // Regular Rows have 4:
        col_gap = '86.5px'
        bom_mar = '30px'
        // Last Rows have 3:
        col_gap_last = '220px'
        bom_mar_last = '150px'
    } else if (trial.emotion == 'Sentiment') {
        // Add these to avoid errors:
        col_gap = '86.5px'
        bom_mar = '150px'
        // Last Rows have 3:
        col_gap_last = '86.5px'
        bom_mar_last = '150px'
    }
    // Insert CSS.
    html += `<style>
      h1 {
        padding: 1%;
        margin: 0;
      }
      .jspsych-content {
        max-width: 1152px;
        margin: 1% auto auto auto;
        font-size: 2vmin;
      }
      a:link {
        color: #29a3a3;
      }
      .button-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
       
      }
      .button-row button {
        background-color: #F0F0F0;
        height: unset;
        aspect-ratio: unset;
        min-width: 16vmin;
        min-height: 6vmin;
        padding: 2px;
        margin: 12px;
        color: black;
        font-size: 2vmin;
        font-weight:bold;
        border-radius: 10px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 5px 10px 0 rgba(0, 0, 0, 0.19);
      }
      .button-row button:hover {
        filter: brightness(90%);
        -webkit-filter: brightness(90%);
        background-color: #f2dbac;
      }
      
      .warning-message {
        height: 3vmin;
        text-align: center;
        font-size: 3vmin;
        font-weight: bold;
        color: #f54e16;
        margin-top: 3vmin;
        opacity: 0;
        transition-duration: 0.5s;
      }
      input[type=submit] {
        min-width: 16vmin;
        min-height: 6vmin;
        background-color: #c1d6c6;
        color: black;
        padding: 10px 10px 10px 10px;
        margin-top: 3vmin;
        border-radius: 10px;
        font-size: 20px;
        font-weight:bold
      }
      input[type=submit]:hover {
        filter: brightness(90%);
        -webkit-filter: brightness(90%);
      }
      </style>`
    // Add paragraph 1.
    html += '<h1>Label Your Emotion</h1>'
    html += '<hr>';
    // add counter-factual; one or two gamble; re-frame the switch; add robbing; detailed outline of the task
    // neutral to safe to safe // add interleve or block
    // Add button row.
    if (trial.emotion == 'GoEmo') {

        var emotions = ['admiration','amusement','anger','annoyance','approval',
            'caring','confusion','curiosity','desire','disappointment',
            'disapproval','disgust', 'embarrassment','excitement','fear',
            'gratitude','grief','joy','love','nervousness',
            'optimism','pride','realization','relief','remorse',
            'sadness','surprise', 'neutral'];
        var upper_limit = 3
        var ul_text = 'THREE'
        html += '<p>Please select 1-3 labels that best describe your current emotion(s).</p>'
        html += '<div class="button-row" id="button-row1">';
        html += '<button id="button-admiration" style="font-weight:bold;">Admiration</button>';
        html += '<button id="button-amusement" style="font-weight:bold;">Amusement</button>';
        html += '<button id="button-anger" style="font-weight:bold;">Australia</button>';
        html += '<button id="button-annoyance" style="font-weight:bold;">Annoyance</button>';
        html += '<button id="button-approval" style="font-weight:bold;">Approval</button>';
        html += '</div>';
        html += '<div class="button-row" id="button-row2">';
        html += '<button id="button-caring" style="font-weight:bold;">Caring</button>';
        html += '<button id="button-confusion" style="font-weight:bold;">Confusion</button>';
        html += '<button id="button-curiosity" style="font-weight:bold;">Curiosity</button>';
        html += '<button id="button-desire" style="font-weight:bold;">Desire</button>';
        html += '<button id="button-disappointment" style="font-weight:bold;">Disappointment</button>';
        html += '</div>';
        html += '<div class="button-row" id="button-row3">';
        html += '<button id="button-disapproval" style="font-weight:bold;">Disapproval</button>';
        html += '<button id="button-disgust" style="font-weight:bold;">Disgust</button>';
        html += '<button id="button-embarrassment" style="font-weight:bold;">Embarrassment</button>';
        html += '<button id="button-excitement" style="font-weight:bold;">Excitment</button>';
        html += '<button id="button-fear" style="font-weight:bold;">Fear</button>';
        html += '</div>';
        html += '<div class="button-row" id="button-row4">';
        html += '<button id="button-gratitude" style="font-weight:bold;">Gratitude</button>';
        html += '<button id="button-grief" style="font-weight:bold;">Grief</button>';
        html += '<button id="button-joy" style="font-weight:bold;">Joy</button>';
        html += '<button id="button-love" style="font-weight:bold;">Love</button>';
        html += '<button id="button-nervousness" style="font-weight:bold;">Nervousness</button>';
        html += '</div>';
        html += '<div class="button-row" id="button-row5">';
        html += '<button id="button-optimism" style="font-weight:bold;">Optimism</button>';
        html += '<button id="button-pride" style="font-weight:bold;">Pride</button>';
        html += '<button id="button-realization" style="font-weight:bold;">Realization</button>';
        html += '<button id="button-relief" style="font-weight:bold;">Relief</button>';
        html += '<button id="button-remorse" style="font-weight:bold;">Remorse</button>';
        html += '</div>';
        html += '<div class="button-row" id="last-button-row">';
        html += '<button id="button-sadness" style="font-weight:bold;">Sadness</button>';
        html += '<button id="button-surprise" style="font-weight:bold;">Surprise</button>';
        html += '<button id="button-neutral" style="font-weight:bold;">Neutral</button>';
        html += '</div>';
    } else if (trial.emotion == 'Ekman') {
        var emotions = ['anger','disgust', 'fear','joy','sadness','surprise', 'neutral'];
        var upper_limit = 1
        var ul_text = 'ONE'
        html += '<p>Please select 1 label that best describe your current emotion(s).</p>'
        html += '<div class="button-row" id="button-row1">';
        html += '<button id="button-anger" style="font-weight:bold;">Anger</button>';
        html += '<button id="button-disgust" style="font-weight:bold;">Disgust</button>';
        html += '<button id="button-fear" style="font-weight:bold;">Fear</button>';
        html += '<button id="button-joy" style="font-weight:bold;">Joy</button>';
        html += '</div>';
        html += '<div class="button-lastrow" id="last-button-row">';
        html += '<button id="button-sadness" style="font-weight:bold;">Sadness</button>';
        html += '<button id="button-surprise" style="font-weight:bold;">Surprise</button>';
        html += '<button id="button-neutral" style="font-weight:bold;">Neutral</button>';
        html += '</div>';
    } else if (trial.emotion == 'Sentiment')  {
        var emotions = ['positive','negative', 'ambiguous','neutral'];
        var upper_limit = 1
        var ul_text = 'ONE'
        html += '<p>Please select 1 label that best describe your current emotion(s).</p>'
        html += '<div class="button-lastrow" id="last-button-row">';
        html += '<button id="button-positive" style="font-weight:bold;">Positive</button>';
        html += '<button id="button-negative" style="font-weight:bold;">Negative</button>';
        html += '<button id="button-ambiguous" style="font-weight:bold;">Ambiguous</button>';
        html += '<button id="button-neutral" style="font-weight:bold;">Neutral</button>';
        html += '</div>';
    }

    // Add Warning Message:
    html += '<div class="warning-message" id="warningMsg">';
    html += '</div>'


    // Add submit button:
    html += '<form id="RateEmo">';
    html += `<center><input type="submit" id="RateEmo" value="Confirm" style="font-weight:bold;"></input><center>`;
    html += '</form>';
    return  [html, emotions, upper_limit,performance.now()]
}

