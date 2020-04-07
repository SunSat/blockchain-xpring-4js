function cehckTransaction() {
    let transactionId = $("#transactionIdTxt").val();

    if (!transactionId) {
        $('#checkTransactionMsgLbl').html("Please enter Transaction ID.");
        return;
    } else {
        $('#checkTransactionMsgLbl').html(" ");
    }

    let checkTransctionReq = $.ajax({
        url: '/api/transaction/'+transactionId,
        type: 'GET',
        dataType: 'json',
        beforeSend: function () {
            $t = $("#checkTransactionContainerDiv"); // CHANGE it to the table's id you have

            $("#overlay").css({
                opacity: 0.8,
                top: $t.offset().top,
                width: $t.outerWidth(),
                height: $t.outerHeight()
            });

            $("#img-load").css({
                top: ($t.height() / 5),
                left: ($t.width() / 4)
            });
            $("#overlay").fadeIn();
        },
        complete: function () {
            $("#overlay").fadeOut();
        }
    });
    checkTransctionReq.done(data => {
        $("#checkTransactionMsgLbl").html(" ");
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
        $('#checkTransactionMsgLbl').html(txt);
    });

    checkTransctionReq.fail(err => {
        $("#checkTransactionMsgLbl").html("Error while communicating with server. Please try after some time.");
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