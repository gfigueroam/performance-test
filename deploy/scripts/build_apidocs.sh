#!/bin/bash

mkdir -p out/api/source 

mkdir -p out/api/html 

for f in docs/api/*.apib ; 
do 
    hercule $f -o out/api/source/$(basename $f .apib).md; 
    aglio -i out/api/source/$(basename $f .apib).md -o out/api/html/$(basename $f .apib).html; 
done