var search = window.location.search.substring(1);
var ids = search.split("&")[0];
var key_times = search.split("&")[1];
var id = ids.split("=")[1];
var key_time = key_times.split("=")[1];
var sheng, fu , exponent;
MIM.ajaxUtils('http://www.taoerhuo.top/curl/public/index.php/admin/index/desc', {
    id: id
}, 'true', 'post', 'json', function (data) {
    if (data.code == 200) {
        var retData = data.data;
        $(".home_team").html(retData.home_team);
        $(".visiting_team").html(retData.visiting_team);
        $(".record").html(retData.record);
        sheng = retData.sheng;
        fu = retData.fu;
        exponent = retData.let_ball;
        if(Number(retData.home_num) < Number(retData.visiting_num)){
            $(".power").css('color','#F56C6C').html("主胜")
        }else {
            $(".power").css('color','#909399').html("主负")
        }
    } else {
        MIM.prompt('失败', 'danger', 2000);
    }
}, function (ret) {
    MIM.prompt('失败', 'danger', 2000);
});
//胜 1  负 2  平 0
$(".analyze").on("click", function () {
    //欧洲指数比较
    var oWin = '';
    if (sheng < fu) {
        oWin = '1';
    } else if (sheng > fu) {
        oWin = '2';
    } else if (sheng == fu) {
        oWin = '0';
    }
    switch (oWin) {
        case '1':
            oWin = "主胜";
            $(".oWin").css('color','#F56C6C');
            break;
        case '2':
            oWin = "主负";
            $(".oWin").css('color','#909399');
            break;
        case '0':
            oWin = "平";
            $(".oWin").css('color','#409EFF');
            break
    }
    $(".oWin").html(oWin);
    //胜率分析
    var win = $('.win').val();
    if(win){
        if (win > 50) {
            win = '1'
        } else if (win < 50) {
            win = '2'
        } else if (win == 50) {
            win = '0'
        }
        switch (win) {
            case '1':
                win = "主胜";
                $(".win").css('color','#F56C6C');
                break;
            case '2':
                win = "主负";
                $(".win").css('color','#909399');
                break;
            case '0':
                win = "平";
                $(".win").css('color','#409EFF');
                break
        }
        $(".win").html(win);
    }else {
        $(".win").css('color','#F56C6C').html("未输入胜率");
    }

    //赢盘率分析
    var winPlate = $(".winPlate").val();
    if(winPlate){
        if (winPlate >= 70) {
            $(".winPlate").css('color','#F56C6C').html("过高注意降赔指数反向分析")
        }else if(winPlate <= 10){
            $(".winPlate").css('color','#F56C6C').html("过低注意分析")
        }else {
            $(".winPlate").css('color','#67C23A').html("正常")
        }
    }else {
        $(".winPlate").css('color','#F56C6C').html("未输入赢盘率")
    }

    //降赔公司分析
    var comp = '';
    var suDropComp = $(".suDropComp").val();
    var ftDropComp = $(".ftDropComp").val();
    var erDropComp = $(".erDropComp").val();
    if(suDropComp&&ftDropComp&&erDropComp){
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
                $(".comp").css('color','#F56C6C');
                break;
            case '2':
                comp = "主负";
                $(".comp").css('color','#909399');
                break;
            case '0':
                comp = "平";
                $(".comp").css('color','#409EFF');
                break
        }
        $(".comp").html(comp);
        arr.splice($.inArray(String(arrMax),arr),1);
        arr.splice($.inArray(String(arrMin),arr),1);
        var arrMiddle = arr.join();
        var arrMiddleHtml;
        if(arrMiddle * 2 > arrMax){
            if (arrMiddle == suDropComp) {
                arrMiddleHtml = "主胜"
            } else if (arrMiddle == ftDropComp) {
                arrMiddleHtml = "平"
            } else if (arrMiddle == erDropComp) {
                arrMiddleHtml = "主负"
            }
            $(".comp").css('color','#F56C6C').html(comp + '或'+arrMiddleHtml);
        }
    }else {
        $(".comp").css('color','#F56C6C').html('信息输入不完整')
    }

//    投注比分析
    var then = '';
    var suThen = $(".suThen").val();
    var ftThen = $(".ftThen").val();
    var erThen = $(".erThen").val();
    if(suThen&&ftThen&&erThen){
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
            then ='2'
        }
        switch (then) {
            case '1':
                then = "主胜";
                $(".then").css('color','#F56C6C');
                break;
            case '2':
                then = "主负";
                $(".then").css('color','#909399');
                break;
            case '0':
                then = "平";
                $(".then").css('color','#409EFF');
                break
        }
        $(".then").html(then);
        if(arr_then_max < 50){
            $(".thenHtml").html('(没超过50%的投注比)');
        }
        arr_then.splice($.inArray(String(arr_then_max),arr_then),1);
        arr_then.splice($.inArray(String(arr_then_min),arr_then),1);
        var arr_then_middle = arr_then.join();
        var arr_then_middle_html;
        if(arr_then_middle * 2 > arr_then_max){
            if (arr_then_middle == suThen) {
                arr_then_middle_html = "主胜"
            } else if (arr_then_middle == ftThen) {
                arr_then_middle_html = "平"
            } else if (arr_then_middle == erThen) {
                arr_then_middle_html = "主负"
            }
            $(".then").css('color','#F56C6C').html(then + '或'+arr_then_middle_html);
        }
    }else {
        $(".then").css('color','#F56C6C').html('信息输入不完整')
    }
