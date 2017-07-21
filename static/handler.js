var stopLists = {};

// Creates a new stoplist
function createStoplist(name) {
  // Create html for stoplist view
  var $stopList = $("\
    <div class='item_wrapper'>                        \
      <div id='stoplist_" + name + "'                 \
            class='stop_item'                         \
            onclick='activateStoplist(" + 'name' + ")'> \
        <p>" + name + "</p>                           \
      </div>                                          \
    </div>                                            \
  ");
  // Add to list of lists
  stopLists[name + ""] = 0;
  // Create .txt file
  var stopURL = '/stoplist/' + name;
  d3.json(stopURL, function(foo) {

  });
  $(".stop_page").append($stopList);
}

// Engages a stoplist and adds it to active stops
function activateStoplist(name) {
  console.log(name);
  console.log("#stoplist_" + name + " activated.");
  console.log(stopLists['default']);
  if(stopLists[name + ""] == 0) {
  $activeStopLlist = $("\
    <div class='item_wrapper activeList_" + name + "_wrapper'>   \
      <div id='activelist_" + name + "'              \
            class='activeList_item'                 \
            onclick='activateStoplist(" + name + ")'> \
        <p>" + name + "</p>                 \
      </div>                                  \
    </div>                                    \
    ");
    $(".active_stoplists").append("$activeStoplist")
  } else {
    $(".active_stoplists").remove(".activeList_" + name +  "_wrapper");
  }

  stopLists[name] = 1 - stopLists[name];
  updateDocuments();
}

// Efficiently update document visuals to any changes to active stoplists
function updateDocuments() {
  // Remove specific items that changed instead of reloading whole visualization
  // generateDocumentVisualizations();
}

// Creates HTML for each doc in corpus
function generateDocs(num) {
  var $doc = $("\
      <div class='item_wrapper'>   \
        <div class='doc_item'>    \
          <p></p>                 \
        </div>                    \
      </div>                      \
  ");
  return $doc;
}

// Adds documents from corpus to viewer
function addDocs() {
  for (i = 0; i < 5; i++) {
    $(".doc_container").append(generateDocs(i));
  }
}

window.onload = function() {
  addDocs();
}
