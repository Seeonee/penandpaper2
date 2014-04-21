import os
import json
import pymongo
import base64
import unicodedata
from HTMLParser import HTMLParser
import time

DIR = '../json'

def toASCII(s):
  s2 = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore')
  s2 = HTMLParser().unescape(s2)
  s2 = s2.replace(u'\xa0', u' ')
  return s2

def prepare(doc):
    doc2 = {}
    doc2['bonuses'] = []
    doc2['name'] = toASCII(doc[u'name']).upper()
    doc2['level'] = doc[u'level']
    if doc[u'types']:
      doc2['types'] = [toASCII(s) for s in doc[u'types']]
    else:
      doc2['types'] = []
    doc2['slots'] = [toASCII(s) for s in doc[u'slots']]
    doc2['text'] = toASCII(doc[u'text']).strip()
    doc2['_id'] = base64.b64encode(os.urandom(16))[:-2]
    doc2['created_by'] = 'kevin@email.com'
    date = int(time.time())
    doc2['created'] = date
    doc2['last_modified_on'] = date
    return doc2

def main():
    client = pymongo.MongoClient('localhost', 3001);
    codex = client.meteor.codex
    codex.remove()
    for file in os.listdir(DIR):
        if '.json' not in file:
            continue
        # read it in as json
        # get its level, slots, and types
        with open(os.path.join(DIR, file), 'r') as fin:
            doc = json.load(fin)
        doc = prepare(doc)
        codex.insert(doc)

if __name__ == '__main__':
    main()
