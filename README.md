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

### Run Matches

```
archon match [teams] [maps] [options]
```

#### Single matches

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

#### Round Robin

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

#### VS World

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

#### Options

```
  -e, --export-csv  Exports game data to csv
  -h, --help        Prints usage
  -l, --elo         Calculates the elo for the run
  -m, --all-maps    Runs all teams specified on all maps in maps/
  -o, --host        Specify a host for the tournament for VsWorld
  -r, --replay-dir  Specify the directory to save the replays in    [default: "replays"]
  -s, --series      Players play the maps in series instead 1 by 1
  -t, --all-teams   Runs all teams in teams/ on the specified maps
```
### Watch the matches
```
archon watch [replays]
```

You can then watch all your saved games
```
> archon watch replays/match.rms
```
Opens match.rms if the visualizer for you to watch
```
> archon watch replays
```
Opens all matches in the 'replays' folder for you to watch (close the window to start the next)
```
> archon watch replays replays1/match.rms replays2
```
Opens all the matches in replays and replays2 and match.rms for you to watch

### Clean
```
archon clean
```
Cleans archon config files.

### Spawn (Beta)
Currently only works in OSX
```
archon spawn [local branches/tags] [-a/-b/-g]
```
Spawns new teams in the teams folder from the given branches or tags

#### Options
```
Options:
  -a, --local-branches   Spawns teams from all local branches
  -b, --remote-branches  Spawns teams from all remote branches
  -g, --tags             Spawns teams from all git tags
```

### Kill (Beta)
Doesn't work on windows
```
archon kill
```
Kills all spawned players


## Feature Requests
1. Output to CSV and/or Google Big Query
2. Single elimination tournament
3. Double elimination tournament
4. Multiple games running at one time (not possible)
