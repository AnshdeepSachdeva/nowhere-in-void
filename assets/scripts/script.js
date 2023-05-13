import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { PointerLockControls } from '../../node_modules/three/examples/jsm/controls/PointerLockControls.js';
import {Cell , Wall, WallSC, Player, CustomFCurve, CustomSCurve, ItemCell } from './classes.js'
const clock = new THREE.Clock();


// Create a scene
let scene;


// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5,2.5, 5);

let player = new Player(camera)

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cube
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0.5, 0);

// Define movement controls
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let isJumping = false;

let firstMessage = {
  upgrade:false,
  speed:false,
  map:false,
  through:false,
  trap:false
}
// Create pointer lock controls
const controls = new PointerLockControls(camera, renderer.domElement);
let inventoryArray = [];

// Add event listeners for keyboard input
document.addEventListener('keydown', onKeyDown);

document.addEventListener('keyup', onKeyUp);

// Load skybox texture
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'assets/images/gradient.png',
  'assets/images/gradient.png',
  'assets/images/gradient.png',
  'assets/images/gradient.png',
  'assets/images/gradient.png',
  'assets/images/gradient.png',
]);

// Set the skybox texture as the scene's background

const mapImages = ['assets/ability-icons/map/map.png', 'assets/ability-icons/map/2map.png', 'assets/ability-icons/map/3map.png'];
const speedImages = ['assets/ability-icons/speed/speed.png', 'assets/ability-icons/speed/2speed.png', 'assets/ability-icons/speed/3speed.png'];

let hasClicked = false;


let tabRequest = false;
let popupEnabled = false;

const coverBackground = document.getElementById('coverBackground');



let g = false

let uWDS = []
let keyContainer = []
let mysContainer = []

let cols, rows;
let w = 10;
let grid = [];
let i, j;
let current;
let sleep = 10;
cols = sleep;
rows = sleep;
let stack = [];


let groundGeometry = new THREE.PlaneGeometry(sleep * w, sleep * w);
var groundMaterial = new THREE.MeshBasicMaterial( {color:0xeeeeee/*, map: groundTexture*/} );


let ground;

let keyCounter = false
let keyPallete = []
let selectedKeys = []
let uCIA = []


// Define movement variables
const acceleration = 0.1;
const friction = 0.8;
let velocity = new THREE.Vector3(0, 0, 0);
let t=0
let endpoint = []

let nukeSound = new Audio('assets/sound/nuke.mp3');
nukeSound.volume = 0.7
nukeSound.load()

let backgroundMusic = new Audio('assets/sound/ambience.mp3');
backgroundMusic.load()
backgroundMusic.loop = true
backgroundMusic.playbackRate = 1
backgroundMusic.volume = 0.3

let keySound = new Audio('assets/sound/coin.mp3');
keySound.load()

let boxSound = new Audio('assets/sound/box.wav');
boxSound.playbackRate = 1
boxSound.volume = 0.3
boxSound.load()

let portalSound = new Audio('assets/sound/portal.mp3');
portalSound.playbackRate = 1.3
portalSound.load()





// container for showing progress messages
const messagesContainer = document.createElement('div');

const gameStatusContainer = document.getElementById('gameStatusContainer');

const levelInfo = document.getElementById('levelInfo');
const timer = document.getElementById('timer');

const tokensCountElement = document.getElementById("tokensCountElement");
const coinsCountElement =  document.getElementById("coinsCountElement");
const keysCountElement = document.getElementById("keysCountElement");

let remainingTime;
let countdownInterval;

const startGame = document.getElementById('startGame');
startGame.addEventListener('click', function (event) {
  gameStatusContainer.style.display = 'block';
  if(!popupEnabled){
    coverBackground.style.display = "none";
    if (!hasClicked) {
        hasClicked = true;
        animate();
        initializeGame();
    }
    controls.lock();
    backgroundMusic.play()
  }
});

levelReset();
document.addEventListener('click', function (event) {
  gameStatusContainer.style.display = 'block';
  if(!popupEnabled){
    coverBackground.style.display = "none";
    if (!hasClicked) {
        hasClicked = true;
        animate();
        initializeGame();
    }
    controls.lock();
    backgroundMusic.play()
  }
})
function levelReset() {
  scene = new THREE.Scene();
  player.keysCount = 0;
  camera.position.set(w/2,2.5,w/2);
  uWDS = [];
  keyContainer = [];
  mysContainer = [];

  sleep = player.level == 1?10:22;
  grid = [];
  stack = [];

  groundGeometry = new THREE.PlaneGeometry(sleep * w, sleep * w);
  ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(sleep * w / 2, 0, sleep * w / 2);
  scene.add(ground);
  scene.background = texture;

  keyCounter = false;
  keyPallete = [];
  selectedKeys = [];
  uCIA = [];
  endpoint = [];
  cols = sleep;
  rows = sleep;

  remainingTime = player.level==1?180:900;
  levelInfo.innerText = "Level - " + player.level;
  
  setup();
  draw();
  setBoostTimeout();
  setTimeout(setTrap, 9000);
}

function initializeGame() {
  messagesContainer.id = 'messages-container';
  messagesContainer.style.position = 'fixed';
  messagesContainer.style.top = '20px';
  messagesContainer.style.left = '20px';
  messagesContainer.style.color = 'white';
  messagesContainer.style.zIndex = '9999';
  document.body.appendChild(messagesContainer);

  // Set level info
  levelInfo.innerText = "Level - " + player.level;

  // Set tokens count
  updateTokensCount();

  // Set the coins count
  updateCoinsCount();

  // Set the keys count
  updateKeysCount();

  // start timer
  updateCountdown();

  // Set up the player object with some initial values
  countdownInterval = setInterval(updateCountdown, 1000);
}

