// Arrow and WASD key codes for controlling the player.
const leftKeys = [37, 65],
	rightKeys = [39, 68],
	upKeys = [38, 87],
	downKeys = [40, 83],
	spaceKey = 32;

let upPressed, downPressed,
	leftPressed, rightPressed,
	lastPressed, spacePressed,
	arrowFired, gameOver,
	timeout, playerHit;

function keyup(event) {
	if (gameOver)
		return upPressed = downPressed = leftPressed = rightPressed = false;

	if (leftKeys.includes(event.keyCode))
		leftPressed = false;
	else if (rightKeys.includes(event.keyCode))
		rightPressed = false;
	else if (upKeys.includes(event.keyCode))
		upPressed = false;
	else if (downKeys.includes(event.keyCode))
		downPressed = false;

	player.className = 'character stand ' + lastPressed;
}

function keydown(event) {
	if (gameOver)
		return upPressed = downPressed = leftPressed = rightPressed = false;

	else if (leftKeys.includes(event.keyCode))
		leftPressed = leftKeys.includes(event.keyCode),
			lastPressed = 'left';
	else if (rightKeys.includes(event.keyCode))
		rightPressed = rightKeys.includes(event.keyCode),
			lastPressed = 'right';
	else if (upKeys.includes(event.keyCode))
		upPressed = upKeys.includes(event.keyCode),
			lastPressed = 'up';
	else if (downKeys.includes(event.keyCode))
		downPressed = downKeys.includes(event.keyCode),
			lastPressed = 'down';
	else if (spaceKey === event.keyCode)
		spacePressed = true;
}

function createExplosion(x, y, scale = 1, explosionTime = 1000) {
	// const explode =
	const explosion = document.createElement('div');
	explosion.className = 'explosion';
	explosion.style.left = x + 'px';
	explosion.style.top = y + 'px';
	// Choose number between .5 and 1.5 to make the explosion bigger or smaller
	explosion.style.setProperty('--scale', scale);
	document.body.appendChild(explosion);

	setInterval(() => explosion?.remove(), explosionTime);
	return explosion;
}

function colliding(e, e1) {
	const e1Left = e1.offsetLeft;
	const e1Top = e1.offsetTop;
	const e1Width = e1.offsetWidth;
	const e1Height = e1.offsetHeight;
	const eLeft = e.offsetLeft;
	const eTop = e.offsetTop;
	const eWidth = e.offsetWidth;
	const eHeight = e.offsetHeight;

	return e1Left < eLeft + eWidth && e1Left + e1Width > eLeft && e1Top < eTop + eHeight && e1Top + e1Height > eTop;
}

const onMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const blink = (subject, duration = 1000, times = 3) => subject.animate(Array(times).fill([{ opacity: '.5' }, { opacity: '1' }]).flat(), { duration: duration, });
const renderLives = (health, lives) => {
	// Create lives based on the number of lives
	health.innerHTML = '';
	for (let i = 0; i < lives; i++)
		health.appendChild(document.createElement('li'));

	health.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
	let defaultLives = 3,
		lives = defaultLives,
		defaultSpawnInterval = 2000,
		spawnInterval = defaultSpawnInterval,
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
		bombsShotElement = document.getElementById('shot'),
		defaultLevel = 1,
		level = defaultLevel,
		levelingInterval = 15000,
		levelElement = document.getElementById('level'),
		intervals = [],
		player = document.getElementById('player'),
		startBtn = document.querySelector('.start'),
		sky = document.querySelector('.sky'),
		skyHeight = sky.offsetHeight,
		skyWidth = sky.offsetWidth,
		docHeight = document.documentElement.clientHeight,
		health = document.querySelector('.health'),
		mainAlien = document.querySelector('.alien.main'),
		nameInput = document.getElementById('name'),
		nameLabel = document.querySelector('label[for=name]'),
		nameLabelAltered;

	timeout = setInterval(move, 10, { player, skyHeight, skyWidth, docHeight, bombsShotElement });
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
		nameLabel.textContent = 'Press enter to submit';
		nameLabelAltered = true;
	})

	nameInput.addEventListener('keydown', e => {
		if (e.key !== 'Enter') return;
		// Add level, bombs dodged, and aliens shot local storage.
		localStorage.setItem('board', JSON.stringify({
			...(JSON.parse(localStorage.getItem('board')) || {}),
			[nameInput.value]: { level, bombsDodged, bombsShot: +bombsShotElement.textContent },
		}));

		nameInput.value = '';
		nameLabel.textContent = 'Added to leaderboard';
		nameInput.classList.add('hidden');

		renderBoard();
	});

	startBtn.addEventListener('click', e => {
		lives = defaultLives;
		level = defaultLevel;
		spawnInterval = defaultSpawnInterval;
		shootIntervalMax = defaultShootIntervalMax;
		shootIntervalMin = defaultShootIntervalMin;
		explosionTime = defaultExplosionTime;
		bombsDodged = defaultBombsDodged;
		bombSpeed = defaultBombSpeed;
		bombsDodgedElement.textContent = bombsDodged;
		levelElement.textContent = level;
		nameLabelAltered = false;
		gameOver = false;
		document.body.classList.add('playing');
		player.className = 'character stand down';

		setTimeout(() => startBtn.classList.add('hidden'), 3000);
		document.body.classList.remove('pc');
		document.body.classList.remove('game-over');

		// Start counting levels, bombs dodged, aliens shot etc.
		startBackgroundWork();

		// Animate alien above sky and hide it
		mainAlien.animate([{ transform: 'translate(-50%, -250%)' }], { duration: 500, })
			.onfinish = () => mainAlien.classList.add('hidden');

		renderLives(health, lives);
		blink(health);
		// blink(player, 600);

		player.classList.add('blink');

		const newAlien = (takeaway = 1) => {
			if (gameOver) return endGame();
			if (spawnInterval <= 0) {
				console.log(spawnInterval, takeaway, spawnInterval - takeaway);
				// When the interval at which the aliens spawn has reduced down to <= 0, stop the game
				return alert('You beat the game! You definately cheated.');
			}

			setTimeout(newAlien, spawnInterval);
			const alien = document.createElement('div');
			const randomY = Math.random() * (skyHeight - skyHeight / 2 - alien.offsetHeight);
			const randomX = Math.random() * (skyWidth - alien.offsetWidth);
			alien.style.left = randomX + 'px';
			alien.style.top = randomY;
			alien.className = 'alien';
			sky.appendChild(alien);

			let moveX = Math.ceil(Math.random() * (6 - 1) + 1),
				posiotnX1 = randomX / moveX,
				posiotnX2 = randomX / moveX,
				shooting = true;

			// Whether the alien should go from left then right, or vice versa.
			const leftFirst = Math.random() >= .5;
			alien.animate([
				{ top: '-50%', left: randomX + 'px', },
				{ top: randomY + 'px', /* left: randomX + 'px', */ offset: .15, },
				{ top: randomY + 'px', left: randomX + 'px', offset: .2, },
				{ top: randomY + 'px', left: (leftFirst ? randomX - posiotnX1 : randomX + posiotnX2) + 'px', offset: .4, },
				{ top: randomY + 'px', left: (leftFirst ? randomX - posiotnX1 : randomX + posiotnX2) + 'px', offset: .45, },
				{ top: randomY + 'px', left: (leftFirst ? randomX + posiotnX2 : randomX - posiotnX1) + 'px', offset: .65, },
				{ top: randomY + 'px', left: (leftFirst ? randomX + posiotnX2 : randomX - posiotnX1) + 'px', offset: .8, },
				{ top: '-100%', left: (leftFirst ? randomX + posiotnX2 : randomX - posiotnX1) + 'px', offset: 1, }
			], { duration: 10000, easing: 'linear' })
				.onfinish = () => {
					shooting = false;
					alien?.remove();
				}


			const shootIntervalFunc = setInterval(() => {
				const bomb = document.createElement('div');
				bomb.className = 'bomb';
				sky.appendChild(bomb);

				const randomLandY = sky.offsetHeight + (Math.random() * (document.documentElement.clientHeight - sky.offsetHeight));
				const randomLandX = Math.random() * (sky.offsetWidth - bomb.offsetWidth);
				
				const explode = () => {
					if (!sky.contains(bomb)) return;

					clearInterval(shootIntervalFunc)
					bomb?.remove();

					const explosion = createExplosion(randomLandX, randomLandY, Math.random() * (1.5 - .5) + .5);

					if (colliding(player, explosion)) {
						lives--;
						if (lives <= 0) {
							gameOver = true, player.className = 'character stand dead';
							return endGame();
						}

						playerHit = true;
						player.classList.add('hit');
						blink(player, 2000);
						blink(health, 2000, 6);
						health.lastChild && health.removeChild(health.lastChild);
						setTimeout(() => playerHit = player.classList.remove('hit'), 1000);
					} else {
						bombsDodged++;
						bombsDodgedElement.textContent = bombsDodged;
					}

					setInterval(() => explosion?.remove(), explosionTime);
				}

				if (!shooting)
					return explode();

				bomb.animate([
					{ top: alien.offsetTop + alien.offsetHeight + 'px', left: alien.offsetLeft + alien.offsetWidth / 2 - 15 + 'px', },
					{ top: randomLandY + 'px', left: randomLandX + 'px' },
				], { duration: bombSpeed, easing: 'linear' })
					.onfinish = explode

				// The bomb is currently facing down, make the bomb face where the x & y position is using Math.atan2
				const angle = Math.atan2(randomLandY - alien.offsetTop - alien.offsetHeight / 2, randomLandX - alien.offsetLeft - alien.offsetWidth / 2);
				bomb.style.transform = `rotate(${angle}rad)`;

			}, Math.ceil(Math.random() * (shootIntervalMax - shootIntervalMin) + shootIntervalMin));

			intervals.push(shootIntervalFunc);
		}

		newAlien();
	});

	function renderBoard() {
		const board = JSON.parse(localStorage.getItem('board')) || {};
		const tbody = document.querySelector('.board table tbody');

		tbody.innerHTML = '';
		for (const name of Object.keys(board).sort((a, b) => board[b].level - board[a].level)) {
			const tr = document.createElement('tr'),
				td1 = document.createElement('td'),
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

	function endGame() {
		player.className = 'character stand dead';
		nameLabel.textContent = nameLabel.dataset.text;
		nameInput.classList.remove('hidden');
		startBtn.classList.remove('hidden');
		document.body.classList.add('game-over');
		document.body.classList.remove('playing');

		if (!onMobile()) {
			document.body.classList.add('pc');
			// Wait 1.5 seconds as plyer might still be holding a WASD key.
			setTimeout(() => nameInput.focus(), 1500);
		}

		for (e of document.querySelectorAll('.alien, .bomb, .explosion'))
			e.remove();

		stopBackgroundWork();
	}

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
				bombSpeed--;
				spawnInterval--;
				shootIntervalMax--;

				if (shootIntervalMax < shootIntervalMin)
					shootIntervalMax = 1000, shootIntervalMin = 0;
			}, 1000),
		);
	}

	function stopBackgroundWork() {
		for (const interval of intervals)
			clearInterval(interval);
		intervals = [];
	}
});

