$(function() {

    initializeApp();

    let token = getCookie("token");
    if(token != null) {
        let role = getCookie("role");
        if(role == "admin") {
            $('.x').each(function(){
                $(this).addClass('hide-menu');
            });
            $('#user-manage').removeClass('hide-menu');
            $('#user-manage').children('.load-link').addClass('active');
            $('#main-container').load('pages/user.html');
            setTimeout(function() {
                loadUser();
            }, 100);
        } else {
            let checkPage = $('.load-link').hasClass('active');
            if(!checkPage){
                $('#main-container').load('pages/overview.html');
                $('.load-link[name=overview]').addClass('active');
                setTimeout(function() {
                    loadOverview();
                }, 100);
            }
        }
        displayName();
    }

    $('.load-link').click(function(){
        loadPage(this);
    });

    $('.load-logout').click(function(){
        logout();
    });

    $('.check-login').click(function(){
        login();
    });

    $('input[name=email]').keypress(function(event){
        var ew = event.which;
        if(ew == 32)
            return true;
        if(48 <= ew && ew <= 57)
            return true;
        if(65 <= ew && ew <= 90)
            return true;
        if(97 <= ew && ew <= 122)
            return true;
        if(ew == 64)
            return true;
        if(ew == 46)
            return true;
        return false;
    });
});

setInterval(function () {
    let path = window.location.pathname.split('/');
    if(path[path.length-1] == "index.html") {
        reloadChert();
    }
}, 60000);

function reloadChert() {
    var set = $('#report-set').val();
    firebase.database().ref('systemlogs').orderByChild('ndate').limitToLast(20).once('value').then(function(snapshot) {
        renderReport(snapshot, "overview-report", null, "LineWithLine", set);
    });
}

function initializeApp() {
    $.getJSON("config.json", function(config) {
        firebase.initializeApp(config);
    });
    $.getJSON("auth.json", function(config) {
        firebase.auth().signInWithEmailAndPassword(config.email, config.password);
    });
}

function loadPage(elem) {
    let page = $(elem).attr('name');
    $('#main-container').load(`pages/${page}.html`, {limit: 25}, 
        function (responseText, textStatus, req) {
            if(req.status == 404){
                $('#main-container').load('pages/errors.html');
            }
            else{
                loadPageData(page);
            }
        }
    );
    $('.load-link').each(function() {
        $(this).removeClass('active');
    });
    let active = $(elem).hasClass('no-active');
    let active_s = $(elem).attr('active-s') == "t" ? true : false;
    if(active_s) {
        $('.load-link').each(function() {
            if($(this).attr('name') == page) {
                $(this).addClass('active');
                return false;
            }
        });
    } else if(!active) {
        $(elem).addClass('active');
    }
}

function loadPageData(page){
    if(page == "profile") {
        loadProfile();
        loadTitle("user profile");
    } else if (page == "overview") {
        loadOverview();
        loadTitle("overview");
    } else if (page == "manage") {
        loadManage();
        loadTitle("setting");
    } else if(page == "user") {
        loadUser();
        loadTitle("users");
    } else if(page == "log") {
        loadLog();
        loadTitle("food amount logs");
    } else if(page == "report") {
        loadReport();
        loadTitle("report");
    } else if(page == "muser") {
        cleanInputuser();
        loadTitle("add user");
    }
}

function loadTitle(ntitle) {
    document.title = `food manage - ${ntitle}`;
}

