import os
import sys
import argparse
import heapq
import random
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
    for item in GLOBAL_TDM:
        for j in range(len(GLOBAL_TDM[item])):
            TERM_FREQ[item] += int(GLOBAL_TDM[item][j])

# TODO: Figure out how to do data right
@app.route('/get_stoplist/<name>')
def getStoplist(name):
    stopwords = []
    if os.path.isfile("stoplists/" + name + ".txt"):
        with open("stoplists/" + name + ".txt", "r+") as file:
            for line in file:
                stopwords.append(line.strip())
        return jsonify({ 'stopwords':stopwords })
    else:
        return "No such file exists."

# TODO: Figure out how to do data right
@app.route('/create_stoplist/<name>')
def createStoplist(name):
    try:
        os.makedirs('stoplists/')
    except OSError:
        if not os.path.isdir('stoplists/'):
            raise
    if os.path.isfile("stoplists/" + name + ".txt"):
        print "File already exists"
    else:
        with open("stoplists/" + name + ".txt", "w") as file:
            file.close()
    return jsonify({})

# Render index.html
@app.route('/')
def home():
    process_TDM()
    term_freq()
    return render_template('index.html',
                            num_docs=len(os.listdir(args.corpus_path)))

if __name__ == '__main__':
    app.run(debug=True)














# TODO: Figure this bit out. Should have a make and a return.
# global TERM_FREQ
# frequentest = Counter({})
# frequentest = TERM_FREQ.most_common(25)
# default = []
# for k, v in frequentest:
#     default.append(k)
