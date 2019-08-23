#!/usr/bin/python
from random import random
import sys
p = 1
n = 1
current = None
if (len(sys.argv) == 2):
    for line in open(sys.argv[1]):
        if(len(line) > 0):
            if random() < p:
                current = line
            n += 1
            p = 1.0/n
    print(current[:-1])
