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
    let vipResult = $(".vip-result");
    let vipCont = $(".vipContent");
    let date = "";//时间
    let totalNumber = "";//总条数
    let currentPage = 1; // 当前页码
    const pageSize = 10; //每页个数
    let newTime = Date.parse(new Date()) / 1000//当前最新时间戳
    let mySwiper = "";//设置swiper
    const sonData = {
        "vip": {win: "", flat: "", lose: "", type: ""},//vip数据胜平负
        "history": {winRate: "", winPlateRate: ""},//近十场历史交锋胜率、近十场历史交锋赢盘率
        "ordNum": {win: 0, flat: 0, lose: 0},//普通数据胜平负
        "impNum": {win: 0, flat: 0, lose: 0},//重要数据胜平负
        "bjInit": {win: "", flat: "", lose: ""},//百家竞彩初始赔率
        "bjTimely": {win: "", flat: "", lose: ""},//百家竞彩即时赔率
        "jcInit": {win: "", flat: "", lose: ""},//竞彩官方初始赔率
        "jcTimely": {win: "", flat: "", lose: ""},//竞彩官方即时赔率
        "wlxInit": {win: "", flat: "", lose: ""},//威廉希尔初始赔率
        "wlbInit": {win: "", flat: "", lose: ""},//立博初始赔率
        "company": {win: "", flat: "", lose: ""},//降赔公司
        "bet": {win: "", flat: "", lose: ""},//投注比.000
        "betfair": {win: "", flat: "", lose: ""},//必发比
        "kelly": {win: "", flat: "", lose: ""},//凯利值
        "disperse": {init: "", initVal: "", even: "", evenVal: ""},//离散
        "principal": {host: "", guest: ""},//纸面实力分析
        "water": {primaryDisc: "", meanDisc: "", rise: "", drop: "", tall: "", low: ""},//水位让球数据 初盘,即盘,升赔，降赔,高水，低水
        "rate": {z: "", f: ""},//本赛事近十场相同主客胜率
        "plate": {z: "", f: ""},//本赛事近十场相同主客赢盘率
    };//单场场次数据
    //abc 是赔率 bcd 是概率
    const organization = {
        'abc': {win: "", flat: '', lose: ''},
        'bcd': {win: "", flat: '', lose: ''}
    }

    let set = null // 定时器
    let bool = false;//是否开启同步数据
    let syTime = 5;//同步数据速度單位s
    let handicap = "";//让球数
    date = sessionStorage.getItem("keyTime") ? sessionStorage.getItem("keyTime") : MIM.timeFilter(newTime, '-', false);
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
            $(".vipContentBtn").show();
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
        let t = 6; //今天加上前6天
        let newsTime = date.getTime() - t * 24 * 60 * 60 * 1000
        for (let i = 0; i <= 24 * t; i += 24) {
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
        window.sessionStorage.clear();
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
                $('#timeSelect').find('input').val(date)
                $.each($("#timeSelect").find("ul li"), function (i, val) {
                    if ($(val).html() === date) {
                        $(val).addClass('pitch-select').siblings().removeClass('pitch-select')
                    }
                })
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
                html += '<div class="host_team mim-ellipsis">【主队】<span>' + val["left_team"] + '</span> [' + val["left_score"] + ']</div>';
                if (val["is_vs"] === "1") {
                    html += '<div class="vs">VS</div>';
                } else if (val["is_vs"] === "0") {
                    html += '<div class="vs">' + JSON.parse(val["record"])[1] + '</div>';
                }
                html += '<div class="guest_team mim-ellipsis">【客队】<span>' + val["right_team"] + '</span> [' + val["right_score"] + ']</div>';
                html += '<div style="margin-top: 12px"><mim-button data-league_name=' + val["league_name"] + ' data-left_team=' + val["left_team"] + ' data-right_team=' + val["right_team"] + ' data-start_time=\'' + val["start_time"] + '\' type="text" id="quiz">AI提问</mim-button></div>';
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
        switch (user) {
            case "1":
                vipCont.show();
                break;
            default:
                vipCont.hide();
                break;
        }

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
                //初始化数据总结
                sonData.ordNum.win = 0;
                sonData.ordNum.lose = 0;
                sonData.ordNum.flat = 0;

                sonData.impNum.win = 0;
                sonData.impNum.lose = 0;
                sonData.impNum.flat = 0;

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
                    vipResult.html("暂无")
                }

                //本赛事近十场相同主客胜率
                sonData.rate.z = Number(retData.status_win_home);
                sonData.rate.f = Number(retData.status_win_visitor);

                //本赛事近十场相同主客赢盘率
                sonData.plate.z = Number(retData.status_pan_home);
                sonData.plate.f = Number(retData.status_pan_visitor);

                //近十场历史交锋胜率
                sonData.history.winRate = Number(retData.history_win);
                //近十场历史交锋赢盘率
                sonData.history.winPlateRate = Number(retData.history_pan);

                //水位让球数据
                sonData.water.primaryDisc = retData.chu_pan.toString();//初盘让球数
                sonData.water.meanDisc = retData.ji_pan.toString();//即盘让球数
                sonData.water.rise = Number(retData.up_han_provider_num);//升赔
                sonData.water.drop = Number(retData.down_han_provider_num);//降赔
                sonData.water.tall = Number(retData.high_water);//即盘让球数
                sonData.water.low = Number(retData.low_water);//即盘让球数

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
                sonData.disperse.init = Number(retData.dispersed_chu);
                sonData.disperse.initVal = retData.dispersed_chu_cn;
                sonData.disperse.even = Number(retData.dispersed_ji);
                sonData.disperse.evenVal = retData.dispersed_ji_cn;
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
                        vipCont.hide();
                        $(".analyseNot").html("请先选择让球数")
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
                        vipCont.hide();
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
                content: '该条数据崩溃！请点确定刷新重试或挑选其余场次',
                buttonText: '确定',
                showClose: false,
                closeOnClickModal: false,
                callback: (function () {
                    window.sessionStorage.removeItem("match_id");
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
        }).on("click", "#quiz", function (e) {
            e.stopPropagation()
            let name = $(this).attr("data-league_name");
            let zhu = $(this).attr("data-left_team");
            let ke = $(this).attr("data-right_team");
            let timeStr = $(this).attr("data-start_time");
            let time = new Date(timeStr);
            let year = time.getFullYear();
            let month = time.getMonth() + 1;
            let day = time.getDate();
            let hour = time.getHours();
            let minute = time.getMinutes();
            if (minute < 10) {
                minute = "0" + minute;
            }
            let timeFormatted = year + "年" + month + "月" + day + "日 " + hour + ":" + minute;
            const textToCopy = '请根据最新数据查询分析预测一下北京时间' + timeFormatted + ' 举行的' + LeagueName(name) + '（请使用最新数据注意到数据的时间保证实时最新数据） （主队）' + zhu + '对战' + ke + '（客队） 请根据你能查询到的历史数据和近期球员表现数据，结合你查到的今天比赛需要的比赛场地和气候情况，以及两队近期（请结合最新的本年度本赛季本联赛的数据请查询天天盈球软件的官方最新数据（截止到我提问的时间）请写出二队的最新积分和排名情况）的分别在本赛季本联赛与其余队伍交手记录和球员状态数据以及球员伤病数据和主场优势数据和你所能查到的能够影响比赛结果的数据（例如盘口，赔率，凯利，必发，离散，同赔等数据）来给我分析一下最有可能的进球数范围（请尽可能缩小范围），及最有可能的比分结果（最好用泊松公式来计算，最好是最精确的2个比分结果），以及是否可以考虑双边进球，和胜平负和让球胜平负建议，以及半场胜平负的建议，最后请给我合理的建议，并对自己的建议内容分别做一个信心指数的分析（打分标准1-10分）。'

            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    MIM.prompt("复制成功", 'success', 2000, false);
                    var url = "https://www.bing.com/search?form=NTPCHT&ocid=msedgntp&cvid=41adc926f911461caf2fdc15616d99fe&ei=5&q=%E5%BF%85%E5%BA%94%E8%81%8A%E5%A4%A9";
                    window.open('microsoft-edge:' + url + '');
                })
                .catch((err) => {
                    MIM.prompt("复制失败", 'danger', 2000, false);
                });

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
                            // clickable: true,
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
        $(".particularsDiv").fadeOut(200);
        window.sessionStorage.removeItem("match_id");
        window.location.reload();
    });

    //关闭
    $(".delOut").on("click", () => {
        //关闭小弹窗
        $(".firstShow").empty().hide();
        $(".secondShow").empty().hide();
        $(".threeShow").hide();
        let inputs = $('.football_table_number input[type="tel"]:not([disabled])');
        inputs.each(function () {
            $(this).val("")
        });
        $(".goals-scored").html("")
        $(".goals-scored-number").html("")
        //关闭模态框
        $(".particularsDiv").fadeOut(200);
        window.sessionStorage.removeItem("match_id");
        handicap = "";
    });

    $(".firstShow").on("click", () => {
        $(".firstShow").empty().hide();
        console.log($(".firstShow").find('input'), "input 个数")
    })
    $(".secondShow").on("click", () => {
        $(".secondShow").empty().hide();
    })
    $(".threeShow .delOutShow").on("click", () => {
        $(".threeShow").hide();
        let inputs = $('.football_table_number input[type="tel"]:not([disabled])');
        inputs.each(function () {
            $(this).val("")
        });
        $(".goals-scored").html("")
        $(".goals-scored-number").html("")
    })
    $(".fourShow .delOutShow").on("click", () => {
        let element = $(".fourShow").find(".cell");
        $(".fourShow input").val("");
        $(".fourShow").hide()
        $(".fourShow .v-m").html("")
        if (element.hasClass("mimGreen") || element.hasClass("mimRed") || element.hasClass("mimBlue")) {
            element.removeClass("mimGreen mimRed mimBlue")
        }
        organization.abc.win = ''
        organization.abc.pink = ''
        organization.abc.lose = ''
        organization.bcd.win = ''
        organization.bcd.pink = ''
        organization.bcd.lose = ''

    })

    //主胜样式
    jQuery.fn.winStyle = function (a) {
        if (a) {
            $(this).css({
                'color': '#F56C6C',
                'fontWeight': 'bolder',
            }).html("主胜" + a + "%");
        } else {
            $(this).css({
                'color': '#F56C6C',
                'fontWeight': 'bolder',
            }).html("主胜");
        }
    };

    //颜色红加粗
    jQuery.fn.redCss = function () {
        $(this).css({
            'color': '#F56C6C',
            'fontWeight': 'bolder',
        });
    }

    //颜色绿加粗
    jQuery.fn.greenCss = function () {
        $(this).css({
            'color': '#67C23A',
            'fontWeight': 'bolder',
        });
    }

    //平样式
    jQuery.fn.flatStyle = function (a) {
        if (a) {
            $(this).css({
                'color': '#67C23A',
                'fontWeight': 'initial',
            }).html("平" + a + "%");
        } else {
            $(this).css({
                'color': '#67C23A',
                'fontWeight': 'initial',
            }).html("平");
        }
    }

    //客队胜样式
    jQuery.fn.loseStyle = function (a) {
        if (a) {
            $(this).css({
                'color': '#909399',
                'fontWeight': 'initial',
            }).html("主负" + a + "%");
        } else {
            $(this).css({
                'color': '#909399',
                'fontWeight': 'initial',
            }).html("主负");
        }
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

        //计算
        let conclusion = "";
        if (badWin > 0 && badPink > 0 && badErr > 0) {
            if (badWin <= badPink && badWin <= badErr) {
                if (Math.abs(badWin - badPink) > Math.abs(badWin - badErr) && badPink < 0.6) {
                    if ((badErr - 0.28) < 0.1 && (badErr - 0.28) > 0 && (badWin - 0.28) < 0) {
                        if (handicap === -1 && d > 2.0 && f > 2.0 && f < d) {
                            conclusion = "推荐：很难平主推胜负（分胜负）主推负 稳：让负（-1）1"
                        } else if (handicap === -1 && d > 2.0 && f > 2.0 && f > d && badPink < 0.5) {
                            conclusion = "推荐：很难平主推胜负（分胜负）主推 胜负若威廉希尔推荐平 则平为主主队不败"
                        } else if (handicap === 1 && d >= 2.0 && f >= 2.0 && d > f && (d - f) > 1) {
                            conclusion = "推荐：很难平主推胜负（分胜负）主推 胜稳受让胜"
                        } else if (handicap === -1 && d >= 1.8 && f >= 2.0 && d < f && badPink > 0.50) {
                            conclusion = "推荐：主推 平 稳平让平 博大胜"
                        } else if (handicap === -1 && d > 2.0 && f > 2.0 && f > d && badPink >= 0.5) {
                            conclusion = "推荐：主推 平 稳平让平"
                        } else if (handicap === 1 && d > 2.3 && f > 2.3 && f < d && badPink >= 0.4) {
                            conclusion = "推荐：主推 平 稳平让平"
                        } else if (handicap === -1 && d > 1.50 && f > 4 && badPink >= 0.4) {
                            conclusion = "推荐：主推 平 稳平让平"
                        } else {
                            conclusion = "推荐：很难平主推胜负（分胜负）22"
                        }
                    } else if ((badErr - 0.28) > 0 && (badErr - 0.28) < 0.1 && (badWin - 0.28) === 0) {
                        if (handicap === -1 && d > 2.0 && f > 2.0 && f > d) {
                            conclusion = "推荐：很难平主推胜负（分胜负）主推负 稳：让负（-1）3"
                        } else {
                            conclusion = "推荐：很难平主推胜负（分胜负）若主即大于1.90 推荐博负【主即：" + d + "】"
                        }
                    } else if ((badErr - 0.28) > 0.1 && Math.abs(badWin - 0.28) < Math.abs(badErr - 0.28)) {
                        if (handicap === -1 && d > 1.80 && d < 1.90 && badErr < 0.5 && badPink < 0.5) {
                            conclusion = "推荐：很难平主推胜负（分胜负）主推胜,且博让平(-1),让胜(-1)"
                        } else if (handicap === -1 && d > 1.80 && d < 1.90 && badErr >= 0.5 && badPink >= 0.5) {
                            conclusion = "推荐：很难平主推胜负（分胜负）主推负,且博大负,让负(-1)"
                        } else {
                            conclusion = "推荐：很难平主推胜负（分胜负）若主即大于2.0 推荐博负【主即：" + d + "】"
                        }
                    } else {
                        if (handicap === -1 && d > 1.30 && d < 1.60) {
                            conclusion = "推荐：很难平主推胜负（分胜负）主推胜,(若客队赔率在1.30-1.40之间可博让平（-1）)【主即：" + d + "】 "
                        } else if (handicap === 1 && d > 2.0 && f > 2.0 && (d - f) < 0.5) {
                            conclusion = "推荐：主场优势所以主推胜，（若理论比实际平最高则次推平）【主即：" + d + "】 "
                        } else {
                            conclusion = "推荐：很难平主推胜负（分胜负）11"
                        }
                    }
                } else if (badErr > badPink && badErr > 0.5 && badErr < 1) {
                    if (handicap === -1 && d >= 1.50 && d < 1.60 && badErr < 0.7) {
                        conclusion = "推荐：胜且可以博大胜;博单半全场:胜胜【主即：" + d + "】"
                    } else if (handicap === -1 && d === 1.50 && badErr < 1) {
                        conclusion = "推荐：胜;博单半全场:胜胜【主即：" + d + "】"
                    } else if (handicap === -1 && d > 1.50 && d < 1.60 && badErr > 0.7) {
                        conclusion = "推荐：负 且稳单让负;博单半全场:负负(个别可能胜)【主即：" + d + "】"
                    } else if (handicap === -1 && d > 1.60 && d < 1.70) {
                        conclusion = "推荐：负且可以博大负,稳单：-1负;【主即：" + d + "】"
                    } else if (handicap === -1 && d > 1.70 && d < 1.80 && badErr < 0.60) {
                        conclusion = "推荐：胜，大胜（主在1.70 - 1.80 之间）【主即：" + d + "】"
                    } else if (handicap === -1 && d > 1.80 && d < 1.90) {
                        conclusion = " 胜，平（主在1.80 - 1.90 之间）;若理论比实际客胜小于等于0.60考虑让负，否则考虑大胜【主即：" + d + "】"
                    } else if (handicap === -1 && d > 1.90 && d < 2.00 && badPink > 0.6) {
                        conclusion = "稳单：让负【主即：" + d + "】"
                    } else if (handicap === -1 && d > 2.00 && d < 2.10 && badErr < 1) {
                        conclusion = "稳单（若主即在2.00-2.10之间，且让球数走胜）：胜【主即：" + d + "】"
                    } else if (handicap === -1 && d > 1.70 && d < 2.00 && badPink <= 0.6) {
                        conclusion = "推荐：胜，大胜（主在1.70 - 1.80 之间）; 胜，平（主在1.80 - 1.90 之间）;稳单（若主即在1.90-2.00之间）：平让平，博半全场 平胜，负平。具体参考理论与实际值【主即：" + d + "】"
                    } else if (handicap === -1 && d > 2.00 && f > 2.00 && (f - d) < 1 && f > d) {
                        conclusion = "推荐：平，稳单平让平(-1) 博小球 0:0 2:1 1:0 1:1(极少会主队大胜)"
                    } else if (handicap === -1 && d < 1.50 && d > 1.40 && badPink < 0.5 && badErr > 0.6 && badErr < 1) {
                        conclusion = "推荐：平，稳单(-1)负(-1)平 博小球1:1 0:1"
                    } else if (handicap === -1 && d > 1.30 && d < 1.40 && badPink > 0.5 && badErr > 0.6 && badErr < 1) {
                        conclusion = "推荐：胜，博单(-1)胜"
                    } else if (handicap === -1 && d > 1.20 && d < 1.30 && badPink > 0.5 && badErr > 0.6 && badErr < 1) {
                        conclusion = "推荐：胜，博单(-1)胜"
                    } else if (handicap === -1 && d > 1.40 && d < 1.50 && badPink > 0.5 && badErr > 0.6 && badErr < 1) {
                        conclusion = "推荐：胜，博单(-1)平"
                    } else if (handicap === 1 && d > 2 && f > 2 && badWin < 0.2 && badErr > 0.5 && badErr < 1 && badPink < 0.2) {
                        conclusion = "推荐：胜，稳单(+1)胜"
                    } else {
                        conclusion = "推荐：负且可以博大负123"
                    }

                } else if (badErr > badPink && badErr < 0.6) {
                    if (handicap === 1 && f > 1.80 && f < 2.50) {
                        conclusion = "推荐：胜，稳单（+1）胜（极少数 +1平）稳+1胜 +1平"
                    } else if (handicap === 1 && f > 1.50 && f < 1.60) {
                        conclusion = "推荐：负（负即在1.50 -1.60 之间），博受让一球平（+1平）【客即：" + f + "】"
                    } else if (handicap === -1 && d >= 1.50 && d < 1.60) {
                        conclusion = "推荐：平（负即在1.50 -1.60 之间），稳单让一球平（-1平）【主即：" + d + "】"
                    } else if (handicap === -1 && d > 2.0 && f > 2.0 && f < 2.50 && (f - d) < 1) {
                        conclusion = "推荐：平，稳单（-1）负"
                    } else if (handicap === -1 && d >= 1.90 && d < 2.00 && (f - d) < 1.5) {
                        conclusion = "推荐：平，稳单（-1）负"
                    } else if (handicap === -1 && d > 1.70 && d < 1.80 && badErr > badWin && badErr < 0.5) {
                        conclusion = "推荐：负，稳单（-1）负"
                    } else if (handicap === 1) {
                        if (f > 1.70 && f < 1.80 && badErr < 0.50) {
                            conclusion = "推荐：胜且可以博大胜，稳单让胜（+1）【主即：" + d + "】"
                        } else if (f > 1.60 && f < 1.70 && badErr > 0.3) {
                            conclusion = "推荐：负且可以博大负【主即：" + d + "】"
                        } else {
                            conclusion = "推荐：暂无【主即：" + d + "】"
                        }

                    } else if (handicap === -1) {
                        if (d > 2.20 || d < 1.20) {
                            conclusion = "推荐：平，让负【主即：" + d + "】胜赔率诡异记得博平 让负"
                        } else if (d > 1.80 && badErr < 0.5 && badWin < 0.3) {
                            conclusion = "推荐：让负【主即：" + d + "】"
                        } else {
                            conclusion = "推荐：暂无【主即：" + d + "】综合看取胜"
                        }
                    }
                } else if (badErr > badPink && badPink > 0.6 && badErr > 1) {
                    if (handicap === -1 && d > 1.50) {
                        conclusion = "推荐：负且可以博大负，稳单（-1）负"
                    } else if (handicap === -1 && d < 1.30 && d > 1.20 && badErr > 2) {
                        conclusion = "推荐：胜且可以博大胜【主即：" + d + "】"
                    } else if (handicap === -1 && d > 1.30 && d < 1.40 && badErr > 2) {
                        conclusion = "推荐：胜【主即：" + d + "】"
                    } else if (handicap === -1 && d > 1.40 && d < 1.50 && badErr < 2 && badErr > 1.50) {
                        conclusion = "推荐：负，稳让负【主即：" + d + "】"
                    } else if (handicap === -1 && d > 1.30 && d < 1.40 && badErr < 1.50 && badErr > 1) {
                        conclusion = "推荐：胜，博让胜【主即：" + d + "】"
                    } else if (handicap === -1 && d > 1.30 && d < 1.40 && badErr > 1.50 && badErr < 2) {
                        conclusion = "推荐：平，让负【主即：" + d + "】（注意水位变化而改变）"
                    } else {
                        conclusion = "推荐：不明【主即：" + d + "】"
                    }
                } else {
                    if (handicap === -1 && d > 2.0 && f > 2.0 && (f - d) < 1) {
                        conclusion = "推荐：平，稳单平让平(-1) 博小球 0:0 1:1 1:0 【主即：" + d + "】"
                    } else if (handicap === -1 && d > 1.80 && f > 2.0 && badErr >= 1) {
                        conclusion = "推荐：负，稳单让负(-1) 博半全场 胜负 平负"
                    } else if (handicap === -1 && badWin < 0.1 && badErr >= 1) {
                        conclusion = "推荐：负，稳单让负(-1) 博半全场 胜负 平负"
                    } else if (handicap === -1 && badPink > 0.5 && badErr >= 0.5 && d > 1.80) {
                        conclusion = "推荐：负，稳单让负(-1) 【主即：" + d + "】"
                    } else if (handicap === -1 && badPink > 0.5 && badErr > 0.5 && badPink > badErr) {
                        conclusion = "推荐：负，稳单让负(-1) 【主即：" + d + "】（补充具体多分析数据）"
                    } else {
                        conclusion = "推荐：胜（补充：若理论比实际的平和客胜值相等相等的话博2:1,理论比实际的平大的话博胜一球，其余可博大胜）【主即：" + d + "】"
                    }
                }
            } else if (badWin > badPink && badWin > badErr) {
                if ((badWin - badPink) < (badWin - badErr)) {
                    if (handicap === -1 && d > 1.80 && d < 1.90) {
                        conclusion = "推荐：胜（博-1胜）极少数平 稳平让平"
                    } else if (handicap === -1 && d > 1.60 && d < 1.70 && badWin > 0.35) {
                        conclusion = "推荐：胜（博-1平）"
                    } else if (handicap === -1 && d > 1.60 && d < 1.70 && badWin < 0.35) {
                        conclusion = "推荐：负（稳-1负）"
                    } else if (handicap === -1 && d > 1.90 && d < 2.00) {
                        conclusion = "推荐：平（博-1平）"
                    } else if (handicap === -1 && f > 2.0 && d > f) {
                        conclusion = "推荐：平（稳-1负）博小球 0:0 1:1 0:1"
                    } else if (handicap === -1 && f > 2.0 && d > 2.0 && d < f && badWin >= 0.50) {
                        conclusion = "推荐：胜，博让胜【主即：" + d + "】"
                    } else if (handicap === 1 && f >= 1.90 && d > f) {
                        conclusion = "推荐：平（稳+1胜+1平）博小球 1:1 1:0 0:0 1:2"
                    } else if (handicap === 1 && badWin > 1 && badPink > 0.5 && badErr < 0.3 && f < 1.40 && f > 1.30) {
                        conclusion = "推荐：负 博（+1负）"
                    } else if (handicap === 1 && badWin > 1 && badWin < 1.50 && badPink > 0.5 && badErr < 0.3 && f > 1.70) {
                        conclusion = "推荐：平（稳+1胜）博 胜【客即：" + f + "】"
                    } else if (handicap === 1 && badWin < 0.5 && badWin > badPink && badErr < 0.3 && f > 1.70) {
                        conclusion = "推荐： 稳+1胜 博 胜 客队即不小于1.70【客即：" + f + "】"
                    } else if (handicap === 1 && f < 1.30) {
                        conclusion = "推荐： 负【客即：" + f + "】"
                    } else if (handicap === 1 && badWin > 0.6 && badPink > 0.3 && f > 1.60 && f < 1.70) {
                        conclusion = "推荐： 胜，稳受（+1）让胜【客即：" + f + "】"
                    } else {
                        conclusion = "推荐：平（若为-1则让负，若为+1则让平）【客即：" + f + "】"
                    }
                } else {
                    if (handicap === -1 && f > 2.0 && d > 2.0 && (f - d) < 1) {
                        conclusion = "推荐：平，稳让负"
                    } else if (handicap === -1 && f > 2.0 && d < 1.80 && d > 1.40) {
                        conclusion = "推荐：胜，若主即在1.40 - 1.50之间博让平【主即：" + d + "】"
                    } else if (handicap === 1 && f > 1.50 && f < 1.60 && d > 4.0) {
                        conclusion = "推荐：负，若负即在1.50 - 1.60之间博受让让负（+1）【负即：" + f + "】"
                    } else if (handicap === 1) {
                        if (f > 1.80 && f <= 1.90 && d > 3.0) {
                            conclusion = "推荐：负，若负即在1.80 - 1.90之间博让平【负即：" + f + "】"
                        } else {
                            conclusion = "推荐：暂无7777"
                        }
                    } else if (handicap === -1) {
                        conclusion = "推荐：胜777"
                    }
                }
            } else if (badWin < badPink && badPink > badErr) {
                if (handicap === -1 && f > 2.0 && d < 1.60 && d > 1.40) {
                    conclusion = "推荐：主推胜，博让平，稳平让平。"
                } else if (handicap === -1 && f > 2.0 && d > 2.0 && f > d && (f - d) < 1) {
                    conclusion = "推荐：主推负，稳让负。若客胜理论比实际接近0 （0~0.05之间）则考虑让平"
                } else if (handicap === 1 && f > 1.70 && d > 2.0 && badWin > badErr) {
                    conclusion = "推荐：主推胜，稳让胜(+1) 客即大于1.70不易打出。【客即：" + f + "】"
                } else if (handicap === -1 && d > 1.70 && d < 2.0 && badWin > badErr) {
                    conclusion = "推荐：主推胜，稳平让平 主即在 1.70-1.80（包含1.80） 之间 让平容易打出。主推负，稳让负 主即在 1.80 - 1.90（包含1.90） 之间 让负容易打出【主即：" + d + "】"
                } else if (handicap === -1 && d > 2.0 && badWin > badErr) {
                    conclusion = "推荐：主推胜。【主即：" + d + "】（注意：多方考虑）"
                } else {
                    conclusion = "推荐：主推平，次推让平 123"
                }
            } else if (badWin > badPink && badPink < badErr && badErr > badWin) {
                if (handicap === -1) {
                    if (d < 1.40 && d > 1.30 && f > d && badErr > 1 && badWin < 0.3) {
                        conclusion = "推荐：胜，博让平"
                    } else if (f > 2.0 && d > 2.0 && f > d && badErr > 0.5 & badWin < 0.3) {
                        conclusion = "推荐：负，稳让负"
                    } else if (d >= 1.30 && d < 1.40 && f > d && badErr > 0.3 && badErr <= 0.5 && badWin < 0.3) {
                        conclusion = "推荐负，稳单 让负"
                    } else if (d >= 1.2 && d < 1.60 && f > d && badErr >= 0.5 && badErr <= 1.5 && badWin < 0.3) {
                        conclusion = "推荐胜，博让胜"
                    } else if (d >= 1.4 && d < 1.50 && f > d && badErr >= 0 && badErr < 0.5 && badWin < 0.3) {
                        conclusion = "推荐:胜【主即：" + d + "】"
                    } else if (d >= 1.70 && d < 1.80 && f > d && badErr >= 0 && badErr < 0.5 && badWin <= 0.3) {
                        conclusion = "推荐:主推平 稳平让平【主即：" + d + "】"
                    } else {
                        conclusion = "新增 -1【主即：" + d + "】 "
                    }
                } else if (handicap === 1) {
                    if (f >= 1.60 && f < d && badErr < 0.4 && badWin < 0.3) {
                        conclusion = "推荐：胜，稳+1胜"
                    } else {
                        conclusion = "新增 +1【客即：" + f + "】"
                    }
                }
            }
        } else if (badWin > 0 && badPink > 0 && badErr < 0) {
            if (badWin >= 0.5 && badPink <= 0.4 && (badWin - badPink) >= 0.1) {
                if (handicap === -1) {
                    if (d > 1.60 && d < 1.70) {
                        conclusion = "推荐：主胜、主即赔在1.60 -1.70之间博大胜【主即：" + d + "】"
                    } else if (d > 1.90 && d < 2.0) {
                        conclusion = "推荐：主平、让平，容易平 主即赔在1.90 -2.00之间博平【主即：" + d + "】"
                    } else if (d > 1.70 && d < 1.80) {
                        conclusion = "推荐：稳让负 即赔在1.70 - 1.80之间博负【主即：" + d + "】"
                    } else if (d > 1.80 && d < 1.90) {
                        conclusion = "推荐：稳让负 即赔在1.80 - 1.90之间博平【主即：" + d + "】"
                    } else {
                        conclusion = "推荐：主胜3333"
                    }
                } else {
                    if (handicap === 1 && d > 2.0 && f > 2.0 && badWin >= 1) {
                        conclusion = "推荐：胜，稳单让胜(+1) 博半全场 胜胜 平胜"
                    } else {
                        conclusion = "推荐：主胜222"
                    }
                }
            } else if (badWin === badPink) {
                conclusion = "推荐：主推胜，次推让平,稳平让平"
            } else {
                if (handicap === -1) {
                    if (d < 1.60 && d > 1.50 && (badWin - badPink) > 0.2) {
                        conclusion = "推荐：胜，博让平(-1),让胜(-1) 胜即在1.50 - 1.60之间 【胜即：" + d + "】"
                    } else if (d <= 1.60 && d >= 1.50 && f > 3) {
                        conclusion = "推荐：胜，博让胜(-1) 胜即在1.50 - 1.60之间 【胜即：" + d + "】"
                    } else if (d > 2.10 && badPink >= 0.5) {
                        conclusion = "推荐：易平，让负 胜即在2.10之上 【胜即：" + d + "】"
                    } else if (d > 1.60 && d < 1.70) {
                        conclusion = "推荐：易平、主即赔在1.60 - 1.70之间博平 稳平让平 博 0:0 1:0【主即：" + d + "】"
                    } else if (d > 1.70 && d < 1.80) {
                        conclusion = "推荐：易胜、主即赔在1.70 - 1.80之间博平 稳平让平 博 0:0 1:0【主即：" + d + "】"
                    } else if (d > 1.90 && d < 2.00) {
                        conclusion = "推荐：主胜 易平、主即赔在1.90 - 2.0之间博平 稳平让平 博 0:0 1:0【主即：" + d + "】"
                    } else if (d > 1.40 && d < 1.50 && badWin < 0.50) {
                        conclusion = "推荐：易平、主即赔在1.40 - 1.50之间博平 稳平让平 博 1:1 1:0【主即：" + d + "】"
                    } else if (d > 1.30 && d < 1.40 && badWin < 0.30 && badPink > badWin && badErr > -0.20) {
                        conclusion = "推荐：易平、主即赔在1.30 - 1.40之间博平 稳平让平 博 1:1 1:0【主即：" + d + "】"
                    } else if (d > 1.80 && d < 1.90 && badWin < 0.50 && badPink < badWin) {
                        conclusion = "推荐：易负、主即赔在1.80 - 1.90之间博负 稳让负 【主即：" + d + "】"
                    } else if (d > 1.80 && d < 1.90 && badPink > 0.50 && badPink < 1 && badPink > badWin) {
                        conclusion = "推荐：易平、主即赔在1.80 - 1.90之间博负 稳让负 【主即：" + d + "】"
                    } else if (d > 1.80 && d < 1.90 && badPink < 0.50 && badWin < 1 && badPink < badWin) {
                        conclusion = "推荐：易平、主即赔在1.80 - 1.90之间博负 稳让负 【主即：" + d + "】"
                    } else if (d <= 1.40 && badWin < 0.30 && badPink > badWin && badErr <= -0.20) {
                        conclusion = "推荐：易胜、主即赔在1.40之下 博让胜【主即：" + d + "】"
                    } else {
                        conclusion = "推荐：胜或平【主即：" + d + "】主即赔在1.40之下易胜、 博让胜 大于2.0的博平"
                    }
                } else if (handicap === 1) {
                    if (badWin > 1 && badPink < 0.5 && d > 2.0 && f > d) {
                        conclusion = "推荐：负 博单 (+1) 负"
                    } else {
                        conclusion = "推荐：胜或平（稳+1胜）"
                    }
                }
            }

        } else if (badWin > 0 && badPink < 0 && badErr < 0) {
            if (handicap === -1) {
                conclusion = "根据竞彩理论开赔数据与实际开赔数据比较，竞彩大幅降低了主胜赔率，同时大幅提高了平局和主负赔率，也就是实际赔率对平负几乎是毫无防备，显然主胜已经非常明显了。推荐：主胜，次推大胜。若主即赔在1.50(不含)-1.60之间需要额外注意反买，即主平（-1）让负【主即：" + d + "】"
            } else {
                conclusion = "根据竞彩理论开赔数据与实际开赔数据比较，竞彩大幅降低了主胜赔率，同时大幅提高了平局和主负赔率，也就是实际赔率对平负几乎是毫无防备，显然主胜已经非常明显了。推荐：主胜，次推大胜。"
            }
        } else if (badWin <= 0 && badPink > 0 && badErr > 0) {
            if (badPink > badErr) {
                if (handicap === -1) {
                    conclusion = "推荐：平的概率很大"
                } else if (handicap === 1) {
                    conclusion = "推荐：平局容易出 ，若+1 则 +1胜"
                }
            } else if (badPink < badErr) {
                if (handicap === -1 && d > f && f > 2.0 && badWin < 0) {
                    conclusion = "推荐：机构开出让一球，但即时水位主比客大，看好主队不败并有可能胜，稳主胜、平 博单让胜，具体看分析结合威廉希尔"
                } else if (handicap === 1 && f > 1.30 && f < 1.40) {
                    conclusion = "推荐：负，(若客队赔率在1.30-1.40之间可博让平（+1）)【客即：" + f + "】"
                } else if (handicap === 1 && f > 1.55 && f < 1.60 && badWin > -0.5) {
                    conclusion = "推荐：少数若客队赔率在1.55-1.60之间且主胜大于-0.5注意要反买，推荐主受让胜（+1）)【客即：" + f + "】"
                } else if (handicap === 1 && f > 1.40 && f < 1.50) {
                    conclusion = "推荐：负，(若客队赔率在1.40-1.50之间且主胜小于-0.5注意可以博大负，推荐博单让负（+1）)【客即：" + f + "】"
                } else if (handicap === 1 && f > 1.30 && f < 1.60) {
                    conclusion = "推荐：负，(若客队赔率在1.30-1.40之间可博让平（+1），少数若客队赔率在1.50-1.60之间且主胜大于等于-0.5注意要反买，推荐主受让胜（+1）)【客即：" + f + "】"
                } else if (handicap === 1 && f < d && badPink < 0.5 && badErr > 0.6 && f >= 1.80 && f < 2) {
                    conclusion = "推荐：平,让平（+1），稳平负，博半全场负平,平平 若威廉希尔不考虑平局则为大负【客即：" + f + "】"
                } else if (handicap === 1 && f < d && badPink < 0.5 && badErr > 0.6 && f >= 2 && f < 2) {
                    conclusion = "推荐：胜,稳让胜（+1） 【客即：" + f + "】"
                } else if (handicap === 1 && f < d && f < 2.0 && badErr > 0.5) {
                    conclusion = "推荐：负,博（+1）让平【客即：" + f + "】"
                } else if (handicap === 1 && f < d && f < 2.0 && badErr < 0.5) {
                    conclusion = "推荐：平,稳单平让平【客即：" + f + "】"
                } else if (handicap === 1 && f < d && f >= 2.0 && badErr < 0.5) {
                    conclusion = "推荐：胜,稳（+1）胜【客即：" + f + "】"
                } else if (handicap === 1 && f < d && f >= 2.0 && badErr > 0.6 && badWin < -0.2) {
                    conclusion = "推荐：负,博（+1）平【客即：" + f + "】"
                } else if (handicap === -1 && f > d && f >= 2.0 && badErr > 0.6 && badErr <= 1 && badWin > -0.2) {
                    conclusion = "推荐：胜,博（-1）平【客即：" + f + "】"
                } else {
                    conclusion = "推荐：负(稳 -1 负,博 +1 负)"
                }
            }
        } else if (badWin < 0 && badPink < 0 && badErr > 0) {
            if (handicap === 1) {
                conclusion = "根据竞彩理论开赔数据与实际开赔数据比较，竞彩大幅降低了客胜赔率，同时大幅提高了平局和主胜赔率，也就是实际赔率对胜平几乎是毫无防备，显然主负已经非常明显了。推荐：客胜，次推客大胜。若客队即赔在1.50-1.60之间需要额外注意反买，" +
                    "即平主队（+1）让胜【客即：" + f + "】，若理论比实际主胜非常小小于 -1 则有平局可能"
            } else {
                conclusion = "根据竞彩理论开赔数据与实际开赔数据比较，竞彩大幅降低了客胜赔率，同时大幅提高了平局和主胜赔率，也就是实际赔率对胜平几乎是毫无防备，显然主负已经非常明显了。推荐：客胜，次推客大胜。"
            }
        } else if (badWin < 0 && badPink > 0 && badErr < 0) {
            conclusion = "根据竞彩理论开赔数据与实际开赔数据比较，竞彩大幅降低了平赔率，同时大幅提高了客胜和主胜赔率，也就是实际赔率对胜负几乎是毫无防备，显然平局已经非常明显了。推荐：平局。"
        } else if (badWin > 0 && badPink < 0 && badErr > 0) {
            if (handicap === 1) {
                conclusion = "暂无"
            } else if (handicap === -1) {
                if (badWin < 0.3 && badErr < 0.3 && badErr < badWin && d < 1.30) {
                    conclusion = "主场赔率非常小异常注意反 推荐让负【主即：" + d + "】"
                } else if (badWin < 0.3 && badErr > 0.6 && badErr < 1 && d < 1.30) {
                    conclusion = "推荐胜，大胜【主即：" + d + "】"
                }

            }
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

        $(".firstShow").append("<img src=\"./images/out.png\" class='delOutShow'>\n" +
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

        //abc 是赔率 bcd 是概率
        organization.abc.win = Number(winLoss.toFixed(2))
        organization.abc.pink = Number(pinkLoss.toFixed(2))
        organization.abc.lose = Number(errLoss.toFixed(2))

        organization.bcd.win = Number(winProbability.toFixed(2))
        organization.bcd.pink = Number(pinkProbability.toFixed(2))
        organization.bcd.lose = Number(errProbability.toFixed(2))

    }
    //开始计算价值分析结果
    $(".beginCalculateResult").on("click", () => {
        //机构赔率
        let a = organization.abc.win
        let b = organization.abc.pink
        let c = organization.abc.lose
        //机构概率
        let d = organization.bcd.win
        let e = organization.bcd.pink
        let f = organization.bcd.lose
        //泊松获取到的赔率
        let sp = Number($(".abc_i-s-p").val())
        let pp = Number($(".abc_i-p-p").val())
        let fp = Number($(".abc_i-f-p").val())
        //泊松获取到的概率
        let sg = Number($(".bcd_i-s-g").val())
        let pg = Number($(".bcd_i-p-g").val())
        let fg = Number($(".bcd_i-f-g").val())
        if (sp && pp && fp && sg && pg && fg) {
            // console.log(a, b, c, d, e, f, "111111111")
            // console.log(sg, pg, fg, sp, pp, fp, "222222")
            //概率价值
            let aa = Number(((sg - d) / d).toFixed(4))
            let bb = Number(((pg - e) / e).toFixed(4))
            let cc = Number(((fg - f) / f).toFixed(4))
            //赔率价值
            let dd = Number(((a - sp) / sp).toFixed(4))
            let ee = Number(((b - pp) / pp).toFixed(4))
            let ff = Number(((c - fp) / fp).toFixed(4))
            $(".aa_v-m").html((aa * 100).toFixed(2) + '%')
            $(".bb_v-m").html((bb * 100).toFixed(2) + '%')
            $(".cc_v-m").html((cc * 100).toFixed(2) + '%')
            $(".dd_v-m").html((dd * 100).toFixed(2) + '%')
            $(".ee_v-m").html((ee * 100).toFixed(2) + '%')
            $(".ff_v-m").html((ff * 100).toFixed(2) + '%')
            //综合价值
            let zh_aa = Number(((aa + dd) / 2 * 100).toFixed(2))
            let zh_bb = Number(((bb + ee) / 2 * 100).toFixed(2))
            let zh_cc = Number(((cc + ff) / 2 * 100).toFixed(2))
            $(".zh_aa_v-m").html(zh_aa)
            $(".zh_bb_v-m").html(zh_bb)
            $(".zh_cc_v-m").html(zh_cc)
            if (zh_aa > 0 && zh_aa >= 20) {
                $(".zh_aa_v-m").addClass("mimGreen")
                $(".beginCalculateResult_v-m").addClass("mimGreen").html("胜")
            }
            if (zh_bb > 0 && zh_bb >= 20) {
                $(".zh_bb_v-m").addClass("mimBlue")
                $(".beginCalculateResult_v-m").addClass("mimBlue").html("平")
            }
            if (zh_cc > 0 && zh_cc >= 20) {
                $(".zh_cc_v-m").addClass("mimRed")
                $(".beginCalculateResult_v-m").addClass("mimRed").html("负")
            }
            if (zh_aa < 20 && zh_bb < 20 && zh_cc < 20) {
                $(".beginCalculateResult_v-m").html("没有价值或价值过低不建议购买")
            }
        } else {
            $.prompt('请输入完整数据', 'danger', 2000, false);
        }

    });
    //点击打开总进球数的分析
    $("#goalsFn").on("click", () => {
        $(".threeShow").show();
    });

    //是否开启客队数据的按钮
    let toggles = document.querySelectorAll(".toggle");


    toggles.forEach(function (toggle) {
        toggle.addEventListener("click", function () {
            let toggleId = $("#" + toggle.id);
            if (toggle.checked) {
                // Switch is checked
                console.log("Switch " + toggle.id + " is on");
                toggleId.parent().parent().parent().nextAll().eq(0).children().find('input')
                    .attr("disabled", "disabled").val("禁用")
                toggleId.parent().parent().parent().nextAll().eq(1).children().find('input')
                    .attr("disabled", "disabled").val("禁用")
                toggleId.parent().parent().parent().nextAll().eq(2).children().find('input')
                    .removeAttr("disabled").val("")
                toggleId.parent().parent().parent().nextAll().eq(3).children().find('input')
                    .removeAttr("disabled").val("")
            } else {
                // Switch is not checked
                console.log("Switch " + toggle.id + " is off");
                toggleId.parent().parent().parent().nextAll().eq(3).children().find('input')
                    .attr("disabled", "disabled").val("禁用")
                toggleId.parent().parent().parent().nextAll().eq(2).children().find('input')
                    .attr("disabled", "disabled").val("禁用")
                toggleId.parent().parent().parent().nextAll().eq(1).children().find('input')
                    .removeAttr("disabled").val("")
                toggleId.parent().parent().parent().nextAll().eq(0).children().find('input')
                    .removeAttr("disabled").val("")
            }
        });
    });

    //计算进球数
    $(".beginCalculate").on("click", () => {
        const hp = 1.5; // 主场进球参数
        const kp = 2; // 客场进球参数
        const hs = 1.5; // 主场失球参数
        const ks = 1; // 客场失球参数
        const inputs = $('.football_table_number input[type="tel"]:not([disabled])');
        let isEmpty = false;
        inputs.each(function () {
            if (!$(this).val().trim()) {
                isEmpty = true;
                return false;
            }
        });
        if (isEmpty) {
            MIM.prompt("表单中包含空值", "danger", 3000, false);
        } else {
            const homeArr = columnSum($("#calculate-table"));
            const visitingArr = columnSum($("#visiting-table"));
            const goalNumber = goalSum(homeArr[0], homeArr[3], hp, kp); // 主队5场进球平均值
            const fumbleNumber = fumble(homeArr[1], homeArr[2], hs, ks); // 主队5场失球平均值
            const k_goalNumber = goalSum(visitingArr[0], visitingArr[3], hp, kp); // 客队5场进球平均值
            const k_fumbleNumber = fumble(visitingArr[1], visitingArr[2], hs, ks); // 客队5场失球平均值
            $(".goals-scored").html("所计算的总进球数");
            $(".goals-scored-number").html(goalsScoredNumber(goalNumber, fumbleNumber, k_goalNumber, k_fumbleNumber));
        }
    });


    //每列的数据和
    let columnSum = ret => {
        let arr = [];
        ret.each(function () { // 遍历每个表格
            let colCount = $(this).find('tr:first td').length; // 获取表格列数
            let columnSum = new Array(colCount).fill(0); // 初始化每列之和为 0
            $(this).find('tr').each(function (rowIndex) { // 遍历表格中的每一行
                $(this).find('td').each(function (colIndex) { // 遍历当前行中的每个单元格
                    let cellValue = parseFloat($(this).find('input').val() || 0);
                    if (!isNaN(cellValue)) { // 如果单元格中的值可以转换为数字
                        columnSum[colIndex] += cellValue; // 将单元格中的数字加入到列的总和中
                    }
                });
            });
            for (let i = 0; i < colCount; i++) {
                arr.push(columnSum[i]);
            }
            return arr
        });
        return arr.slice(2)
    }
    //进球比数
    const goalSum = (a, b, c, d) => {
        const sum = (Number(a) * Number(c) + Number(b) * Number(d)) / 5;
        return Number(sum.toFixed(2));
    };
    //失球比数
    const fumble = (a, b, c, d) => {
        const sum = (Number(a) * Number(c) + Number(b) * Number(d)) / 5;
        return Number(sum.toFixed(2));
    };
    //计算进球数的函数
    let goalsScoredNumber = (a, b, c, d) => {
        const sum1 = ((Number(a) + Number(d)) / 2).toFixed(2)
        const sum2 = ((Number(b) + Number(c)) / 2).toFixed(2)
        let sum = ((Number(sum1) + Number(sum2)) / 2).toFixed(3)
        return sum
    }
    //初盘即盘数据展示
    const TRANSITION_MAP = {
        "0": "平手(0)",
        "0/0.5": "平/半(0/0.5)",
        "0.5": "半球(0.5)",
        "0.5/1": "半/一(0.5/1)",
        "1": "一球(1)",
        "1.5": "一球半(1.5)",
        "1/1.5": "一球/一球半(1/1.5)",
        "1.5/2": "一球半/两球(1.5/2)",
        "2": "两球(2)",
        "2/2.5": "两球/两球半(2/2.5)",
        "2.5": "两球半(2.5)",
        "-0/0.5": "受平/半(-0/0.5)",
        "-0.5": "受半球(-0.5)",
        "-0.5/1": "受半/一(-0.5/1)",
        "-1": "受一球(-1)",
        "-1.5": "受一球半(-1.5)",
        "-1/1.5": "受一球/受一球半(-1/-1.5)",
        "-1.5/2": "受一球半/受两球(-1.5/-2)",
        "-2": "受两球(-2)"
    };

    const transitionFn = (ret) => {
        return TRANSITION_MAP[ret] || ret;
    };


    //vip数据分析
    let vipFn = (a, b, c, d) => {
        if (a === 0 && b === 0 || a === 0 && c === 0 || b === 0 & c === 0) {
            vipHtml.html("数据不全暂不预判~")
            vipResult.html("暂无")
        } else {
            switch (d) {
                case "0":
                    vipHtml.html("主让胜" + a + "%；让平" + b + "%；让客胜" + c + "%");
                    let h = (a + b + c);
                    let a_probability = (a / h * 100).toFixed(0);
                    let b_probability = (b / h * 100).toFixed(0);
                    let c_probability = (c / h * 100).toFixed(0);
                    const probability_arr = [a_probability, b_probability, c_probability];
                    probability_arr.sort((a, b) => {
                        return b - a
                    });
                    let aArrMax = probability_arr[0];//最大值

                    if (aArrMax === a_probability) {
                        vipResult.html("让主胜：" + a_probability + "%")
                    } else if (aArrMax === b_probability) {
                        vipResult.html("让平：" + b_probability + "%")
                    } else if (aArrMax === c_probability) {
                        vipResult.html("让客胜：" + c_probability + "%")
                    }
                    break;
                case "1":
                    vipHtml.html("主胜" + a + "%；平" + b + "%；客胜" + c + "%");
                    const clArr = [a, b, c];
                    clArr.sort((a, b) => {
                        return b - a
                    });
                    let clArrMax = clArr[0];//最大值
                    if (clArrMax === a) {
                        vipResult.html("主胜：" + a + "%");
                    } else if (clArrMax === b) {
                        vipResult.html("平：" + b + "%");
                    } else if (clArrMax === c) {
                        vipResult.html("客胜：" + c + "%");
                    }
                    break;
                case "2":
                    vipHtml.html("让主胜" + a + "%；让平" + b + "%；让客胜" + c + "%");
                    const blArr = [a, b, c];
                    blArr.sort((a, b) => {
                        return b - a
                    });
                    let blArrMax = blArr[0];//最大值
                    if (blArrMax === a) {
                        vipResult.html("让主胜：" + a + "%");
                    } else if (blArrMax === b) {
                        vipResult.html("让平：" + b + "%");
                    } else if (blArrMax === c) {
                        vipResult.html("让客胜：" + c + "%");
                    }
                    break;
            }
        }
    }
    //水位让球数分析 初盘,即盘,升赔，降赔,高水，低水函数
    let waterConcedeFn = (a, b, c, d, e, f) => {
        let waterHtml = "";
        let riseHtml = "";
        let loseHtml = "";
        let ofHtml = "";
        if (c > d && (c - d) >= 3) {
            riseHtml = "初赔大于即赔，则看好初盘（" + transitionFn(a) + "）<span class='mimRed mim-fontBold-16'>【升盘】</span>"
        } else if (c >= d) {
            riseHtml = "初赔略大于或等于即赔，但相差不多，则看好初盘（" + transitionFn(a) + "）<span class='mimWhite mim-fontBold-16'>【盘口不变】</span>"
        } else if (c < d && (d - c) >= 3) {
            riseHtml = "即赔大于初赔，则看好初盘（" + transitionFn(a) + "）<span class='mimMinor mim-fontBold-16'>【降盘】</span>"
        } else if (c <= d) {
            riseHtml = "即赔大于或等于初赔，但相差不多，则看好初盘（" + transitionFn(a) + "）<span class='mimWhite mim-fontBold-16'>【盘口不变】</span>"
        }

        if (e > f && (e - f) >= 3) {
            loseHtml = "高水大于低水，则看好即盘（" + transitionFn(b) + "）<span class='mimRed mim-fontBold-16'>【升水】</span>"
        } else if (e >= f) {
            loseHtml = "高水略大于或等于低水，但相差不多，则看好即盘（" + transitionFn(b) + "）<span class='mimWhite mim-fontBold-16'>【平】</span>"
        } else if (e < f && (f - e) >= 3) {
            loseHtml = "低水大于高水，则看好即盘（" + transitionFn(b) + "）<span class='mimMinor mim-fontBold-16'>【降水】</span>"
        } else if (e <= f) {
            loseHtml = "低水略大于或等于高水，但相差不多，则看好即盘（" + transitionFn(b) + "）<span class='mimWhite mim-fontBold-16'>【平】</span>"
        }

        if (handicap === -1) {
            if (a === b) {
                ofHtml = "分析：【实际盘口无变化，盘口不变，升水走上盘;】"
            } else {
                ofHtml = "分析：【实际盘口有变化，具体 升盘升水走上盘，降盘升水走下盘，升盘平走上盘，升盘降水走下盘  】"
            }
        } else {
            if (a === b) {
                ofHtml = "分析：暂无"
            } else {
                ofHtml = "分析：暂无"
            }
        }

        waterHtml = "解读：主队如果为让（" + handicap + "）球，则看到初盘为（" + transitionFn(a) + "），且" + riseHtml + ";即盘为（" + transitionFn(b) + "），且" + loseHtml;

        $(".message-water-level").html(waterHtml);

        $(".secondShow").append($("<img src=\"./images/out.png\" class=\"delOutShow\"/>\n" +
            "            <div style=\"text-align: center;margin: 48px auto 24px;\">\n" +
            "                <mim-table style=\"text-align: center\" border=\"true\" id=\"secondShow-table\">\n" +
            "                    <table class=\"mim-table mim-table-header-wrapper\">\n" +
            "                        <tr>\n" +
            "                            <th class=\"is-leaf\" width=\"360\">\n" +
            "                                <div class=\"cell\">初盘</div>\n" +
            "                            </th>\n" +
            "                            <th class=\"is-leaf\" width=\"360\">\n" +
            "                                <div class=\"cell\">即盘</div>\n" +
            "                            </th>\n" +
            "                        </tr>\n" +
            "\n" +
            "                    </table>\n" +
            "                    <table class=\"mim-table mim-table-body-wrapper\">\n" +
            "                        <tr>\n" +
            "                            <td class=\"is-leaf\" width=\"120\">\n" +
            "                                <div class=\"cell\">初赔：<b class=\"mimRed v-m\">" + c + "</b></div>\n" +
            "                            </td>\n" +
            "                            <td class=\"is-leaf\" width=\"120\">\n" +
            "                                <div class=\"cell\">" + transitionFn(a) + "</div>\n" +
            "                            </td>\n" +
            "                            <td class=\"is-leaf\" width=\"120\">\n" +
            "                                <div class=\"cell\">即赔：<b class=\"mimGreen v-m\">" + d + "</b></div>\n" +
            "                            </td>\n" +
            "                            <td class=\"is-leaf\" width=\"120\">\n" +
            "                                <div class=\"cell\">高水：<b class=\"mimRed v-m\">" + e + "</b></div>\n" +
            "                            </td>\n" +
            "                            <td class=\"is-leaf\" width=\"120\">\n" +
            "                                <div class=\"cell\">" + transitionFn(b) + "</div>\n" +
            "                            </td>\n" +
            "                            <td class=\"is-leaf\" width=\"120\">\n" +
            "                                <div class=\"cell\">低水：<b class=\"mimGreen v-m\">" + f + "</b></div>\n" +
            "                            </td>\n" +
            "                        </tr>\n" +
            "                    </table>\n" +
            "                </mim-table>\n" +
            "                <div class=\"mimGold mim-font-16 peroration\">" + waterHtml + "</div>\n" +
            "                <div class=\"mimGold mim-font-14 peroration\">" + ofHtml + "</div>\n" +
            "            </div>"))
    }

    //近十场主客胜率/赢盘率分析函数
    let winPlateRateFn = (a, b, c, d) => {
        let winPlateRateHtml = "暂无分析~";
        if (handicap === -1) {
            if (a >= 50 && (a - b) >= 20 && (a - b) < 40) {
                if (c >= 50 && d < 50) {
                    winPlateRateHtml = "参考：胜；博(-1)胜"
                } else if (c === 50 && d === 50) {
                    winPlateRateHtml = "参考：易平需注意"
                } else if (c > 50 && d > 50 && c < d) {
                    winPlateRateHtml = "参考：胜；博(-1)胜"
                } else if (c > 50 && d > 50 && c > d) {
                    winPlateRateHtml = "参考：负，稳让负"
                } else if (c >= 50 && d >= 50 && d > c) {
                    winPlateRateHtml = "参考：胜；博(-1)平；稳平让平"
                }
            } else if (a >= 50 && (a - b) > 40) {
                if (c > 50 && c > d) {
                    winPlateRateHtml = "参考：胜；博(-1)胜"
                } else if (d > 50 && d > c) {
                    winPlateRateHtml = "参考：负，稳让负"
                }
            } else if (a >= 50 && (a - b) === 40) {
                winPlateRateHtml = "参考：容易平"
            } else if (a < 50 && b < 50 && a >= 10 && b >= 10 && a === b) {
                if (c <= 50 && d >= 50 && (d - c) < 40) {
                    winPlateRateHtml = "参考：胜"
                } else if (c <= 50 && d <= 50 && d > c) {
                    winPlateRateHtml = "参考：平或让平 胜"
                } else if (c <= 50 && d <= 50 && c > d) {
                    winPlateRateHtml = "参考：让平或平 负"
                } else if (c === d) {
                    winPlateRateHtml = "参考：平"
                }
            } else if (a < 50 && b < 50 && a >= 10 && b >= 10 && a < b) {
                if (c < d) {
                    winPlateRateHtml = "参考：胜"
                } else if (c > d) {
                    winPlateRateHtml = "参考：负"
                }
            } else if (a < 50 && b < 50 && a >= 10 && b >= 10 && a > b) {
                if (c < d) {
                    winPlateRateHtml = "参考：胜"
                } else if (c > d) {
                    winPlateRateHtml = "参考：负"
                } else if (c === d && a > b && (a - b) >= 20 && (a - b) < 40) {
                    winPlateRateHtml = "参考：胜"
                }
            } else if (a > 50 && b > 50 && (a - b) >= 0 && (a - b) <= 20) {
                if (c < d) {
                    winPlateRateHtml = "参考：负"
                } else if (c > d) {
                    winPlateRateHtml = "参考：胜"
                }
            }

        } else if (handicap === 1) {

        }
        $(".winPlateRateHtml").html(winPlateRateHtml)

    }

    //本赛事近十场相同主客胜率函数
    let winRateAnalyseFn = (a, b) => {
        let rt = $(".rate");
        if (a && b) {
            if (a < 10 && b < 10) {
                rt.html("胜率均小于10%，不予分析").redCss();
            } else {
                switch (true) {
                    case a > b:
                        rt.winStyle();
                        sonData.ordNum.win++;
                        break;
                    case a < b:
                        rt.loseStyle();
                        sonData.ordNum.lose++
                        break;
                    case a === b:
                        rt.flatStyle();
                        sonData.ordNum.flat++
                        break
                }
            }
        } else {
            rt.html("暂无数据").redCss();
        }
    }

    //本赛事近十场相同主客赢盘率函数
    let winPlateRateRecentFn = (a, b) => {
        let mp = $(".msgFp");
        if (a && b) {
            switch (true) {
                case a < b:
                    mp.winStyle();
                    sonData.ordNum.win++;
                    break;
                case a > b:
                    mp.loseStyle();
                    sonData.ordNum.lose++;
                    break;
                case a === b:
                    mp.flatStyle();
                    sonData.ordNum.flat++;
                    break
            }
        } else {
            mp.html("暂无数据").redCss();
        }
    }

    // 近十场历史交锋胜率、近十场历史交锋赢盘率
    let historyWinRateAnalyseFn = (a, b) => {
        let wA = $(".winAnalysis");
        let wP = $(".winPlate");
        switch (true) {
            case a > 50:
                wA.winStyle(a);
                break;
            case a < 50 && a > 0:
                wA.loseStyle(a);
                break;
            case a === 50:
                wA.flatStyle(a);
                break
            default:
                wA.html("暂无数据").redCss();
                break;
        }

        switch (true) {
            case b >= 70:
                wP.html("过高注意降赔指数反向分析").redCss();
                break;
            case b <= 10:
                wP.html("过低注意分析").redCss();
                break;
            default:
                wP.html("正常").greenCss();
                break;
        }
    }

    //竞彩官方即时赔率函数
    let europeFn = (a, b, c) => {
        let europe = $(".europe").html("");
        let europeDs = $(".europe-details").html("");
        if (a !== 0 || b !== 0 || c !== 0) {
            europeDs.html("【" + a + "，" + b + "，" + c + "】")
            switch (true) {
                case a < c:
                    europe.winStyle();
                    sonData.ordNum.win++;
                    break;
                case a > c:
                    europe.loseStyle();
                    sonData.ordNum.lose++;
                    break;
                default:
                    europe.flatStyle();
                    sonData.ordNum.flat++;
                    break;
            }
        } else {
            europe.html("信息不全无法预测").redCss();
        }

    }

    //必发数据分析计算
    let outboxFn = (a, b, c) => {
        let outbox = $(".outbox").html("");
        let outboxTwo = $(".outbox-two").html("");
        let hint = $(".hintShow").html("");
        let outboxDs = $(".outbox-details").html("");
        if (a !== 0 || b !== 0 || c !== 0) {
            outboxDs.html("【" + a + "，" + b + "，" + c + "】");
            const d = [a, b, c];
            d.sort((a, b) => {
                return b - a
            });
            let dM = d[0];//最大值
            let dC = d[1];//中间值
            if (dM < 50) {
                hint.html('(没超过50%的指数)').redCss();
            }
            switch (true) {
                case dM === a:
                    outbox.winStyle();
                    sonData.ordNum.win++;
                    sonData.impNum.win++;
                    break;
                case dM === b:
                    outbox.flatStyle();
                    sonData.ordNum.flat++;
                    sonData.impNum.flat++;
                    break;
                case dM === c:
                    outbox.loseStyle();
                    sonData.ordNum.lose++;
                    sonData.impNum.lose++;
                    break;
                default:
                    break;
            }
            if (dC * 2 > dM) {
                switch (true) {
                    case dC === dM && dM === c:
                        outboxTwo.loseStyle();
                        sonData.ordNum.lose++;
                        sonData.impNum.lose++;
                        break;
                    case dC === dM && dM === b:
                        outboxTwo.flatStyle();
                        sonData.ordNum.flat++;
                        sonData.impNum.flat++;
                        break;
                    default:
                        switch (true) {
                            case dC === a:
                                outboxTwo.winStyle();
                                sonData.ordNum.win++;
                                sonData.impNum.win++;
                                break;
                            case dC === b:
                                outboxTwo.flatStyle();
                                sonData.ordNum.flat++;
                                sonData.impNum.flat++;
                                break;
                            case dC === c:
                                outboxTwo.loseStyle();
                                sonData.ordNum.lose++;
                                sonData.impNum.lose++;
                                break;
                            default:
                                break;
                        }
                        break;
                }
            }
        } else {
            outbox.html("暂无数据").redCss();
        }
    }

    //降赔公司分析计算
    let compFn = (a, b, c) => {
        let comp = $(".comp").html("");
        let compTwo = $(".comp-two").html("");
        let compDs = $(".comp-details").html("");
        if (a !== 0 || b !== 0 || c !== 0) {
            compDs.html("【胜:" + a + "家，平:" + b + "家，负:" + c + "家】");
            const d = [a, b, c];
            d.sort((a, b) => {
                return b - a
            });
            let dM = d[0];//最大值
            let dC = d[1];//中间值
            switch (true) {
                case dM === a:
                    comp.winStyle();
                    sonData.ordNum.win++;
                    sonData.impNum.win++;
                    break;
                case dM === b:
                    comp.flatStyle();
                    sonData.ordNum.flat++;
                    sonData.impNum.flat++;
                    break;
                case dM === c:
                    comp.loseStyle();
                    sonData.ordNum.lose++;
                    sonData.impNum.lose++;
                    break;
                default:
                    break;
            }
            if (dC * 2 > dM) {
                switch (true) {
                    case dC === dM && dM === c:
                        compTwo.loseStyle();
                        sonData.ordNum.lose++;
                        sonData.impNum.lose++;
                        break;
                    case dC === dM && dM === b:
                        compTwo.flatStyle();
                        sonData.ordNum.flat++;
                        sonData.impNum.flat++;
                        break;
                    default:
                        switch (true) {
                            case dC === a:
                                compTwo.winStyle();
                                sonData.ordNum.win++;
                                sonData.impNum.win++;
                                break;
                            case dC === b:
                                compTwo.flatStyle();
                                sonData.ordNum.flat++;
                                sonData.impNum.flat++;
                                break;
                            case dC === c:
                                compTwo.loseStyle();
                                sonData.ordNum.lose++;
                                sonData.impNum.lose++;
                                break;
                            default:
                                break;
                        }
                        break;
                }
            }
        } else {
            comp.html("暂无数据").redCss();
        }
    }

    //投注比分析计算
    let thenFn = (a, b, c) => {
        let then = $(".then").html("");
        let thenTwo = $(".then-two").html("");
        let thenDs = $(".then-details").html("");
        if (a !== 0 || b !== 0 || c !== 0) {
            thenDs.html("【胜:" + a + "%，平:" + b + "%，负:" + c + "%】");
            const d = [a, b, c];
            d.sort((a, b) => {
                return b - a
            });
            let dM = d[0];//最大值
            let dC = d[1];//中间值
            switch (true) {
                case dM === a:
                    then.winStyle();
                    sonData.ordNum.win++;
                    sonData.impNum.win++;
                    break;
                case dM === b:
                    then.flatStyle();
                    sonData.ordNum.flat++;
                    sonData.impNum.flat++;
                    break;
                case dM === c:
                    then.loseStyle();
                    sonData.ordNum.lose++;
                    sonData.impNum.lose++;
                    break;
                default:
                    break;
            }
            if (dC * 2 > dM) {
                switch (true) {
                    case dC === dM && dM === c:
                        thenTwo.loseStyle();
                        sonData.ordNum.lose++;
                        sonData.impNum.lose++;
                        break;
                    case dC === dM && dM === b:
                        thenTwo.flatStyle();
                        sonData.ordNum.flat++;
                        sonData.impNum.flat++;
                        break;
                    default:
                        switch (true) {
                            case dC === a:
                                thenTwo.winStyle();
                                sonData.ordNum.win++;
                                sonData.impNum.win++;
                                break;
                            case dC === b:
                                thenTwo.flatStyle();
                                sonData.ordNum.flat++;
                                sonData.impNum.flat++;
                                break;
                            case dC === c:
                                thenTwo.loseStyle();
                                sonData.ordNum.lose++;
                                sonData.impNum.lose++;
                                break;
                            default:
                                break;
                        }
                        break;
                }
            }
        } else {
            then.html("暂无数据").redCss();
        }
    }

    //离散值分析计算
    let disperseFn = (a, b, c, d) => {
        let disperse = $(".disperse").html("");
        if (c === d) {
            switch (d) {
                case "胜":
                    sonData.ordNum.win++;
                    sonData.impNum.win++;
                    break;
                case "平":
                    sonData.ordNum.flat++;
                    sonData.impNum.flat++;
                    break;
                case "负":
                    sonData.ordNum.lose++;
                    sonData.impNum.lose++;
                    break;
            }
        } else {
            // switch (c) {
            //     case "胜":
            //         sonData.ordNum.win++;
            //         sonData.impNum.win++;
            //         break;
            //     case "平":
            //         sonData.ordNum.flat++;
            //         sonData.impNum.flat++;
            //         break;
            //     case "负":
            //         sonData.ordNum.lose++;
            //         sonData.impNum.lose++;
            //         break;
            // }
            if (a > b) {
                switch (d) {
                    case "胜":
                        sonData.ordNum.win++;
                        sonData.impNum.win++;
                        break;
                    case "平":
                        sonData.ordNum.flat++;
                        sonData.impNum.flat++;
                        break;
                    case "负":
                        sonData.ordNum.lose++;
                        sonData.impNum.lose++;
                        break;
                }
            }
        }
        disperse.html("初：" + c + "( " + a + ")；即：" + d + "( " + b + ")");
    }

    //凯利值分析计算
    let cayleyFn = (a, b, c) => {
        let cayley = $(".cayley").html("");
        let cayleyTwo = $(".cayley-two").html("");
        let cayleyDs = $(".cayley-details").html("");
        if (a !== 0 || b !== 0 || c !== 0) {
            cayleyDs.html("【胜:" + a + "家，平:" + b + "家，负:" + c + "家】");
            const d = [a, b, c];
            d.sort((a, b) => {
                return b - a
            });
            let dM = d[0];//最大值
            let dC = d[1];//中间值
            switch (true) {
                case dM === a:
                    cayley.winStyle();
                    sonData.ordNum.win++;
                    sonData.impNum.win++;
                    break;
                case dM === b:
                    cayley.flatStyle();
                    sonData.ordNum.flat++;
                    sonData.impNum.flat++;
                    break;
                case dM === c:
                    cayley.loseStyle();
                    sonData.ordNum.lose++;
                    sonData.impNum.lose++;
                    break;
                default:
                    break;
            }
            if ((dC + 5) > dM) {
                switch (true) {
                    case dC === dM && dM === c:
                        cayleyTwo.loseStyle();
                        sonData.ordNum.lose++;
                        sonData.impNum.lose++;
                        break;
                    case dC === dM && dM === b:
                        cayleyTwo.flatStyle();
                        sonData.ordNum.flat++;
                        sonData.impNum.flat++;
                        break;
                    default:
                        switch (true) {
                            case dC === a:
                                cayleyTwo.winStyle();
                                sonData.ordNum.win++;
                                sonData.impNum.win++;
                                break;
                            case dC === b:
                                cayleyTwo.flatStyle();
                                sonData.ordNum.flat++;
                                sonData.impNum.flat++;
                                break;
                            case dC === c:
                                cayleyTwo.loseStyle();
                                sonData.ordNum.lose++;
                                sonData.impNum.lose++;
                                break;
                            default:
                                break;
                        }
                        break;
                }
            }
        } else {
            cayley.html("暂无数据").redCss();
        }
    }

    //各机构和竞彩官方理论利润率分析、竞彩官方市场赔率概率
    let theTheoryOfProfit = (a, b, c) => {
        let j, k, l, p, q, r, w, y, z;
        let profitShow = $(".profitShow").html("");
        let profit = $(".profit").html("");
        let profitTwo = $(".profit-two").html("");
        let profitDs = $(".profit-details").html("");
        let theoryProfit = (1 / a + 1 / b + 1 / c - 1).toFixed(3);
        let winLoss = 3 * a / (3 - theoryProfit * a);
        let pinkLoss = 3 * b / (3 - theoryProfit * b);
        let errLoss = 3 * c / (3 - theoryProfit * c);
        let winProfit = theoryProfit * winLoss / 3 * 100;
        let pinkProfit = theoryProfit * pinkLoss / 3 * 100;
        let errProfit = theoryProfit * errLoss / 3 * 100;
        let theoryProfitVal = Number(theoryProfit * 100);
        profitShow.html((theoryProfitVal).toFixed(2) + "%").redCss();
        p = Number((1 / winLoss * 100).toFixed(2));
        q = Number((1 / pinkLoss * 100).toFixed(2));
        r = Number((1 / errLoss * 100).toFixed(2));
        j = Number(winProfit.toFixed(2));
        k = Number(pinkProfit.toFixed(2));
        l = Number(errProfit.toFixed(2));
        w = Number((j * p * Number(winLoss.toFixed(2)) / 10).toFixed(4));
        y = Number((k * q * Number(pinkLoss.toFixed(2)) / 10).toFixed(4));
        z = Number((l * r * Number(errLoss.toFixed(2)) / 10).toFixed(4));
        profitDs.html("【" + w + "，" + y + "，" + z + "】");//各机构和竞彩官方理论利润率分析
        if (handicap === -1) {
            if (w < y && w < z) {
                if (y < z) {
                    console.log(333);
                    if ((w * 2) < z && (w * 2) > y) {
                        profit.winStyle();
                        profitTwo.html("(稳平让平)").redCss();
                    } else if ((w * 2) < z && (w * 2) + 5 < y && y < 100) {
                        profit.winStyle();
                        profitTwo.html("(博让胜,大胜)").redCss();
                    } else if ((w * 2) < z && (w * 2) < y && y > 100 && w < 35) {
                        profit.winStyle();
                        profitTwo.html("(博让胜,大胜)").redCss();
                    } else if ((w * 2) < z && (w * 2) < y && y > 100 && z < 200) {
                        profit.flatStyle();
                        profitTwo.html("(稳平让平)").redCss();
                    } else if ((w * 2) < z && (w * 2) < y && y > 100 && z > 200 && w > 35) {
                        profit.winStyle();
                        profitTwo.html("(稳平让平,有平的可能)").redCss();
                    } else if ((w * 2) < z && (w * 2) < y && y < 100 && z < 100 && w > 35) {
                        profit.flatStyle();
                        profitTwo.html("(稳平让平)").redCss();
                    } else if ((w * 2) > z && (w * 2) > y) {
                        if ((w * 1.5) < z && (w * 1.5) < y) {
                            profit.winStyle();
                            profitTwo.html("(稳让平让负)").redCss();
                        }
                    } else {
                        profit.winStyle();
                    }
                } else if (y > z) {
                    console.log(444);
                    if ((w * 2) > z && (w * 2) > y) {
                        if ((w * 1.5) > z && (w * 1.5) < y) {
                            profit.flatStyle();
                            profitTwo.html("(稳让负，客队不败,少数大胜)").redCss();
                        } else if ((w * 1.5) > z && (w * 1.5) > y) {
                            profit.loseStyle();
                            profitTwo.html("(稳让负让平)").redCss();
                        } else if ((w * 1.5 + 4) < z && (w * 1.5 + 4) < y) {
                            profit.winStyle();
                            profitTwo.html("(稳平让平)").redCss();
                        } else {
                            profit.loseStyle();
                            profitTwo.html("(稳让负，客队不败3)").redCss();
                        }
                    } else if ((w * 2) > z && (w * 2) < y) {
                        if (y - (w * 2) < 5) {
                            profit.loseStyle();
                            profitTwo.html("(稳让负，客队不败4)").redCss();
                        }
                    } else if ((w * 2) < z && (w * 2) < y) {
                        console.log(808);
                    }

                }
            } else if (w < y && w > z) {
                if (y > z) {
                    console.log(222);

                } else if (y < z) {
                    console.log(111);
                }
            }
        } else if (handicap === 1) {
            if (y > z && w > z) {
                if (w > y) {
                    console.log(666);
                    if ((z * 2) > w && (z * 2) > y) {
                        console.log(666.1);
                        profit.winStyle();
                        profitTwo.html("(稳受让胜，个别大负)").redCss();
                    } else if ((z * 2) > w && (z * 2) < y) {
                        console.log(666.2);

                    } else if ((z * 2) < w && (z * 2) > y) {
                        console.log(666.3);
                        profit.flatStyle();
                        profitTwo.html("(稳平让平)").redCss();

                    } else if ((z * 2) < w && (z * 2) < y && z < 40) {
                        console.log(666.4);
                        profit.loseStyle();
                        profitTwo.html("(博受让负)").redCss();

                    } else {
                        profitTwo.html("依据情况判断").redCss();
                    }
                } else if (w < y) {
                    console.log(777);
                    if ((z * 2) > w && (z * 2) > y) {
                        console.log(777.1);
                        profit.loseStyle();
                        profitTwo.html("(稳让胜让平)").redCss();
                    } else if ((z * 2) > w && (z * 2) < y) {
                        console.log(777.2);

                    } else if ((z * 2) < w && (z * 2) > y) {
                        console.log(777.3);

                    } else if ((z * 2) < w && (z * 2) < y) {
                        console.log(777.4);

                    }

                }

            } else if (y > z && w < z) {
                console.log(888);
                profit.winStyle();
                profitTwo.html("(稳受让胜)").redCss();
            }
        }

    }

    //全概率比、重点概率比
    let probabilityFn = (a, b, c, d, e, f) => {
        let m = (a + b + c);//全概率比
        let n = (d + e + f);//重点概率比
        let arr = [];
        let allWin = Number(((a / m).toFixed(4) * 100).toFixed(2));
        let allFlat = Number(((b / m).toFixed(4) * 100).toFixed(2));
        let allLose = Number(((c / m).toFixed(4) * 100).toFixed(2));
        $(".probability-than").html("【胜:" + allWin + "%，" + "平:" + allFlat + "%，" + "负:" + allLose + "%】");
        let impWin = Number(((d / n).toFixed(4) * 100).toFixed(2));
        let impFlat = Number(((e / n).toFixed(4) * 100).toFixed(2));
        let impLose = Number(((f / n).toFixed(4) * 100).toFixed(2));
        $(".probability-ratio").html("【胜:" + impWin + "%，" + "平:" + impFlat + "%，" + "负:" + impLose + "%】");

        $(".probability-than-details-price").html(computerFn(allWin, allFlat, allLose).split(";")[0]);
        $(".probability-than-details").html("【" + computerFn(allWin, allFlat, allLose).split(";")[1] + "】").redCss();

        $(".probability-ratio-details-price").html(computerFn(impWin, impFlat, impLose).split(";")[0]);
        $(".probability-ratio-details").html("【" + computerFn(impWin, impFlat, impLose).split(";")[1] + "】").redCss();
        arr = [allWin, allFlat, allLose]
        return arr
    }

    //全概率比、重点概率比分析结果数据电脑预测结果
    let computerFn = (a, b, c) => {
        let computerOne = "";
        let computerTwo = "";
        let computerThree = "";
        const computerNumber = [a, b, c];
        computerNumber.sort((a, b) => {
            return b - a
        });
        let computerNumberMax = computerNumber[0];//最大值
        if (a > 50 || b > 50 || c > 50) {
            if (computerNumberMax === a) {
                computerOne = "胜"
            }
            if (computerNumberMax === b) {
                computerOne = "平"
            }
            if (computerNumberMax === c) {
                computerOne = "负"
            }
            if (computerNumberMax === a && computerNumberMax === b) {
                computerOne = "胜，平"
            }
            if (computerNumberMax === c && computerNumberMax === b) {
                computerOne = "负，平"
            }
            if (computerNumberMax === c && computerNumberMax === a) {
                computerOne = "负，胜"
            }
        }
        switch (handicap) {
            case 1:
                if ((a + b) - c >= 20) {
                    computerTwo = "让胜";
                } else {
                    computerTwo = "让负，让平";
                }
                if ((a + b) - c >= 20) {
                    computerThree = "让胜";
                } else if (a >= 30 && b <= 30) {
                    computerThree = "让平";
                } else if (c >= 60) {
                    computerThree = "让负";
                } else if (a >= b && (a + b) >= c) {
                    computerThree = "让胜";
                } else {
                    computerThree = "平，负";
                }
                break;
            case -1:
                if ((b + c) - a >= 20) {
                    computerTwo = "让负";
                } else {
                    computerTwo = "让平，让胜";
                }

                if ((b + c) - a >= 20) {
                    if (b >= 40 && b <= 60) {
                        computerThree = "平，让负";
                    } else {
                        computerThree = "让负";
                    }
                } else if (c >= 20 && b <= 20) {
                    computerThree = "胜，让平";
                } else if (a >= 60) {
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

    //百家机构合理的胜平负真实机率，机构（初）与市场（即）的分析
    let reasonableChanceFn = (a, b, c) => {
        let d, e, f, h, i, j, v, aj, bj, cj;
        let ocr = $(".official-chance-result").html("暂无分析~");
        v = (1 / a + 1 / b + 1 / c - 1).toFixed(3);
        d = 3 * a / (3 - v * a);
        e = 3 * b / (3 - v * b);
        f = 3 * c / (3 - v * c);
        h = Number((1 / d * 100).toFixed(2));
        i = Number((1 / e * 100).toFixed(2));
        j = Number((1 / f * 100).toFixed(2));
        let jj = officialProbabilityFn(sonData.jcTimely.win, sonData.jcTimely.flat, sonData.jcTimely.lose).split(";");
        aj = jj[0];
        bj = jj[1];
        cj = jj[2];
        let ai = Number((h - aj).toFixed(2));
        let bi = Number((i - bj).toFixed(2));
        let ci = Number((j - cj).toFixed(2));
        let absAi = Math.abs(ai);
        let absBi = Math.abs(bi);
        let absCi = Math.abs(ci);
        let aii, bii, cii;
        if (ai > 0) {
            aii = (ai + "↑");
        } else {
            aii = (ai + "↓");
        }

        if (bi > 0) {
            bii = (bi + "↑");
        } else {
            bii = (bi + "↓");
        }

        if (ci > 0) {
            cii = (ci + "↑");
        } else {
            cii = (ci + "↓");
        }
        switch (handicap) {
            case 1:
                if (ai > 0 && bi < 0 && ci < 0) {
                    if (ai < 5 && absBi < 5 && absCi < 5) {
                        if (Number((absBi + absCi).toFixed(2)) > ai) {
                            if (absBi < absCi) {
                                if (absCi > 4) {
                                    ocr.html("负，让负").redCss();
                                } else if (absCi > 1 && absCi < 2) {
                                    ocr.html("平，让胜").redCss();
                                } else if (absCi > 3 && absCi < 4) {
                                    ocr.html("负，让平").redCss();
                                } else {
                                    ocr.html("平，让平？？？").redCss();
                                }
                            } else {
                                if (absBi < 1) {
                                    ocr.html("负，让负").redCss();
                                }
                            }
                        } else {
                            if (absBi < absCi) {
                                ocr.html("胜，让胜").redCss();
                            }
                        }
                    }
                } else if (ai > 0 && bi > 0 && ci < 0) {
                    if (ai < 5 && bi < 5 && absCi < 5) {
                        if (Number((ai + bi).toFixed(2)) < absCi) {
                            if (bi > ai) {
                                ocr.html("平胜，稳让胜").redCss();
                            }
                        }
                    } else if (ai < 5 && bi < 5 && absCi < 10 && absCi > 5) {
                        if (Number((ai + bi).toFixed(2)) > absCi) {
                            if (bi > ai) {
                                ocr.html("负，让负").redCss();
                            }
                        }
                    }
                } else if (ai < 0 && bi > 0 && ci < 0) {
                    if (absAi < 5 && bi < 5 && absCi < 5) {
                        if (Number((absAi + absCi).toFixed(2)) > bi) {
                            if (absAi > absCi) {
                                ocr.html("平，让胜").redCss();
                            }
                        }
                    }
                }
                break;
            case -1:
                if (ai > 0 && bi < 0 && ci < 0) {
                    console.log(8888888);
                    if (ai > 5 && absBi < 5 && absCi < 5) {
                        console.log(88888881234);
                        if ((absBi + absCi) < absAi) {
                            ocr.html("让负").redCss();
                            if (absBi < absCi) {
                                if (absCi > 4) {
                                    ocr.html("平，让平").redCss();
                                } else {
                                    ocr.html("负，让负").redCss();
                                }
                            } else if (absBi > absCi) {
                                ocr.html("平，让平").redCss();
                            }
                        } else if ((absBi + absCi) > absAi) {
                            ocr.html("胜").redCss();
                            if (absBi < absCi) {
                                ocr.html("胜，博让胜").redCss();
                            } else if (absBi > absCi) {
                                ocr.html("11111").redCss();
                            }
                        }

                    } else if (ai < 5 && absBi < 5 && absCi < 5) {
                        ocr.html("稳平，让平").redCss();
                        if (Number(absBi + absCi).toFixed(2) <= ai) {
                            ocr.html("让平，让负").redCss();
                            if (absBi > absCi) {
                                ocr.html("平负，稳让负").redCss();
                                if (absBi < 1) {
                                    ocr.html("平，让平").redCss();
                                }
                            } else if (absCi > absBi) {
                                if (absCi > 2 && absCi < 3) {
                                    ocr.html("胜，稳让平让胜").redCss();
                                } else if (absCi > 3) {
                                    ocr.html("负，博大负，稳让负").redCss();
                                } else if (absCi > 1 && absCi < 2) {
                                    ocr.html("平或负，稳让负").redCss();
                                } else if (absCi < 1) {
                                    ocr.html("胜，让胜").redCss();
                                }
                            }
                        } else {
                            if (absCi < absBi) {
                                ocr.html("平，让平").redCss();
                            } else if (absCi > absBi) {
                                if (absBi < 2 && absBi > 1) {
                                    ocr.html("负，稳让负").redCss();
                                } else {
                                    ocr.html("胜，稳平让平，极少可能大胜").redCss();
                                }
                            }
                        }
                    } else if (ai > 5 && absBi < 5 && absCi > 5 && ai < 10 && absCi < 10) {
                        if ((absCi + absBi) < ai) {
                            ocr.html("平，稳让负").redCss();
                        } else {
                            ocr.html("负，稳让负").redCss();
                        }
                    } else if (absBi < 5 && absCi > 5 && ai > 10 && absCi < 10) {
                        ocr.html("让负").redCss();
                        if ((absCi + absBi) < ai) {
                            ocr.html("平，稳让负").redCss();
                        } else {
                            ocr.html("???").redCss();
                        }
                    }
                } else if (ai > 0 && bi > 0 && ci < 0) {
                    console.log(99999999);
                    if (ai < 5 && bi < 5 && absCi < 5) {
                        if ((ai + bi) < absCi) {
                            ocr.html("胜，博让胜").redCss();
                        } else {
                            ocr.html("胜，博让平").redCss();
                        }
                    } else if (ai < 5 && bi < 5 && absCi > 5) {
                        if ((ai + bi) < absCi) {
                            ocr.html("负，让负").redCss();
                        }
                    }

                } else if (ai < 0 && bi < 0 && ci > 0) {
                    console.log(999999998888888);
                    if (absAi < 5 && absBi < 5 && ci < 5) {
                        if (Number((absAi + absBi).toFixed(2)) < ci) {
                            ocr.html("胜，平").redCss();
                            if (absBi > absAi) {
                                ocr.html("平，让平").redCss();
                            } else if (absBi < absAi) {
                                if (absAi > 2) {
                                    ocr.html("负，稳让负").redCss();
                                } else {
                                    ocr.html("胜，博让平").redCss();
                                }
                            }
                        } else {
                            if (absBi > absAi) {
                                ocr.html("负，稳让负").redCss();
                            } else if (absBi < absAi) {
                                if (absAi < 1) {
                                    ocr.html("平，稳让负").redCss();
                                } else if (absAi > 1 && absAi < 2) {
                                    ocr.html("负，稳让负").redCss();
                                } else if (absAi > 2 && absAi < 3) {
                                    ocr.html("平负，稳让负").redCss();
                                } else {
                                    ocr.html("89897989").redCss();
                                }
                            }
                        }
                    } else if (absAi < 5 && absBi < 5 && ci > 5 && ci < 10) {
                        if ((absAi + absBi) > ci) {
                            if (absBi > absAi) {
                                ocr.html("胜，博让平").redCss();
                            } else if (absBi < absAi) {
                                if (absBi < 1) {
                                    ocr.html("胜，博让胜").redCss();
                                }
                            }
                        }
                    } else if (absAi > 5 && absBi < 5 && ci > 5) {
                        if ((absAi + absBi) > ci) {
                            ocr.html("胜，平").redCss();
                            if (absBi > absAi) {
                                ocr.html("88888").redCss();
                            } else if (absBi < absAi) {
                                if (absBi < 1) {
                                    ocr.html("胜，博让胜").redCss();
                                } else {
                                    ocr.html("98653274").redCss();
                                }
                            }
                        }
                    }
                } else if (ai < 0 && bi > 0 && ci > 0) {
                    console.log(7777777777);
                    if (absAi < 5 && bi < 5 && ci < 5) {
                        if ((bi + ci) > absAi) {
                            if (bi > ci) {
                                ocr.html("负，让负").redCss();
                            } else if (bi < ci) {
                                ocr.html("平，让负,稳平让平").redCss();
                            }
                        } else {
                            if (bi > ci) {
                                ocr.html("胜，博让胜").redCss();
                            } else if (bi < ci) {
                                ocr.html("平，让负").redCss();
                                if (bi < 1) {
                                    if (absAi > 1 && absAi < 2) {
                                        ocr.html("胜，稳平让平").redCss();
                                    } else {
                                        ocr.html("胜，博让胜").redCss();
                                    }
                                }
                            }
                        }
                    } else if (absAi > 5 && bi < 5 && ci < 5 && absAi < 10) {
                        if ((bi + ci) < absAi) {
                            ocr.html("负，平").redCss();
                            if (bi > ci) {
                                ocr.html("平，让负").redCss();
                            } else if (bi < ci) {
                                ocr.html("负，让负").redCss();
                            }
                        }
                    } else if (absAi > 10 && bi < 5 && ci > 5) {
                        if ((bi + ci) < absAi) {
                            ocr.html("胜，平").redCss();
                            if (bi > ci) {
                                ocr.html("11111").redCss();
                            } else if (bi < ci) {
                                ocr.html("平，让负").redCss();
                            }
                        }
                    } else if (absAi < 10 && bi < 5 && ci > 5 && absAi > 5) {
                        if ((bi + ci) > absAi) {
                            if (bi > ci) {
                                ocr.html("11111").redCss();
                            } else if (bi < ci) {
                                if (bi < 1) {
                                    ocr.html("平，让平").redCss();
                                }
                            }
                        }
                    }
                } else if (ai > 0 && bi < 0 && ci > 0) {
                    console.log(9999);
                    if (ai < 5 && absBi < 5 && ci < 5) {
                        console.log(9999123);
                        if ((ai + ci) > absBi) {
                            ocr.html("胜，平").redCss();
                            if (ai > ci) {
                                ocr.html("胜，稳平，让平").redCss();
                            } else if (ai < ci) {
                                ocr.html("平，让平").redCss();
                            }
                        } else {
                            if (ai > ci) {
                                if (ai < 2) {
                                    ocr.html("负，让负").redCss();
                                }
                            } else if (ai < ci) {
                                ocr.html("稳胜，博让胜").redCss();
                            }
                        }
                    }
                } else if (ai < 0 && bi > 0 && ci < 0) {
                    console.log(10);
                    if (absAi < 5 && bi < 5 && absCi < 5) {
                        if ((absAi + absCi) > bi) {
                            if (bi > absAi) {
                                ocr.html("胜，让平").redCss();
                            } else {
                                ocr.html("888").redCss();
                            }
                        } else {
                            if (bi > absAi) {
                                ocr.html("胜，让平,稳平让平").redCss();
                            } else {
                                ocr.html("888").redCss();
                            }
                        }
                    }

                }

                break;
            default:
                ocr.html("暂无分析~")
                break;
        }
        //全概率比、重点概率比
        let arr = probabilityFn(sonData.ordNum.win, sonData.ordNum.flat, sonData.ordNum.lose,
            sonData.impNum.win, sonData.impNum.flat, sonData.impNum.lose);
        let uu_s = Number((arr[0] - h).toFixed(2));
        let uu_p = Number((arr[1] - i).toFixed(2));
        let uu_f = Number((arr[2] - j).toFixed(2));

        const sDiff = Math.round((arr[0] - h) * 100) / 100;
        const pDiff = Math.round((arr[1] - i) * 100) / 100;
        const fDiff = Math.round((arr[2] - j) * 100) / 100;

        let uu_jg = '暂无分析~';
        if (handicap === -1) {
            if (uu_s < 0 && uu_p < 0 && uu_f > 0) {
                if (uu_f <= 18 && uu_f > 9) {
                    if (h < 45) {
                        uu_jg = "负(--+)"
                    } else {
                        if (uu_s >= uu_p) {
                            uu_jg = "胜(--+)"
                        } else {
                            uu_jg = "平,让平(--+)"
                        }
                    }
                } else if (uu_f >= 24 && uu_f <= 29) {
                    uu_jg = "平，让平(--+)"
                } else if (uu_f >= 29 && uu_f < 36) {
                    if (uu_s <= uu_p) {
                        uu_jg = "胜(+--)"
                    } else {
                        uu_jg = "平(+--)"
                    }
                } else {
                    if (uu_s >= uu_p) {
                        uu_jg = "胜(--+)"
                    } else {
                        uu_jg = "平(--+)"
                    }
                }
            } else if (uu_s > 0 && uu_p < 0 && uu_f < 0) {
                if (uu_s <= 16 && uu_s > 9) {
                    uu_jg = "胜(+--)"
                } else if (uu_s >= 24 && uu_s <= 29) {
                    uu_jg = "平，让平(--+)"
                } else if (uu_s >= 29 && uu_s < 40) {
                    if (uu_p <= uu_f) {
                        uu_jg = "平(+--)"
                    } else {
                        uu_jg = "负(+--)"
                    }
                } else if (uu_s >= 40) {
                    if (uu_p <= uu_f) {
                        uu_jg = "平(+--)"
                    } else {
                        uu_jg = "负(+--)"
                    }
                } else {
                    if (uu_p >= uu_f) {
                        uu_jg = "平(+--)"
                    } else {
                        uu_jg = "负(+--)"
                    }
                }
            } else if (uu_s < 0 && uu_p > 0 && uu_f < 0) {
                uu_jg = "开始(-+-)"
            }
        }

        $(".reasonable-chance-init").html("【胜:" + h + "%，平:" + i + "%，负:" + j + "%】")
        $(".official-chance-self").html("【胜:" + uu_s + "%，平:" + uu_p + "%，负:" + uu_f + "%】")
        $(".official-chance-result-self").html(uu_jg).redCss()
        $(".official-chance").html("【胜:" + aii + "，平:" + bii + "，负:" + cii + "】")
    }

    // 竞彩官方合理的胜平负概率函数
    let officialProbabilityFn = (a, b, c) => {
        let d, e, f, h, i, j, v;
        d = Number((100 / a).toFixed(2));
        e = Number((100 / b).toFixed(2));
        f = Number((100 / c).toFixed(2));
        v = Number(d + e + f);
        h = Number(((d / v).toFixed(4) * 100).toFixed(2));
        i = Number(((e / v).toFixed(4) * 100).toFixed(2));
        j = Number(((f / v).toFixed(4) * 100).toFixed(2))
        return "" + h + ";" + i + ";" + j + ""
    }


    //开始数据计算
    function dataCompute() {
        //纸面实力计算
        principalCount(sonData.principal.host, sonData.principal.guest);
        //本赛事近十场相同主客胜率
        winRateAnalyseFn(sonData.rate.z, sonData.rate.f);
        //本赛事近十场相同主客赢盘率
        winPlateRateRecentFn(sonData.plate.z, sonData.plate.f);
        //近十场历史交锋胜率、近十场历史交锋赢盘率
        historyWinRateAnalyseFn(sonData.history.winRate, sonData.history.winPlateRate);
        //竞彩官方即时赔率分析
        europeFn(sonData.jcTimely.win, sonData.jcTimely.flat, sonData.jcTimely.lose);
        //必发比数据分析
        outboxFn(sonData.betfair.win, sonData.betfair.flat, sonData.betfair.lose);
        //百家初盘与竞彩即盘分析
        preliminaryContest(sonData.bjInit.win, sonData.bjInit.flat, sonData.bjInit.lose,
            sonData.jcTimely.win, sonData.jcTimely.flat, sonData.jcTimely.lose,
            sonData.wlxInit.win, sonData.wlxInit.flat, sonData.wlxInit.lose,
            sonData.wlbInit.win, sonData.wlbInit.flat, sonData.wlbInit.lose,
        );

        //降赔公司分析
        compFn(sonData.company.win, sonData.company.flat, sonData.company.lose);
        //投注比分析
        thenFn(sonData.bet.win, sonData.bet.flat, sonData.bet.lose);
        //离散值分析
        disperseFn(sonData.disperse.init, sonData.disperse.even, sonData.disperse.initVal, sonData.disperse.evenVal);
        //凯利值分析
        cayleyFn(sonData.kelly.win, sonData.kelly.flat, sonData.kelly.lose);
        // vip数据分析
        vipFn(sonData.vip.win, sonData.vip.flat, sonData.vip.lose, sonData.vip.type);

        //水位让球数分析 初盘,即盘,升赔，降赔,高水，低水
        waterConcedeFn(sonData.water.primaryDisc, sonData.water.meanDisc, sonData.water.rise,
            sonData.water.drop, sonData.water.tall, sonData.water.low)

        //近十场主客胜率/赢盘率分析
        winPlateRateFn(sonData.rate.z, sonData.rate.f, sonData.plate.z, sonData.plate.f)

        //各机构和竞彩官方理论利润率分析
        theTheoryOfProfit(sonData.bjInit.win, sonData.bjInit.flat, sonData.bjInit.lose);

        // //全概率比、重点概率比
        // probabilityFn(sonData.ordNum.win, sonData.ordNum.flat, sonData.ordNum.lose,
        //     sonData.impNum.win, sonData.impNum.flat, sonData.impNum.lose);

        // 百家机构合理的胜平负真实机率，机构（初）与市场（即）的分析
        reasonableChanceFn(sonData.bjInit.win, sonData.bjInit.flat, sonData.bjInit.lose)
        // $(".reasonable-chance-even").html(officialProbabilityFn(sonData.bjTimely.win, sonData.bjTimely.flat, sonData.bjTimely.lose))
        //竞彩官方合理的胜平负概率函数,机构（市场）的胜平负概率
        let jj = officialProbabilityFn(sonData.jcTimely.win, sonData.jcTimely.flat, sonData.jcTimely.lose).split(";");
        let aj = jj[0], bj = jj[1], cj = jj[2];
        $(".official-probability-even").html("【胜:" + aj + "%，平:" + bj + "%，负:" + cj + "%】");
        // $(".official-probability-even-message").html("不胜");
        // console.log(sonData.ordNum.win, sonData.ordNum.flat, sonData.ordNum.lose);
        // console.log(sonData.impNum.win, sonData.impNum.flat, sonData.impNum.lose);

    }

    //百家初盘生成详细信息
    $("#messageFn").on("click", () => {
        $(".firstShow").empty().show();
        //百家初盘与竞彩即盘分析
        preliminaryContest(sonData.bjInit.win, sonData.bjInit.flat, sonData.bjInit.lose,
            sonData.jcTimely.win, sonData.jcTimely.flat, sonData.jcTimely.lose,
            sonData.wlxInit.win, sonData.wlxInit.flat, sonData.wlxInit.lose,
            sonData.wlbInit.win, sonData.wlbInit.flat, sonData.wlbInit.lose
        );
    });

    //开始价值的分析
    $("#analyse_value").on("click", () => {
        $(".fourShow").show();
        //百家初盘与竞彩即盘分析
        preliminaryContest(sonData.bjInit.win, sonData.bjInit.flat, sonData.bjInit.lose,
            sonData.jcTimely.win, sonData.jcTimely.flat, sonData.jcTimely.lose,
            sonData.wlxInit.win, sonData.wlxInit.flat, sonData.wlxInit.lose,
            sonData.wlbInit.win, sonData.wlbInit.flat, sonData.wlbInit.lose
        );
    });

    //水位让球数据生成详细信息
    $("#waterLevelFn").on("click", () => {
        $(".secondShow").empty().show();
        //水位让球数分析 初盘,即盘,升赔，降赔,高水，低水
        waterConcedeFn(sonData.water.primaryDisc, sonData.water.meanDisc, sonData.water.rise,
            sonData.water.drop, sonData.water.tall, sonData.water.low)
    });

    // 数据同步
    $("#dataSynchronizationFn").on("click", () => {
        let synchronization = $("#dataSynchronizationFn");
        if (!bool) {
            bool = !bool
            synchronization.html("关闭数据同步").attr("type", "danger");
            set = setInterval(() => {
                $(".newTime").html($.timeFilter(Date.parse(new Date()) / 1000, '-', ':'));
                init();
            }, 1000 * syTime);
        } else {
            bool = !bool
            clearInterval(set);
            synchronization.html("开启数据同步").attr("type", "primary");
        }

    })


})();



