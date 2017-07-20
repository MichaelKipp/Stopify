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

def term_freq():
    global TERM_FREQ
    for item in GLOBAL_TDM:
        TERM_FREQ[item] = 0
    for item in GLOBAL_TDM:
        for j in range(len(GLOBAL_TDM[item])):
            TERM_FREQ[item] += int(GLOBAL_TDM[item][j])

def create_stoplist(words, name):
    try:
        os.makedirs('stoplists/')
    except OSError:
        if not os.path.isdir('stoplists/'):
            raise
    with open("stoplists/" + name + ".txt", "w") as file:
        for item in words:
            file.write(item + "\n")
        file.close()

@app.route('/default_stop/')
def getStops():
    global TERM_FREQ
    frequentest = Counter({})
    frequentest = TERM_FREQ.most_common(25)
    default = []
    for k, v in frequentest:
        default.append(k)
    create_stoplist(default, "default")
    return jsonify({ 'stoplist':frequentest })

# Render index.html
@app.route('/')
def home():
    process_TDM()
    term_freq()
    return render_template('index.html',
                            num_docs=len(os.listdir(args.corpus_path)))

if __name__ == '__main__':
    app.run(debug=True)
