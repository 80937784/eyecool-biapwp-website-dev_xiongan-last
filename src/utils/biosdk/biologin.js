var loginType;

function alertDev(type) {
    if (type=='fvein'){
        $.modal.alert("指静脉登录功能开发中，请切换其他登录方式。");
        return;
    }
    $('#bioMessage').text("");
    $("#abisdiv").css("display", "none");
    $("#abisdiv-btn").css("display", "none");
    $("#abisdiv_first").css("display", "block");
    $("#abisdiv-firstBtn").css("display", "block");

    var bioLoginUsername = $(".username").val();
    if (bioLoginUsername) {
        $("#otherLoginTypeName").val(bioLoginUsername);
    }
    if (loginType) {
        $("#" + loginType + "-active-img").attr("src", ctx + "img/" + loginType + ".svg");
        $("#" + loginType + "-active-img").parent().children("label:last-child").css("color", "#7B7D89");

    }
    loginType = type;
    $(".abis-login-box").css("display", "block");
    $("#" + type + "-active-img").attr("src", ctx + "img/" + type + "-active.svg");
    $("#" + type + "-active-img").parent().children("label:last-child").css("color", "#ffffff");
}

$(".return-login").click(function () {
    iconRevert();
    if (loginType == "iris") {
        exitIris();
    }
    if (loginType == "face") {
        closeFaceDevice();
    }
    if (loginType == "finger") {
        exitFinger();
    } else {
        if ($('#imgPreview')) {
            $('#imgPreview').remove();
        }
        $(".abis-login-box").css("display", "none");
    }
})

function iconRevert() {
    var list = ["finger", "face", "iris", "fvein"];
    $.each(list, function (item) {
        $("#" + list[item] + "-active-img").attr("src", ctx + "img/" + list[item] + ".svg")
        $("#" + list[item] + "-active-img").parent().children("label:last-child").css("color", "#7B7D89");
    });
    $("#abisdiv_first").css("display", "block");
    $("#abisdiv-firstBtn").css("display", "block");
    $("#abisdiv").css("display", "none");
    $("#abisdiv-btn").css("display", "none");

    //关闭设备
    $("#iframe1").css("display", "block");
    // $("#abisdiv").empty();

}


$(".to-next").click(function () {
    var loginName = $("#otherLoginTypeName").val();
    if (loginName) {
        var map = {"finger": "指纹", "face": "人脸", "fvein": "指静脉", "iris": "虹膜"};
        $("#abisdiv_first").css("display", "none");
        $("#abisdiv-firstBtn").css("display", "none");
        $("#abisdiv").css("display", "block");
        $("#abisdiv-btn").css("display", "block");
        $("#loginType-text").html(map[loginType] + "识别区域");
        if (loginType == "iris") {
            initAndGetIrisImage(getIrisImgs);
        }
        if (loginType == "face") {
            initFaceDevice(openCamera);
        }
        if (loginType == "finger") {
            initAndGetFingerPrint();
        }
    } else {
        $.modal.alert("请输入账号", modal_status.WARNING);
        return;
    }
});

