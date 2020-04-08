function preparePayment() {

    let fromAdd = $('#fromAddressPreparePaymentTxt').val();
    let fromSeed = $('#seedPreparePaymentTxt').val();
    let toAdd = $('#toAddressPreparePaymentTxt').val();
    let amount = $('#amountPreparePaymentTxt').val();

    let reqData = {
        fromAddress : fromAdd,
        fromSeed: fromSeed,
        toAddress: toAdd,
        amount: amount
    };

    let preparePaymentReq = $.ajax({
        url: '/api/v1/accounts/payment/prepare',
        type: 'POST',
        data: reqData,
        dataType: 'json',
        beforeSend: function () {
            $t = $("#prepareTransactionContainerDiv"); // CHANGE it to the table's id you have

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

    preparePaymentReq.done(data => {
        $("#preparePaymentWalletMsgLbl").html(" ");
        let txt = "<div class='w3-padding-large'><p><table border='1'>";
        for (x in data) {
            txt += "<tr><td>" + x + "</td><td>";
            if(data[x] instanceof Object) {
                txt += constructTable(data[x]);
            } else {
                txt += data[x];
            }
            txt += "</td></tr>";
        }
        txt += "</table></p></div>";
        $('#preparePaymentWalletMsgLbl').html(txt);
    });

    preparePaymentReq.fail(err => {
        $("#preparePaymentWalletMsgLbl").html("Error while communicating with server. Please try after some time.");
    });
}

function constructTable(data) {
    let tbl = "<table border='1'>";
    for(x in data) {
        tbl += "<tr><td>" + x + "</td><td>";
        if(data[x] instanceof Object) {
            tbl += constructTable(data[x]);
        } else {
            tbl += data[x];
        }
        tbl+= "</td></tr>";
    }
    tbl+= "</table>";
    return tbl;
}