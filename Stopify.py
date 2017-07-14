import os
import sys
import argparse
from timeit import default_timer as timer
from flask import Flask, render_template, jsonify, request
from werkzeug.utils import secure_filename
from TDMmaker import make_term_document_matrix

app = Flask(__name__)

parser = argparse.ArgumentParser()
parser.add_argument("--corpus_path", help="path to corpus directory",
                                                            required=True)
args = parser.parse_args()

GLOBAL_TDM = None

# Access corpus, process it, return jsonified data
# TODO: Figure out what types of files should be handled (currently only .txt)
def process_corpus(path):
    # Check if indicated corpus path is valid
    if os.path.isdir(path):
        corpus_dir = path
    else:
        print 'Invalic corpus path. %s is not a directory.' % path
        exit(1)

    return make_term_document_matrix(corpus_dir)

# Render index.html
@app.route('/')
def home():
    global GLOBAL_TDM
    start = timer()
    GLOBAL_TDM  = process_corpus(args.corpus_path)
    end = timer()
    print ("Corpus processed in: " + str(end - start) + " seconds")
    return render_template('index.html')

@app.route('/lookup/', methods=['GET', 'POST'])
def lookup():
    if request.method == 'POST':
        start = timer()
        key = str(request.form['lookup']).strip()
        if key in GLOBAL_TDM:
            print "KEY AVAILABLE"
            end = timer()
            return render_template('lookup.html', word=GLOBAL_TDM[key]
                                                , time=str(end-start))
        else:

            return render_template('lookup.html', word=key)
    print("Getting to 1")
    return render_template('lookup.html', word='')


if __name__=='__main__':
    app.run(debug=True)
