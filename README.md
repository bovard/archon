archon
======

A helper to test battle code bots (battlecode.org)

Installation [Unsupported]
======

npm install -g archon

How it works [Unsupported]
======

cd path/to/battlecode

Single matches [Unsupported]
=====

Plays the two bots against each other on the specified maps

archon match --teams botA botB --maps map1

>> map1 botB 1000
>> Summary:
>> botA 0  1 0
>> botB 1  0 100

on map1 botB won in 1000 - 1499 rounds


archon match --teams botA botB --maps map1 map2 ... mapN

>> map1 botA 500
>> map2 botB 1000
...
>> mapN botA 1500
>> Summary:
>> bot A 5 5 50
>> bot B 5 5 50

Round robin tournaments [Unsupported]
=====

Plays all bots against each other on every map

arhcon match --teams botA botB botC --maps map1 map2

>> map1 [botA/botB] botA 1000
>> map1 [botA/botC] botC 500
>> map1 [botB/botC] botB 1500
>> map2 [botA/botB] botA 1500
>> map2 [botA/botC] botC 1000
>> map2 [botB/botC] botC 2500
>> Summary:
>> botA 2 2 50
>> botB 1 3 25
>> botC 3 1 75

VS World [Unsupported]
=====

Plays the host bot against all the others on all the maps

archon match --host botA --teams botB botC --maps map1 map2

>> map1 [botA/botB] botA 500
>> map1 [botA/botC] botC 1000
>> map2 [botA/botB] botA 1000
>> map2 [botA/botC] botC 2000
>> Summary:
>> botA map1 1 1 50
>> botA map2 1 1 50


Feature Requests
=====
Output to CSV
Save the game files
Single elimination tournament
Double elimination tournament