function loadUser(page = 1) {
    let rows = 10;
    let uid = getCookie("uid");
    firebase.database().ref("users").once('value').then(function(snapshot) {
        let users = [];
        snapshot.forEach(function(childSnapshot) {
            users.push(childSnapshot.val());
        });
        let end = (page * rows) - 1;
        let start = (page - 1) * rows;
        $('table#users tbody').empty();
        for(i = start; i < end; i++) {
            let user = users[i];
            if(user != undefined) {
                let dClass = (uid == user.uid ? "disabled" : "");
                let adduser = `<tr>
                <td>${(i + 1)}</td>
                <td>${user.fname}</td>
                <td>${user.lname}</td>
                <td>${user.email}</td>
                <td>${user.tphone}</td>
                <td>
                    <a class="muser-buu" href="#" uid="${user.uid}" onclick="loadEditUser(this)"><i class="material-icons">edit</i></a>
                </td>
                <td>
                    <a class="muser-buu ${dClass}" uid="${user.uid}" href="#delete-user" class="trigger-btn" data-toggle="modal"><i class="material-icons">delete</i></a>
                </td>
                </tr>`;
                $('table#users tbody').append(adduser);
            } else { break; }
        }
        let countPage = Math.ceil(users.length / rows);
        if(countPage > 1) {
            let pagelist = `<tr><td colspan="6"><div class="paginationx">`;
            if(countPage > 7 && page != 1) {
                pagelist += `<a href="#" onclick="loadUser(1)">&laquo;</a>`;
            }
            for(i = 1;i <= countPage;i++) {
                if(i == page) {
                    pagelist += `<a class="active" href="#">${i}</a>`;
                } else {
                    pagelist += `<a href="#" onclick="loadUser(${i})">${i}</a>`;
                }
            }
            if(countPage > 7 && page != countPage) {
                pagelist += `<a href="#" onclick="loadUser(${countPage})">&raquo;</a>`;
            }
            pagelist += `</div></td></tr>`;
            $('table#users tbody').append(pagelist);
        }
    });
}

function loadReport(startDate, endDate) {
    if(startDate == undefined && endDate == undefined) {
        let today = new Date();
        let pad = "00";
        let day = (pad + today.getDate().toString()).slice(-pad.length);
        let year = today.getFullYear().toString();
        let month = (pad + (today.getMonth() + 1).toString()).slice(-pad.length);
        let date = `${month}/${day}/${year}`;
        startDate = new Date(`${year}-${month}-${day}`);
        endDate = new Date(`${year}-${month}-${day}`);
        $('input[name=start]').val(date);
        $('input[name=end]').val(date);
    }
    let startAt = getNumDate(startDate);
    let endAt = getNumDate(endDate);
    var oneDay = 24*60*60*1000;
    var diffDays = Math.round(Math.abs((startDate.getTime() - endDate.getTime())/(oneDay)));
    $('#full-report-date-range').datepicker({});
    firebase.database().ref('systemlogs').orderByChild('ndate').startAt(startAt).endAt(endAt).once('value').then(function(snapshot) {
        let type = $('.r-type').val();
        let set = $('.r-set').val();
        renderReport(snapshot, "full-report", diffDays, type, set);
    });
}

function loadManage() {
    firebase.database().ref('setting').on('value', function(data) {
        let setting = data.val();
        let status = Boolean(setting.running) ? "running" : "stoped";
        $('.value-c').text(`${formatMoney(setting.amount, 0)} gram`);
        $('.value-t').text(`${formatMoney(setting.time, 0)} minutes`);
        $('.value-s').text(status);
        $('.update-c').text(setting.date);
        $('.updateby-c').text(setting.uname);
        $('.value-c').attr('value-id', setting.logId);

        $('.volume-food').val(setting.amount);
        $('.time-food').val(setting.time);

        let icon = Boolean(setting.running) ? "pause" : "play_arrow";
        $('.update-r').attr('running', setting.running);
        $('.running-i').text(icon);
    });
}

function loadOverview() {
    let database = firebase.database();
    // load default setting
    database.ref('settinglogs').limitToLast(1).on('child_added', function(data) {
        let setting = data.val();
        $('.value-o').text(formatMoney(setting.amount, 0) + " gram");
        $('.updateby-o').text(setting.uname);

        let date = new Date(setting.date);
        let mname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let dname = date.getDate() + ' ' + mname[date.getMonth()] + ' ' + date.getFullYear().toString().substr(-2);
        let tname = date.getHours() + ':' + date.getMinutes();
        $('.update-o').text(dname);
        $('.update-t-o').text(tname);
    });
    // load node status
    database.ref('setting').on('value', function(data) {
        let setting = data.val();
        let running = Boolean(setting.running) ? "running" : "stoped";
        $('.value-n').text(running);
    });
    // load default temperature
    database.ref('systemlogs').limitToLast(1).on('child_added', function(data) {
        let log = data.val();
        $('.temp-o').text(log.temperature + " °C");
    });
    // load activity log
    database.ref('settinglogs').limitToLast(10).on('value', function(snapshot) {
        $('#activity-l ul').empty();
        let logs = [];
        snapshot.forEach(function(childSnapshot) {
            logs.push(childSnapshot.val());
        });
        logs.sort(function (a, b) {
            return (b.id > a.id ? 1 : -1);
        });
        let count = logs.length;
        logs.forEach(function(data) {
            let li = `<li class="list-group-item d-flex px-3">
            <span class="text-semibold text-fiord-blue">${data.uname}</span>
            <span class="ml-auto text-right text-semibold text-reagent-gray">${formatMoney(data.amount, 0)}</span>
            </li>`;
            $("#activity-l ul").append(li);
        });
        if(count == 0) {
            let li = `<li class="list-group-item d-flex px-3">
            <span class="text-semibold text-fiord-blue">no activity log.</span>
            <span class="ml-auto text-right text-semibold text-reagent-gray"></span>
            </li>`;
            $("#activity-l ul").append(li);
        }
    });
    // load chart
    var set = $('#report-set').val();
    firebase.database().ref('systemlogs').orderByChild('ndate').limitToLast(20).once('value').then(function(snapshot) {
        renderReport(snapshot, "overview-report", null, "LineWithLine", set);
    });
}

