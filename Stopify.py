import os
import sys
import argparse
from flask import Flask, render_template, jsonify, request
from werkzeug.utils import secure_filename
from TDMmaker import make_term_document_matrix

app = Flask(__name__)

parser = argparse.ArgumentParser()
parser.add_argument("--corpus_path", help="path to corpus directory",
                    required=True)
args = parser.parse_args()
GLOBAL_TDM = None

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

# Render index.html


@app.route('/')
def home():
    process_TDM()
    return render_template('index.html',
                            num_docs=len(os.listdir(args.corpus_path)))

if __name__ == '__main__':
    app.run(debug=True)
