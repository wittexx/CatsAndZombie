const gridSize = 5;
let playerPos, cats, zombies;
let isMoving = false; 

function randomPos() {
  return Math.floor(Math.random() * gridSize);
}

function getUniquePos(exclude = []) {
  let pos;
  do {
    pos = { x: randomPos(), y: randomPos() };
  } while (exclude.some(e => e.x === pos.x && e.y === pos.y));
  return pos;
}

function startGame() {
  playerPos = { x: 2, y: 2 };
  cats = [getUniquePos([playerPos])];
  zombies = [
    getUniquePos([playerPos, ...cats]),
    getUniquePos([playerPos, ...cats])
  ];
  updateView();
}

async function movePlayer(dir) {
  if (isMoving) return; 
  isMoving = true;
  setTimeout(() => isMoving = false, 500); 

  if (dir === 'N' && playerPos.y > 0) playerPos.y--;
  else if (dir === 'S' && playerPos.y < gridSize - 1) playerPos.y++;
  else if (dir === 'V' && playerPos.x > 0) playerPos.x--;
  else if (dir === 'Ö' && playerPos.x < gridSize - 1) playerPos.x++;

  
  const isOnCat = cats.some(cat => cat.x === playerPos.x && cat.y === playerPos.y);

  if (isOnCat) {
    updateView();
    setTimeout(async () => {
      const joke = await fetchJoke();
      alert(`😺 Du har räddat katten! och här får du ett roligt skämt\n\n  ${joke}`);
      startGame();
    }, );
    return; 
  }

 
  moveZombies();

  
  const isOnZombie = zombies.some(z => z.x === playerPos.x && z.y === playerPos.y);
  updateView(); 
  if (isOnZombie) {
    setTimeout(() => {
      alert("🧟‍♂️ Du blev fångad av en zombie! Spelet startar om.");
      startGame();
    }, );
    return;
  }
}

function moveZombies() {
  zombies.forEach(z => {
    if (Math.random() < 0.7) {
      if (Math.abs(z.x - playerPos.x) > Math.abs(z.y - playerPos.y)) {
        z.x += z.x < playerPos.x ? 1 : -1;
      } else if (z.y !== playerPos.y) {
        z.y += z.y < playerPos.y ? 1 : -1;
      }
    }
  });
}



function renderMiniMap() {
  const mapDiv = document.getElementById('minimap');
  mapDiv.innerHTML = '';
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (playerPos.x === x && playerPos.y === y) {
        cell.classList.add('player');
        cell.textContent = '🧍';
      } else if (cats.some(cat => cat.x === x && cat.y === y)) {
        cell.classList.add('cat');
        cell.textContent = '🐱';
      } else if (zombies.some(z => z.x === x && z.y === y)) {
        cell.classList.add('zombie');
        cell.textContent = '🧟';
      }
      mapDiv.appendChild(cell);
    }
  }
}

function updateView() {
  const index = playerPos.y * gridSize + playerPos.x + 1;
  const gameImage = document.getElementById('game-image');
  const jpeg = `images/starwars city${index}.jpeg`;
  const jpg = `images/starwars city${index}.jpg`;
  const png = `images/starwars city${index}.png`;

  const testImg = new Image();
  testImg.onload = () => {
    gameImage.src = testImg.src;
  };
  testImg.onerror = () => {
    const fallback = new Image();
    fallback.onload = () => {
      gameImage.src = fallback.src;
    };
    fallback.onerror = () => {
      gameImage.src = png;
    };
    fallback.src = jpg;
  };
  testImg.src = jpeg;

  const catOverlay = document.getElementById('cat-overlay');
  const zombieOverlay = document.getElementById('zombie-overlay');

  catOverlay.classList.remove("show");
  zombieOverlay.classList.remove("show");

  if (cats.some(cat => cat.x === playerPos.x && cat.y === playerPos.y)) {
    catOverlay.classList.add("show");
  } else if (zombies.some(z => z.x === playerPos.x && z.y === playerPos.y)) {
    zombieOverlay.classList.add("show");
  }

  renderMiniMap();
}

async function fetchJoke() {
  try {
    const response = await fetch('https://api.api-ninjas.com/v1/jokes', {
      headers: {
        'X-Api-Key': 'KOpaxkSlwLXhLFNS7k05jg==9qbULtTzAH0VN4mk'
      }
    });
    const data = await response.json();
    return data[0]?.joke || "Inget skämt hittades.";
  } catch {
    return "Något gick fel när skämtet skulle hämtas.";
  }
}


startGame();