function loadLog(endAt) {
    let rows = 10;
    let leadsRef = firebase.database().ref('settinglogs');
    if(endAt != undefined) {
        leadsRef.orderByChild('id').endAt(endAt).limitToLast(rows).on('value', function(snapshot) {
            renderLogs(snapshot);
        });
    } else {
        leadsRef.orderByChild('id').limitToLast(rows).on('value', function(snapshot) {
            renderLogs(snapshot);
        });
    }
}

function renderLogs(snapshot) {
    let logs = [];
    snapshot.forEach(function(childSnapshot) {
        logs.push(childSnapshot.val());
    });
    logs.sort(function (a, b) {
        return (b.id > a.id ? 1 : -1);
    });
    firebase.database().ref('settinglogs').on('value', function(snapshot) {
        $('table#logs tr#loadmore').remove();
        let totalRows = snapshot.numChildren();
        let defaultRows = $('table#logs tr').length - 1;
        let item = defaultRows + 1;
        let lastID = 0;
        logs.forEach(function(data) {
            let rowData = `<tr>
            <td>` + item + `</td>
            <td>` + data.uname + `</td>
            <td>` + formatMoney(data.amount, 0) + `</td>
            <td>` + data.date + `</td>
            </tr>`;
            $('table#logs tbody').append(rowData);
            lastID = data.id;
            item++;
        });
        defaultRows = $('table#logs tr').length - 1;
        if (totalRows == 0) {
            $('table#logs tbody').append(`<tr><td colspan="4">no setting log.</td></tr>`);
        } else if (defaultRows < totalRows) {
            $('table#logs tbody').append(`<tr id="loadmore"><td colspan="4"><button onclick="loadLog(${(lastID - 1)})" id="load-more" class="load-more btn btn-sm btn-accent">Load More</button></td></tr>`);
        }
    });
}

function loadProfile() {
    let uid = getCookie("uid");
    firebase.database().ref("users/" + uid).once('value').then(function(data) {
        let user = data.val();
        $('.profile-name').text(user.fname + " " + user.lname);
        $('.profile-tel').text(user.tphone);
        // $('.profile-email').text(user.email);
        $('#feFirstName').val(user.fname);
        $('#feLastName').val(user.lname);
        $('#feEmailAddress').val(user.email);
        $('#feTelephone').val(user.tphone);
        if(user.img != undefined && user.img != "null"){
            $('.profile-img').attr('src', user.img);
        }
    });
}

