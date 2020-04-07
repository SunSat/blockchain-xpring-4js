function checkBalance() {
    let key = $('#checkBalanceTxt').val();
    if(!key) {
        $('#checkBalanceMsgLbl').html("Please enter xrp address to check balance.");
        return;
    } else {
        $('#checkBalanceMsgLbl').html(" ");
    }

    let checkBalanceReq = $.ajax({
        url: '/api/account/balance/'+key,
        type: 'GET',
        dataType: 'json',
        beforeSend: function () {
            $t = $("#checkBalanceContainerDiv"); // CHANGE it to the table's id you have

            $("#overlay").css({
                opacity: 0.8,
                top: $t.offset().top,
                width: $t.outerWidth(),
                height: $t.outerHeight()
            });

            $("#img-load").css({
                top: ($t.height() / 8),
                left: ($t.width() / 8)
            });
            $("#overlay").fadeIn();
        },
        complete: function () {
            $("#overlay").fadeOut();
        }
    });
    checkBalanceReq.done(data => {
        $("#checkBalanceMsgLbl").html(" ");
        let txt = "<table border='1'>";
        for (x in data) {
            txt += "<tr><td>" + x + "</td><td>" + data[x] + "</td></tr>";
        }
        txt += "</table>";
        document.getElementById("checkBalanceMsgLbl").innerHTML = txt ;
    });

    checkBalanceReq.fail(err => {
        $("#checkBalanceMsgLbl").html('Error while communicating with server. Please try after some time.');
    });
}