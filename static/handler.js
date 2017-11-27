var activeStoplists = {};
var activeStopwords = new Set();
var pieChartData = [];
var latestStatistics = [];

// Engages a stoplist and adds it to active stops
function activateStoplist(name) {
  if(activeStoplists[name] == 0) {
    // Add html
    d3.select("#stoplist-" + name)
      .style("outline", "solid 2px rgba(17,202,227,.8)")

    // Activate new words
    var stopURL = '/get_stoplist/' + name;
    d3.json(stopURL, function(foo) {
      for(i = 0; i < foo['stoplist']['stopwords'].length; i++) {
          activeStopwords.add(foo['stoplist']['stopwords'][i]);
      }
      updateVisuals();
    });
  } else {
    // Clear html
    d3.select("#stoplist-" + name)
      .style("outline", "none")
    // Remove no longer active words
    var stopURL = '/get_stoplist/' + name;
    d3.json(stopURL, function(foo) {
      for(i = 0; i < foo['stoplist']['stopwords'].length; i++) {
        activeStopwords.delete(foo['stoplist']['stopwords'][i]);
      }
      updateVisuals();
    });
  }
  activeStoplists[name] = 1 - activeStoplists[name];
}

function logActiveStopwords() {
  console.log(activeStopwords);
}

function addExistingStoplists() {
  // Create html for stoplist view
  for (i = 0; i < existing_stoplist_names['general'].length; i++) {
    var stopURL = '/get_stoplist/' + existing_stoplist_names['general'][i];
    d3.json(stopURL, function(foo) {
      createStoplist(foo['stoplist']['name'],
                      foo['stoplist']['stopwords'],
                      foo['stoplist']['type']);
    });
  }
  for (i = 0; i < existing_stoplist_names['domain'].length; i++) {
    var stopURL = '/get_stoplist/' + existing_stoplist_names['domain'][i];
    d3.json(stopURL, function(foo) {
      createStoplist(foo['stoplist']['name'],
                      foo['stoplist']['stopwords'],
                      foo['stoplist']['type']);
    });
  }
}

// Creates a new stoplist
function createStoplist(stoplistToAdd, stopwordsToAdd, type) {
  // Create .txt file
  // TODO: Find a better way of doing this
  $.getJSON($SCRIPT_ROOT + '/create_stoplist', {
     name: stoplistToAdd,
     stopwords: stopwordsToAdd,
     folder: type
   })
   generateStoplistHTML(stoplistToAdd, stopwordsToAdd, type);
}

function generateStoplistHTML(name, stopwords, type) {
  // Create html for stoplist view
  if (type == 'general') {
    var target = d3.select('.general-stoplist-page')
  } else {
    var target = d3.select('.domain-specific-stoplist-page')
  }
  target.append("div")
      .attr("class", "item-wrapper stoplistWrapper")
      .attr("id", "listwrapper-" + name)
    .append("div")
      .attr("class", "stop-item")
      .attr("id", "stoplist-" + name)
      .on('mouseover', function() {
          $('#list-' + name + "-options").show();
      })
      .on('mouseout', function() {
          $('#list-' + name + "-options").hide();
      })
      .on('click', function() {
        activateStoplist(name);
      })
    .append("div")
      .attr("class", "stop-title")
      .text(function() {
        if (name.length > 10) {
          return name.substring(0, 10) + "...";
        } else {
          return name;
        }
      })
  var hover = d3.select("#stoplist-" + name)
    .append("div")
      .attr("class", "stop-preview")
      .attr("id", name + "-preview")
      .text(function() {
        if (stopwords.length > 14) {
          return stopwords.slice(0, 15).join(", ") + "...";
        } else {
          return stopwords.slice(0, stopwords.length).join(", ") + "...";
        }
      })
    .append("div")
      .attr("class", "hover-options")
      .attr("id", "list-" + name + "-options")
    hover.append("img")
      .attr("class", "hover-icon")
      .attr("src", "static/image/icons/add_gray.svg")
      .attr("display", "block")
      .attr("position", "relative")
      .attr("margin", "0 auto")
      .attr("width", "24px")
      .attr("height", "24px")
      .attr("fill", "red")
      .on("click", function() {
        addNewWord(name);
      })

  $('#list-' + name + "-options").hide();
  // Add to list of lists
  activeStoplists[name] = 0;

}

function updateStoplistHTML(name) {
  d3.select("#" + name + "-preview").remove()
  d3.select("#" + name + "-options").remove()
  var stopURL = '/get_stoplist/' + name;
  d3.json(stopURL, function(foo) {
    stopwords = foo['stoplist']['stopwords'];
    d3.select("listwrapper-" + name)
      .append("div")
        .on('mouseover', function() {
            $('#list-' + name + "-options").show();
        })
        .on('mouseout', function() {
            $('#list-' + name + "-options").hide();
        })
        .on('click', function() {
          activateStoplist(name);
        })
      .append("div")
        .attr("class", "stop-title")
        .text(function() {
          if (name.length > 10) {
            return name.substring(0, 10) + "...";
          } else {
            return name;
          }
        })
    var hover = d3.select("#stoplist-" + name)
      .append("div")
        .attr("class", "stop-preview")
        .attr("id", name + "-preview")
        .text(function() {
          if (stopwords.length > 14) {
            return stopwords.slice(0, 15).join(", ") + "...";
          } else {
            return stopwords.slice(0, stopwords.length).join(", ") + "...";
          }
        })
      .append("div")
        .attr("class", "hover-options")
        .attr("id", "list-" + name + "-options")
      hover.append("img")
        .attr("class", "hover-icon")
        .attr("src", "static/image/icons/add_gray.svg")
        .attr("display", "block")
        .attr("position", "relative")
        .attr("margin", "0 auto")
        .attr("width", "24px")
        .attr("height", "24px")
        .attr("fill", "red")
        .on("click", function() {
          addNewWord(name);
        })
  })
}

