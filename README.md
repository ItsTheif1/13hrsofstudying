# 13hrsofstudying
uhhh hello my name is crewmate
## Running it 
```
npx wrangler dev
```
## Adding a New Game
1. Create a folder for the game
Inside your `g` directory, create a folder for the game:
``` text
g/
├── something/
├── karlson/
└── newgame/
```
2. Put the game files in the folder
Your folder should contain at least:
``` text
g/newgame/
├── index.html
├── icon.png
└── (other game files)
```
`index.html` launches the game.
`icon.png` is the image shown in the menu.
3. Add the game to `games.json`
Find the last game entry:
``` json
{
  "name": "Karlson",
  "filepath": "./g/karlson/index.html",
  "icon": "./g/karlson/icon.png"
}
```
Add a comma after it and then add your new game:
``` json
{
  "name": "New Game",
  "filepath": "./g/newgame/index.html",
  "icon": "./g/newgame/icon.png"
}
```
Example finished file:
``` json
{
  "games": [
    {
      "name": "Something",
      "filepath": "./g/something/index.html",
      "icon": "./g/something/icon.png"
    },
    {
      "name": "Karlson",
      "filepath": "./g/karlson/index.html",
      "icon": "./g/karlson/icon.png"
    },
    {
      "name": "New Game",
      "filepath": "./g/newgame/index.html",
      "icon": "./g/newgame/icon.png"
    }
  ]
}
```
