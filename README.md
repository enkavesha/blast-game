https://enkavesha.github.io/blast-game/

# BLAST GAME

#### GAME DESCRIPTION

Game field has arbitrary size NxM (10x10). Each tile has random color. Number of possible colors is set in level config. Tile of each color has equal chance to appear.   

When clicking on a tile, an area of adjacent tiles of the same color is removed. The minimum size of an area is 2 by default. Tiles drop down to empty spaces. New tiles are generated and fill empty spaces. It continues until field is completely filled again.   

You should always be able to remove tiles. If there are no moves - tiles are shuffled. Number of autoshuffles is predefined. If all autoshuffles are used and there are still no moves - you lose.


#### BONUS LOGIC DESCRIPTION

You can get **super tile** for removing 5+ tiles, and **field blast tile** for removing 10+ tiles. **Super tile** removes whole row or col, **field blast tile** removes all field. You receive **row super tile** if removed area has more tiles on Y axis than on X axis, and vice a versa. If width of removed area is equal to its height - **super tile** will be random.

`chainSuperTiles` setting defines whether **super tiles** will be triggered if they are in area removed by other **super tile**.

You earn coins for creating **super tiles**. `bonusForCoins` setting determines whether you will spend coins for bonuses: **shuffle**, **bomb**, **teleport**. If not, you have predefined number of each bonus for each level.

**Shuffle** shuffles all tiles.   
**Bomb** removes area of predefined radius.  
**Teleport** swaps two selected tiles.

#### QUICK START

* Install dependencies

   `npm i`

* To build assets and browse game locally from `index.html`   
   `gulp build`
* To get one `.html` build file   
   `gulp build`   
   `npm run prod`
* To play around with settings and see changes on the fly   
   `gulp sync`
