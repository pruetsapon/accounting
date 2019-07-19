function renderReport(snapshot, rClass, diffDays = null, type = 'LineWithLine', set = 0) {

  let labels = [];
  let temps = [];
  let logs = [];

  let count = 1;
  let current = "";
  let totalTemp = 0;
  let totalLog = 0;
  let countData = 1;
  let totalData = snapshot.numChildren();

  if (diffDays == null) {
    snapshot.forEach(function(childSnapshot) {
      let data = childSnapshot.val();
      labels.push(data.date);
      temps.push(data.temperature);
      logs.push(data.amount);
    });
  }
  else if (diffDays == 0) {
    snapshot.forEach(function(childSnapshot) {
      let data = childSnapshot.val();
      let date = getDateByType(data.date, "hour");
      if (countData == totalData || (current != date && current != "")) {
        let sumTemp = parseFloat(totalTemp/count).toFixed(2);
        let sumLogs = parseFloat(totalLog/count).toFixed(2);
        labels.push(current);
        temps.push(sumTemp);
        logs.push(sumLogs);
        current = date;
        totalTemp = parseInt(data.temperature);
        totalLog = parseInt(data.amount);
        count = 1;
      } else {
        current = date;
        totalTemp += parseInt(data.temperature);
        totalLog += parseInt(data.amount);
        count++;
      }
      countData++;
    });
  } else if (diffDays > 0 && diffDays < 30) {
    snapshot.forEach(function(childSnapshot) {
      let data = childSnapshot.val();
      let date = getDateByType(data.date, "day");
      if (countData == totalData || (current != date && current != "")) {
        let sumTemp = parseFloat(totalTemp/count).toFixed(2);
        let sumLogs = parseFloat(totalLog/count).toFixed(2);
        labels.push(current);
        temps.push(sumTemp);
        logs.push(sumLogs);
        current = date;
        totalTemp = parseInt(data.temperature);
        totalLog = parseInt(data.amount);
        count = 1;
      } else {
        current = date;
        totalTemp += parseInt(data.temperature);
        totalLog += parseInt(data.amount);
        count++;
      }
      countData++;
    });
  } else if (diffDays > 0 && diffDays < 364) {
    snapshot.forEach(function(childSnapshot) {
      let data = childSnapshot.val();
      let date = getDateByType(data.date, "month");
      if (countData == totalData || (current != date && current != "")) {
        let sumTemp = parseFloat(totalTemp/count).toFixed(2);
        let sumLogs = parseFloat(totalLog/count).toFixed(2);
        labels.push(current);
        temps.push(sumTemp);
        logs.push(sumLogs);
        current = date;
        totalTemp = parseInt(data.temperature);
        totalLog = parseInt(data.amount);
        count = 1;
      } else {
        current = date;
        totalTemp += parseInt(data.temperature);
        totalLog += parseInt(data.amount);
        count++;
      }
      countData++;
    });
  } else {
    snapshot.forEach(function(childSnapshot) {
      let data = childSnapshot.val();
      let date = getDateByType(data.date, "year");
      if (countData == totalData || (current != date && current != "")) {
        let sumTemp = parseFloat(totalTemp/count).toFixed(2);
        let sumLogs = parseFloat(totalLog/count).toFixed(2);
        labels.push(current);
        temps.push(sumTemp);
        logs.push(sumLogs);
        current = date;
        totalTemp = parseInt(data.temperature);
        totalLog = parseInt(data.amount);
        count = 1;
      } else {
        current = date;
        totalTemp += parseInt(data.temperature);
        totalLog += parseInt(data.amount);
        count++;
      }
      countData++;
    });
  }

  let setTemp = {
    label: 'Temperature',
    fill: 'start',
    data: temps,
    backgroundColor: 'rgba(0,123,255,0.1)',
    borderColor: 'rgba(0,123,255,1)',
    pointBackgroundColor: '#ffffff',
    pointHoverBackgroundColor: 'rgb(0,123,255)',
    borderWidth: 1.5,
    pointRadius: 0,
    pointHoverRadius: 3
  };
  let setLog = {
    label: 'Food Amount',
    fill: 'start',
    data: logs,
    backgroundColor: 'rgba(255,65,105,0.1)',
    borderColor: 'rgba(255,65,105,1)',
    pointBackgroundColor: '#ffffff',
    pointHoverBackgroundColor: 'rgba(255,65,105,1)',
    borderDash: [3, 3],
    borderWidth: 1,
    pointRadius: 0,
    pointHoverRadius: 2,
    pointBorderColor: 'rgba(255,65,105,1)'
  };
  let datasets = [];

  let unit = "";
  if (set == 1) {
    unit = "gram";
    datasets.push(setLog);
  } else if (set == 2) {
    unit = "°C";
    datasets.push(setTemp);
  } else {
    // datasets.push(setTemp);
    // datasets.push(setLog);
  }

  $('.r-graph').remove();
  $('#r-container').append(`<canvas height="130" style="max-width: 100% !important;" class="${rClass} r-graph"></canvas>`);
  
  var bouCtx = document.getElementsByClassName(rClass)[0];
  var bouData = {
    labels: labels,
    datasets: datasets
  };

  // Options
  var bouOptions = {
    responsive: true,
    legend: {
      position: 'top'
    },
    elements: {
      line: {
        // A higher value makes the line look skewed at this ratio.
        tension: 0.3
      },
      point: {
        radius: 0
      }
    },
    scales: {
      xAxes: [{
        display: true,
        gridLines: false,
        autoskip: false,
        // ticks: {
        //   callback: function (tick, index) {
        //     // Jump every 7 values on the X axis labels to avoid clutter.
        //     return index % 7 !== 0 ? '' : tick;
        //   }
        // }
      }],
      yAxes: [{
        // ticks: {
        //   suggestedMax: 45,
        //   callback: function (tick, index, ticks) {
        //     if (tick === 0) {
        //       return tick;
        //     }
        //     return tick > 999 ? formatMoney(tick, 0) : tick;
        //   }
        // },
        scaleOverride : true,
        scaleStartValue : 0,
        scaleLabel: {
          display: true,
          labelString: unit
        }
      }]
    },
    // Uncomment the next lines in order to disable the animations.
    // animation: {
    //   duration: 0
    // },
    hover: {
      mode: 'nearest',
      intersect: false
    },
    tooltips: {
      custom: false,
      mode: 'nearest',
      intersect: false
    }
  };

  // Generate the Analytics Overview chart.
  window.foodReport = new Chart(bouCtx, {
    type: type,
    data: bouData,
    options: bouOptions
  });
}

function getDateByType(date, type, format = "/") {
  let datev = new Date(date);
  let pad = "00";
  if(type == "hour") {
    return datev.getHours() + ":00";
  } else if (type == "day") {
    return (pad + datev.getDate().toString()).slice(-pad.length) + format + (pad + (datev.getMonth() + 1).toString()).slice(-pad.length) + format + datev.getFullYear();
  } else if (type == "month") {
    return (pad + (datev.getMonth() + 1).toString()).slice(-pad.length) + format + datev.getFullYear();
  } else {
    return datev.getFullYear();
  }
}