function move({ player, skyHeight, skyWidth: screenWidth, docHeight, bombsShotElement }) {
	const positionLeft = player.offsetLeft;
	const positionTop = player.offsetTop;
	const screenHeight = document.documentElement.clientHeight;

	if (!arrowFired) {
		if (upPressed) {
			player.style.top = (positionTop <= skyHeight ? skyHeight : positionTop - 1) + 'px';
			if (!leftPressed && !rightPressed)
				player.classList.remove('up', 'down', 'left', 'right', 'stand');
			player.classList.add('character', playerHit ? 'hit' : 'walk', 'up');
		}
		if (downPressed) {
			player.style.top = (positionTop >= screenHeight - player.offsetHeight ? screenHeight - player.offsetHeight : positionTop + 1) + 'px';
			if (!leftPressed && !rightPressed)
				player.classList.remove('up', 'down', 'left', 'right', 'stand');
			player.classList.add('character', playerHit ? 'hit' : 'walk', 'down');
		}
		if (leftPressed) {
			player.style.left = (positionLeft <= 0 ? 0 : positionLeft - 1) + 'px';
			if (!upPressed && !downPressed)
				player.classList.remove('up', 'down', 'left', 'right', 'stand');
			player.classList.add('character', playerHit ? 'hit' : 'walk', 'left');
		}
		if (rightPressed) {
			player.style.left = (positionLeft >= screenWidth - player.offsetWidth ? screenWidth - player.offsetWidth : positionLeft + 1) + 'px';
			if (!upPressed && !downPressed)
				player.classList.remove('up', 'down', 'left', 'right');
			player.classList.add('character', 'walk', 'right');
		}
	}

	if (spacePressed) {
		player.className = `character stand ${lastPressed} fire`;
		if (!arrowFired) {
			arrowFired = true;
			const arrow = document.createElement('div');
			arrow.className = `arrow ${lastPressed}`;
			arrow.style.top = player.offsetTop + player.offsetHeight / 2 - arrow.offsetHeight / 2 + 'px';
			arrow.style.left = player.offsetLeft + player.offsetWidth / 2 - arrow.offsetWidth / 2 + 'px';
			document.body.appendChild(arrow);

			// Arrow animation (no easing)
			const pressedBefore = lastPressed;
			const arrowInterval = setInterval(() => {
				// Mave arrow based on last pressed until off screen.
				if (pressedBefore == 'up')
					arrow.style.top = arrow.offsetTop - 5 + 'px';
				else if (pressedBefore == 'down')
					arrow.style.top = arrow.offsetTop + 5 + 'px';
				else if (pressedBefore == 'left')
					arrow.style.left = arrow.offsetLeft - 5 + 'px';
				else if (pressedBefore == 'right')
					arrow.style.left = arrow.offsetLeft + 5 + 'px';

				// Arrow is off screen
				if (arrow.offsetTop <= 0 || arrow.offsetTop >= docHeight || arrow.offsetLeft <= 0 || arrow.offsetLeft >= screenWidth) {
					arrow?.remove();
					clearInterval(arrowInterval);
				}

				// Arrow hits a bomb or alien ship.
				const bomb = document.elementFromPoint(arrow.offsetLeft + arrow.offsetWidth / 2, arrow.offsetTop + arrow.offsetHeight / 2);
				if (arrow && bomb?.classList.contains('bomb')) {
					arrow?.remove();
					bomb.classList.add('exploded');
					setTimeout(() => bomb?.remove(), 500);
					bombsShotElement.textContent = ++bombsShotElement.textContent;
					clearInterval(arrowInterval);
				}
			});
		}

		setTimeout(() => {
			spacePressed = arrowFired = false;
			player.classList.remove('fire');
		}, 500);
	}
}