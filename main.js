christmasTime = new Date(2017, 11, 25);

time = document.getElementById('christmas_time');

time.innerHTML = Date.parse(christmasTime.getTime() - Date.now());