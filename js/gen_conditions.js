function get_gam_dict(win_p,fuzz_match,no_neg) {
    console.log(`generating for win p = ${win_p}`)
    let pos_range = [...Array(10).keys()]
    let neg_range=  pos_range.map(function(x) {return x * -1})
    let full_range = unique(pos_range.concat(neg_range));
    if (no_neg) {
        full_range = pos_range;
    }

    let full_range_pairs = full_range.reduce( (acc, v, i) =>
            acc.concat(full_range.slice(i+1).map( w => [v,w] )),
        []);
    let [winP, maxP] = frac_hack(win_p)
    let expected_value = [];
    for (let x in full_range_pairs) {
        let temp_x = full_range_pairs[x]
        if(temp_x[0] > temp_x[1]) {
            expected_value.push( ((temp_x[0] * winP) + (temp_x[1] * (maxP-winP))) )
        } else {
            expected_value.push( ((temp_x[1] * winP) + (temp_x[0] * (maxP-winP))) )
        }
    }
    let sel_pairs = {};
    for (let iz in full_range) {
        sel_pairs[full_range[iz]] = [];
        for (let xy in expected_value) {
            if (fuzz_match) {
                console.log('fuzz match')
                expected_value[xy] = Math.round(expected_value[xy]/maxP)
            }
            if (expected_value[xy] === full_range[iz]*maxP) {
                sel_pairs[full_range[iz]].push(full_range_pairs[xy])
            }
        }
        if (sel_pairs[full_range[iz]].length === 0) {
            delete sel_pairs[full_range[iz]]
        }
    }
    if (Object.keys(sel_pairs).length===0) {
        alert (`You use win p = ${winP/maxP} & fuzz match = ${fuzz_match} & no loss = ${no_neg}. 
        This combination resulted in no condition generated. Please reconsider.`);
    }
    return [sel_pairs, full_range]
}

function gen_trial_contin(t, win_p, yoke_por, left_p, ar_dict, full_range, diff_wall,ct_type,emo_int,iti_func) {
    /* default to no shuffling in the generation, just appending 1s to 0s do that outside */
    let t_i = [...Array(t).keys()]
    let yoke_all = new Array(Math.round(t_i.length * parseFloat(yoke_por))).fill(1);
    yoke_all=yoke_all.concat(new Array(t_i.length - yoke_all.length).fill(0))
    yoke_all=shuffle(yoke_all)
    let win_all = new Array(Math.round(t_i.length * parseFloat(win_p))).fill(1);
    win_all=win_all.concat(new Array(t_i.length - win_all.length).fill(0))
    win_all=shuffle(win_all)
    let lr_all = new Array(Math.round(t_i.length * parseFloat(left_p))).fill('left');
    lr_all=lr_all.concat(new Array(t_i.length - lr_all.length).fill('right'))
    lr_all=shuffle(lr_all)
    let iti_all = new Array(t).fill(1500);
    if (iti_func) {
        iti_all = iti_func()
    }
    let ar_keys = Object.keys(ar_dict)
    let ev_all=[], pairs_all=[], safe_all=[], contin_all = []
    let emo_counter = 0
    for (let ix in t_i) {
        let ev = sample(ar_keys)
        let rx = sample(ar_dict[ev])
        let rate_emo = 0;
        let max_diff = ev
        if (diff_wall && parseInt(ev) > diff_wall) {
            max_diff = diff_wall
        }
        // console.log(`pairs are ${rx}, expected v is ${ev}, max_diff is ${max_diff}`)
        let sv = ev /* do nothing if it's ev = sv */
        if (ct_type === 'worse') {
            let temp_iz = [];
            for (let iz in full_range) {
                let dif = (parseInt(ev) - parseInt(iz))
                if (dif <= parseInt(max_diff) & dif > 0) {
                    temp_iz.push(full_range[iz])
                }
            }
            sv = sample(temp_iz)
        } else if (ct_type === 'better') {
            let temp_iz = [];
            for (let iz in full_range) {
                let dif = (parseInt(iz) - parseInt(ev))
                if (dif <= parseInt(max_diff) & dif > 0) {
                    temp_iz.push(full_range[iz])
                }
            }
            sv = sample(temp_iz)
        } else if (ct_type === 'fixed') {
            for (let iz in full_range) {
                let dif = (parseInt(iz) - parseInt(ev))
                if (dif === ct_fixed) {
                    sv = sample(full_range[iz])
                }
            }
        }
        /* show emo labeling? */
        if (emo_counter === emo_int) {
            rate_emo = 1
            emo_counter = 0
        } else {
            emo_counter += 1
        }
        /* gen trial level contingencies */
        ev_all.push(ev)
        pairs_all.push(rx)
        safe_all.push(sv)
        contin_all.push( {
            yoked: yoke_all[ix],
            which_side: lr_all[ix],
            iti: iti_all[ix],
            reward_text:  {
                'gambling': [pad(rx[0],3," "), pad(rx[1],3," ")],
                'safe':[pad(sv,3," ")],
            },
            gambling_result: win_all[ix],
            show_emo_rate: rate_emo,
            win_p: win_p,
            yoke_p: yoke_por,
            choice_type: ct_type,
        } )
    }
    let paris_map = pairs_all.map( x => x[0].toString() + ' & ' + x[1].toString() )
    return {
        info: {
            ExpectedValue: ev_all,
            GamPairs: paris_map,
            SafeOpt: safe_all,
            Win:win_all,
            ITIs: iti_all,
        },
        timeline: contin_all
    }
}

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