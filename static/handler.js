var activeStoplists = {};
var activeStopwords = new Set();
var pieChartData = [];
var suggestionActive = false;

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
      .attr("id", "listwrapper_" + name)
    .append("div")
      .attr("class", "stop_item")
      .attr("id", "stoplist_" + name)
      .on('mouseover', function() {
          $('#list_' + name + "_options").show();
      })
      .on('mouseout', function() {
          $('#list_' + name + "_options").hide();
      })
      .on('click', function() {
        activateStoplist(name);
      })
    .append("div")
      .attr("class", "hover_options")
      .attr("id", "list_" + name + "_options")
  var hover = d3.select("#list_" + name + "_options")
    hover.append("img")
      .attr("class", "hover_icon")
      .attr("src", "static/image/icons/add_gray.svg")
      .attr("display", "block")
      .attr("position", "relative")
      .attr("margin", "0 auto")
      .attr("width", "24px")
      .attr("height", "24px")
      .attr("fill", "red")
      .on("click", function() {
        addNewWords(name);
      })

  $('#list_' + name + "_options").hide();
  // Add to list of lists
  activeStoplists[name] = 0;

  // Create .txt file
  // TODO: Find a better way of doing this
  var stopURL = '/create_stoplist/' + name;
  d3.json(stopURL, function(foo) {
  });
}

// TODO: Can I not call d3.json?
// TODO: Turns off stoplist if its active. Check for this and reactivate if necessary
function addNewWords(name) {
  var newWord = prompt("Please enter a new stopword:", "");
  var addURL = '/add_to_stoplist/' + name + '/' + newWord;
  d3.json(addURL, function(foo) {

  });
  console.log(newWord);
}

function generatePieChartData(name) {
  var documentURL = '/get_document/' + name;
  d3.json(documentURL, function(d) {
    text = d['contents'].split(" ");
    active = 0;
    inactive = 0;
    for (i = 0; i < text.length; i++) {
      if (activeStopwords.has(text[i])) {
        active++;
      } else {
        inactive++;
      }
    }
    pieChartData.push([active, inactive]);
    generatePieChart(name);
    pieChartData.pop();
  })
}

// TODO: Add transition
// TODO: Add labels
function generatePieChart(name) {
  var margin = 0,
      radius = 25,
      z = d3.scale.category20c();

  var svg = d3.selectAll("#document_" + name).selectAll("svg")
      .data(pieChartData)
      .enter()
    .append("svg")
      .attr('width', (radius + margin) * 2)
      .attr('height', (radius + margin) * 2)
    .append("g")
      .attr("transform", "translate(" + (radius + margin) + ","
                                        + (radius + margin) + ")");

  svg.selectAll("path")
    .data(d3.layout.pie())
    .enter()
  .append("path")
    .attr("d", d3.svg.arc()
        .innerRadius(radius / 2)
        .outerRadius(radius))
    .style("fill", function(d, i) { return z(i); });
}

// Efficiently update document visuals to any changes to active stoplists
function updateVisuals() {
  // Reset chart data
  pieChartData = [];
  // Make sure there are active stop words
  if (activeStopwords.size > 0) {
    for (i = 0; i < doc_names.length; i++) {
      // createStats(doc_names[i]);
      generatePieChartData(doc_names[i]);
    }
  } else {
    $("svg").remove();
  }
}

// Creates HTML for each doc in corpus
function generateDocs(name) {
  d3.select(".doc_container")
    .append("div")
      .attr("class", "item_wrapper document_wrapper")
    .append("div")
      .attr("class", "doc_item")
      .attr("id", "document_" + name)
      .on('click', function() {
        var documentURL = '/get_document/' + name;
        d3.json(documentURL, function(foo) {
            // console.log(foo['contents']);
        });
      })
}

// Adds documents from corpus to viewer
function addDocs() {
  for (i = 0; i < doc_names.length; i++) {
    generateDocs(doc_names[i]);
  }
}

function provideSuggestions() {
  page = document.getElementById("suggestion_page")
  if (suggestionActive = !suggestionActive)
  {
    page.style.boxShadow = "0px 0px 50px 0px rgba(2, 2, 2, .15)";
    page.style.width =
              (document.getElementById("doc_side").clientWidth - 20) + "px";
  } else {
    page.style.width = "0px";
    page.style.boxShadow = "none";
  }
}

window.onload = function() {
  addDocs();
  createStoplist("common_names");
  createStoplist("common_words_100");
  createStoplist("conjunctions");
}
