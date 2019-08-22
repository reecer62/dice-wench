#!/usr/bin/python
from random import random
p = 1
n = 1
current = None
for line in open("NLRMEv2.txt"):
    if(len(line) > 0):
        if random() < p:
            current = line
        n += 1
        p = 1.0/n
print(current[:-1])
