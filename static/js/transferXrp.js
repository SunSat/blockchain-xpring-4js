function transferXrp() {
    let fromAddress = $("#fromAddressTransferXrpTxt").val();
    let toAddress = $("#toAddressTransferXrpTxt").val();
    let amount = $("#amountTransferXrpTxt").val();
    let seed = $("#seedTransferXrpTxt").val();

    $('#transferWalletMsgLbl').show();
    if (!fromAddress || !toAddress || !amount || !seed) {
        $('#transferWalletMsgLbl').html("Please enter data in the all the fields");
        return;
    } else {
        $('#transferWalletMsgLbl').html(" ");
    }

    let reqData = {
        fromAddress: fromAddress,
        amount:amount,
        toAddress:toAddress,
        currency: 'xrp',
        seed: seed
    };
    let transferFundReq = $.ajax({
        url: '/api/account/transfer',
        type: 'POST',
        data: reqData,
        dataType: 'json',
        beforeSend: function () {
            $t = $("#transferXRPContainerDiv"); // CHANGE it to the table's id you have

            $("#overlay").css({
                opacity: 0.8,
                top: $t.offset().top,
                width: $t.outerWidth(),
                height: $t.outerHeight()
            });

            $("#img-load").css({
                top: ($t.height() / 4),
                left: ($t.width() / 4)
            });
            $("#overlay").fadeIn();
        },
        complete: function () {
            $("#overlay").fadeOut();
        }
    });
    transferFundReq.done(data => {
        $("#transferWalletMsgDiv").html(" ");
        let txt = "<div class='w3-padding-large'><p><table border='1'>";
        for (x in data) {
            txt += "<tr><td>" + x + "</td><td>" + data[x] + "</td></tr>";
        }
        txt += "</table></p></div>";
        $('#transferWalletMsgDiv').html(txt);
    });

    transferFundReq.fail(err => {
        $("#transferWalletMsgDiv").html("Error while Transfuring the fund. Please try after some time.");
    });
}