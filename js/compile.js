let search = window.location.search.substring(1);
let search_ = search.split("&");
let id = search_[0].split("=")[1];
let redId = search_[1].split("=")[1];
let sheng, fu, ping;
let home_num, visiting_num;
let dispersed_chu, dispersed_chu_cn, dispersed_ji, dispersed_ji_cn;
let primaryDisc, meanDisc, rise, drop, tall, low;//初盘,即盘,升盘，降盘,高水，低水
let use_rq, win_rate, draw_rate, lose_rate;//vip

(() => {
    $(".loadingShow").show();
    $.promiseAjax("http://47.96.190.129:9527/api/get/desc", {
        match_id: id
    }).then(ret => {
        if (ret.status === 200) {
            $(".loadingShow").hide();
            let retData = ret.data;
            let handicap = retData.handicap;
            switch (handicap) {
                case "+1":
                    $(".justAnalyze").show();
                    break;
                case "-1":
                    $(".loseAnalyze").show();
                    break;
                default:
                    $(".justAnalyze").show();
                    $(".loseAnalyze").show();
                    break;

            }
            $(".home_team").html("[" + retData.left_score + "]" + retData.left_team);
            $(".visiting_team").html(retData.right_team + "[" + retData.right_score + "]");
            let elapsed = retData.elapsed;
            switch (elapsed) {
                case "已完场":
                    $(".record").html(retData.record);
                    break;
                case "未开赛":
                    $(".record").html(elapsed);
                    break;
                case "比赛中-中场":
                    $(".record").html(elapsed);
                    break;
                default:
                    $(".record").html("比赛中-" + elapsed + "'");
                    break;
            }
            //vip
            use_rq = retData.use_rq;
            win_rate = Number(retData.win_rate);
            draw_rate = Number(retData.draw_rate);
            lose_rate = Number(retData.lose_rate);

            home_num = Number(retData.left_score);
            visiting_num = Number(retData.right_score);
            let odds_europe = retData.odds_europe.split(";");
            sheng = odds_europe[0];
            ping = odds_europe[1];
            fu = odds_europe[2];
            if (retData.history_win) {
                $(".win").val(retData.history_win);
            }
            if (retData.history_pan) {
                $(".winPlate").val(retData.history_pan);
            }

            if (retData.status_win_home) {
                $(".zRate").val(retData.status_win_home);
            }

            if (retData.status_win_visitor) {
                $(".kRate").val(retData.status_win_visitor);
            }

            if (retData.status_pan_home) {
                $(".zFp").val(retData.status_pan_home);
            }

            if (retData.status_pan_visitor) {
                $(".kFp").val(retData.status_pan_visitor);
            }
            //    降赔公司
            $(".suDropComp").val(retData.win_num);
            $(".ftDropComp").val(retData.draw_num);
            $(".erDropComp").val(retData.lose_num);
            //    投注比
            $(".suThen").val(retData.ratio_win);
            $(".ftThen").val(retData.ratio_draw);
            $(".erThen").val(retData.ratio_visitor);
            //    必发比
            $(".suOutbox").val(Math.floor(retData.betfair_win));
            $(".ftOutbox").val(Math.floor(retData.betfair_draw));
            $(".erOutbox").val(Math.floor(retData.betfair_visitor));
            //    凯利值
            $(".suKl").val(retData.kelly_win);
            $(".ftKl").val(retData.kelly_draw);
            $(".erKl").val(retData.kelly_visitor);
            // 离散值
            dispersed_chu = retData.dispersed_chu;
            dispersed_chu_cn = retData.dispersed_chu_cn;
            dispersed_ji = retData.dispersed_ji;
            dispersed_ji_cn = retData.dispersed_ji_cn;
            //让球数据
            primaryDisc = retData.chu_pan.toString();
            meanDisc = retData.ji_pan.toString();
            rise = Number(retData.up_han_provider_num);
            drop = Number(retData.down_han_provider_num);
            tall = Number(retData.high_water);
            low = Number(retData.low_water);

        } else {
            $.prompt(ret.message, 'danger', 2000, false);
        }
    }, err => console.error(err));

})();

let transitionFn = ret => {
    let retDate = "";
    switch (ret) {
        case "0":
            retDate = "平手";
            break;
        case "0/0.5":
            retDate = "平/半";
            break;
        case "0.5/1":
            retDate = "半/一";
            break;
        case "2/2.5":
            retDate = "两球/两球半";
            break;
        case "1":
            retDate = "一球";
            break;
        case "2.5":
            retDate = "两球半";
            break;
        case "-0/0.5":
            retDate = "受平/半";
            break;
        case "-0.5":
            retDate = "受半球";
            break;
        case "-0.5/1":
            retDate = "受半/一";
            break;
        case "-1":
            retDate = "受一球";
            break;
        case "0.5":
            retDate = "半球";
            break;
        case "1.5":
            retDate = "一球半";
            break;
        case "-1.5":
            retDate = "受一球半";
            break;
        case "-1/1.5":
            retDate = "受一球/受一球半";
            break;
        case "1/1.5":
            retDate = "一球/一球半";
            break;
        case "2":
            retDate = "两球";
            break;
        default:
            retDate = ret;
            break;
    }
    return retDate;
}

