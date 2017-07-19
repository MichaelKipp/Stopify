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
