# archon

A helper to test battle code bots (battlecode.org)

## Installation

npm install -g archon

## How it works

First do:
```
> cd path/to/battlecode
> archon -h # shows the help and usage
```
(all replays are saved in the replay/ folder by default, see -r)

### Single matches

Plays the two bots against each other on the specified maps
```
> archon teams/botA teams/botB maps/map1
 map1 [botA/botB] botB 1000
 Summary:
 botA 0  1 0
 botB 1  0 100
```
on map1 botB won in 1000 - 1499 rounds

```
> archon teams/botA teams/botB maps/map1 maps/map2 ... maps/mapN

 map1 [botA/botB] botA 500
 map2 [botA/botB] botB 1000
 ...
 mapN [botA/botB] botA 1500
 Summary:
 botA 5 5 50
 botB 5 5 50
```

### Round Robin 

Plays all bots against each other on every map

```
> archon teams/botA teams/botB teams/botC maps/map1 maps/map2

 map1 [botA/botB] botA 1000
 map1 [botA/botC] botC 500
 map1 [botB/botC] botB 1500
 map2 [botA/botB] botA 1500
 map2 [botA/botC] botC 1000
 map2 [botB/botC] botC 2500
 Summary:
 botA 2 2 50
 botB 1 3 25
 botC 3 1 75
```

### VS World

Plays the host bot against all the others on all the maps

```
> archon --host botA teams/botB teams/botC maps/map1 maps/map2

 map1 [botA/botB] botA 500
 map1 [botA/botC] botC 1000
 map2 [botA/botB] botA 1000
 map2 [botA/botC] botC 2000
 Summary:
 botA map1 1 1 50
 botA map2 1 1 50
```

### Watch the matches

You can then watch all your saved games
```
> archon -v replays/match.rms
```
Opens match.rms if the visualizer for you to watch
```
> archon -v replays
```
Opens all replays in the replay folder for you to watch (close the window to start the next)


### Options

```
> archon -h
Usage:
  archon [options] [maps] [teams]
Example:
  archon maps/map1.xml teams/team1/ teams/team2/

Options:
  -c, --clean       Cleans up after archon and restores defaults
  -h, --help        Prints usage
  -m, --all-maps    Runs all teams specified on all maps in maps/
  -o, --host        Specify a host for the tournament for VsWorld
  -r, --replay-dir  Specify the directory to save the replays in    [default: "replays"]
  -s, --series      Players play the maps in series instead 1 by 1
  -t, --all-teams   Runs all teams in teams/ on the specified maps
  -v, --visualize   Runs the specified replay(s) in the viewer
```

## Feature Requests
1. Output to CSV
2. Single elimination tournament
3. Double elimination tournament
4. Multiple games running at one time (not possible)
