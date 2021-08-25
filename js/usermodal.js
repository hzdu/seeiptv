$(function () {
    $(".usermodal_register").on('click',function () {
        xdialog.open({
            title: 'Register account',
            body: {
                src:"#registeruserdiv",
            },
            buttons: {ok:'Register', cancel: 'cancel'},
            style: 'width:30em;',
            effect: 'newspaper',
            onok: function(param) {
                var inputusername = $("#registeruserdiv_username").val();
                var inputpassword = $("#registeruserdiv_password").val();
                var inputemail = $("#registeruserdiv_email").val();
                if (isEmpty(inputusername)){
                    alert("Sorry,username isn't empty");
                    return;
                }
                if (isEmpty(inputpassword)){
                    alert("Sorry,password isn't empty");
                    return;
                }
                if (isEmpty(inputemail)){
                    alert("Sorry,email isn't empty");
                    return;
                }
                var da = JSON.stringify({"m": 'add',"u": inputusername, "e": inputemail, "p": inputpassword});
                $.ajax({
                    type: "POST",
                    url: appdomain+"api/userapi.php",
                    contentType: 'application/json;charset=UTF-8',
                    data: da,
                    success: function (data) {
                        if (data.msg=="success"){
                            window.location.href = domainurl;
                        }else if (data.msg=="error"){
                            xdialog.open({
                                title: 'Register account',
                                body: 'Sorry, failed, please re-register',
                                style: 'width: 35em;',
                                effect: 'newspaper',
                            });
                        }
                    }
                });

            },
        });
    });

    $(".usermodal_signin").on('click',function (){
        xdialog.open({
            title: 'Sign in',
            body: {
                src:"#loginuserdiv",
            },
            buttons: {ok:'Sign in', cancel: 'cancel'},
            style: 'width:30em;',
            effect: 'newspaper',
            onok: function(param) {
                var inputusername = $("#loginuserdiv_username").val();
                var inputpassword = $("#loginuserdiv_password").val();
                if (isEmpty(inputusername)){
                    alert("Sorry,username isn't empty");
                    return;
                }
                if (isEmpty(inputpassword)){
                    alert("Sorry,password isn't empty");
                    return;
                }
                var da = JSON.stringify({"m": 'login',"u": inputusername,"p": inputpassword});
                $.ajax({
                    type: "POST",
                    url: appdomain+"api/userapi.php",
                    contentType: 'application/json;charset=UTF-8',
                    data: da,
                    success: function (data) {
                        if (data.msg=="success"){
                            window.location.href = domainurl;
                        }else{
                            xdialog.open({
                                title: 'Sign in',
                                body: 'Sorry, login failed, please log in again',
                                style: 'width: 35em;',
                                effect: 'newspaper',
                            });
                        }
                    }
                });
            },
        });
    });

})