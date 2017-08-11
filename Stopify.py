import os
import sys
import argparse
import heapq
import random
import json
from collections import Counter
from flask import Flask, render_template, jsonify, request
from werkzeug.utils import secure_filename
from TDMmaker import make_term_document_matrix

app = Flask(__name__)

parser = argparse.ArgumentParser()
parser.add_argument("--corpus_path", help="path to corpus directory",
                    required=True)
args = parser.parse_args()
GLOBAL_TDM = None
TERM_FREQ = Counter({})

@app.route('/get_stats/')
def getStats():
    return jsonify({ 'stats':generateStatistics() })

def generateStatistics():
    statistics = []
    stopwordSuggestions = []
    beforeStatistics = [0.0, 0.0]
    afterStatistics =[0.0, 0.0]
    improvements = [0.0, 0.0]

    global TERM_FREQ
    global GLOBAL_TDM

    for item in TERM_FREQ:
        # Total number of tokens
        beforeStatistics[0] += TERM_FREQ[item]
        # Total number of characters
        beforeStatistics[1] += len(item) * TERM_FREQ[item]

        if item not in stopwordSuggestions and len(item) <= 2:
            stopwordSuggestions.append(item)

    for item in TERM_FREQ:
        if item not in stopwordSuggestions:
            # Reduced number of tokens
            afterStatistics[0] += TERM_FREQ[item]
            # Reduced number of characters
            afterStatistics[1] += len(item) * TERM_FREQ[item]

    # Average token length
    beforeStatistics[1] = beforeStatistics[1]/beforeStatistics[0]
    afterStatistics[1] = afterStatistics[1]/afterStatistics[0]

    improvements[0] = beforeStatistics[0] - afterStatistics[0]
    improvements[1] = afterStatistics[1] - beforeStatistics[1]

    statistics.append(stopwordSuggestions)
    statistics.append(beforeStatistics)
    statistics.append(afterStatistics)
    statistics.append(improvements)
    return statistics

def get_existing_stoplist_names():
    stoplists = {}
    stoplists['general'] = []
    stoplists['domain'] = []
    for item in os.listdir('stoplists/general/'):
        stoplists['general'].append(item.strip(".txt"))
    for item in os.listdir('stoplists/domain/'):
        stoplists['domain'].append(item.strip(".txt"))
    return json.dumps(stoplists)

def get_doc_names():
    docs = []
    for item in os.listdir(args.corpus_path):
        docs.append(item.strip(".txt"))
    return docs

# TODO: Currently only handles .txt files
def process_TDM():
    if os.path.isdir(args.corpus_path):
        corpus_dir = args.corpus_path
        print "Valid corpus path."
    else:
        print 'Invalid corpus path. %s is not a directory.' % args.corpus_path
        exit(1)
    global GLOBAL_TDM
    GLOBAL_TDM = make_term_document_matrix(corpus_dir)

# Generates dictionary of terms and frequencies in corupus
def term_freq():
    global TERM_FREQ
    for item in GLOBAL_TDM:
        TERM_FREQ[item] = 0
        for j in range(len(GLOBAL_TDM[item])):
            TERM_FREQ[item] += int(GLOBAL_TDM[item][j])

@app.route('/get_active_docs/<searchTerm>')
def getActiveDocs(searchTerm):
    docs = {}
    active_docs = []
    docs['active'] = active_docs
    for item in os.listdir(args.corpus_path):
        print item
        if searchTerm in open(args.corpus_path + "/" + item).read() and item not in active_docs:
            active_docs.append(item)
    return jsonify({ 'docs':docs })

# Return the contents of a document
@app.route('/get_document/<name>')
def getDocument(name):
    contents = []
    if os.path.isfile(args.corpus_path + name + ".txt"):
        with open(args.corpus_path + name + ".txt", "r+") as file:
            for line in file:
                contents.append(line.strip())
        contents = ''.join(contents)
        return jsonify({ 'contents':contents })
    else:
        return "No such file exists."

# TODO: Figure out how to do data right
@app.route('/get_stoplist/<name>')
def getStoplist(name):
    stoplist = {}
    stopwords = []
    stoplist['name'] = name
    stoplist['stopwords'] = stopwords
    if os.path.isfile("stoplists/general/" + name + ".txt"):
        stoplist['type'] = 'general'
        with open("stoplists/general/" + name + ".txt", "r+") as file:
            for line in file:
                stoplist['stopwords'].append(line.strip())
        return jsonify({ 'stoplist':stoplist })
    elif os.path.isfile("stoplists/domain/" + name + ".txt"):
        stoplist['type'] = 'domain'
        with open("stoplists/domain/" + name + ".txt", "r+") as file:
            for line in file:
                stoplist['stopwords'].append(line.strip())
        return jsonify({ 'stoplist':stoplist })
    else:
        return "No such file exists."

# TODO: Figure out how to do data right
@app.route('/create_stoplist')
def createStoplist():
    name = request.args.get('name')
    folder = request.args.get('folder')
    print name
    try:
        os.makedirs('stoplists/')
    except OSError:
        if not os.path.isdir('stoplists/'):
            raise
    if os.path.isfile("stoplists/" + folder + "/" + name + ".txt"):
        print "File already exists"

    else:
        with open("stoplists/" + folder + "/" + name + ".txt", "w") as file:
            words_to_add = request.args.get('stopwords')
            for item in words_to_add:
                file.write("%s\n" % item)
            file.close()
    return jsonify({})

@app.route('/add_to_stoplist/<name>/<word>')
def addToStoplist(name, word):
    with open("stoplists/" + name + ".txt", "a+") as file:
        file.write("%s\n" % word)
        file.close();
    return jsonify({})

# Render index.html
@app.route('/')
def home():
    process_TDM()
    term_freq()
    return render_template('index.html',
                            doc_names = get_doc_names(),
                            existing_stoplist_names = get_existing_stoplist_names())

if __name__ == '__main__':
    app.run(debug=True)
