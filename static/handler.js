var activeStoplists = {};
var activeStopwords = new Set();

// Engages a stoplist and adds it to active stops
function activateStoplist(name) {
  if(activeStoplists[name] == 0) {
    // Add html
    d3.select(".active_stoplists")
      .append("div")
        .attr("class", "item_wrapper activeListWrapper")
        .attr("id", "activeList_" + name + "_wrapper")
      .append("div")
        .attr("class", "activeList_item")
        .attr("id", "activeList_" + name)
        .on('click', function() {
          activateStoplist(name);
        })

    // Activate new words
    var stopURL = '/get_stoplist/' + name;
    d3.json(stopURL, function(foo) {
      for(i = 0; i < foo['stopwords'].length; i++) {
          activeStopwords.add(foo['stopwords'][i]);
      }
    });
  } else {
    // Clear html
    console.log("#activeList_" + name +  "_wrapper");
    $("#activeList_" + name +  "_wrapper").remove();
    // Remove no longer active words
    var stopURL = '/get_stoplist/' + name;
    d3.json(stopURL, function(foo) {
      for(i = 0; i < foo['stopwords'].length; i++) {
        activeStopwords.delete(foo['stopwords'][i]);
      }
    });
  }
  activeStoplists[name] = 1 - activeStoplists[name];
  updateDocuments();
}

function logActiveStopwords() {
  console.log(activeStopwords);
}

// Creates a new stoplist
function createStoplist(name) {
  // Create html for stoplist view
  d3.select(".stop_page")
    .append("div")
      .attr("class", "item_wrapper stoplistWrapper")
    .append("div")
      .attr("class", "stop_item")
      .attr("id", "stoplist_" + name)
      .on('click', function() {
        activateStoplist(name);
      })
  // Add to list of lists
  activeStoplists[name] = 0;

  // Create .txt file
  // TODO: Find a better way of doing this
  var stopURL = '/create_stoplist/' + name;
  d3.json(stopURL, function(foo) {
  });
}

// Efficiently update document visuals to any changes to active stoplists
function updateDocuments() {
  // Remove specific items that changed instead of reloading whole visualization
  // generateDocumentVisualizations();
}

// Creates HTML for each doc in corpus
function generateDocs(num) {
  d3.select(".doc_container")
    .append("div")
      .attr("class", "item_wrapper document_wrapper")
    .append("div")
      .attr("class", "doc_item")
      .on('click', function() {
        // TODO: Make something happen.
      })
}

// Adds documents from corpus to viewer
function addDocs() {
  for (i = 0; i < 5; i++) {
    generateDocs(i);
  }
}

window.onload = function() {
  addDocs();
  createStoplist("common_names");
  createStoplist("common_words_100");
  createStoplist("conjunctions");
}