function updateFood() {
    let value = $('.volume-food');
    if(validateNum(value)) {
        let volume = parseInt($('.volume-food').val());
        let time = parseInt($('.time-food').val());
        // let running = $('.update-r').attr('running');
        let running = false;
        let vid = $('.value-c').attr('value-id');
        let id = vid == undefined ? 1 : parseInt(vid) + 1;
        let date = new Date();
        let pad = "00";
        let day = (pad + date.getDate().toString()).slice(-pad.length);
        let year = date.getFullYear().toString();
        let month = (pad + (date.getMonth() + 1).toString()).slice(-pad.length);
        let hour = (pad + date.getHours().toString()).slice(-pad.length);
        let minute = (pad + date.getMinutes().toString()).slice(-pad.length);
        let second = (pad + date.getSeconds().toString()).slice(-pad.length);
        let ndate = parseInt(year + month + day);
        let pdate = year + "-" + month + "-" + day + " " + hour + ':' + minute + ':' + second;
        let uid = getCookie("uid");
        let displayName = getCookie("displayName");
        let npath = year + month + day + hour + minute + second;
        let log = {
            id: id,
            amount: volume,
            date: pdate,
            ndate: ndate,
            uid: uid,
            uname: displayName,
            time: time
        };
        firebase.database().ref("settinglogs/" + npath).set(log).then(function() {
            getNoti('success', "Food volume has been updated", 'check');
            $('.value-c').attr('value-id', id);
        }).catch(function(error) {
            getNoti('danger', error.message, 'close');
        });
        let setting = {
            amount: volume,
            date: pdate,
            uname: displayName,
            time: time,
            running: running,
            logId: id
        };
        firebase.database().ref("setting").set(setting);
        $('#update-food').modal('hide');
        let status = running ? "running" : "stoped";
        let icon = running ? "pause" : "play_arrow";
        $('.update-r').attr('running', running);
        $('.running-i').text(icon);
        $('.value-s').text(status);
    } else {
        $('#finvalid').text("Please enter your volume.");
    }
}

function updateRunning() {
    let volume = parseInt($('.volume-food').val());
    let time = parseInt($('.time-food').val());
    let running = false;
    if($('.update-r').attr('running') == "true") {
        running = false;
    } else {
        running = true;
    }
    let displayName = getCookie("displayName");
    let pdate = getStringDate(new Date());
    let setting = {
        amount: volume,
        date: pdate,
        uname: displayName,
        time: time,
        running: running
    };
    firebase.database().ref("setting").set(setting).then(function() {
        let status = running ? "running" : "stoped";
        let icon = running ? "pause" : "play_arrow";
        let statusText = Boolean(running) ? "started" : "stoped";
        $('.update-r').attr('running', running);
        $('.running-i').text(icon);
        $('.value-s').text(status);
        getNoti('success', `Running ${statusText}.`, 'check');
    }).catch(function(error) {
        getNoti('danger', error.message, 'close');
    });
}

function updateProfile() {
    let uid = getCookie("uid");
    let fname = $('#feFirstName').val();
    let lname = $('#feLastName').val();
    let tel =  $('#feTelephone').val();
    let user = {
        fname: fname,
        lname: lname,
        tphone: tel,
        uid: uid
    };
    firebase.database().ref("users/" + user.uid + "/").update(user).then(function() {
        storageUser(user);
        getNoti('success', "Profile your has been updated", 'check');
    }).catch(function(error) {
        getNoti('danger', error.message, 'close');
    });
}

async function saveUser(uid) {
    let email = $('.email-u');
    let password = $('.password-u');
    let cpassword = $('.password-c-u');
    let fname = $('.fname-u');
    let lname = $('.lname-u');
    let tel = $('.tphone-u');
    let role = $('.role-u');
    if(await validateUser(email, password, cpassword, fname, lname, tel, uid)) {
        uid = (uid == undefined ? createUUID() : uid);
        let user = {
            email: email.val(),
            fname: fname.val(),
            lname: lname.val(),
            tphone: tel.val(),
            password: md5(password.val()),
            role: role.val(),
            uid: uid
        };
        firebase.database().ref("users/" + user.uid + "/").update(user).then(function() {
            // let cuid = $('.create-user').attr('uid');
            // if(cuid == undefined) {
            //     cleanInputuser();
            // }
            let page = `<a name="user">x</a>`;
            loadPage(page);
            setTimeout(function() {
                getNoti('success', "User has been saved", 'check');
            }, 100);
        }).catch(function(error) {
            getNoti('danger', error.message, 'close');
        });
    }
}

function loadEditUser(elem) {
    let uid = $(elem).attr('uid');
    $('#main-container').load('pages/muser.html');
    loadTitle('edit user');
    firebase.database().ref("users/" + uid).once('value').then(function(data) {
        let user = data.val();
        $('.create-user').attr('uid', uid);
        $('.muser-h').text('Edit User');
        $('.email-u').val(user.email);
        $('.fname-u').val(user.fname);
        $('.lname-u').val(user.lname);
        $('.tphone-u').val(user.tphone);
        $('.role-u').val(user.role);
        $('.email-u').attr('readonly', true);
        $('.password-u').attr('placeholder', 'New Password');
        $('.password-c-u').attr('placeholder', 'Confirm New Password');
    });
}