//functions
function jump() {
  const jumpHeight = 2.0;
  const jumpSpeed = 0.075;
  const startHeight = camera.position.y;
  let frameCount = 0;

  function jumpInterval() {
    frameCount++;
    const newHeight = startHeight + jumpHeight * Math.sin(jumpSpeed * frameCount);
    if (newHeight <= startHeight) {
      camera.position.y = startHeight;
      isJumping = false;
      clearInterval(intervalId);
    } else {
      camera.position.y = newHeight;
    }
  }

  let intervalId = setInterval(jumpInterval, 15);
  isJumping = true;
}

// Define event handlers for keyboard input
function onKeyDown(event) {
  switch (event.code) {
    case 'KeyW':
      moveForward = true;
      break;
    case 'KeyA':
      moveLeft = true;
      break;
    case 'KeyS':
      moveBackward = true;
      break;
    case 'KeyD':
      moveRight = true;
      break;
    case 'Space':
      if (!isJumping) {
        jump(camera);

      }
      break;
    case 'Tab':
        if(hasClicked) {
            togglePopup();
        }
  }
  // prevent default tab behavior
  if (event.code === 'Tab') {
    event.preventDefault();
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case 'KeyW':
      moveForward = false;
      break;
    case 'KeyA':
      moveLeft = false;
      break;
    case 'KeyS':
      moveBackward = false;
      break;
    case 'KeyD':
      moveRight = false;
      break;
    case 'Digit2':
      if(player.coinsCount >= 4&&(player.bMap.level>0||player.bMap.u>0)){
        player.coinsCount -= 4;
        player.uMap = true;
        mazeBoosterActivation()
        for(i in inventoryArray){
          if(i.name == "Map"){
            i.activated = true;
          }
        }
        updateInventory(inventoryArray,player.coinsCount);
      }
      updateCoinsCount()
      updateInventory(inventoryArray,player.coinsCount)
      break
    case 'Digit1':
      if(player.coinsCount >= 3&&(player.bSpeed.level>0||player.bSpeed.u>0)){
        player.coinsCount -= 3;
        player.uSpeed = true;
        for(i in inventoryArray){
          if(i.name == "Speed"){
            i.activated = true;
          }
        }
        updateInventory(inventoryArray,player.coinsCount)
        setTimeout(()=>{
          player.uSpeed = false;
          for(i in inventoryArray){
            if(i.name == "Speed"){
              i.activated = false;
            }
          }
        }, player.bSpeed.level == 1 ? 7000 : 13000);
      }
      updateCoinsCount();
      updateInventory(inventoryArray,player.coinsCount);
  }
}

function createWall(x, y, z, width, height, depth, color, dive,wallNo) {
  // create wall geometry
  var wallGeometry = new THREE.BoxGeometry(width, height, depth);

  // create wall material
  var wallMaterial = new THREE.MeshBasicMaterial({color: color});
  // create wall mesh
  var wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
  wallMesh.name = "wall";

  // set wall position
  wallMesh.position.set(x, y, z);

  // add wall to the scene
  scene.add(wallMesh);

  //add data to universalWallsDataSet
  dive = dive == 1?true:false;
  let substrate
  if(dive){
    substrate = new Wall(x,z,wallNo,w)
  }
  else{
    substrate = new WallSC(x,z,wallNo,w)
  }

  uWDS.push(substrate);
}


function draw() {
  let colour2 = 0xd2d2d2
  let colour = 0xafafaf
  let wid = 0.03
  for (let h = 0; h < grid.length; h++) {
    //top
    if (grid[h].walls[0]) {
      createWall(grid[h].i * w + w / 2, w / 2, grid[h].j * w, w, w, wid,colour2 ,1,0);
    }

    if (grid[h].walls[2]) {
      createWall(grid[h].i * w + w / 2, w / 2, grid[h].j * w + w, w, w, wid, colour2, 1,2);
    }

    if (grid[h].walls[3]) {
      createWall(grid[h].i * w, w / 2, grid[h].j * w + w / 2, wid, w, w, colour,0,3);
    }

    if (grid[h].walls[1]) {
      createWall(grid[h].i * w + w, w / 2, grid[h].j * w + w / 2, wid, w, w, colour,0,1);
    }
  }
}

function wallCollisionDetector(mV){
  let pointAC = [camera.position.x, camera.position.z];
  for(let i=0;i<uWDS.length;i++){
    uWDS[i].setup(pointAC);
    if(uWDS[i].perpDist < 1 && uWDS[i].atRange){
      mV = uWDS[i].preventMovement(mV,pointAC);
    }
  }
  return mV;
}


function index(i, j) {
  if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
    return -1;
  }
  return i + j * sleep;
}

function setup() {
  
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let cell = new Cell(i, j);
      grid.push(cell);
    }
  }
  for (i = 0; i < rows; i++) {
    for (j = 0; j < cols; j++) {
      let cell = new ItemCell(i, j,sleep);
      uCIA.push(cell);
    }
  }  
  current = grid[0];
  work();
  generateKeyPlace(keyPallete)
  for(let u = 0;u < selectedKeys.length;u++){
    let f = selectedKeys[u];
    uCIA[f.i*sleep+f.j].boostType = 1;
  }
}


