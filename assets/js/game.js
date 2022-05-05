// Variables of pressed keys.
var upPressed, downPressed, leftPressed, rightPressed, lastPressed;

// Arrays of arrow and WASD key codes for controlling the player.
const leftKeys = [37, 65],
	rightKeys = [39, 68],
	upKeys = [38, 87],
	downKeys = [40, 83];

var playing, gameOver;

const keyup = event => {
	if (gameOver) return upPressed = downPressed = leftPressed = rightPressed = lastPressed = false;
	if (leftKeys.includes(event.which))
		leftPressed = false,
			lastPressed = 'left';
	if (rightKeys.includes(event.which))
		rightPressed = false,
			lastPressed = 'right';
	if (upKeys.includes(event.which))
		upPressed = false,
			lastPressed = 'up';
	if (downKeys.includes(event.which))
		downPressed = false,
			lastPressed = 'down';

	player.className = 'character stand ' + lastPressed;
	// player.classList.add('character', 'stand', lastPressed);
}


const move = (player, skyHeight, screenWidth) => {
	const positionLeft = player.offsetLeft;
	const positionTop = player.offsetTop;

	if (upPressed) {
		// Don't go above the sky. 'document.elementFromPoint' is a bit buggy.
		player.style.top = (positionTop <= skyHeight ? skyHeight : positionTop - 1) + 'px';

		if (!leftPressed && !rightPressed)
			// player.className = 'character walk up';
			player.classList.remove('up', 'down', 'left', 'right');
		player.classList.add('character', 'walk', 'up');
	}

	if (downPressed) {
		// Don't go below the map (visible screen).
		const screenHeight = document.documentElement.clientHeight;
		player.style.top = (positionTop >= screenHeight - player.offsetHeight ? screenHeight - player.offsetHeight : positionTop + 1) + 'px';

		if (!leftPressed && !rightPressed)
			// player.className = 'character walk down';
			player.classList.remove('up', 'down', 'left', 'right');
		player.classList.add('character', 'walk', 'down');
	}



	if (leftPressed) {
		player.style.left = (positionLeft <= 0 ? 0 : positionLeft - 1) + 'px';

		if (!upPressed && !downPressed)
			// player.className = 'character walk left';
			player.classList.remove('up', 'down', 'left', 'right');
		player.classList.add('character', 'walk', 'left');
	}

	if (rightPressed) {
		player.style.left = (positionLeft >= screenWidth - player.offsetWidth ? screenWidth - player.offsetWidth : positionLeft + 1) + 'px';

		if (!upPressed && !downPressed)
			// player.className = 'character walk right';
			player.classList.remove('up', 'down', 'left', 'right');
		player.classList.add('character', 'walk', 'right');
	}
}


const keydown = event => {
	if (gameOver) return upPressed = downPressed = leftPressed = rightPressed = lastPressed = false;
	if (leftKeys.includes(event.which))
		leftPressed = leftKeys.includes(event.which);
	else if (rightKeys.includes(event.which))
		rightPressed = rightKeys.includes(event.which);
	else if (upKeys.includes(event.which))
		upPressed = upKeys.includes(event.which);
	else if (downKeys.includes(event.which))
		downPressed = downKeys.includes(event.which);
}

const onMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const blink = (subject, duration = 1000, times = 3) => subject.animate(Array(times).fill([{ opacity: '.5' }, { opacity: '1' }]).flat(), { duration: duration, });
const renderLives = (health, lives) => {
	// create lives based on the number of lives
	health.innerHTML = '';
	for (let i = 0; i < lives; i++)
		health.appendChild(document.createElement('li'));

	health.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
	let defaultLives = 1,
		lives = defaultLives,
		defaultSpawnInterval = 2000,
		spawnInterval = defaultSpawnInterval,
		defaultShootInterval = 1000,
		shootInterval = defaultShootInterval,
		defaultShootIntervalMax = 4000,
		shootIntervalMax = defaultShootIntervalMax,
		defaultShootIntervalMin = 1000,
		shootIntervalMin = defaultShootIntervalMin,
		defaultExplosionTime = 1000,
		explosionTime = defaultExplosionTime,
		defaultBombSpeed = 5000,
		bombSpeed = defaultBombSpeed,
		defaultBombsDodged = 0,
		bombsDodged = defaultBombsDodged,
		bombsDodgedElement = document.getElementById('dodged'),
		defaultAliensShot = 0,
		aliensShot = defaultAliensShot,
		aliensShotElement = document.getElementById('shot'),
		defaultLevel = 1,
		level = defaultLevel,
		levelingInterval = 5000,
		levelElement = document.getElementById('level'),
		intervals = [],
		player = document.getElementById('player'),
		startBtn = document.querySelector('.start'),
		sky = document.querySelector('.sky'),
		skyHeight = sky.offsetHeight,
		skyWidth = sky.offsetWidth,
		timeout = setInterval(move, 10, player, skyHeight, skyWidth),
		health = document.querySelector('.health'),
		mainAlien = document.querySelector('.alien.main'),
		nameInput = document.getElementById('name'),
		nameLabel = document.querySelector('label[for="name"]'),
		nameLabelAltered = false;

	document.querySelector('.info p').addEventListener('click', () => alert(`
		Information:

		Aliens ships will spawn randomly and shoot at you.
		Use WASD or arrow keys to move & dodge bombs.
		Use the space bar to shoot with your arrows at the aliens ships.
		
		You have ${lives} lives, if you get hit, you will lose a life.
		If you run out of lives, you lose.
	
		You level up every ${levelingInterval / 1000} seconds.
		Try to get as much dodges, levels, and kills as possible.`.replace(/^\t+/gm, '')));

	renderBoard();
	document.addEventListener('keydown', keydown);
	document.addEventListener('keyup', keyup);

	nameInput.addEventListener('input', () => {
		if (nameLabelAltered) return;
		console.log('input');
		nameLabel.textContent = 'Press enter to submit';
		nameLabelAltered = true;
	})

	nameInput.addEventListener('keydown', event => {
		if (event.key !== 'Enter') return;
		// Add level, bombs dodged, and aliens shot local storage.
		localStorage.setItem('board', JSON.stringify({
			...(JSON.parse(localStorage.getItem('board')) || {}),
			[nameInput.value]: { level, bombsDodged, aliensShot },
		}));

		nameInput.value = '';
		nameLabel.textContent = 'Added to leaderboard';
		nameInput.classList.add('hidden');

		renderBoard();
	});

	function renderBoard() {
		const board = JSON.parse(localStorage.getItem('board')) || {};
		const tbody = document.querySelector('.board table tbody');
		tbody.innerHTML = '';

		for (const name of Object.keys(board).sort((a, b) => board[b].level - board[a].level)) {
			const tr = document.createElement('tr');
			const td1 = document.createElement('td'),
				td2 = document.createElement('td'),
				td3 = document.createElement('td');

			td1.textContent = name;
			td2.textContent = board[name].level;
			td3.textContent = board[name].bombsDodged;

			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);

			tbody.appendChild(tr);
		}
	}


	const endGame = () => {
		playing = false; lives = 1;
		spawnInterval = 4000;
		shootInterval = 2000;
		shootIntervalMax = 4000;
		shootIntervalMin = 1000;
		explosionTime = 1000;
		player.className = 'character dead';

		nameInput.classList.remove('hidden');
		nameLabel.textContent = nameLabel.dataset.text;
		document.body.classList.add('game-over');
		document.body.classList.remove('playing');
		startBtn.classList.remove('hidden');

		if (!onMobile()) {
			document.body.classList.add('pc');
			nameInput.focus();
		}

		// player.classList.remove('stand', 'walk', 'up', 'down', 'left', 'right');
		// renderLives(health, lives);

		for (e of document.querySelectorAll('.alien, .bomb, .explosion'))
			e.remove();

		stopBackgroundWork();
	}

	startBtn.addEventListener('click', e => {
		// lives = defaultLives,
		level = defaultLevel;
		// spawnInterval = defaultSpawnInterval;
		// shootInterval = defaultShootInterval;
		// shootIntervalMax = defaultShootIntervalMax;
		// shootIntervalMin = defaultShootIntervalMin;
		// explosionTime = defaultExplosionTime;
		// bombsDodged = defaultBombsDodged;
		// bombSpeed = defaultBombSpeed;
		// aliensShot = defaultAliensShot;
		bombsDodgedElement.textContent = bombsDodged;
		levelElement.textContent = level;
		nameLabelAltered = false;
		gameOver = false;
		document.body.classList.remove('game-over');
		playing = !document.body.classList.add('playing');
		player.className = 'character stand down';

		setTimeout(() => startBtn.classList.add('hidden'), 3000);
		document.body.classList.remove('pc');

		// Start counting levels, bombs dodged, aliens shot etc.
		startBackgroundWork();

		// Animate alien above sky and hide it
		mainAlien.animate([{ transform: 'translate(-50%, -250%)' }], { duration: 500, })
			.onfinish = () => mainAlien.classList.add('hidden');

		renderLives(health, lives);
		blink(health);
		// blink(player, 600);

		player.classList.add('blink');

		const newAlien = (duration, takeaway = 1) => {
			if (gameOver) return endGame();
			if (spawnInterval <= 0) {
				console.log(spawnInterval, takeaway, spawnInterval - takeaway);
				// When the interval at which the aliens spawn has reduced down to <= 0, stop the game
				return alert('You beat the game! You definately cheated.');
			}

			setTimeout(newAlien, spawnInterval);
			const alien = document.createElement('div');


			// Spawn alien inside the sky
			// const randomY = Math.random() * (skyHeight - alien.offsetHeight) + 'px';
			const randomY = Math.random() * (skyHeight - skyHeight / 2 - alien.offsetHeight);
			const randomX = Math.random() * (skyWidth - alien.offsetWidth);
			alien.style.left = randomX + 'px';
			alien.style.top = randomY;
			alien.className = 'alien';
			// alien.style.setProperty('--position-y', Math.ceil(randomY) + 'px');
			sky.appendChild(alien);

			let moveX = Math.ceil(Math.random() * (6 - 1) + 1),
				posiotnX1 = randomX / moveX,
				posiotnX2 = randomX / moveX,
				shooting = true;

			alien.animate([
				{ top: '-50%', left: randomX + 'px', },
				{ top: randomY + 'px', /* left: randomX + 'px', */ offset: .15, },
				{ top: randomY + 'px', left: randomX + 'px', offset: .2, },
				{ top: randomY + 'px', left: randomX - posiotnX1 + 'px', offset: .4, },
				{ top: randomY + 'px', left: randomX - posiotnX1 + 'px', offset: .45, },
				{ top: randomY + 'px', left: randomX + posiotnX2 + 'px', offset: .65, },
				{ top: randomY + 'px', left: randomX + posiotnX2 + 'px', offset: .8, },
				{ top: '-100%', left: randomX + posiotnX2 + 'px', offset: 1, }
			],
				{ duration: 10000, easing: 'linear' })
				.onfinish = () => {
					// console.log('done');
					shooting = false;
					// console.log(bomb);
					alien?.remove();
					// bomb?.remove();
				}




			const shootIntervalFunc = setInterval(() => {
				// if (gameOver) return; //!
				const bomb = document.createElement('div');
				bomb.className = 'bomb';
				// bomb.style.left = randomX + 'px';
				// bomb.style.top = randomY + 'px';
				sky.appendChild(bomb);

				// Pick random place below the sky to shoot the bullet
				// const randomLandY = Math.random() * (sky.offsetHeight + Math.random() * sky.offsetHeight);
				const randomLandY = sky.offsetHeight + (Math.random() * (document.documentElement.clientHeight - sky.offsetHeight));
				const randomLandX = Math.random() * (sky.offsetWidth - bomb.offsetWidth);
				// const randomLandX = Math.random() * skyWidth

				const explode = () => {
					// if (gameOver) return; //!
					if (!sky.contains(bomb)) return; //!

					clearInterval(shootIntervalFunc)
					// console.log('Boom');
					bomb?.remove();

					const explosion = document.createElement('div');
					explosion.className = 'explosion';
					explosion.style.left = randomLandX + 'px';
					explosion.style.top = randomLandY + 'px';
					// Choose number between .5 and 1.5 to make the explosion bigger or smaller
					explosion.style.setProperty('--scale', Math.random() * (1.5 - .5) + .5);
					sky.appendChild(explosion);

					if (
						// Detect if player is near explosion
						explosion.getBoundingClientRect().top < player.getBoundingClientRect().bottom &&
						explosion.getBoundingClientRect().bottom > player.getBoundingClientRect().top &&
						explosion.getBoundingClientRect().left < player.getBoundingClientRect().right &&
						explosion.getBoundingClientRect().right > player.getBoundingClientRect().left

					) {
						if (!gameOver) console.log('Game Over');
						// remove one life.
						lives--;
						if (lives <= 0) {
							gameOver = true;
							player.className = 'character dead';
							playing = false;
						}
						health.lastChild && health.removeChild(health.lastChild);
						blink(health, 2000, 6);
						player.classList.add('hit');
						setTimeout(() => player.classList.remove('hit'), 1000);

					} else {
						// console.log('No hit');
						// console.log(explosion.getBoundingClientRect().top, player.getBoundingClientRect().bottom);
						// console.log(explosion.getBoundingClientRect().bottom, player.getBoundingClientRect().top);
						// console.log(explosion.getBoundingClientRect().left, player.getBoundingClientRect().right);
						// console.log(explosion.getBoundingClientRect().right, player.getBoundingClientRect().left);
						bombsDodged++;
						bombsDodgedElement.textContent = bombsDodged;
					}

					setInterval(() => explosion?.remove(), explosionTime);
				}

				if (!shooting) return explode();

				bomb.animate([
					{ top: alien.offsetTop + alien.offsetHeight + 'px', left: alien.offsetLeft + alien.offsetWidth / 2 - 15 + 'px', },
					// Make sure top doesn't go off screen
					{ top: randomLandY + 'px', left: randomLandX + 'px' },
					// { top: randomLandY + 'px', left: randomLandX + 'px', },
				], { duration: bombSpeed, easing: 'linear' })
					.onfinish = explode

				// The bomb is currently facing down, make sure the bomb is facing where the x position is using Math.atan2
				const angle = Math.atan2(randomLandY - alien.offsetTop - alien.offsetHeight / 2, randomLandX - alien.offsetLeft - alien.offsetWidth / 2);
				bomb.style.transform = `rotate(${angle}rad)`;

				// }, shootInterval);
			}, Math.ceil(Math.random() * (shootIntervalMax - shootIntervalMin) + shootIntervalMin));
			// const shootIntervalFunc = setInterval(shoot, Math.ceil(Math.random() * (shootIntervalMax - shootIntervalMin) + shootIntervalMin));

			// setTimeout(() => {
			// 	// clearInterval(shootIntervalFunc);
			// 	shooting = false;
			// 	// alien?.remove();
			// }, 10000);
			intervals.push(shootIntervalFunc);
		}

		newAlien(0);
	});

	// spawnInterval = 2000;
	// startBtn.click();

	// Interval to speed up spawn rate, shoot rate, and alien speed
	function startBackgroundWork() {
		intervals.push(
			// Interval to change level
			setInterval(() => {
				if (gameOver) return;
				level++;
				levelElement.textContent = level;
			}, levelingInterval),

			// Interval to change displayed level
			setInterval(() => {
				if (gameOver) return;
				// Speed up everything as the level goes up
				bombSpeed -= 1;
				spawnInterval -= 1;
				shootInterval -= 1;
				shootIntervalMax -= 1;
				if (shootIntervalMax < shootIntervalMin) {
					shootIntervalMax = 1000;
					shootIntervalMin = 0;
				}
			}, 1000),
		);
	}

	function stopBackgroundWork() {
		for (const interval of intervals)
			clearInterval(interval);
		intervals = [];
	}
});