function deleteUser(elem) {
    let uid = $(elem).attr('uid');
    let cuid = getCookie("uid");
    if(uid != cuid) {
        firebase.database().ref('users/' + uid).remove().then(function() {
            loadUser();
            getNoti('success', "User has been deleted", 'check');
        })
        .catch(function(error) {
            getNoti('danger', error.message, 'close');
        });
    } else {
        getNoti('danger', "Can't delete user", 'close');
    }
    $('#delete-user').modal('hide');
}

function getNoti(type, msg, icon, close = true) {
    let noti = `<div class="alert alert-${type} alert-dismissible fade show mb-0" role="alert">
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">`;
    if(close) {
        noti += `<span aria-hidden="true">×</span>`;
    }
    noti += `</button><i class="material-icons">${icon}</i> ${msg}</div>`;
    $('.noti').html(noti);
}

function cleanInputuser() {
    $('.email-u').val('');
    $('.password-u').val('');
    $('.password-c-u').val('');
    $('.fname-u').val('');
    $('.lname-u').val('');
    $('.tphone-u').val('');
}

function displayName() {
    let displayName = getCookie("displayName");
    $('.user-name').text(displayName);
    let photo = getCookie("photoURL");
    let photoURL = "images/profiles/default.png";
    if(photo != null){
        photoURL = photo;
    }
    $('.user-avatar').attr('src', photoURL);
}

function login() {
    let email = $('input[name=email]');
    let password = $('input[name=password]');
    if(validateLogin(email, password)) {
        let emailVal = email.val();
        let passwordVal = password.val();
        firebase.database().ref("users").orderByChild('email').equalTo(emailVal).on("value", function(snapshot) {
            let data = snapshot.val();
            let key = Object.keys(data);
            let user = data[key];
            if(user && user.password == md5(passwordVal)) {
                // let date = new Date();
                // let log = {
                //     uid: user.uid,
                //     uname: user.fname + " " + user.lname,
                //     token: createUUID(),
                //     date: getStringDate(date)
                // };
                // firebase.database().ref("loginlogs/" + log.token + "/").update(log);
                storageUser(user, createUUID());
                window.location.href = 'index.html';
            } else {
                getNoti('danger', "You have entered an invalid username or password", 'close', false);
            }
        });
    }
}

function logout() {
    deleteCookie("token");
    setTimeout(function() {
        window.location.href = 'login.html';
    }, 1000);
}

function storageUser(user, token) {
    if(token != undefined) {
        setCookie("token", token, 1);
    }
    setCookie("displayName", `${user.fname} ${user.lname}`, 1);
    setCookie("uid", user.uid, 1);
    setCookie("role", user.role, 1);
    displayName();
}

function validateLogin(email, password) {
    let emailVal = email.val();
    let passwordVal = password.val();
    let checkLogin = true;
    if (passwordVal.length < 6) {
        checkLogin = false;
        password.addClass("is-invalid");
        $('#pinvalid').text("Please enter password.");
        if (passwordVal.length > 0) {
            $('#pinvalid').text("Password minimum 6 characters.");
        }
    } else {
        password.removeClass("is-invalid");
    }
    if (!validateEmail(emailVal)) {
        checkLogin = false;
        email.addClass("is-invalid");
        $('#uinvalid').text("Please enter email.");
    } else {
        email.removeClass("is-invalid");
    }
    return checkLogin;
}

async function validateUser(email, password, cpassword, fname, lname, tel, uid) {
    let validate = true;
    let emailVal = email.val();
    let snapshot = await firebase.database().ref("users").orderByChild("email").equalTo(email.val()).once("value");
    let user = snapshot.val();
    if(uid == undefined) {
        if(!validateEmail(emailVal)) {
            validate = false;
            email.addClass("is-invalid");
            $('#invalid-e').text("Please enter email.");
        } else if(user) {
            validate = false;
            email.addClass("is-invalid");
            $('#invalid-e').text("Already has email.");
        } else {
            email.removeClass("is-invalid");
        }
    }
    let passwordVal = password.val();
    let cpasswordVal = cpassword.val();
    if((passwordVal.length > 0 || cpasswordVal.length > 0 ) && uid != undefined) {
        if(!validatePassword(password, cpassword)) {
            validate = false;
        }
    } else if (uid == undefined) {
        if(!validatePassword(password, cpassword)) {
            validate = false;
        }
    }
    let fnameVal = fname.val();
    if(fnameVal.length < 2) {
        validate = false;
        fname.addClass("is-invalid");
        $('#invalid-f').text("Please enter first name.");
        if (fnameVal.length > 0) {
            $('#invalid-f').text("First name minimum 2 characters.");
        }
    } else {
        fname.removeClass("is-invalid");
    }
    let lnameVal = lname.val();
    if(lnameVal.length < 2) {
        validate = false;
        lname.addClass("is-invalid");
        $('#invalid-l').text("Please enter last name.");
        if (lnameVal.length > 0) {
            $('#invalid-l').text("Last name minimum 2 characters.");
        }
    } else {
        lname.removeClass("is-invalid");
    }
    let telVal = tel.val();
    if(telVal.length < 8) {
        validate = false;
        tel.addClass("is-invalid");
        $('#invalid-t').text("Please enter telephone number.");
        if (telVal.length > 0) {
            $('#invalid-t').text("Telephone number minimum 8 characters.");
        }
    } else {
        tel.removeClass("is-invalid");
    }
    return validate;
}

