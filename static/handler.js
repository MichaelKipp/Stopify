function generate_default_stoplist() {
  var $stop = $("\
      <div class='stop_holder'>    \
        <div class='stop_box'>     \
          <p>stop</p>              \
        </div>                     \
      </div>                       \
  ");
  return $stop;
}

d3.select('#def_stop_gen')
  .on('click', function() {
    console.log("Check");
    var stopURL = '/default_stop/';
    d3.json(stopURL, function(foo) {
      console.log(foo);
    });
  });

function add_default_stoplist() {
  $(".stop_container").append(generate_default_stoplist());
}

function generateDoc(num) {
  var $doc = $("\
      <div class='doc_holder'>    \
        <div class='doc_box'>     \
          <p>" + num + "</p>      \
        </div>                    \
      </div>                      \
  ");
  return $doc;
}

function addDocs() {
  for (i = 0; i < 5; i++) {
    $(".doc_container").append(generateDoc(i));
  }
}

window.onload = function() {
  addDocs();
}
