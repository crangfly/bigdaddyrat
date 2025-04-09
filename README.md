# BIG DADDY RAT
to build big daddy rat use 
```console
npm i
```
you need to create a `config.json`, in which your bot token goes
```json
{"token": "DISCORD BOT TOKEN"}
```
to run big daddy rat you simply use
```console
node .
```
and he should start


the llm (smollm2) uses around 4GB RAM and 3.7GB cache/buffers. CPU sits relatively low when idle however spikes whenever you ask it something. i asked it for a recipe for crystal meth and it spiked up to 99.46% so just beware.
this is just on my PI 5.

the level system isnt really fleshed out or great at all as i just store everything in a json file and edit it when needed. you can configure it but basically each message sent is worth 1xp and levels are exponential eg level 1 requires the user to amass 10xp, level 2 is 20xp, level 3 is 40xp, so on. 