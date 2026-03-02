
# Memory Tasks

A set of working memory tasks in a triad of standalone web applications.

----

### 1. Limited Hold

https://jfo222.github.io/1/

Based on S. Inoue and T. Matsuzawa's 2007 documentation.

|  Config                     |  Description                               |  Value                        |
|  ------                     |  ------                                    |  ------                       |
|  alphanumeric               |  Sets characters of stimuli                |  "alpha", "numeric"           |
|  limitMax/limitMin          |  Stimuli range                             |  Integer                      |
|  maskID arrow/char          |  Sets mask                                 |  "1", "2"                     |
|  nightMode                  |  Enables night mode                        |  Boolean                      |
|  randomize arrow            |  Randomized within the stimulus sector     |  Boolean                      |
|  randomize char             |  Randomized instead of sequential          |  Boolean                      |
|  reverse arrow/char         |  Reverses the order                        |  Boolean, "alternate"         |
|  sound                      |  Enables sound                             |  Boolean                      |
|  time 0/1/2                 |  Stimuli hold time                         |  Milliseconds, 0 = unlimited  |

----

### 2. Dual N-back

https://jfo222.github.io/2/

Based on S. Jaeggi and M. Buschkuehl's 2008 documentation.

|  Map                        |  Key        |
|  ------                     |  :----:     |
|  Visual target              |  A          |
|  Aural target               |  L          |
|  Buttons on/off             |  B          |
|  Run block/end task         |  Space      |

 QWERTY keyboard layout.

----

|  Config                     |  Description                               |  Value                        |
|  ------                     |  ------                                    |  ------                       |
|  aural                      |  Auditory stimuli                          |  Array (8 consonants)         |
|  autoDown/autoUp (session)  |  Mistakes > or < to decrement/increment N  |  Integer                      |
|  base                       |  Length of sequence equals base + N        |  Integer                      |
|  blocks (session)           |  Number of blocks in a session             |  Integer                      |
|  buttons                    |  Enables onscreen buttons                  |  Boolean                      |
|  limitMax/limitMin          |  N-back range                              |  Integer                      |
|  nightMode                  |  Enables night mode                        |  Boolean                      |
|  overlap                    |  Number of simultaneous targets            |  Integer                      |
|  overlapCtrl                |  Enables controlled overlap                |  Boolean                      |
|  sound                      |  Enables sound                             |  Boolean                      |
|  targets                    |  Number of targets (single stream)         |  Integer                      |
|  timeRate/timeStimulus      |  Sets time                                 |  Milliseconds                 |

----

### 3. Backwards

https://jfo222.github.io/3/

A backwards memory span task.

|  Config                     |  Description                               |  Value                        |
|  ------                     |  ------                                    |  ------                       |
|  alphanumeric               |  Sets characters of stimuli                |  Boolean                      |
|  autoDown/autoUp            |  Successive rounds to set level            |  Integer                      |
|  columns                    |  Number of panel columns                   |  Integer                      |
|  limitMin                   |  Minimum sequence length                   |  Integer                      |
|  nightMode                  |  Enables night mode                        |  Boolean                      |
|  qty char/color             |  Number of stimuli                         |  Integer                      |
|  sound                      |  Enables sound                             |  Boolean                      |
|  timeRate/timeStimulus      |  Sets time                                 |  Milliseconds                 |

----

### How-to

Open the task index file with a browser.

Note: Config files won't work over `content://`, default values will be used.

----

Or run on server:

Open the terminal.

`cd` to the downloaded directory (`cd`, Space, and drag-and-drop).

With Bun installed:

`bun start 2` starts app 2.

With Deno installed:

`deno task app` (+ number).

Ctrl + C stops server.

----

