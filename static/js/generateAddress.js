function generateWallet() {
    let key = $("#secreteKey").val();
    if (!key) {
        $("#generateWalletMsgDiv").show();
        $("#generateWalletMsgLbl").html("Enter the Wallet Secrete Key");
    } else {
        $("#generateWalletMsgDiv").hide();
        $("#generateWalletMsgLbl").innerText = "";
        let reqData = {
            passpharse: key
        };
        let WalletGenerateReq = $.ajax({
            url: '/api/wallet',
            type: 'POST',
            data: reqData,
            dataType: 'json',
            beforeSend: function () {
                $t = $("#generateWalletContainerDiv"); // CHANGE it to the table's id you have

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
        WalletGenerateReq.done(data => {
            $("#generateWalletMsgDiv").show();
            $("#generateWalletMsgLbl").html("");
            let txt = "<table border='1'>";
            for (x in data) {
                txt += "<tr><td>" + x + "</td><td>" + data[x] + "</td></tr>";
            }
            txt += "</table>";
            document.getElementById("generateWalletMsgDiv").innerHTML = txt;
        });

        WalletGenerateReq.fail(err => {
            $("#generateWalletMsgDiv").show();
            $("#generateWalletMsgLbl").html("Error while communicating with server. Please try after some time.");
        });
    }
}