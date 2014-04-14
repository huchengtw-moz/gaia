window.addEventListener('load', function() {
  function $(id) {
    return document.getElementById(id);
  }

  $('mouse-click').addEventListener('click', function() {
    alert('clicked');
  });
  $('mouse-down').addEventListener('mousedown', function() {
    alert('mouse down');
  });
  $('mouse-up').addEventListener('mouseup', function() {
    alert('mouse up');
  });

  $('mouse-move').addEventListener('mouseup', function() {
    $('mouse-move').textContent = 'Mouse Move';
  });

  $('mouse-move').addEventListener('mousemove', function(e) {
    $('mouse-move').textContent = 'x:' + e.clientX + ',y:' + e.clientY;
  });
});