//胜 1  负 2  平 0
$(".analyze").on("click", function () {
    let dataType = $(this).attr("data-type");
    let exponent = "";
    switch (dataType) {
        case "1":
            exponent = "1";
            break;
        case "2":
            exponent = "-1";
            break;
    }
    var successNum = 0, flatNum = 0, errNum = 0;
    var impSCNum = 0, impFlatNum = 0, impErrNum = 0;
    //让球数据分析
    //初盘
    $(".primaryDisc").html(transitionFn(primaryDisc));
    //即盘
    $(".meanDisc").html(transitionFn(meanDisc));
    //升盘
    $(".rise").html(rise);
    //降盘
    $(".drop").html(drop);
    //高水
    $(".tall").html(tall);
    //低水
    $(".low").html(low);

    var letBallResult = "";
    if (Number(tall) > Number(low)) {
        letBallResult = "主胜"
    } else if (Number(tall) < Number(low)) {
        letBallResult = "主负"
    } else {
        letBallResult = "平"
    }
    $(".let-ball-result").html(transitionFn(meanDisc) + ":" + letBallResult)


    //纸面实力
    if (home_num && visiting_num) {
        if (home_num < visiting_num) {
            $(".power").css('color', '#F56C6C').html("主胜")
            successNum++
        } else {
            $(".power").css('color', '#909399').html("主负")
            errNum++
        }
    } else {
        $(".power").html("信息不全无法预测");
    }

    //欧洲指数比较
    var oWin = '';
    if (sheng && fu) {
        if (Number(sheng) < Number(fu)) {
            oWin = '1';
        } else if (Number(sheng) > Number(fu)) {
            oWin = '2';
        } else if (Number(sheng) === Number(fu)) {
            oWin = '0';
        }
        switch (oWin) {
            case '1':
                oWin = "主胜";
                successNum++;
                $(".oWin").css('color', '#F56C6C');
                break;
            case '2':
                oWin = "主负";
                errNum++;
                $(".oWin").css('color', '#909399');
                break;
            case '0':
                oWin = "平";
                flatNum++;
                $(".oWin").css('color', '#409EFF');
                break
        }
        $(".oWin").html(oWin);
    } else {
        $(".oWin").html("信息不全无法预测");
    }

    //本赛事近十场相同主客胜率
    var zRate = Number($(".zRate").val());
    var kRate = Number($(".kRate").val());
    var rateMessage = "";

    if (zRate && kRate) {
        if (zRate < 20 && kRate < 20) {
            $(".rate").css('color', '#F56C6C').html("胜率均小于20%，不予分析");
        } else {
            if (zRate > kRate) {
                rateMessage = "1"
            } else if (zRate < kRate) {
                rateMessage = "2"
            } else if (zRate === kRate) {
                rateMessage = "3"
            }
            switch (rateMessage) {
                case '1':
                    rateMessage = "主胜";
                    successNum++;
                    $(".rate").css('color', '#F56C6C');
                    break;
                case '2':
                    rateMessage = "主负";
                    errNum++;
                    $(".rate").css('color', '#909399');
                    break;
                case '3':
                    rateMessage = "平";
                    flatNum++;
                    $(".rate").css('color', '#409EFF');
                    break
            }

            $(".rate").html(rateMessage);
        }


    } else {
        $(".rate").css('color', '#F56C6C').html("信息输入不完整");
    }

    //本赛事近十场相同主客赢盘率
    var zFp = Number($(".zFp").val());
    var kFp = Number($(".kFp").val());
    var msgFp = "";

    if (zFp && kFp) {
        if (zFp > kFp) {
            msgFp = "2"
        } else if (zFp < kFp) {
            msgFp = "1"
        } else if (zFp === kFp) {
            msgFp = "3"
        }
        switch (msgFp) {
            case '1':
                msgFp = "主胜";
                successNum++;
                impSCNum++;
                $(".msgFp").css('color', '#F56C6C');
                break;
            case '2':
                msgFp = "主负";
                errNum++;
                impErrNum++;
                $(".msgFp").css('color', '#909399');
                break;
            case '3':
                msgFp = "平";
                flatNum++;
                impFlatNum++;
                $(".msgFp").css('color', '#409EFF');
                break
        }
        $(".msgFp").html(msgFp);

    } else {
        $(".msgFp").css('color', '#F56C6C').html("信息输入不完整");
    }


    //胜率分析
    var win = $('.win').val();
    if (win) {
        if (win > 50) {
            win = '1'
        } else if (win < 50) {
            win = '2'
        } else if (win == 50) {
            win = '0'
        }
        switch (win) {
            case '1':
                win = "主胜(仅参考)";
                $(".win").css('color', '#F56C6C');
                break;
            case '2':
                win = "主负(仅参考)";
                $(".win").css('color', '#909399');
                break;
            case '0':
                win = "平(仅参考)";
                $(".win").css('color', '#409EFF');
                break
        }
        $(".win").html(win);
    } else {
        $(".win").css('color', '#F56C6C').html("未输入胜率");
    }

    //赢盘率分析
    var winPlate = $(".winPlate").val();
    if (winPlate) {
        if (winPlate >= 70) {
            $(".winPlate").css('color', '#F56C6C').html("过高注意降赔指数反向分析")
        } else if (winPlate <= 10) {
            $(".winPlate").css('color', '#F56C6C').html("过低注意分析")
        } else {
            $(".winPlate").css('color', '#67C23A').html("正常")
        }
    } else {
        $(".winPlate").css('color', '#F56C6C').html("未输入赢盘率")
    }

    //降赔公司分析
    var comp = '';
    var suDropComp = $(".suDropComp").val();
    var ftDropComp = $(".ftDropComp").val();
    var erDropComp = $(".erDropComp").val();
    if (suDropComp && ftDropComp && erDropComp) {
        var arr = [];
        arr.push(suDropComp);
        arr.push(ftDropComp);
        arr.push(erDropComp);
        var arrMax = Math.max.apply(null, arr);//最大值
        var arrMin = Math.min.apply(null, arr);//最小值
        if (arrMax == suDropComp) {
            comp = '1'
        } else if (arrMax == ftDropComp) {
            comp = '0'
        } else if (arrMax == erDropComp) {
            comp = '2'
        }
        switch (comp) {
            case '1':
                comp = "主胜";
                successNum++;
                impSCNum++;
                $(".comp").css('color', '#F56C6C');
                break;
            case '2':
                comp = "主负";
                errNum++;
                impErrNum++;
                $(".comp").css('color', '#909399');
                break;
            case '0':
                comp = "平";
                flatNum++;
                impFlatNum++;
                $(".comp").css('color', '#409EFF');
                break
        }
        $(".comp").html(comp);
        arr.splice($.inArray(String(arrMax), arr), 1);
        arr.splice($.inArray(String(arrMin), arr), 1);
        var arrMiddle = arr.join();
        var arrMiddleHtml;
        if (arrMiddle * 2 > arrMax) {
            if (arrMiddle == arrMax && arrMax == erDropComp) {
                arrMiddleHtml = "主负";
                errNum++;
                impErrNum++;
            } else if (arrMiddle == arrMax && arrMax == suDropComp) {
                arrMiddleHtml = "主胜";
                successNum++;
                impSCNum++;
            } else {
                if (arrMiddle == suDropComp) {
                    arrMiddleHtml = "主胜"
                    successNum++;
                    impSCNum++;
                } else if (arrMiddle == ftDropComp) {
                    arrMiddleHtml = "平"
                    flatNum++;
                    impFlatNum++;
                } else if (arrMiddle == erDropComp) {
                    arrMiddleHtml = "主负"
                    errNum++;
                    impErrNum++;
                }
            }
            $(".comp").css('color', '#F56C6C').html(comp + '或' + arrMiddleHtml);
        }
    } else {
        $(".comp").css('color', '#F56C6C').html('信息输入不完整，无法分析')
    }

//    投注比分析
    var then = '';
    var suThen = $(".suThen").val();
    var ftThen = $(".ftThen").val();
    var erThen = $(".erThen").val();
    if (suThen && ftThen && erThen) {
        if (suThen === "0" && ftThen === "0" && erThen === "0") {
            $(".then").css('color', '#F56C6C').html('暂无数据，注意分析数据~');
        } else {
            var arr_then = [];
            arr_then.push(suThen);
            arr_then.push(ftThen);
            arr_then.push(erThen);
            var arr_then_max = Math.max.apply(null, arr_then);//最大值
            var arr_then_min = Math.min.apply(null, arr_then);//最小值
            if (arr_then_max == suThen) {
                then = '1'
            } else if (arr_then_max == ftThen) {
                then = '0'
            } else if (arr_then_max == erThen) {
                then = '2'
            }
            switch (then) {
                case '1':
                    then = "主胜";
                    successNum++;
                    impSCNum++;
                    $(".then").css('color', '#F56C6C');
                    break;
                case '2':
                    then = "主负";
                    errNum++;
                    impErrNum++;
                    $(".then").css('color', '#909399');
                    break;
                case '0':
                    then = "平";
                    flatNum++;
                    impFlatNum++;
                    $(".then").css('color', '#409EFF');
                    break
            }
            $(".then").html(then);
            if (arr_then_max < 50) {
                $(".thenHtml").html('(没超过50%的投注比)');
            }
            arr_then.splice($.inArray(String(arr_then_max), arr_then), 1);
            arr_then.splice($.inArray(String(arr_then_min), arr_then), 1);
            var arr_then_middle = arr_then.join();
            var arr_then_middle_html;
            if (arr_then_middle * 2 > arr_then_max) {
                if (arr_then_middle == arr_then_max && arr_then_max == erThen) {
                    arr_then_middle_html = "主负";
                    errNum++;
                    impErrNum++;
                } else if (arr_then_middle == arr_then_max && arr_then_max == ftThen) {
                    arr_then_middle_html = "平";
                    flatNum++;
                    impFlatNum++;
                } else {
                    if (arr_then_middle == suThen) {
                        arr_then_middle_html = "主胜";
                        successNum++;
                        impSCNum++;
                    } else if (arr_then_middle == ftThen) {
                        arr_then_middle_html = "平";
                        flatNum++;
                        impFlatNum++;
                    } else if (arr_then_middle == erThen) {
                        arr_then_middle_html = "主负";
                        errNum++;
                        impErrNum++;
                    }
                }
                $(".then").css('color', '#F56C6C').html(then + '或' + arr_then_middle_html);
            }
        }
    } else {
        $(".then").css('color', '#F56C6C').html('信息输入不完整，无法分析')
    }
//    必发指数分析
    var outbox = '';
    var suOutbox = $(".suOutbox").val();
    var ftOutbox = $(".ftOutbox").val();
    var erOutbox = $(".erOutbox").val();
    if (suOutbox && ftOutbox && erOutbox) {
        if (suOutbox === "0" && ftOutbox === "0" && erOutbox === "0") {
            $(".outbox").css('color', '#F56C6C').html('暂无数据,注意分析数据~')
        } else {

            var arr_outbox = [];
            arr_outbox.push(suOutbox);
            arr_outbox.push(ftOutbox);
            arr_outbox.push(erOutbox);
            var arr_outbox_max = Math.max.apply(null, arr_outbox);//最大值
            var arr_outbox_min = Math.min.apply(null, arr_outbox);//最小值
            if (arr_outbox_max == suOutbox) {
                outbox = '1'
            } else if (arr_outbox_max == ftOutbox) {
                outbox = '0'
            } else if (arr_outbox_max == erOutbox) {
                outbox = '2'
            }
            switch (outbox) {
                case '1':
                    outbox = "主胜";
                    successNum++;
                    $(".outbox").css('color', '#F56C6C');
                    break;
                case '2':
                    outbox = "主负";
                    errNum++;
                    $(".outbox").css('color', '#909399');
                    break;
                case '0':
                    outbox = "平";
                    flatNum++;
                    $(".outbox").css('color', '#409EFF');
                    break
            }
            $(".outbox").html(outbox);
            if (arr_outbox_max < 50) {
                $(".outboxHtml").html('(没超过50%的指数)');
            }
            arr_outbox.splice($.inArray(String(arr_outbox_max), arr_outbox), 1);
            arr_outbox.splice($.inArray(String(arr_outbox_min), arr_outbox), 1);
            var arr_outbox_middle = arr_outbox.join();
            let arr_outbox_middle_html = "";
            if (arr_outbox_middle * 2 > arr_outbox_max) {
                if (arr_outbox_middle == arr_outbox_max && arr_outbox_max == erOutbox) {
                    arr_outbox_middle_html = "主负";
                    errNum++;
                } else if (arr_outbox_middle == arr_outbox_max && arr_outbox_max == ftOutbox) {
                    arr_outbox_middle_html = "平";
                    flatNum++;
                } else {
                    if (arr_outbox_middle == suOutbox) {
                        arr_outbox_middle_html = "主胜";
                        successNum++;
                    } else if (arr_outbox_middle == ftOutbox) {
                        arr_outbox_middle_html = "平";
                        flatNum++;
                    } else if (arr_outbox_middle == erOutbox) {
                        arr_outbox_middle_html = "主负";
                        errNum++;
                    }
                }
                $(".outbox").css('color', '#F56C6C').html(outbox + '或' + arr_outbox_middle_html);
            }

        }

    } else {
        $(".outbox").css('color', '#F56C6C').html('信息输入不完整，无法分析')
    }

    //离散分析
    if (dispersed_chu_cn === dispersed_ji_cn) {
        switch (dispersed_ji_cn) {
            case "胜":
                successNum++;
                impSCNum++;
                break;
            case "平":
                flatNum++;
                impFlatNum++;
                break;
            case "负":
                errNum++;
                impErrNum++;
                break;
        }
    } else {
        switch (dispersed_chu_cn) {
            case "胜":
                successNum++;
                impSCNum++;
                break;
            case "平":
                flatNum++;
                impFlatNum++;
                break;
            case "负":
                errNum++;
                impErrNum++;
                break;
        }

        switch (dispersed_ji_cn) {
            case "胜":
                successNum++;
                impSCNum++;
                break;
            case "平":
                flatNum++;
                impFlatNum++;
                break;
            case "负":
                errNum++;
                impErrNum++;
                break;
        }
    }
    $(".disperse").html("初:" + dispersed_chu_cn + "(" + dispersed_chu + ")" + "，" + "即:" + dispersed_ji_cn + "(" + dispersed_ji + ")");

    //    凯利指数分析
    var kelly = '';
    var suKl = $(".suKl").val();
    var ftKl = $(".ftKl").val();
    var erKl = $(".erKl").val();
    if (suKl && ftKl && erKl) {
        var arr_kl = [];
        arr_kl.push(suKl);
        arr_kl.push(ftKl);
        arr_kl.push(erKl);
        var arr_kl_max = Math.max.apply(null, arr_kl);//最大值
        var arr_kl_min = Math.min.apply(null, arr_kl);//最小值
        if (arr_kl_max == suKl) {
            kelly = '1'
        } else if (arr_kl_max == ftKl) {
            kelly = '0'
        } else if (arr_kl_max == erKl) {
            kelly = '2'
        }
        switch (kelly) {
            case '1':
                kelly = "主胜";
                successNum++;
                impSCNum++;
                $(".kelly").css('color', '#F56C6C');
                break;
            case '2':
                kelly = "主负";
                errNum++;
                impErrNum++;
                $(".kelly").css('color', '#909399');
                break;
            case '0':
                kelly = "平";
                impFlatNum++;
                flatNum++;
                $(".kelly").css('color', '#409EFF');
                break
        }
        $(".kelly").html(kelly);
        arr_kl.splice($.inArray(String(arr_kl_max), arr_kl), 1);
        arr_kl.splice($.inArray(String(arr_kl_min), arr_kl), 1);
        var arr_kl_middle = arr_kl.join();
        var arr_kl_middle_html;
        if (Number(arr_kl_middle) + 5 > arr_kl_max) {
            if (arr_kl_middle == arr_kl_max && arr_kl_max == erKl) {
                arr_kl_middle_html = "主负";
                errNum++;
                impErrNum++;
            } else if (arr_kl_middle == arr_kl_max && arr_kl_max == ftKl) {
                arr_kl_middle_html = "平";
                flatNum++;
                impFlatNum++;
            } else {
                if (arr_kl_middle === suKl) {
                    arr_kl_middle_html = "主胜";
                    successNum++;
                    impSCNum++;
                } else if (arr_kl_middle === ftKl) {
                    arr_kl_middle_html = "平";
                    flatNum++;
                    impFlatNum++;
                } else if (arr_kl_middle === erKl) {
                    arr_kl_middle_html = "主负";
                    errNum++;
                    impErrNum++;
                }
            }

            $(".kelly").css('color', '#F56C6C').html(kelly + '或' + arr_kl_middle_html);
        }


    } else {
        $(".kelly").css('color', '#F56C6C').html('信息输入不完整，无法分析')
    }

//


//    受让指数
    $(".exponent").css('color', '#F56C6C').html(exponent);

    //全概率比计算
    var num = successNum + errNum + flatNum;
    var suProb = Number(((successNum / num).toFixed(4) * 100).toFixed(2));
    var errProb = Number(((errNum / num).toFixed(4) * 100).toFixed(2))
    var flatProb = Number(((flatNum / num).toFixed(4) * 100).toFixed(2))
    $(".suProb").html(suProb + "%")
    $(".errProb").html(errProb + "%")
    $(".flatProb").html(flatProb + "%")

    //vip预测数据
    let use_rq_su = $(".use_rq_su");
    let suVip = $(".suVip");

    let use_rq_err = $(".use_rq_err");
    let errVip = $(".errVip");

    let use_rq_flat = $(".use_rq_flat");
    let flatVip = $(".flatVip");

    let vip_arr = [win_rate, lose_rate, draw_rate];
    let vip_arr_max = Math.max.apply(null, vip_arr);//最大值
    let vip_arr_min = Math.min.apply(null, vip_arr);//最小值
    vip_arr.splice($.inArray(String(vip_arr_max), vip_arr), 1);
    vip_arr.splice($.inArray(String(vip_arr_min), vip_arr), 1);
    let vip_arr_middle = Number(vip_arr.join());
    let vip_result;
    let vipFn = ret => {
        switch (ret) {
            case "1":
                if (vip_arr_middle === vip_arr_max && vip_arr_max === lose_rate) {
                    vip_result = "让主负，让平";
                } else if (vip_arr_middle === vip_arr_max && vip_arr_max === draw_rate) {
                    vip_result = "让平，让主胜";
                } else {
                    if (vip_arr_max === win_rate) {
                        vip_result = "让主胜";
                    } else if (vip_arr_max === draw_rate) {
                        vip_result = "让平";
                    } else if (vip_arr_max === lose_rate) {
                        vip_result = "让主负";
                    }
                }
                break;
            case "2":
                if (vip_arr_middle === vip_arr_max && vip_arr_max === lose_rate) {
                    vip_result = "主负，平";
                } else if (vip_arr_middle === vip_arr_max && vip_arr_max === draw_rate) {
                    vip_result = "平，主胜";
                } else {
                    if (vip_arr_max === win_rate) {
                        vip_result = "主胜";
                    } else if (vip_arr_max === draw_rate) {
                        vip_result = "平";
                    } else if (vip_arr_max === lose_rate) {
                        vip_result = "主负";
                    }
                }
                break;
        }
        $(".vip-result").html(vip_result)
    }
    if (win_rate === 100 || lose_rate === 100 || draw_rate === 100) {
        $(".vipDiv").hide();
        $(".vipDivNone").show();
        $(".vip-result").html("暂无数据~")
    } else {
        switch (use_rq) {
            case "0":
                use_rq_su.html("让主胜");
                suVip.html(win_rate + '%');

                use_rq_err.html("让主负");
                errVip.html(lose_rate + '%');

                use_rq_flat.html("让平");
                flatVip.html(draw_rate + '%');

                vipFn("1");
                break;
            case "1":
                use_rq_su.html("主胜");
                suVip.html(win_rate + '%');

                use_rq_err.html("主负");
                errVip.html(lose_rate + '%');

                use_rq_flat.html("平");
                flatVip.html(draw_rate + '%');

                vipFn("2");
                break;
            case "2":
                use_rq_su.html("让主胜");
                suVip.html(win_rate + '%');

                use_rq_err.html("让主负");
                errVip.html(lose_rate + '%');

                use_rq_flat.html("让平");
                flatVip.html(draw_rate + '%');

                vipFn("1");
                break;
        }
    }
    //重点概率比计算
    var numImp = impSCNum + impErrNum + impFlatNum;
    let suProbImp = Number(((impSCNum / numImp).toFixed(4) * 100).toFixed(2));
    let errProbImp = Number(((impErrNum / numImp).toFixed(4) * 100).toFixed(2));
    let flatProbImp = Number(((impFlatNum / numImp).toFixed(4) * 100).toFixed(2));
    $(".suProbImp").html(suProbImp + "%")
    $(".errProbImp").html(errProbImp + "%")
    $(".flatProbImp").html(flatProbImp + "%")

    //竞彩官方市场赔率概率
    sheng = Number(sheng);
    ping = Number(ping);
    fu = Number(fu);
    //如果期望收入100元
    let shengPut = Number((100 / sheng).toFixed(2));
    let pingPut = Number((100 / ping).toFixed(2));
    let fuPut = Number((100 / fu).toFixed(2));
    let putNumber = Number(shengPut + pingPut + fuPut);
    let shengProbability = Number(((shengPut / putNumber).toFixed(4) * 100).toFixed(2));
    let pingProbability = Number(((pingPut / putNumber).toFixed(4) * 100).toFixed(2));
    let fuProbability = Number(((fuPut / putNumber).toFixed(4) * 100).toFixed(2))
    $(".shengProbability").html(shengProbability + "%");
    $(".pingProbability").html(pingProbability + "%");
    $(".fuProbability").html(fuProbability + "%");


    //预测概率差值
    let shengDifference = Number((suProb - shengProbability).toFixed(2));
    let fuDifference = Number((errProb - fuProbability).toFixed(2));
    let pingDifference = Number((flatProb - pingProbability).toFixed(2));
    let shengDifferenceImp = Number((suProbImp - shengProbability).toFixed(2));
    let fuDifferenceImp = Number((errProbImp - fuProbability).toFixed(2));
    let pingDifferenceImp = Number((flatProbImp - pingProbability).toFixed(2));
    $(".shengDifference").html("（普通）概率差值:" + shengDifference);
    $(".fuDifference").html("（普通）概率差值:" + fuDifference);
    $(".pingDifference").html("（普通）概率差值:" + pingDifference);
    $(".shengDifferenceImp").html("（重点）概率差值:" + shengDifferenceImp);
    $(".fuDifferenceImp").html("（重点）概率差值:" + fuDifferenceImp);
    $(".pingDifferenceImp").html("（重点）概率差值:" + pingDifferenceImp);

    console.log(Math.abs(shengDifference) + Math.abs(shengDifferenceImp));
    console.log(Math.abs(fuDifference) + Math.abs(fuDifferenceImp));
    console.log(Math.abs(pingDifference) + Math.abs(pingDifferenceImp));


    //计算市场赔率概率
    let absShengDifference = Math.abs(shengDifference);//胜的概率差值的绝对值
    let absFuDifference = Math.abs(fuDifference);//负的概率差值的绝对值
    let absPingDifference = Math.abs(pingDifference);//平的概率差值的绝对值
    let arr_abs = [];
    arr_abs.push(absShengDifference);
    arr_abs.push(absFuDifference);
    arr_abs.push(absPingDifference);
    let abs_max = Math.max.apply(null, arr_abs);//最大值
    let abs_min = Math.min.apply(null, arr_abs);//最小值
    let probabilityResult = "";
    let describe = "";
    switch (exponent) {
        case "-1":
            if (absShengDifference <= 5) {
                console.log(1111);
                if (absPingDifference < 5 && absFuDifference < 5) {
                    if (abs_min === absShengDifference) {
                        describe = "主胜与预测的相差极小，负比胜差值大且小于5，平比胜差值大且小于5，则看好主大胜";
                        probabilityResult = "胜，让胜";
                    } else if (abs_min === absPingDifference) {
                        describe = "主胜与预测的相差极小，负比胜差值大且小于5，平比胜差值小且小于5，则看好平局打出";
                        probabilityResult = "平，让负";
                    } else if (abs_min === absFuDifference) {
                        describe = "主胜与预测的相差极小，负比胜差值小且小于5，平比胜差值大且小于5，则看好主负打出";
                        probabilityResult = "负，让负";
                    }
                } else if (absPingDifference > 5 && absFuDifference > 5) {
                    describe = "主胜与预测的相差极小，负比胜差值大且大于5，平比胜差值大且大于5，则看好主胜";
                    probabilityResult = "胜";
                }
            } else if (5 < absShengDifference && absShengDifference <= 10) {
                console.log(222);
                if (absPingDifference < absShengDifference && absFuDifference > absShengDifference && absPingDifference < 5) {
                    probabilityResult = "胜，让平";
                } else if (absPingDifference < absShengDifference && absFuDifference < absShengDifference && absPingDifference < 6 && absFuDifference > 5) {
                    probabilityResult = "胜";
                } else if (absPingDifference < absShengDifference && absFuDifference < absShengDifference && absPingDifference < 6 && absFuDifference < 6) {
                    if (abs_min === absShengDifference) {
                        probabilityResult = "胜";
                    } else if (abs_min === absPingDifference) {
                        probabilityResult = "平，让负";
                    } else if (abs_min === absFuDifference) {
                        probabilityResult = "负，让负";
                    }
                } else if (absPingDifference < absShengDifference && absFuDifference > absShengDifference && absPingDifference < 10 && absFuDifference > 6) {
                    probabilityResult = "负，让负";
                }
            } else if (10 < absShengDifference && absShengDifference <= 20) {
                console.log(333);
                if (shengDifference > 0) {
                    if (absFuDifference > absShengDifference && absPingDifference < absShengDifference && absPingDifference < 5) {
                        describe = "主胜与预测的相差一般，负比胜差值大不易打出，平比胜差值小且小于5，则看好主胜";
                        probabilityResult = "胜，让胜";
                    } else if (absFuDifference < absShengDifference && absPingDifference < absShengDifference && absPingDifference < 5) {
                        if (fuDifference < 0 && pingDifference < 0) {
                            // describe = "主胜与预测的相差一般，且平负差值为负，负比胜差值小易打出，平比胜差值小且小于5，则看好负打出";
                            // probabilityResult = "负，让负";
                        }
                    } else if (absFuDifference < absShengDifference && absPingDifference < absShengDifference && absPingDifference < 5) {
                        if (fuDifference < 0 && pingDifference < 0) {
                            describe = "主胜与预测的相差一般，且平负差值为负，负比胜差值小易打出，平比胜差值小且小于5，则看好负打出";
                            probabilityResult = "负，让负";
                        }
                    } else if (absFuDifference < absShengDifference && absPingDifference < absShengDifference && absPingDifference > 5 && absFuDifference > 5) {
                        if (fuDifference < 0 && pingDifference < 0) {
                            describe = "主胜与预测的相差一般，且平负差值为负，负平比胜差值小但均大于5则不易出，则看好胜打出";
                            probabilityResult = "胜";
                        }
                    }

                } else {

                }

            } else if (20 < absShengDifference && absShengDifference <= 30) {
                console.log(444);
                if (absFuDifference < absShengDifference && absPingDifference < 5) {
                    probabilityResult = "平，让负";
                } else if (absFuDifference < 5 && absPingDifference < absShengDifference && absPingDifference > 10) {
                    if (shengDifference > 0 && fuDifference < 0 && pingDifference < 0) {
                        probabilityResult = "胜，让平";
                    } else if (shengDifference < 0 && fuDifference > 0 && pingDifference > 0) {
                        probabilityResult = "平，让负";
                    }
                } else if (absFuDifference < absShengDifference && absPingDifference > 10 && absFuDifference > 10 && absPingDifference < absShengDifference && fuDifference < 0 && pingDifference < 0 && shengDifference > 0) {
                    probabilityResult = "让负";
                } else {
                    probabilityResult = "以电脑分析为主";
                }
            } else if (absShengDifference > 30) {
                console.log(555);
                if (absFuDifference < absShengDifference && absPingDifference < absShengDifference && absPingDifference < 10 || absFuDifference < 10) {
                    describe = "主胜与预测的相差过大且平或负与自身预测接近则主胜不容易被打出，建议让负";
                    if (abs_min === absFuDifference) {
                        probabilityResult = "平，让负";
                    } else if (abs_min === absPingDifference) {
                        probabilityResult = "负，让负";
                    }
                }
            }
            break;
        case "1":
            if (absFuDifference <= 5) {

            } else if (5 < absFuDifference && absFuDifference <= 10) {

            } else if (10 < absFuDifference && absFuDifference <= 20) {
                if (fuDifference > 10) {
                    // describe = "主负比预测的低,容易被打出";
                }
                console.log(111111);
            }

            break;
        default:

            break;
    }

    $(".describe").html(describe);
    $(".probability-result").html(probabilityResult);
    $(".result").val(probabilityResult)


    let computerSu = (successNum / num).toFixed(4) * 100;
    let computerErr = (errNum / num).toFixed(4) * 100;
    let computerFlat = (flatNum / num).toFixed(4) * 100;
    let computerSu_imp = (impSCNum / numImp).toFixed(4) * 100;
    let computerErr_imp = (impErrNum / numImp).toFixed(4) * 100;
    let computerFlat_imp = (impFlatNum / numImp).toFixed(4) * 100;
    //电脑预测结果
    let computerFn = (computerSu, computerErr, computerFlat) => {
        let computerOne = "";
        let computerTwo = "";
        let computerThree = "";
        const computerNumber = [];
        computerNumber.push(computerSu);
        computerNumber.push(computerFlat);
        computerNumber.push(computerErr);
        let computerNumberMax = Math.max.apply(null, computerNumber);//最大值
        let computerNumberMin = Math.min.apply(null, computerNumber);//最小值
        if (computerSu > 50 || computerFlat > 50 || computerErr > 50) {
            if (computerNumberMax === computerSu) {
                computerOne = "胜"
            }
            if (computerNumberMax === computerErr) {
                computerOne = "负"
            }
            if (computerNumberMax === computerFlat) {
                computerOne = "平"
            }
            if (computerNumberMax === computerSu && computerNumberMax === computerFlat) {
                computerOne = "胜，平"
            }
            if (computerNumberMax === computerErr && computerNumberMax === computerFlat) {
                computerOne = "负，平"
            }
            if (computerNumberMax === computerErr && computerNumberMax === computerSu) {
                computerOne = "负，胜"
            }
        }
        switch (exponent) {
            case "1":
                if ((computerFlat + computerSu) - computerErr >= 20) {
                    computerTwo = "让胜";
                } else {
                    computerTwo = "让负，让平";
                }

                if ((computerFlat + computerSu) - computerErr >= 20) {
                    computerThree = "让胜";
                } else if (computerSu >= 30 && computerFlat <= 30) {
                    computerThree = "让平";
                } else if (computerErr >= 60) {
                    computerThree = "让负";
                } else {
                    computerThree = "平，负";
                }
                break;
            case "-1":
                if ((computerFlat + computerErr) - computerSu >= 20) {
                    computerTwo = "让负";
                } else {
                    computerTwo = "让平，让胜";
                }

                if ((computerFlat + computerErr) - computerSu >= 20) {
                    if (computerFlat >= 40 && computerFlat <= 60) {
                        computerThree = "平，让负";
                    } else {
                        computerThree = "让负";
                    }
                } else if (computerErr >= 20 && computerFlat <= 20) {
                    computerThree = "胜，让平";
                } else if (computerSu >= 60) {
                    computerThree = "让胜";
                } else {
                    computerThree = "胜，平";
                }
                break;
            default:
                computerTwo = "不做预判";
                break;
        }

        let resultComputer = "";//电脑
        let resultPop = "";//电脑详细
        if (computerOne && computerTwo) {
            resultComputer = computerOne + "，" + computerTwo
        } else {
            resultComputer = computerTwo
        }

        if (computerOne && computerThree) {
            const computerOneArr = computerOne.split("，");
            const computerThreeArr = computerThree.split("，");
            const mergeArr = [...new Set([...computerOneArr, ...computerThreeArr])];
            resultPop = mergeArr.join("，")
        } else {
            resultPop = computerThree
        }

        return resultComputer + ";" + resultPop;

    }

    //全概率比分析结果
    $(".result-computer").html(computerFn(computerSu, computerErr, computerFlat).split(";")[0]);
    $(".result-computer-detail").html(computerFn(computerSu, computerErr, computerFlat).split(";")[1]);
    //重点概率比分析结果
    $(".result-computer-emphasis").html(computerFn(computerSu_imp, computerErr_imp, computerFlat_imp).split(";")[0]);
    $(".result-computer-emphasis-detail").html(computerFn(computerSu_imp, computerErr_imp, computerFlat_imp).split(";")[1]);

    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));
    var option = {
        title: {
            text: '全概率饼状分布图',
            subtext: MIM.timeFilter(Date.parse(new Date()) / 1000, '-', ':'),
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: [
                    {value: successNum, name: '主胜'},
                    {value: errNum, name: '主负'},
                    {value: flatNum, name: '平'}
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    normal: {
                        show: true,
                        formatter: '{b} : {c} ({d}%)'
                    },
                    labelLine: {show: true}
                },
                color: ['#FF4444', '#006AFF', '#00CC88']
            }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    // 基于准备好的dom，初始化echarts实例
    var myChartColumnar = echarts.init(document.getElementById('mainColumnar'));
    var optionColumnar = {
        title: {
            text: '全概率柱状分布图',
            subtext: MIM.timeFilter(Date.parse(new Date()) / 1000, '-', ':'),
            left: 'center'
        },
        xAxis: {
            type: 'category',
            data: ['主胜', '主负', '平']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [
                    {
                        value: successNum,
                        itemStyle: {
                            color: '#FF4444'
                        }
                    },
                    {
                        value: errNum,
                        itemStyle: {
                            color: '#006AFF'
                        }
                    },
                    {
                        value: flatNum,
                        itemStyle: {
                            color: '#00CC88'
                        }
                    },
                ],
                type: 'bar',
                color: ['#FF4444', '#006AFF', '#00CC88'],
                itemStyle: {
                    normal: {
                        label: {
                            formatter: "{c}" + "个",
                            show: true,
                            position: "top",
                            textStyle: {
                                fontWeight: "bolder",
                                fontSize: "12",
                                color: "#000000"
                            }
                        }
                    }
                },
            },

        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChartColumnar.setOption(optionColumnar);
    // 基于准备好的dom，初始化echarts实例
    var myChartImport = echarts.init(document.getElementById('mainImport'));
    var optionImport = {
        title: {
            text: '重点概率饼状分布图',
            subtext: MIM.timeFilter(Date.parse(new Date()) / 1000, '-', ':'),
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: [
                    {value: impSCNum, name: '主胜'},
                    {value: impErrNum, name: '主负'},
                    {value: impFlatNum, name: '平'}
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    normal: {
                        show: true,
                        formatter: '{b} : {c} ({d}%)'
                    },
                    labelLine: {show: true}
                },
                color: ['#FF4444', '#006AFF', '#00CC88']
            }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChartImport.setOption(optionImport);
    // 基于准备好的dom，初始化echarts实例
    var myChartColumnarImport = echarts.init(document.getElementById('mainColumnarImport'));
    var optionColumnarImport = {
        title: {
            text: '重点概率柱状分布图',
            subtext: MIM.timeFilter(Date.parse(new Date()) / 1000, '-', ':'),
            left: 'center'
        },
        xAxis: {
            type: 'category',
            data: ['主胜', '主负', '平']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [
                    {
                        value: impSCNum,
                        itemStyle: {
                            color: '#FF4444'
                        }
                    },
                    {
                        value: impErrNum,
                        itemStyle: {
                            color: '#006AFF'
                        }
                    },
                    {
                        value: impFlatNum,
                        itemStyle: {
                            color: '#00CC88'
                        }
                    },
                ],
                type: 'bar',
                color: ['#FF4444', '#006AFF', '#00CC88'],
                itemStyle: {
                    normal: {
                        label: {
                            formatter: "{c}" + "个",
                            show: true,
                            position: "top",
                            textStyle: {
                                fontWeight: "bolder",
                                fontSize: "12",
                                color: "#000000"
                            }
                        }
                    }
                },
            },

        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChartColumnarImport.setOption(optionColumnarImport);
}).drawerInit("mimDrawer");
//确定结果
$("#definitive").on("click", function () {
    if ($(".result").val()) {
        modificationFn($(".result").val(), $(".result-computer-emphasis").html());
    } else {
        $.messageBox('$alert', {
            title: '重置',
            content: '是否重置结果',
            buttonText: '确定',
            // showClose:false,
            // closeOnClickModal:true,
            callback: (function () {
                modificationFn($(".result").val(), $(".result-computer-emphasis").html());
            })
        });
    }
});

//修改
function modificationFn(forecast, computer_forecast) {
    $.promiseAjax("http://47.96.190.129:9527/api/update/forecast", {
        id: redId,
        forecast: forecast,
        computer_forecast: computer_forecast,
    }, "POST").then(ret => {
        if (ret.status === 200) {
            MIM.prompt(ret.message, 'success', 2000, false);
            setTimeout(function () {
                window.location.href = "../index.html"
            }, 2000)
        } else {
            MIM.prompt(ret.message, 'danger', 2000, false);
        }
    }, err => console.error(err));
}