function validatePassword(password, cpassword) {
    let validate = true;
    let passwordVal = password.val();
    let cpasswordVal = cpassword.val();
    if(passwordVal.length >= 6 && cpasswordVal.length >= 6) {
        if(passwordVal != cpasswordVal) {
            validate = false;
            password.addClass("is-invalid");
            $('#invalid-p').text("Password is not matched.");
            cpassword.addClass("is-invalid");
            $('#invalid-c').text("Password is not matched.");
        } else {
            password.removeClass("is-invalid");
            cpassword.removeClass("is-invalid");
        }
    } else {
        if(passwordVal.length < 6) {
            validate = false;
            password.addClass("is-invalid");
            $('#invalid-p').text("Please enter password.");
            if (passwordVal.length > 0) {
                $('#invalid-p').text("Password minimum 6 characters.");
            }
        } else {
            password.removeClass("is-invalid");
        }
        if(cpasswordVal.length < 6) {
            validate = false;
            cpassword.addClass("is-invalid");
            $('#invalid-c').text("Please enter confirm password.");
            if(cpasswordVal != passwordVal) {
                $('#invalid-c').text("Confirm password does not match.");
            } else if (cpasswordVal.length > 0) {
                $('#invalid-c').text("Confirm password minimum 6 characters.");
            }
        } else {
            cpassword.removeClass("is-invalid");
        }
    }
    return validate;
}

function validateNum(elem) {
    let num = $(elem).val();
    if(num <= 0) {
        $(elem).addClass("is-invalid");
        return false;
    } else {
        $(elem).removeClass("is-invalid");
        return true;
    }
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function getNumDate(date) {
    let pad = "00";
    let day = (pad + date.getDate().toString()).slice(-pad.length);
    let year = date.getFullYear().toString();
    let month = (pad + (date.getMonth() + 1).toString()).slice(-pad.length);
    return parseInt(year + month + day);
}

function getStringDate(date) {
    let pad = "00";
    let day = (pad + date.getDate().toString()).slice(-pad.length);
    let year = date.getFullYear().toString();
    let month = (pad + (date.getMonth() + 1).toString()).slice(-pad.length);
    let hour = (pad + date.getHours().toString()).slice(-pad.length);
    let minute = (pad + date.getMinutes().toString()).slice(-pad.length);
    let second = (pad + date.getSeconds().toString()).slice(-pad.length);
    let pdate = year + "-" + month + "-" + day + " " + hour + ':' + minute + ':' + second;
    return pdate;
}

function setCookie(name, value, days = 1) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i = 0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {   
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;"; 
}

function getParams(text, param) {
    if(text != null) {
        let fsplit = text.split(`${param}=`);
        if(fsplit.length > 1) {
            let lsplit = fsplit[1].split('&');
            return lsplit[0];
        }
    }
    return null;
}

function createUUID() {
    let s = [];
    let hexDigits = shuffleDigits("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
    for (var i = 0; i < 20; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[12] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23];

    let uuid = s.join("");
    return uuid;
}

function isNumberKey(evt)
{
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

function shuffleDigits(digit) {
    var a = digit.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

function formatMoney(n, c, d, t) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? "." : d,
      t = t == undefined ? "," : t,
      s = n < 0 ? "-" : "",
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
      j = (j = i.length) > 3 ? j % 3 : 0;
  
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};