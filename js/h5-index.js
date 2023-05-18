var user = window.localStorage.getItem('user');
var key_time = window.location.search.substring(1);
if(user){
    if(user === "2"){
        $(".user").html("路人甲");
        $(".forecast").css('visibility','hidden')
    }else if(user === "1") {
        $(".user").html("管理员");
        $(".forecast").show('visibility','inherit')
    }
}else {
    MIM.prompt('未登录', 'danger', 2000);
    setTimeout(function () {
        window.location.href = "./h5-index-login.html?"+key_time;
    },1500);
}
//时间选择器
var options = [];
timeInit();
function timeInit() {
    MIM.ajaxUtils('http://www.taoerhuo.top/curl/public/index.php/admin/index/week', {
    }, 'true', 'post', 'json', function (data) {
        if (data.code == 200) {
            var retData = data.data.list;
            $.each(retData,function (i,val) {
                options.push({
                    id:val,
                    value:val
                })
            });
            $('#timeSelect').selectInit(options);
            $('#timeSelect option:selected').html(key_time);
            $('.time').html(key_time);
            var dataTime = $('#timeSelect option:selected').html();
            $("#timeSelect").find('input').val(dataTime);

        } else {
            MIM.prompt('失败', 'danger', 2000);
        }
    }, function (ret) {
        MIM.prompt('失败', 'danger', 2000);
    });
}
$("#timeSelect").on('click','ul li',function () {
    key_time = $(this).html();
    $('.time').html(key_time);
    if(window.location.search.substring(1) !== key_time){
        window.location.href = "./h5-index.html?"+key_time
    }
});
