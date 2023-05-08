<!DOCTYPE html>
<html>
  <head>
    <title>Nowhere in Void</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div id="coverBackground">
      <div id="gameTitle">Nowhere in Void</div>
      <div id="startGame">Start Game</div>
      <div id="rules">
        <div id="howToPlay">How To Play</div>
        <ul type="-">
          <li>Press W,A,S,D keys to move, SPACE to jump and Q to upgrade abilities.</li>
          <li>Collect keys, unlock and find the portal to advance to the next level.</li>
          <li>Unlock abilities and upgrade them for a better chance of survival.</li>
          <li>Avoid the traps and running out of time.</li>
          <li>Put ON your headphones to enjoy the game with background sound.</li>
        </ul>      
      </div>
    </div>
    
    <script type="module" src="script.js"></script>
    <script type="module" src="classes.js"></script>
    <!-- game status -->
    <div id="gameStatusContainer">
      <div id="levelInfo"></div>
      <div id="timer"></div>
      <div id="badgesInfo">
        <div id="tokensContainer">
          <img id="tokenImg" src="assets/icons/upgrade.svg" width="28" height="28">
          <div id="tokensCountElement"></div>
        </div>
        <div id="coinsContainer">
          <img id="coinImg" src="assets/icons/coin.svg" width="28" height="28">
          <div id="coinsCountElement"></div>
        </div>
      </div>
      <div id="keysContainer">
        <img id="keyImg" src="assets/icons/key.svg" width="28" height="28">
        <div id="keysCountElement"></div>
      </div>
    </div>
  </body>
</html>