//    必发指数分析
    var outbox = '';
    var suOutbox = $(".suOutbox").val();
    var ftOutbox = $(".ftOutbox").val();
    var erOutbox = $(".erOutbox").val();
    if(suOutbox&&ftOutbox&&erOutbox){
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
            outbox ='2'
        }
        switch (outbox) {
            case '1':
                outbox = "主胜";
                $(".outbox").css('color','#F56C6C');
                break;
            case '2':
                outbox = "主负";
                $(".outbox").css('color','#909399');
                break;
            case '0':
                outbox = "平";
                $(".outbox").css('color','#409EFF');
                break
        }
        $(".outbox").html(outbox);
        if(arr_outbox_max < 50){
            $(".outboxHtml").html('(没超过50%的指数)');
        }
        arr_outbox.splice($.inArray(String(arr_outbox_max),arr_outbox),1);
        arr_outbox.splice($.inArray(String(arr_outbox_min),arr_outbox),1);
        var arr_outbox_middle = arr_outbox.join();
        var arr_outbox_middle_html;
        if(arr_outbox_middle * 2 > arr_outbox_max){
            if (arr_outbox_middle == suOutbox) {
                arr_outbox_middle_html = "主胜"
            } else if (arr_outbox_middle == ftOutbox) {
                arr_outbox_middle_html = "平"
            } else if (arr_outbox_middle == erOutbox) {
                arr_outbox_middle_html = "主负"
            }
            $(".outbox").css('color','#F56C6C').html(outbox + '或'+arr_outbox_middle_html);
        }

    }else {
        $(".outbox").css('color','#F56C6C').html('信息输入不完整')
    }


//    受让指数
    $(".exponent").css('color','#F56C6C').html(exponent);


}).drawerInit("mimDrawer");
//确定结果
$("#definitive").on("click",function () {
    if($(".result").val()){
        modificationFn($(".result").val(),"");
    }else {
        $.messageBox('$alert',{
            title:'重置',
            content:'是否重置结果',
            buttonText:'确定',
            // showClose:false,
            // closeOnClickModal:true,
            callback:(function () {
                modificationFn($(".result").val(),"");
            })
        });
    }
});
//修改
function modificationFn(forecast,red) {
    MIM.ajaxUtils('http://www.taoerhuo.top/curl/public/index.php/admin/index/editMsg', {
        id: id,
        forecast: forecast,
        red: red,
    }, 'true', 'post', 'json', function (data) {
        if (data.code == 200) {
            MIM.prompt(data.message, 'success', 2000);
            setTimeout(function () {
                window.location.href = "./h5-index.html?"+key_time
            },2000)
        } else {
            MIM.prompt('失败', 'danger', 2000);
        }
    }, function (ret) {
        MIM.prompt('失败', 'danger', 2000);
    });
}
