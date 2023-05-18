(() => {

    var arrowFunction = "var t = () => {};";
    try {
        f = new Function(arrowFunction);
    } catch (e) {
        $.prompt('当前浏览器不支持該頁面!', 'danger', 2000, false);
    }

    let user = window.localStorage.getItem('user'); //获取用户类型信息 1vip 2普通
    let match_id = window.sessionStorage.getItem('match_id'); //某场比赛
    let user_html = $(".user");
    let vipHtml = $(".vipHtml");
    let date = "";//时间
    let totalNumber = "";//总条数
    let currentPage = 1; // 当前页码
    const pageSize = 10; //每页个数
    let newTime = Date.parse(new Date()) / 1000//当前最新时间戳
    date = sessionStorage.getItem("keyTime");
    let mySwiper = "";//设置swiper
    let sonData = {
        "vip": {win: "", flat: "", lose: "", type: ""},//vip数据胜平负
        "ordNum": {win: 0, flat: 0, lose: 0},//普通数据胜平负
        "impNum": {win: 0, flat: 0, lose: 0},//重要数据胜平负
        "bjInit": {win: "", flat: "", lose: ""},//百家竞彩初始赔率
        "bjTimely": {win: "", flat: "", lose: ""},//百家竞彩即时赔率
        "jcInit": {win: "", flat: "", lose: ""},//竞彩官方初始赔率
        "jcTimely": {win: "", flat: "", lose: ""},//竞彩官方即时赔率
        "wlxInit": {win: "", flat: "", lose: ""},//威廉希尔初始赔率
        "wlbInit": {win: "", flat: "", lose: ""},//立博初始赔率
        "company": {win: "", flat: "", lose: ""},//降赔公司
        "bet": {win: "", flat: "", lose: ""},//投注比
        "betfair": {win: "", flat: "", lose: ""},//必发比
        "kelly": {win: "", flat: "", lose: ""},//凯利值
        "disperse": {init: "", initVal: "", even: "", evenVal: ""},//离散
        "principal": {host: "", guest: ""},//纸面实力分析
    };//单场场次数据

    let handicap = "";//让球数
    if (!date) {
        date = MIM.timeFilter(newTime, '-', false)
    }
    let options = [];//时间列表
    $(".newTime").html($.timeFilter(newTime, '-', ':'));//数据更新时间
    switch (user) {
        case "1":
            $("#M,body").css({
                background: "#333C4F",
            });
            $("header").css({
                color: "#E6B777"
            })
            $(".ball_div").css({
                border: "10px dotted #E6B777"
            })
            $(".mySwiper").css({
                background: "#e4e7ed"
            })
            $(".ai").html("AI足球（vip尊享版）")
            user_html.html("尊享VIP用户").prev().attr("src", "./images/vip1.png");
            break;
        case "2":
            user_html.html("普通用户").prev().attr("src", "./images/pt.png");
            break;
        default:
            $.prompt('请重新登陆', 'danger', 2000, false);
            setTimeout(() => {
                window.location.href = "./html/login.html";
            }, 1500);
            break;
    }

    //vip多加的日期
    let getWeekDataList = () => {
        let days = []
        let date = new Date();
        let newsTime = date.getTime() - 6 * 24 * 60 * 60 * 1000
        for (let i = 0; i <= 24 * 6; i += 24) {
            //今天加上前6天
            let dateItem = new Date(newsTime - i * 60 * 60 * 1000) //使用当天时间戳减去以前的时间毫秒（小时*分*秒*毫秒）
            let y = dateItem.getFullYear() //获取年份
            let m = dateItem.getMonth() + 1 //获取月份js月份从0开始，需要+1
            let d = dateItem.getDate() //获取日期
            m = addDate0(m) //给为单数的月份补零
            d = addDate0(d) //给为单数的日期补零
            let valueItem = y + '-' + m + '-' + d //组合
            days.push(valueItem) //添加至数组
        }

        //给日期加0
        function addDate0(time) {
            if (time.toString().length === 1) {
                time = '0' + time.toString()
            }
            return time
        }

        return days
    }

    //退出登录
    $("#out").on("click", () => {
        window.location.href = './html/login.html';
        window.localStorage.clear();
    });

    //初始化时间
    let timeFn = () => {
        $.promiseAjax("https://tt.taoerhuo.top/api/get/date").then(ret => {
            if (ret.status === 200) {
                let retData = ret.data;
                switch (user) {
                    case "1":
                        retData = retData.concat(getWeekDataList()).sort();
                        break;
                }
                $.each(retData, function (i, val) {
                    options.push({
                        id: val,
                        value: val
                    })
                });
                $('#timeSelect').selectInit(options);
                $("#timeSelect").find('input').val(date);
            } else {
                MIM.prompt(ret.message, 'danger', 2000, false);
                $(".loadingShow").show();
            }
        }, err => console.error(err));
    };
    timeFn();
    let appendHtml = (ret, pagNumber) => {
        let html = '';
        let consequence = '', letConsequence = '', let_ball = "";//让球数
        let recordArr = [];
        for (let i = 0; i < pagNumber; i++) {
            html += '<div class="swiper-slide">';
            $.each(ret, function (index, val) {
                let code_block = () => {
                    if (val["elapsed"] === "未开赛") {
                        html += '<div class="half-court mimMinor">半:等待开赛中~~</div>';
                    } else if (recordArr[0] && recordArr[1] && !recordArr[2] && !recordArr[3]) {
                        html += '<div class="half-court mimMinor">半:[' + recordArr[0] + ']</div>';
                    } else if (recordArr[0] && recordArr[1] && recordArr[2] && !recordArr[3]) {
                        html += '<div class="half-court mimMinor">半:[' + recordArr[0] + '] 加:[' + recordArr[2] + ']</div>';
                    } else if (recordArr[0] && recordArr[1] && recordArr[2] && recordArr[3]) {
                        html += '<div class="half-court mimMinor">半:[' + recordArr[0] + '] 加:[' + recordArr[2] + '] 点:[' + recordArr[3] + ']</div>';
                    }
                }
                html += '<div class="storm" data-id=' + val["match_id"] + '>';
                html += '<div class="gameTime">' + val["week_number"] + '·' + val["league_name"] + '</div>';
                html += '<div class="gameBeginTime">' + val["start_time"] + '</div>';
                recordArr = JSON.parse(val["record"]);
                let record_one, record_Two;
                if (recordArr[1]) {
                    record_one = Number(recordArr[1].split(':')[0]);
                    record_Two = Number(recordArr[1].split(':')[1]);
                }

                switch (val["elapsed"]) {
                    case "已完场":
                        if (record_one > record_Two) {
                            consequence = "胜"
                        } else if (record_one === record_Two) {
                            consequence = "平"
                        } else if (record_one < record_Two) {
                            consequence = "负"
                        }

                        if (val["handicap"]) {
                            let_ball = Number(val["handicap"]);
                            if ((record_one + let_ball) > record_Two) {
                                letConsequence = "让胜"
                            } else if ((record_one + let_ball) === record_Two) {
                                letConsequence = "让平"
                            } else if ((record_one + let_ball) < record_Two) {
                                letConsequence = "让负"
                            }
                        }
                        if (letConsequence && val["handicap"] === "+1" || letConsequence && val["handicap"] === "-1") {
                            html += '<div class="ifStart mimRed">(' + val["elapsed"] + '：' + consequence + ' + ' + letConsequence + ')</div>';
                            code_block();
                        } else {
                            html += '<div class="ifStart mimRed">(' + val["elapsed"] + '：' + consequence + ')</div>';
                            code_block();
                        }
                        break;
                    case "未开赛":
                        html += '<div class="ifStart mimMinor">(' + val["elapsed"] + ')</div>';
                        code_block();
                        break;
                    case "比赛中-中场":
                        html += '<div class="ifStart mimGreen">(' + val["elapsed"] + ')</div>';
                        code_block();
                        break;
                    case "加时":
                        html += '<div class="ifStart mimGreen">(' + val["elapsed"] + ')</div>';
                        code_block();
                        break;
                    case "推迟":
                        html += '<div class="ifStart mimMinor">(比赛' + val["elapsed"] + ')</div>';
                        break;
                    default:
                        html += '<div class="ifStart mimGreen">(比赛中----' + val["elapsed"] + '‘)</div>';
                        code_block();
                        break;
                }
                html += '<div class="host_team">【主队】<span>' + val["left_team"] + '</span> [' + val["left_score"] + ']</div>';
                if (val["is_vs"] === "1") {
                    html += '<div class="vs">VS</div>';
                } else if (val["is_vs"] === "0") {
                    html += '<div class="vs">' + JSON.parse(val["record"])[1] + '</div>';
                }
                html += '<div class="guest_team">【客队】<span>' + val["right_team"] + '</span> [' + val["right_score"] + ']</div>';
                html += '</div>';
            })
            html += '</div>';
        }
        return html;
    }

    let handicapHtml = $(".handicap");

    let showResult = () => {
        $(".analyseNotDiv").hide()
        $(".analyseShow").show();
    }
    //点击某场调用的函数
    let sonInit = dataId => {
        $(".loadingShow").show();
        $.promiseAjax("https://tt.taoerhuo.top/api/get/desc", {
            match_id: dataId
        }).then(ret => {
            if (ret.status === 200) {
                $(".loadingShow").hide();
                $(".particularsDiv").fadeIn(200);
                let retData = ret.data;
                handicap = Number(retData.handicap);//让球数
                let elapsed = retData.elapsed;//赛程
                let recordArr = JSON.parse(retData.record);//比分
                let elapsedHtml = $(".elapsed");
                let vsDetailsHtml = $(".vsDetails");
                //纸面实力数据
                sonData.principal.host = Number(retData.left_score);
                sonData.principal.guest = Number(retData.right_score);

                //vip数据
                if (retData.win_rate && retData.draw_rate && retData.lose_rate && retData.use_rq) {
                    sonData.vip.win = Number(retData.win_rate);
                    sonData.vip.flat = Number(retData.draw_rate);
                    sonData.vip.lose = Number(retData.lose_rate);
                    sonData.vip.type = retData.use_rq;
                } else {
                    sonData.vip.win = null;
                    sonData.vip.flat = null;
                    sonData.vip.lose = null;
                    sonData.vip.type = null;
                    vipHtml.html("暂未有数据~")
                }

                //百家平均初始赔率
                sonData.bjInit.win = Number(retData.baijia_chu.split("/")[0]);
                sonData.bjInit.flat = Number(retData.baijia_chu.split("/")[1]);
                sonData.bjInit.lose = Number(retData.baijia_chu.split("/")[2]);


                //百家平均即时赔率
                sonData.bjTimely.win = Number(retData.baijia_ji.split("/")[0]);
                sonData.bjTimely.flat = Number(retData.baijia_ji.split("/")[1]);
                sonData.bjTimely.lose = Number(retData.baijia_ji.split("/")[2]);


                //竞彩官方初始赔率
                sonData.jcInit.win = Number(retData.jingcai_chu.split("/")[0]);
                sonData.jcInit.flat = Number(retData.jingcai_chu.split("/")[1]);
                sonData.jcInit.lose = Number(retData.jingcai_chu.split("/")[2]);


                //竞彩官方即时赔率
                sonData.jcTimely.win = Number(retData.odds_europe.split(";")[0]);
                sonData.jcTimely.flat = Number(retData.odds_europe.split(";")[1]);
                sonData.jcTimely.lose = Number(retData.odds_europe.split(";")[2]);


                //威廉希尔初始赔率
                sonData.wlxInit.win = Number(retData.weilian_chu.split("/")[0]);
                sonData.wlxInit.flat = Number(retData.weilian_chu.split("/")[1]);
                sonData.wlxInit.lose = Number(retData.weilian_chu.split("/")[2]);


                //立博初始赔率
                sonData.wlbInit.win = Number(retData.libo_chu.split("/")[0]);
                sonData.wlbInit.flat = Number(retData.libo_chu.split("/")[1]);
                sonData.wlbInit.lose = Number(retData.libo_chu.split("/")[2]);


                //降赔公司
                sonData.company.win = Number(retData.win_num);
                sonData.company.flat = Number(retData.draw_num);
                sonData.company.lose = Number(retData.lose_num);

                //投注比
                sonData.bet.win = Number(retData.ratio_win);
                sonData.bet.flat = Number(retData.ratio_draw);
                sonData.bet.lose = Number(retData.ratio_visitor);

                //必发比
                sonData.betfair.win = Number(Math.floor(retData.betfair_win));
                sonData.betfair.flat = Number(Math.floor(retData.betfair_draw));
                sonData.betfair.lose = Number(Math.floor(retData.betfair_visitor));

                //凯利值
                sonData.kelly.win = Number(retData.kelly_win);
                sonData.kelly.flat = Number(retData.kelly_draw);
                sonData.kelly.lose = Number(retData.kelly_visitor);

                //离散值
                sonData.disperse.init = retData.dispersed_chu;
                sonData.disperse.initVal = Number(retData.dispersed_chu_cn);
                sonData.disperse.even = retData.dispersed_ji;
                sonData.disperse.evenVal = Number(retData.dispersed_ji_cn);
                switch (elapsed) {
                    case "已完场":
                        elapsedHtml.addClass("mimRed").removeClass("mimMinor").removeClass("mimGreen").html("赛程：" + elapsed);
                        vsDetailsHtml.html(recordArr[1]);
                        break;
                    case "未开赛":
                        elapsedHtml.addClass("mimMinor").removeClass("mimRed").removeClass("mimGreen").html("赛程：" + elapsed);
                        vsDetailsHtml.html("VS");
                        break;
                    case "比赛中-中场":
                        vsDetailsHtml.html(recordArr[1]);
                        elapsedHtml.addClass("mimGreen").removeClass("mimRed").removeClass("mimMinor").html("赛程：" + elapsed);
                        break;
                    case "比赛中-加时":

                        break;
                    case "推迟":
                        elapsedHtml.addClass("mimRed").removeClass("mimGreen").removeClass("mimMinor").html("赛程：" + elapsed);
                        vsDetailsHtml.html("VS");
                        break;
                    default:
                        vsDetailsHtml.html(recordArr[1]);
                        elapsedHtml.addClass("mimGreen").removeClass("mimRed").removeClass("mimMinor").html("赛程：比赛中----" + elapsed + "'");
                        break;
                }
                switch (handicap) {
                    case 0:
                        handicapHtml.html("").hide();
                        $(".analyseNotDiv").show()
                        $(".analyseShow").hide();
                        $(".analyseNot").html("请先选择让球数");
                        $(".analyze").show();
                        break;
                    case 1:
                        handicapHtml.html("(+1)").show();
                        showResult();
                        dataCompute();//数据计算
                        break;
                    case -1:
                        handicapHtml.html("(-1)").show();
                        showResult();
                        dataCompute();//数据计算
                        break;
                    default:
                        handicapHtml.html('(' + retData.handicap + ')').show();
                        $(".analyseNotDiv").show()
                        $(".analyseShow").hide();
                        $(".analyze").hide();
                        $(".analyseNot").html("让球数不在考虑范围内，不做判断");
                        break;
                }
                $(".host_teamDetails .host").html(retData.left_team);
                $(".guest_teamDetails .guest").html(retData.right_team);

            } else {
                $.prompt(ret.message, 'danger', 2000, false);
            }
        }, err => {
            $.messageBox('$alert', {
                title: '出错了！！！',
                content: '该条数据崩溃！请点确定挑选其余场次',
                buttonText: '确定',
                showClose: false,
                closeOnClickModal: false,
                callback: (function () {
                    location.reload();
                })
            });
        })
    }
    if (match_id) {
        sonInit(match_id);
    }

    //点击让球
    $(".analyze").on("click", function () {
        let dataType = $(this).attr("data-type");
        switch (dataType) {
            case "1":
                handicapHtml.html("(+1)").show();
                showResult();
                handicap = 1;
                break;
            case "2":
                handicapHtml.html("(-1)").show();
                handicap = -1;
                showResult()
                break;
        }
        dataCompute();//数据计算
    })

    //点击调用
    let swiperSelected = (e) => {
        $(".mySwiper .list").find(".storm").unbind("click").bind("click", function () {
            let dataId = $(this).attr("data-id");
            window.sessionStorage.setItem("match_id", dataId);
            sonInit(dataId);
        })
    }


    //页面初始化
    let init = () => {
        $.promiseAjax("https://tt.taoerhuo.top/api/get/list", {
            date: date,
        }).then(ret => {
            if (ret.status === 200) {
                $(".loadingShow").hide();
                let retData = ret.data;
                totalNumber = retData.length;
                let pagNumber = "";
                if (totalNumber > pageSize) {
                    pagNumber = Math.ceil(totalNumber / pageSize);
                } else {
                    pagNumber = 1;
                }
                if (pagNumber !== 1) {
                    $(".list").empty();
                    let retDataNew = retData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                    let html = appendHtml(retDataNew, pagNumber);
                    $(".mySwiper .list").append(html);
                    mySwiper = new Swiper(".mySwiper", {
                        pagination: {
                            el: ".swiper-pagination",
                            type: "fraction",
                        },
                        on: {
                            slideChangeTransitionEnd: function () {
                                $(".list").empty();
                                currentPage = this.activeIndex + 1;
                                retDataNew = retData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                                $(".mySwiper .list").append(appendHtml(retDataNew, pagNumber));
                            },
                            click: function (e) {
                                swiperSelected(e)
                            },
                            preventClicksPropagation: false
                        }
                    });
                } else {
                    $(".list").empty();
                    let html = appendHtml(retData, pagNumber);
                    $(".mySwiper .list").append(html);
                    mySwiper = new Swiper(".mySwiper", {
                        on: {
                            click: function (e) {
                                swiperSelected(e)
                            }
                        },
                        preventClicksPropagation: false
                    });
                }


            } else {
                MIM.prompt(ret.message, 'danger', 2000, false);
            }
        }, err => console.error(err));
    };
    init();

    //时间选择
    $("#timeSelect").on('click', 'ul li', function () {
        date = $(this).html();
        sessionStorage.setItem("keyTime", date)
        $(".list").empty();
        mySwiper.destroy(true, true);
        switch (user) {
            case "1":
                $(".mySwiper").css({
                    background: "#e4e7ed"
                })
                break;
        }
        $(".loadingShow").show();
        init();
        $(".particularsDiv").fadeOut(200);
    });

    //关闭
    $(".delOut").on("click", () => {
        //关闭小弹窗
        $(".firstShow").empty().hide();
        //关闭模态框
        $(".particularsDiv").fadeOut(200);
        window.sessionStorage.removeItem("match_id");
        handicap = "";
    });

    $(".firstShow").on("click", () => {
        $(".firstShow").empty().hide();
    })

    //主胜样式
    jQuery.fn.winStyle = function () {
        $(this).css({
            'color': '#F56C6C',
            'fontWeight': 'bolder',
        }).html("主胜");
    }

    //客队胜样式
    jQuery.fn.loseStyle = function () {
        $(this).css({
            'color': '#909399',
        }).html("主负");
    }

    //纸面实力计算
    let principalCount = (a, b) => {
        if (a && b) {
            if (a < b) {
                $(".power").winStyle();
                sonData.ordNum.win++
            } else {
                $(".power").loseStyle()
                sonData.ordNum.lose++
            }
        } else {
            $(".power").css({
                'color': '#8088A8',
            }).html("信息不全无法预测");
        }
    };
    //百家初盘与竞彩即盘分析
    let preliminaryContest = (a, b, c, d, e, f, g, h, i, j, k, l) => {
        let theoryProfit = (1 / a + 1 / b + 1 / c - 1).toFixed(3);

        let winLoss = 3 * a / (3 - theoryProfit * a);
        let pinkLoss = 3 * b / (3 - theoryProfit * b);
        let errLoss = 3 * c / (3 - theoryProfit * c);

        let winProbability = 1 / winLoss * 100;
        let pinkProbability = 1 / pinkLoss * 100;
        let errProbability = 1 / errLoss * 100;

        let winProfit = theoryProfit * winLoss / 3 * 100;
        let pinkProfit = theoryProfit * pinkLoss / 3 * 100;
        let errProfit = theoryProfit * errLoss / 3 * 100;

        let put = (1 / (Number(1 / d) + Number(1 / e) + Number(1 / f))).toFixed(4);

        let jcWinProfit = ((1 - put) * winLoss / 3).toFixed(4);
        let jcPinkProfit = ((1 - put) * pinkLoss / 3).toFixed(4);
        let jcErrProfit = ((1 - put) * errLoss / 3).toFixed(4);

        let jcWinLoss = winLoss / (1 + jcWinProfit) * 10;
        let jcPinkLoss = pinkLoss / (1 + jcPinkProfit) * 10;
        let jcErrLoss = errLoss / (1 + jcErrProfit) * 10;

        let badWin = (jcWinLoss - d).toFixed(2);
        let badPink = (jcPinkLoss - e).toFixed(2);
        let badErr = (jcErrLoss - f).toFixed(2);


        let conclusion = "";
        if (badWin > 0 && badPink > 0 && badErr > 0) {
            if (badWin <= badPink && badWin <= badErr) {
                if (Math.abs(badWin - badPink) > Math.abs(badWin - badErr)) {
                    if ((badErr - 0.28) < 0.1 && (badErr - 0.28) > 0 && (badWin - 0.28) < 0) {
                        conclusion = "推荐：很难平主推胜负（分胜负）主推负"
                    } else if ((badErr - 0.28) > 0 && (badErr - 0.28) < 0.1 && (badWin - 0.28) === 0) {
                        conclusion = "推荐：很难平主推胜负（分胜负）主推胜"
                    } else if ((badErr - 0.28) > 0.1 && Math.abs(badWin - 0.28) < Math.abs(badErr - 0.28)) {
                        conclusion = "推荐：很难平主推胜负（分胜负）主推胜"
                    } else {
                        conclusion = "推荐：很难平主推胜负（分胜负）"
                    }
                } else if (badErr > badPink && badErr > 0.5 && badErr < 1) {
                    conclusion = "推荐：负且可以博大负"
                } else if (badErr > badPink && badErr < 0.6) {
                    conclusion = "推荐：胜且可以博大胜"
                } else {
                    conclusion = "推荐：胜"
                }
            } else if (badWin > badPink && badWin > badErr) {
                if ((badWin - badPink) < (badWin - badErr)) {
                    conclusion = "推荐：平（若为-1则让负，若为+1则让平）"
                } else {
                    conclusion = "推荐：胜"
                }
            } else if (badWin < badPink && badPink > badErr) {
                conclusion = "推荐：主推平，次推让平"
            }
        } else if (badWin > 0 && badPink > 0 && badErr < 0) {
            if (badWin >= 0.5 && badPink <= 0.4 && (badWin - badPink) >= 0.1) {
                conclusion = "推荐：主胜"
            } else if (badWin === badPink) {
                conclusion = "推荐：主推胜，次推让平"
            } else {
                conclusion = "推荐：胜或平"
            }

        } else if (badWin > 0 && badPink < 0 && badErr < 0) {
            conclusion = "根据竞彩理论开赔数据与实际开赔数据比较，竞彩大幅降低了主胜赔率，同时大幅提高了平局和主负赔率，也就是实际赔率对平负几乎是毫无防备，显然主胜已经非常明显了。推荐：主胜，次推大胜"

        } else if (badWin <= 0 && badPink > 0 && badErr > 0) {
            conclusion = "推荐：平负"
            if (badPink > badErr) {
                conclusion = "推荐：平"
            } else if (badPink < badErr) {
                conclusion = "推荐：负"
            }
        } else if (badWin < 0 && badPink < 0 && badErr > 0) {
            conclusion = "根据竞彩理论开赔数据与实际开赔数据比较，竞彩大幅降低了客胜赔率，同时大幅提高了平局和主胜赔率，也就是实际赔率对胜平几乎是毫无防备，显然主负已经非常明显了。推荐：客胜，次推客大胜"
        } else if (badWin < 0 && badPink > 0 && badErr < 0) {
            conclusion = "根据竞彩理论开赔数据与实际开赔数据比较，竞彩大幅降低了平赔率，同时大幅提高了客胜和主胜赔率，也就是实际赔率对胜负几乎是毫无防备，显然平局已经非常明显了。推荐：平局。"
        }

        $(".message-particulars").html(conclusion);

        //威廉希尔
        let wlx_conclusion = "";
        if (g === 0 || h === 0 || i === 0) {
            wlx_conclusion = "未能输入数据或数据不全";
        } else if (h < 3.0) {
            wlx_conclusion = "平局概率大"
        } else if (h < 2.8) {
            wlx_conclusion = "主推：平"
        } else if (h === 3.0) {
            wlx_conclusion = "极少平局，可以不考虑平，平衡考虑主场优势获胜,特别注意主场低赔（小于2.4）趋势不清，2.25必须当心，主场2.4-2.45不能信，客场2.4-2.45可信度很高"
        } else if (h >= 3.1) {
            wlx_conclusion = "带尾巴的例如2.63 2.88等基本不出，2.4-2.45不能相信，2.5-2.6可以相信，2.7-2.8客场能信"
            if (g === 2.15) {
                wlx_conclusion = "主场低赔2.15赔有优势"
            }
            if (i <= 2.2 && i >= 2.1) {
                wlx_conclusion = "平局容易打出"
            }
        } else {
            wlx_conclusion = "不做判断";
        }

        //立博
        let wlb_conclusion = "";
        const wlbArr = [j, k, l];
        wlbArr.sort((a, b) => {
            return b - a
        });
        let wlbArrMax = wlbArr[0];//最大值
        let wlbArrCenter = wlbArr[1];//中间值
        let wlbArrMin = wlbArr[2];//最小值
        if (j === 0 || k === 0 || l === 0) {
            wlb_conclusion = "未能输入数据或数据不全";
        } else if (j >= 2 && j < 3 && k >= 3 && l >= 3 && k < 4 && l < 4) {
            if ((l - k) > 0.2) {
                wlb_conclusion = "80%概率不为负,推荐：胜或者平";
            }
        } else if (j >= 2 && j < 3 && k >= 3 && k < 4 && l >= 2 && l < 3) {
            if (wlbArrMin > 2.37 && (2.87 - wlbArrMin) > (2.87 - wlbArrCenter)) {
                wlb_conclusion = "接近2.87赔率一方不败率较高";
            } else {
                wlb_conclusion = "不做判断";
            }
        } else if (j === l) {
            wlb_conclusion = "打出主胜的可能性较小";
        } else {
            wlb_conclusion = "不做判断";
        }


        $(".firstShow").append("<img src=\"./images/out.png\" style=\"width: 24px;cursor: pointer;position: absolute;right: 12px\"\n" +
            "                 class=\"delOutFirstShow\"/>\n" +
            "            <p>机构理论利润率：<span>" + (theoryProfit * 100).toFixed(2) + "%</span></p>\n" +
            "            <p>机构合理赔率：主胜合理赔率：<span>" + winLoss.toFixed(2) + "</span>；平合理赔率：<span>" + pinkLoss.toFixed(2) + "</span>；客胜合理赔率：<span>" + errLoss.toFixed(2) + "</span></p>\n" +
            "            <p>机构合理的胜平负真实机率：主胜机率：<span>" + winProbability.toFixed(2) + "%</span>；平机率：<span>" + pinkProbability.toFixed(2) + "%</span>；客胜机率：<span>" + errProbability.toFixed(2) + "%</span></p>\n" +
            "            <p>机构合理的胜平负真实利润率：主胜利润率：<span>" + winProfit.toFixed(2) + "%</span>；平利润率：<span>" + pinkProfit.toFixed(2) + "%</span>；客胜利润率：<span>" + errProfit.toFixed(2) + "%</span></p>\n" +
            "            <br/>\n" +
            "            <p>竞彩官方赔付率：<span>" + (put * 100).toFixed(2) + "%</span></p>\n" +
            "            <p>竞彩官方利润率：竞彩主胜利润率：<span>" + (jcWinProfit * 100).toFixed(2) + "%</span>；竞彩平利润率：<span>" + (jcPinkProfit * 100).toFixed(2) + "%</span>；竞彩客胜利润率：<span>" + (jcErrProfit * 100).toFixed(2) + "%</span></p>\n" +
            "            <p>理论竞彩官方开出赔率：竞彩主胜赔率：<span>" + jcWinLoss.toFixed(2) + "</span>；竞彩平赔率：<span>" + jcPinkLoss.toFixed(2) + "</span>；竞彩客胜赔率：<span>" + jcErrLoss.toFixed(2) + "</span></p>\n" +
            "            <p>理论比实际：主胜：<span>" + badWin + "</span>；平：<span>" + badPink + "</span>；客胜：<span>" + badErr + "</span></p>\n" +
            "            <div style=\"margin-top: 20px\">\n" +
            "                <h2>数据总结：</h2>\n" +
            "                <p style=\"margin-top: 10px\">竞彩方向：<span>" + conclusion + "</span></p>\n" +
            "                <p>威廉希尔方向：<span>" + wlx_conclusion + " (" + g + "," + h + "," + i + ")</span></p>\n" +
            "                <p>立博方向：<span>" + wlb_conclusion + " (" + j + "," + k + "," + l + ")</span></p>\n" +
            "            </div>")

    }
    //vip数据分析
    let vipFn = (a, b, c, d) => {
        console.log(a, b, c, d);
        switch (d) {
            case "0":
                vipHtml.html(a + "人" + b + "人" + c + "人")
                break;
            case "1":

                break;
            case "2":

                break;
        }

    }

    //开始数据计算
    function dataCompute() {
        //纸面实力计算
        principalCount(sonData.principal.host, sonData.principal.guest);
        //实时欧洲指数分析

        //百家初盘与竞彩即盘分析
        preliminaryContest(sonData.bjInit.win, sonData.bjInit.flat, sonData.bjInit.lose,
            sonData.jcTimely.win, sonData.jcTimely.flat, sonData.jcTimely.lose,
            sonData.wlxInit.win, sonData.wlxInit.flat, sonData.wlxInit.lose,
            sonData.wlbInit.win, sonData.wlbInit.flat, sonData.wlbInit.lose,
        );

        // vip数据分析
        vipFn(sonData.vip.win, sonData.vip.flat, sonData.vip.lose, sonData.vip.type)


    }

    //生成详细信息
    $("#messageFn").on("click", () => {
        $(".firstShow").empty().show();
        //百家初盘与竞彩即盘分析
        preliminaryContest(sonData.bjInit.win, sonData.bjInit.flat, sonData.bjInit.lose,
            sonData.jcTimely.win, sonData.jcTimely.flat, sonData.jcTimely.lose,
            sonData.wlxInit.win, sonData.wlxInit.flat, sonData.wlxInit.lose,
            sonData.wlbInit.win, sonData.wlbInit.flat, sonData.wlbInit.lose,
        );
    })

})();



