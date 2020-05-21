document.getElementById('date').innerHTML = new Date().toDateString();

var mySlider = $("#EX1").bootstrapSlider({
  ticks: [0, 100, 200, 300, 400],
  ticks_labels: ['', 'This', '', 'That', ''],
  
});