// TODO: Can I not call d3.json?
// TODO: Turns off stoplist if its active. Check for this and reactivate if necessary
function addNewWord(name) {
  var newWord = prompt("Please enter a new stopword:", "");
  var addURL = '/add_to_stoplist/' + name + '/' + newWord;
  d3.json(addURL, function(foo) {
  });
  updateStoplistHTML(name);
}

function removeWord(name) {
  var removeWord = prompt("Please enter a stopword to remove:", "");
  var addURL = '/remove_from_stoplist/' + name + '/' + removeWord;
  d3.json(addURL, function(foo) {
  });
  updateStoplistHTML(name);
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
      radius = 10,
      z = d3.scale.ordinal().range(["#11CAE3", "#FFFFFF"]);

  var svg = d3.selectAll("#document-" + name).select(".diagnostics-view").selectAll("svg")
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
        .innerRadius(radius / 1.7)
        .outerRadius(radius))
    .style("fill", function(d, i) { return z(i); });
}

// Efficiently update document visuals to any changes to active stoplists
function updateVisuals() {
  // Reset chart data
  pieChartData = [];
  $("svg").remove();
  // Make sure there are active stop words
  if (activeStopwords.size > 0) {
    for (i = 0; i < doc_names.length; i++) {
      generatePieChartData(doc_names[i]);
    }
  }
}

// Creates HTML for each doc in corpus
function generateDocs(name) {
  var documentURL = '/get_document/' + name;
  d3.json(documentURL, function(foo) {
    d3.select(".doc-page")
      .append("div")
        .attr("class", "item-wrapper " + name + "-wrapper")
      .append("div")
        .attr("class", "doc-item")
        .attr("id", "document-" + name)
      .append("div")
        .attr("class", "doc-title")
        .text(function() {
          if (name.length > 10) {
            return name.substring(0, 10) + "...";
          } else {
            return name;
          }
        })
    d3.select("#document-" + name)
      .append("div")
        .attr("class", "doc-preview")
        .text(function() {
          if (foo['contents'].length > 14) {
            return foo['contents'].split(" ").slice(0, 15).join(" ") + "...";
          } else {
            return foo['contents'].split(" ").slice(0, foo['contents'].length).join(" ") + "...";
          }
        })
    d3.select("#document-" + name)
      .append("div")
        .attr("class", "diagnostics-view")
  })
}

// Adds documents from corpus to viewer
function addDocs() {
  for (i = 0; i < doc_names.length; i++) {
    generateDocs(doc_names[i]);
  }
}

function collectBeforeDiagnostics(docText) {
  diagnostics = [0/*total number of tokens*/,
                  0/*total word length*/];
  textArray = docText.split(" ");
  for (item of textArray) {
    diagnostics[0] += 1;
    diagnostics[1] += item.length;
  }
  return diagnostics;
}

function collectAfterDiagnostics(docText, newStopwords) {
  diagnostics = [0/*total number of tokens*/,
                  0/*total word length*/];
  textArray = docText.split(" ");
  for (item of textArray) {
    diagnostics[0] += 1;
    diagnostics[1] += item.length;
  }
  return diagnostics;
}

function evaluateSuggestions() {
  d3.json('/get_stats/', function(foo) {
    console.log(foo);
    stats = foo['stats'];
    latestStatistics = stats;

    change = "";

    if (stats[3][1] > 0) {
      change = "+";
    } else {
      change = "-";
    }

    d3.select(".word-field")
      .select("p").remove();
    d3.select(".word-field")
      .append("p")
        .text(stats[0].toString().replace(",", ", "))

    d3.select(".before-field")
      .select("p").remove();
    d3.select(".before-field")
      .append("p")
        .text("Total Tokens: " + stats[1][0])
      .append("p")
          .text("Average Token Length: "  + stats[1][1].toString().substring(0, 4))

    d3.select(".after-field")
      .select("p").remove();
    d3.select(".after-field")
      .append("p")
        .text("Total Tokens: " + stats[2][0] + " (-" + stats[3][0] + ")")
      .append("p")
          .text("Average Token Length: "  + stats[2][1].toString().substring(0, 4)

                  + " (" + change + stats[3][1].toString().substring(0, 4) + ")")

    d3.select("#add-diagnostics-button")
      .on("click", function() {
        var name = prompt("What would you like to call this stoplist?", "")
        createStoplist(name, stats[0], "domain");
      })
  });
}

window.onload = function() {
  addDocs();
  addExistingStoplists();
  evaluateSuggestions();

  $(document).ready(function(){

      $(".doc-search-box").keyup(function(){
          var searchTerm = $(this).val()
          if (searchTerm.length > 0) {
            // Loop through the comment list
            var stopURL = '/get_active_docs/' + searchTerm;
            d3.json(stopURL, function(foo) {
              for (i = 0; i < doc_names.length; i++) {
                if (foo['docs']['active'].includes(doc_names[i] + ".txt")) {
                  d3.select("." + doc_names[i] + "-wrapper")
                    .style("display", "initial");
                } else {
                  d3.select("." + doc_names[i] + "-wrapper")
                    .style("display", "none");
                }
              }
            })
          } else {
            for (i = 0; i < doc_names.length; i++) {
                d3.select("." + doc_names[i] + "-wrapper")
                  .style("display", "initial");
            }
          }
      });
  });
}
