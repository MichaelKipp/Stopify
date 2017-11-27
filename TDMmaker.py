import sys
import os
import string
import nltk
import glob

# Tokenizes a single document
# -Parameters: .txt filename
# TODO: think about the leaving the case of the words alone
# -Returns: lowercase, punctuation-free, list of tokens
def get_tokens(filename):
    with open(filename, 'r') as document:
        text = document.read()
        lowers = text.lower()
        no_punctuation = lowers.translate(None, string.punctuation)
        tokens = nltk.word_tokenize(no_punctuation)
        return tokens

# Converts a corpus into a Term Document Matrix
# -Parameters: path to corpus directory
# -Returns: Dictionary where keys map tokens to document occurances
def make_term_document_matrix(path):
    print ("Creating TDM from " + path + "...")
    doc_dict = {}
    cur_number = 0
    docs = glob.glob(path + '*.txt')


    for filename in docs:
        cur_doc = get_tokens(filename)
        for item in cur_doc:
            if item in doc_dict:
                #TODO: Make sure that this is going in order
                # For example, doc3 is the first opened but gets but in doc0 place in matrix
                doc_dict[item][cur_number] += 1
            else:
                doc_dict[item] = [0 for i in range(len(docs))]
                doc_dict[item][cur_number] += 1
        cur_number += 1
    return doc_dict