function work() {
  current.visited = true;

  //step 1
  let next = current.checkNeighbors(grid,cols,rows,sleep);

  if (next) {
    next.visited = true;

    //step 2
    stack.push(current);

    //step 3
    removeWalls(current, next);

    //step 4
    current = next;

    //step 5
    keyCounter = true
    work();
  } else if (stack.length > 0) {
    if(keyCounter){
      keyPallete.push(current);
      keyCounter = false;
    }
    current = stack.pop();
    work();
  }
  
}

function removeWalls(a, b) {
  let x = a.i - b.i;
  if (x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (x === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }

  let y = a.j - b.j;
  
  if (y === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}


/*uIMCA = []

class ItemMeshComponent {
  constructor (x,y,comp) {
      this.x = x;
      this.y = y;
      this.component = comp
  }
}*/

function checkPickUp(){
  let camX = camera.position.x
  let camY = camera.position.z
  for(let h = 0;h<uCIA.length;h++){
    let item = uCIA[h]
    let dis = Math.sqrt(Math.pow(camX-(item.x*w+w/2),2)+Math.pow(camY-(item.y*w+w/2),2))
    if(dis<3){
      switch(uCIA[h].boostType){
        case 1:
          player.keysCount += 1
          keySound.play()
          
          // Udate Keys Count
          updateKeysCount();
          
          keyDissapearAnimation(uCIA[h].comp)
          uCIA[h].boostType = 0
          if(player.keysCount!=3){
              showMessages("You have found a key.")
          }
          else{
              showMessages("You have unlocked the portal, find the portal and advance to the next level.")
              portal()
          }
          break
        case -1:
          uCIA[h].boostType = 0
          
          boxSound.play()
          
          boxOpening(h)
          keyDissapearAnimation(uCIA[h].comp)
          break
        case 13:
          uCIA[h].boostType = 0
          player.level++
          player.keysCount = 0
          
          // Update Keys Count
          updateKeysCount();

          portalSound.play()   
                            
          showMessages("You have now moved to level "+player.level)
          remainingTime = 9999
          setTimeout(()=>{
              levelReset()
          },4000)
          
          break
        case 8:
          activateNuke(item)
          uCIA[h].boostType = 0
      }
    }
      
  }
}

function boxOpening() {
  if(player.level == 1){
    let rny = Math.floor(Math.random()*10)
    if(rny < 8){
      let rn6 = Math.floor(Math.random()*4)+1
      player.coinsCount += rn6
      showMessages("You recieved "+rn6+" coins.")
      updateCoinsCount()
      updateInventory(inventoryArray,player.coinsCount)
    }
    else{
      let rn7 = Math.floor(Math.random()*2)
      if(rn7 == 0){
        if(firstMessage.map == false){
          player.bMap.level += 1
          firstMessage.map = true
          showMessages("You have unlocked maps ability! \n press 2 to activate the ability","#fff")
          let obj = { name: 'Map', cost: 4, no: 2, activated: false,level :1}
          inventoryArray.push(obj)
          updateInventory(inventoryArray,player.coinsCount)
        }
        else{
          let newTokens = Math.floor(Math.random()*3)+1
          player.tokensCount += newTokens
          showMessages("You got " +newTokens+ " upgrade token","#fff")
          updateTokensCount()
        }
      }
      else{    
        if(firstMessage.speed == false){
          player.bSpeed.level +=1
          firstMessage.speed = true
          showMessages("You have unlocked the speed ability! \n press 1 to activate the ability","#fff")
          let obj = { name: 'Speed', cost: 3, no: 1, activated: false,level :1}
          inventoryArray.push(obj)
          updateInventory(inventoryArray,player.coinsCount)
        }
        else{
          let newTokens = Math.floor(Math.random()*3)+1
          player.tokensCount += newTokens
          showMessages("You got " +newTokens+ " upgrade token","#fff")
          updateTokensCount()
        }
      }
    }

  }
  else if (player.level ==2){
    let rny = Math.floor(Math.random()*15)
    if(rny < 8){
      let rn6 = Math.floor(Math.random()*4)+2
      player.coinsCount += rn6
      showMessages("You recieved "+rn6+" coins.")
      updateCoinsCount()
      updateInventory(inventoryArray,player.coinsCount)
    }
    else{
      let rn7 = Math.floor(Math.random()*2)
      if(rn7 == 0){
        if(firstMessage.map == false){
          player.bMap.level += 1
          firstMessage.map = true
          showMessages("You have unlocked maps ability! \n press 2 to activate the ability","#fff")
          let obj = { name: 'Map', cost: 4, no: 2, activated: false,level :1}
          inventoryArray.push(obj)
          updateInventory(inventoryArray,player.coinsCount)
        }
        else{
          let newTokens = Math.floor(Math.random()*3)+1
          player.tokensCount += newTokens
          showMessages("You got " +newTokens+ " upgrade token","#fff")
          updateTokensCount()
        }
      }
        else if(rn7 == 1){
          if(firstMessage.speed == false){
            player.bSpeed.level +=1
            firstMessage.speed = true
            showMessages("You have unlocked the speed ability! \n press 1 to activate the ability","#fff")
            let obj = { name: 'Speed', cost: 3, no: 1, activated: false,level :1}
            inventoryArray.push(obj)
            updateInventory(inventoryArray,player.coinsCount)
          }
          else{
            let newTokens = Math.floor(Math.random()*3)+1
            player.tokensCount += newTokens
            showMessages("You got " +newTokens+ " upgrade token","#fff")
            updateTokensCount()
          }
        }
        else {
          let newTokens = Math.floor(Math.random()*3)+1
          player.tokensCount += newTokens
          showMessages("You got " +newTokens+ " upgrade token","#fff")
          updateTokensCount()
        }
    }
  }
}


function portal() {
  let portalPallete = []
  for(let i =0;i<keyPallete.length;i++){
    if(uCIA[keyPallete[i].i*sleep+keyPallete[i].j].boostType == 0){
      portalPallete.push(keyPallete[i])
    }
  }
  let port = portalPallete[Math.floor(Math.random()*portalPallete.length)]
  uCIA[port.i*sleep+port.j].boostType = 13
  // Create the geometry
  const radius = 2.7;
  const detail = 0;
  const geometry = new THREE.DodecahedronGeometry(radius, detail);

  // Create the material
  const color = new THREE.Color(0x000000); // Unique color
  const material = new THREE.MeshBasicMaterial({ color });

  // Create the mesh
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(port.i * w + w / 2, 4, port.j * w + w / 2);
  // Add the mesh to the scene
  scene.add(mesh);
  endpoint.push(mesh)
}
function generateKeyPlace(keyPallete){
  let placeArray = []
  
  let a = Math.floor(Math.random()*keyPallete.length/3)
  let b = Math.floor(Math.random()*keyPallete.length/3+keyPallete.length/3)
  b= a==b?b+Math.floor(Math.random()*keyPallete.length/3-1):b
  let c = Math.floor(Math.random()*keyPallete.length/3+keyPallete.length*2/3)
  c= b==c?c+Math.floor(Math.random()*keyPallete.length/3-1):c

  placeArray.push(a)
  placeArray.push(b)
  placeArray.push(c)

  selectedKeys.push(keyPallete[a])
  selectedKeys.push(keyPallete[b])
  selectedKeys.push(keyPallete[c])
  
  

  for(let r = 0;r<keyPallete.length;r++){
    if(!placeArray.includes(r)){
      // Create a texture for the material
      const texture = new THREE.TextureLoader().load('assets/icons/question-mark.png');
      const material = new THREE.MeshBasicMaterial({ map: texture });

      // Create a geometry for the box
      const geometry = new THREE.BoxGeometry(1, 1, 1);

      // Create a mesh for the box
      const box = new THREE.Mesh(geometry, material);
      box.position.set(keyPallete[r].i*w+w/2,2.5,keyPallete[r].j*w+w/2)
      uCIA[keyPallete[r].i*sleep+keyPallete[r].j].boostType = -1
      scene.add(box)
      uCIA[keyPallete[r].i*sleep+keyPallete[r].j].comp = box
      mysContainer.push(box)
    }
  }
  for(let r = 0;r<selectedKeys.length;r++){
    const group = new THREE.Group();
    const geometry = new THREE.TorusGeometry( 0.2, 0.1, 16, 100 );
    const material = new THREE.MeshBasicMaterial({color:0x000000});
    const torus = new THREE.Mesh( geometry, material );
    const path = new CustomFCurve( 0.5 );
    const geometry2 = new THREE.TubeGeometry( path, 20, 0.07, 8, false );
    const mesh = new THREE.Mesh( geometry2, material);
    const path2 = new CustomSCurve( 0.1 );
    const geometry3 = new THREE.TubeGeometry( path2, 20, 0.07, 8, false );
    const mesh2 = new THREE.Mesh( geometry3, material);
    const path3 = new CustomSCurve( 0.1 );
    const geometry4 = new THREE.TubeGeometry( path3, 20, 0.07, 8, false );
    const mesh3 = new THREE.Mesh( geometry4, material);
    


    group.add(mesh);
    group.add(torus);
    group.add(mesh2)
    group.add(mesh3)

    // Position the meshes so that they are on top of each other
    mesh.position.set(0.35, 0, 0);
    torus.position.set(-0.45, 0, 0);
    mesh2.position.set(0.45,-0.1,0)
    mesh3.position.set(0.65,-0.1,0)

    group.position.set(selectedKeys[r].i * w + w / 2, 2.5, selectedKeys[r].j * w + w / 2);
    // Add the group to the scene
    scene.add(group);
    keyContainer.push(group)
    uCIA[selectedKeys[r].i*sleep+selectedKeys[r].j].comp = group
  }
}

function keyDissapearAnimation(comp) {
  scene.remove(comp)
}


function showMessages(message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.innerText = message;
  messagesContainer.appendChild(messageElement);

  setTimeout(() => {
    messagesContainer.removeChild(messageElement);
  }, 8000);
}

function displayMaze() {
  let ele = document.getElementById("maze");
  if (ele) {
    ele.parentNode.removeChild(ele); // remove the previous "maze" element
  }
  let ele2 = document.getElementById("mapContainer");
  if (ele2) {
    ele2.parentNode.removeChild(ele2); // remove the previous "maze" element
  }

  const mapCanvas = document.createElement('canvas');
  const ctx = mapCanvas.getContext('2d');
  const tileSize = 20; // size of each tile in pixels
  const numRows = player.level == 1 ? 10: 10; // assuming a square maze
  const mapContainer = document.createElement('div');

  mapContainer.style.backgroundColor = 'rgba(0,0,0,1)';
  mapContainer.style.position = 'fixed';
  mapContainer.style.borderRadius = '10px'
  mapContainer.style.top = '255px';
  mapContainer.style.right = '30px';
  mapContainer.style.padding = '10px 10px 6px 10px';
  mapContainer.id = "mapContainer"

  mapCanvas.id = "maze"
  mapCanvas.width = numRows * tileSize;
  mapCanvas.height = numRows * tileSize;
  // mapCanvas.style.margin = '8px';
  mapCanvas.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';

  mapContainer.appendChild(mapCanvas);
  document.body.appendChild(mapContainer);

  let l1 =  player.level == 1 ? true: false;

  let vSC = false
  let hSC = false
  let vshift = l1?0:(camera.position.x/w*tileSize - 10*tileSize/2) 
  let hshift = l1?0:(camera.position.z/w*tileSize - 10*tileSize/2)
  let vlock = !(camera.position.x/w*tileSize <= (sleep-numRows/2)*tileSize && camera.position.x/w*tileSize >= 5*tileSize);

  if(camera.position.x/w*tileSize >= (sleep-5)*tileSize){
      vSC = true
      vshift = (sleep-10)*tileSize
  }
  let hlock = !(camera.position.z/w*tileSize <= (sleep-numRows/2)*tileSize && camera.position.z/w*tileSize >= 5*tileSize)
  if(camera.position.z/w*tileSize >= (sleep-5)*tileSize){
      hSC = true
      hshift = (sleep-10)*tileSize
  }
  ctx.beginPath();
  ctx.arc(vlock && !vSC? (camera.position.x/w)*tileSize : (camera.position.x/w)*tileSize - vshift,hlock && !hSC? (camera.position.z/w)*tileSize : (camera.position.z/w)*tileSize-hshift, tileSize/4 , 0, 2 * Math.PI);
  ctx.fillStyle = 'black';
  ctx.fill();

  grid.forEach((cell) => {
    const i = cell.i
    const j = cell.j
    
    // draw top wall
    if (cell.walls[0]) {
      ctx.beginPath();
      ctx.moveTo(vlock && !vSC?i * tileSize:i * tileSize-vshift,hlock && !hSC? j * tileSize:j*tileSize-hshift);
      ctx.lineTo(vlock && !vSC?(i + 1) * tileSize:(i + 1) * tileSize - vshift,hlock && !hSC?j * tileSize:j*tileSize-hshift);
      ctx.stroke();
    }
    
    // draw right wall
    if (cell.walls[1]) {
      ctx.beginPath();
      ctx.moveTo(vlock && !vSC?(i + 1) * tileSize:(i + 1) * tileSize - vshift, hlock && !hSC?j * tileSize:j * tileSize-hshift);
      ctx.lineTo(vlock && !vSC?(i + 1) * tileSize:(i + 1) * tileSize - vshift, hlock && !hSC?(j + 1) * tileSize:j * tileSize-hshift);
      ctx.stroke();
    }
    
    // draw bottom wall
    if (cell.walls[2]) {
      ctx.beginPath();
      ctx.moveTo(vlock && !vSC?(i + 1) * tileSize:(i + 1) * tileSize-vshift, hlock && !hSC?(j + 1) * tileSize:(j + 1) * tileSize - hshift);
      ctx.lineTo(vlock && !vSC?i * tileSize:i * tileSize-vshift, hlock && !hSC?(j + 1) * tileSize:(j + 1) * tileSize - hshift);
      ctx.stroke();
    }
    
    // draw left wall
    if (cell.walls[3]) {
      ctx.beginPath();
      ctx.moveTo(vlock && !vSC?i * tileSize:i * tileSize-vshift, hlock && !hSC?(j + 1) * tileSize:(j + 1) * tileSize-hshift);
      ctx.lineTo(vlock && !vSC?i * tileSize:i * tileSize-vshift, hlock && !hSC?j * tileSize:j * tileSize-hshift);
      ctx.stroke();
    }
  });
}



function mazeBoosterActivation() {
  let x = 0;
  console.log("#1")
  const inter = setInterval(() => {
    console.log("#2")
    displayMaze(); // call displayMaze() once before starting the interval
    x += 1;
    if ((x >= 15 && player.bMap.level == 1)||(x >= 25 && player.bMap.level == 2)||(x >= 40 && player.bMap.level == 3)) {
      console.log("#1")
      clearMaze();
      player.uMap = false
      for(i in inventoryArray){
        console.log("#1")
          if(i.name == "Map"){
              i.activated = false
          }
      }
      updateInventory(inventoryArray,player.coinsCount)
      clearInterval(inter);
    }
  }, 1000);
}

function clearMaze(){
  let ele = document.getElementById("maze");
  ele.parentNode.removeChild(ele);
  let ele2 = document.getElementById("mapContainer");
  ele2.parentNode.removeChild(ele2);
}



function animate() {
  requestAnimationFrame(animate);

  let moveVector = new THREE.Vector3(0, 0, 0);
  const moveSpeed = player.uSpeed?player.bSpeed.level==1?0.4:0.55:0.2;
  const direction = camera.getWorldDirection(new THREE.Vector3());

  if (moveForward) {
    let cameraDirection = direction.normalize();
    moveVector.add(new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize().multiplyScalar(moveSpeed));
  }
  if (moveBackward) {
    let cameraDirection = direction.normalize();
    moveVector.add(new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize().multiplyScalar(-moveSpeed));
  }
  if (moveLeft) {
    let cameraDirection = direction.normalize();
    let strafeVector = new THREE.Vector3(cameraDirection.z, 0, -cameraDirection.x);
    moveVector.add(strafeVector.normalize().multiplyScalar(moveSpeed));
  }
  if (moveRight) {
    let cameraDirection = direction.normalize();
    let strafeVector = new THREE.Vector3(cameraDirection.z, 0, -cameraDirection.x);
    moveVector.add(strafeVector.normalize().multiplyScalar(-moveSpeed));
  }

  // Update velocity based on acceleration and friction
  velocity.add(moveVector.clone().multiplyScalar(acceleration)).multiplyScalar(friction);

  // detect and handle wall collisions
  moveVector = wallCollisionDetector(moveVector);
  checkPickUp()


  // Get the elapsed time since the last frame
  const elapsedTime = clock.getElapsedTime();

  // Set the rotation of the mesh on its own axis
  for(let i = 0;i<keyContainer.length;i++){
    keyContainer[i].rotation.y = elapsedTime;
  }
  for(let i = 0;i<mysContainer.length;i++){
      mysContainer[i].rotation.y = elapsedTime;
    
      mysContainer[i].rotation.x = elapsedTime;
  }
  for(let i = 0;i<endpoint.length;i++){
    endpoint[i].rotation.y = elapsedTime*7;
    endpoint[i].rotation.x = elapsedTime*7;
  }

  // Update camera position based on corrected movement vector
  camera.position.add(moveVector);
  renderer.render(scene, camera);

}

function updateCountdown() {
  remainingTime--;
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  timer.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  if (remainingTime <= 0) {
    clearInterval(countdownInterval);
    gameOver();
  }
}

function updateTokensCount() {
  tokensCountElement.innerText = ` ${player.tokensCount}`;
}

function updateCoinsCount() {
  coinsCountElement.innerText = ` ${player.coinsCount}`;
}

function updateKeysCount() {
  keysCountElement.innerText = ` ${player.keysCount} / 3`;
}

function gameOver() {
  const overlay = document.createElement('div');
overlay.classList.add('overlay');

const gameOverText = document.createElement('div');
gameOverText.classList.add('game-over-text');
gameOverText.textContent = 'Game Over';
overlay.appendChild(gameOverText);

const restartText = document.createElement('p');
restartText.classList.add('restart-text');
restartText.textContent = 'Restarting in 3...';
overlay.appendChild(restartText);

document.body.appendChild(overlay);

let count = 3;
const countdownInterval = setInterval(() => {
  count--;
  restartText.textContent = 'Restarting in ' + count + '...';
}, 1000);

setTimeout(() => {
  clearInterval(countdownInterval);
  window.location.reload();
}, 3000);

}

function updateInventory(inventoryArray, money) {
  // Check if inventoryArray is empty
  if (!inventoryArray || inventoryArray.length === 0) {
      return;
  }

  // Remove the existing inventory element
  const inventoryEl = document.getElementById('inventory');
  if (inventoryEl) {
    inventoryEl.remove();
  }

  // Create the inventory element
  const inventory = document.createElement('div');
  inventory.id = 'inventory';
  inventory.style.position = 'fixed';
  inventory.style.bottom = '0';
  inventory.style.right = '0';
  inventory.style.display = 'flex';
  inventory.style.flexDirection = 'row-reverse';
  inventory.style.gap = '10px';
  inventory.style.padding = '10px';
  inventory.style.background = 'rgba(0, 0, 0, 0.5)';
  inventory.style.color = 'white';
  inventory.style.fontFamily = 'Arial';
  inventory.style.fontSize = '20px';
  inventory.style.zIndex = '999';

  // Add the items to the inventory
  for (let item of inventoryArray) {
    const itemEl = document.createElement('div');
    itemEl.style.display = 'flex';
    itemEl.style.flexDirection = 'column';
    itemEl.style.alignItems = 'center';

    // Add the item image
    const itemImgWrapper = document.createElement('div');
    itemImgWrapper.style.position = 'relative';

    const itemImg = document.createElement('img');
    if(item.name === "Map"){
      itemImg.src = mapImages[item.level-1]
    }
    else if(item.name === "Speed"){
      itemImg.src = speedImages[item.level-1]
    }
    itemImg.style.width = '50px';
    itemImg.style.height = '50px';
    itemImg.style.borderRadius = '25%';
    itemImg.style.objectFit = 'cover';

    // Grayscale the item image if the player cannot afford it
    if (item.cost > money) {
      if (item.name === 'Map') {
          itemImg.src = 'assets/ability-icons/map/map.png';
        } else if (item.name === 'Speed') {
          itemImg.src = 'assets/ability-icons/speed/speed.png';
        }
    }

    // Add the item cost and quantity
    const itemCost = document.createElement('div');
    itemCost.textContent = `${item.cost}`;
    itemCost.style.position = 'absolute';
    itemCost.style.top = '-10px';
    itemCost.style.right = '0px';
    itemCost.style.transform = 'translate(-10%,-10%)'
    itemCost.style.fontSize = '14px';
    itemCost.style.fontWeight = 'bold';
    itemCost.style.height = '27px'
    itemCost.style.width = '27px'
    itemCost.style.borderRadius = '50%'
    itemCost.style.backgroundColor = 'white'
    itemCost.style.color = 'black'
    itemCost.style.display = 'flex';
    itemCost.style.alignItems = 'center';
    itemCost.style.justifyContent = 'center';

    const coinImg = document.createElement('img');
    coinImg.src = 'assets/icons/coin.svg';
    coinImg.style.filter = "grayscale(100%)"
    coinImg.style.width = '15px';
    coinImg.style.height = '15px';
    coinImg.style.position = 'relative'
    coinImg.style.left = '9px'
    coinImg.style.marginLeft = '-8px';
    coinImg.style.borderRadius = '50%';

    itemCost.appendChild(coinImg);
    itemImgWrapper.appendChild(itemImg);
    itemImgWrapper.appendChild(itemCost);
    itemEl.appendChild(itemImgWrapper);
    
    const itemNo = document.createElement('div');
    itemNo.textContent = `[${item.no}]`;
    itemNo.style.fontSize = '14px';
    itemNo.style.fontWeight = 'bold';
    itemNo.style.marginTop = '5px';
    itemNo.style.marginLeft = '-6px';
    itemNo.style.textAlign = 'center';
    itemImgWrapper.appendChild(itemNo);
    // Highlight the item image if it's activated
    if (item.activated) {
      itemImg.style.border = '10px solid white';
    }

    inventory.appendChild(itemEl);
  }

  document.body.appendChild(inventory);
}

// Define upgrade costs and tokens
const upgradeCosts = [5, 12, 30];
const upgradeTokensReq = [2, 5, 10];

function showAbilitiesPopup() {
  const popup = document.createElement('div');
  popup.id = "popup"
  popup.style.position = 'fixed';
  popup.style.width = '60%';
  popup.style.height = '50%';
  popup.style.top = '25%';
  popup.style.left = '20%';
  popup.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  popup.style.border = '2px solid black';
  popup.style.borderRadius = '5px';
  popup.style.padding = '20px';
  popup.style.zIndex = '999';


  // Add title to popup
  const title = document.createElement('div');
  title.style.fontSize = '30px'
  title.textContent = 'Abilities List';
  title.style.textAlign = 'center';
  popup.appendChild(title);
    

  // Add ability list to popup
  const abilityList = document.createElement('ul');
  abilityList.style.listStyleType = 'none';
  abilityList.style.margin = '0';
  abilityList.style.padding = '0';
  abilityList.style.height = '80%';
  abilityList.style.overflow = 'auto';


  // Loop through inventoryArray and add abilities to list
  for (let i = 0; i < inventoryArray.length; i++) {
    const ability = inventoryArray[i];
    const abilityItem = document.createElement('li');
    abilityItem.style.display = 'flex';
    abilityItem.style.alignItems = 'center';
    abilityItem.style.margin = '10px 0';
    
    // Add image to ability item
    const imageWrapper = document.createElement('div');
    imageWrapper.style.marginRight = '20px';
    const image = document.createElement('img');
    if (ability.name === 'Speed') {
      image.src = speedImages[ability.level - 1];
    } else if (ability.name === 'Map') {
      image.src = mapImages[ability.level - 1];
    }
    image.style.width = '50px';
    image.style.height = '50px';
    imageWrapper.appendChild(image);
    abilityItem.appendChild(imageWrapper);
    
    // Add ability name to ability item
    const abilityName = document.createElement('div');
    abilityName.textContent = ability.name;
    abilityName.style.fontSize = '20px';
    abilityItem.appendChild(abilityName);
    
    
    
    // Add upgrade button to ability item
    const upgradeButton = document.createElement('button');
    const level = ability.level;
    if (level === 1) {
      upgradeButton.innerHTML = ` Upgrade <img src="assets/icons/coin.svg" alt="coin" height="16px" style="border-radius: 50%; -webkit-filter:grayscale(100%); vertical-align: middle; margin-top: -4px;"> ${upgradeCosts[0]} <img src="assets/icons/upgrade.svg" alt="upgrade tokens" height="16px" style="border-radius: 50%;filter: grayscale(100%); -webkit-filter: grayscale(100%); vertical-align: middle; margin-top: -4px;"> ${upgradeTokensReq[0]}`;
    } else if (level === 2) {
      upgradeButton.innerHTML = ` Upgrade <img src="assets/icons/coin.svg" alt="coin" height="16px" style="border-radius: 50%; -webkit-filter:grayscale(100%); vertical-align: middle; margin-top: -4px;"> ${upgradeCosts[1]} <img src="assets/icons/upgrade.svg" alt="upgrade tokens" height="16px" style="border-radius: 50%;filter: grayscale(100%); -webkit-filter: grayscale(100%); vertical-align: middle; margin-top: -4px;"> ${upgradeTokensReq[1]}`;
    } else if (level === 3) {
      upgradeButton.textContent = 'Max Level';
      upgradeButton.disabled = true;
      upgradeButton.style.backgroundColor = 'grey';
    }

    //upgradeButton.style.backgroundColor = '#4C4C4c';
    upgradeButton.style.border = '3px solid black'
    upgradeButton.style.color = 'black';
    upgradeButton.style.padding = '8px 12px';
    upgradeButton.style.textAlign = 'center';
    upgradeButton.style.textDecoration = 'none';
    upgradeButton.style.display = 'inline-block';
    upgradeButton.style.fontSize = '16px';
    upgradeButton.style.marginLeft = '20px'
    upgradeButton.style.right = '150px'
    upgradeButton.classList.add("upgradeButton")
    upgradeButton.style.borderRadius = '10px'
    abilityItem.appendChild(upgradeButton);
  
    upgradeButton.onclick = function() {
      if (player.tokensCount >= upgradeTokensReq[level - 1] && player.coinsCount >= upgradeCosts[level - 1]) {
        player.tokensCount -= upgradeTokensReq[level - 1];
        player.coinsCount -= upgradeCosts[level - 1];
        ability.level += 1;
        if (ability.name === 'bMap') {
          player.bMap.level++;
        } else if (ability.name === 'bSpeed') {
          player.bSpeed.level++;
        }
        updateInventory(inventoryArray,player.coinsCount)
        updateCoinsCount()
        updateTokensCount()
        togglePopup()
        togglePopup()
      }
      else {
          showMessages("You do not meet the requirements to upgrade the ability.")
      }
    };

    // Add upgrade button to ability item
    abilityItem.appendChild(upgradeButton);

    // Add ability item to ability list
    abilityList.appendChild(abilityItem);
  }
  // Add ability list to popup
  popup.appendChild(abilityList);
  document.body.appendChild(popup);
}



function deletePopup() {
  const popup = document.getElementById("popup");
  if (popup) {
    popup.remove();
  }
}


function togglePopup() {
  if (!popupEnabled) {
      controls.unlock();
      showAbilitiesPopup();
      popupEnabled = true
  } else {
      
    controls.lock();
    deletePopup()
    popupEnabled = false
  }
}

function handleKeyDown(event) {
  if (hasClicked && event.code === "KeyQ" && !event.repeat) {
    if (!tabRequest) {
      togglePopup();
      tabRequest = true;
    }
  }
}

function handleKeyUp(event) {
  if (hasClicked && event.code === "KeyQ" && !event.repeat) {
    if (tabRequest) {
      tabRequest = false;
    }
  }
}

function setTrap() {
  const trapCandidates = [];
  for (let i = 0; i < uCIA.length; i++) {
    if (uCIA[i].boostType === 0) {
      trapCandidates.push(uCIA[i]);
    }
  }

  const numberOfTraps = player.level === 1 ? 2 : player.level === 2 ? 7 : 0;
  const selectedTraps = [];
  for (let i = 0; i < numberOfTraps; i++) {
    const randomIndex = Math.floor(Math.random() * trapCandidates.length);
    const selectedTrap = trapCandidates[randomIndex];
    selectedTraps.push(selectedTrap);
    trapCandidates.splice(randomIndex, 1);
  }
  for (let i = 0; i < selectedTraps.length; i++) {
      const x = selectedTraps[i].x;
      const y = selectedTraps[i].y;
      const index = x * sleep + y;
      uCIA[index].boostType = 8;
    }
  
}
function activateNuke(obj) {
  // Create mesh for nuke area
  const nukeArea = new THREE.Mesh(
    new THREE.CircleGeometry(player.level ==1? 3 * w:4.5*w, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  nukeArea.rotation.x = -Math.PI / 2; // Rotate by 90 degrees around the x-axis
  nukeArea.position.set(obj.x*w+w/2, 0.2, obj.y*w+w/2);
  scene.add(nukeArea);

  // Start warning message interval
  const warningMessage = document.createElement('div');
  warningMessage.style.position = 'absolute';
  warningMessage.style.top = '10px';
  warningMessage.style.left = '50%';
  warningMessage.style.transform = 'translate(-50%, 0)';
  warningMessage.style.color = '#000000';
  warningMessage.style.fontSize = '30px'
  warningMessage.style.fontWeight = 'bold';
  warningMessage.textContent = 'LEAVE THE BLACK ZONE IMMEDIATELY';
  document.body.appendChild(warningMessage);

  const intervalId = setInterval(() => {
    warningMessage.style.opacity = warningMessage.style.opacity === '0' ? '1' : '0';
  }, 500);
  // Start timeout to check distance
  
  nukeSound.play();

  setTimeout(() => {
    clearInterval(intervalId);
    warningMessage.remove();
    const distance = Math.sqrt((camera.position.x - (obj.x*w+w/2))**2+(camera.position.z - (obj.y*w+w/2))**2)
    if ((distance < 3*w && player.level == 1) || (distance < 4.5*w && player.level == 2)) {
      gameOver();
    }
    scene.remove(nukeArea);
  }, 10000);
}

function getRandomBoost() {
  const boostArray = [];

  uCIA.forEach((item) => {
    if (item.boostType === 0) {
      boostArray.push(item);
    }
  });

  const randomIndex = Math.floor(Math.random() * boostArray.length);
  let uit = boostArray[randomIndex];

  // Create a texture for the material
  const texture = new THREE.TextureLoader().load('assets/icons/question-mark.png');
  const material = new THREE.MeshBasicMaterial({ map: texture });

  // Create a geometry for the box
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  // Create a mesh for the box
  const box = new THREE.Mesh(geometry, material);
  box.position.set(uit.x*w+w/2,2.5,uit.y*w+w/2)
  uCIA[uit.x*sleep+uit.y].boostType = -1
  scene.add(box)
  uCIA[uit.x*sleep+uit.y].comp = box
  mysContainer.push(box)
}

function setBoostTimeout() {
  const numBoostMinus1 = uCIA.filter(item => item.boostType === -1).length;
  const timePeriod = numBoostMinus1 * 10000 + 10000;
  
  setTimeout(() => {
    getRandomBoost();
    setBoostTimeout();
  }, timePeriod);
}
document.addEventListener("keyup", handleKeyUp);
document.addEventListener("keydown", handleKeyDown);


