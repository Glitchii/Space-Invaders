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
	else if (leftKeys.includes(event.keyCode))
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

function renderLeaderBoard() {
	const board = JSON.parse(localStorage.getItem('board')) || {};
	const tbody = document.querySelector('.board table tbody');
	tbody.innerHTML = '';

	for (const name of Object.keys(board).sort((a, b) => board[b].level - board[a].level)) {
		const tr = tbody.appendChild(document.createElement('tr'));
		tr.appendChild(document.createElement('td')).textContent = name;
		tr.appendChild(document.createElement('td')).textContent = board[name].level;
		tr.appendChild(document.createElement('td')).textContent = board[name].bombsDodged;
	}
}

function impact(e, e1) {
	const eLeft = e.offsetLeft;
	const eTop = e.offsetTop;
	const eWidth = e.offsetWidth;
	const eHeight = e.offsetHeight;
	const e1Left = e1.offsetLeft;
	const e1Top = e1.offsetTop;
	const e1Width = e1.offsetWidth;
	const e1Height = e1.offsetHeight;

	return e1Left < eLeft + eWidth && e1Left + e1Width > eLeft && e1Top < eTop + eHeight && e1Top + e1Height > eTop;
}

const onMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const blink = (subject, duration = 1000, times = 3) => subject.animate(Array(times).fill([{ opacity: '.5' }, { opacity: '1' }]).flat(), { duration });
const renderLives = (health, lives) => {
	// Create lives based on the number of lives
	health.innerHTML = '';
	health.classList.remove('hidden');
	for (let i = 0; i < lives; i++)
		health.appendChild(document.createElement('li'));
}

document.addEventListener('DOMContentLoaded', () => {
	let intervals = [],
		lives = livesDefault = 3,
		spawnInterval = spawnIntervalDefault = 2000,
		shootIntervalMax = shootIntervalMaxDefault = 4000,
		shootIntervalMin = shootIntervalMinDefault = 1000,
		explosionTime = explosionTimeDefault = 1000,
		bombSpeed = bombSpeedDefault = 5000,
		bombsDodged = bombsDodgedDefault = 0,
		bombsDodgedElement = document.getElementById('dodged'),
		bombsShotElement = document.getElementById('shot'),
		level = levelDefault = 1,
		levelingInterval = 20000,
		alienAniamtionDuration = 10000,
		levelElement = document.getElementById('level'),
		player = document.getElementById('player'),
		startBtn = document.querySelector('.start'),
		sky = document.querySelector('.sky'),
		health = document.querySelector('.health'),
		mainAlien = document.querySelector('.alien.main'),
		nameInput = document.getElementById('name'),
		nameLabel = document.querySelector('label[for=name]'),
		nameLabelAltered;

	timeout = setInterval(move, 10, { player, sky, bombsShotElement });
	document.querySelector('.info p').addEventListener('click', () => alert(`
		Information:

		Aliens ships will spawn randomly and shoot at you.
		Use WASD or arrow keys to move & dodge bombs.
		Use the space bar to shoot with your arrows at the aliens ships.
		
		You have ${lives} lives, if you get hit, you will lose a life. If you run out of lives, you lose.
	
		You level up every ${levelingInterval / 1000} seconds, alien spawn speed increases by 50ms, bomb speed by 100ms, and alien shooting interval speed by 200 as you level up.
		Try to get as much dodges, levels, and kills as possible.
		
		Explosions will still have an impact just by being close to them even if not directly in the explosion.`.replace(/^\t+/gm, '')));

	renderLeaderBoard();
	document.addEventListener('keydown', keydown);
	document.addEventListener('keyup', keyup);

	nameInput.addEventListener('input', () => {
		if (nameLabelAltered) return;
		
		nameLabel.textContent = 'Press enter to submit';
		nameLabelAltered = true;
	})

	nameInput.addEventListener('keydown', e => {
		if (e.key !== 'Enter' || !nameInput.value) return;
		// Add level, bombs dodged, and aliens shot local storage.
		localStorage.setItem('board', JSON.stringify({
			...(JSON.parse(localStorage.getItem('board')) || {}),
			[nameInput.value]: { level, bombsDodged, bombsShot: +bombsShotElement.textContent },
		}));

		nameInput.value = '';
		nameLabel.textContent = 'Added to leaderboard';
		nameInput.classList.add('hidden');

		renderLeaderBoard();
	});

	startBtn.addEventListener('click', e => {
		lives = livesDefault;
		spawnInterval = spawnIntervalDefault;
		shootIntervalMax = shootIntervalMaxDefault;
		shootIntervalMin = shootIntervalMinDefault;
		explosionTime = explosionTimeDefault;
		bombsDodged = bombsDodgedDefault;
		bombSpeed = bombSpeedDefault;
		level = levelDefault;
		bombsDodgedElement.textContent = bombsDodged;
		bombsShotElement.textContent = 0;
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

		function newAlien() {
			if (gameOver)
				return endGame();

			setTimeout(newAlien, spawnInterval);
			
			const alien = document.createElement('div');
			const randomY = Math.random() * (sky.offsetHeight - sky.offsetHeight / 2 - alien.offsetHeight);
			const randomX = Math.random() * (sky.offsetWidth - alien.offsetWidth);
			const positionX = randomX / Math.ceil(Math.random() * 5 + 1);
			
			alien.style.left = randomX + 'px';
			alien.style.top = randomY;
			alien.className = 'alien';
			sky.appendChild(alien);

			// Whether the alien should go from left then right, or viceversa.
			const leftFirst = Math.random() >= .5;
			alien.animate([
				{ top: '-50%', left: randomX + 'px', },
				{ top: randomY + 'px', left: randomX + 'px', offset: .2, },
				{ top: randomY + 'px', left: (leftFirst ? randomX - positionX : randomX + positionX) + 'px', offset: .4, },
				{ top: randomY + 'px', left: (leftFirst ? randomX - positionX : randomX + positionX) + 'px', offset: .45, },
				{ top: randomY + 'px', left: (leftFirst ? randomX + positionX : randomX - positionX) + 'px', offset: .65, },
				{ top: randomY + 'px', left: (leftFirst ? randomX + positionX : randomX - positionX) + 'px', offset: .8, },
				{ top: '-100%', left: (leftFirst ? randomX + positionX : randomX - positionX) + 'px', offset: 1, }
			], { duration: alienAniamtionDuration, easing: 'linear' })
				.onfinish = () => alien?.remove();

			const shootIntervalFunc = setInterval(() => {
				const bomb = document.createElement('div');
				const randomLandY = sky.offsetHeight + (Math.random() * (document.documentElement.clientHeight - sky.offsetHeight));
				const randomLandX = Math.random() * (sky.offsetWidth - bomb.offsetWidth);
				bomb.className = 'bomb';
				sky.appendChild(bomb);

				const explode = () => {
					bomb.style.top = randomLandY + 'px';
					bomb.style.left = randomLandX + 'px';
					if (!sky.contains(bomb) && bomb.className !== 'explosion shot') return;
					bomb.className = 'explosion';
					bomb.style.setProperty('--scale', /* random explosion size */ Math.random() * (1.2 - .5) + .5);
					bomb.style.removeProperty('transform');

					if (impact(player, bomb)) {
						if (--lives <= 0)
							return endGame();

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

					setInterval(() => bomb?.remove(), explosionTime);
				}

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
			setInterval(() => {
				clearInterval(shootIntervalFunc);
				// intervals.splice(intervals.indexOf(shootIntervalFunc), 1);
			}, alienAniamtionDuration - 200);
		}

		newAlien();
	});

	function endGame() {
		gameOver = true;
		nameLabel.textContent = nameLabel.dataset.text;
		nameInput.classList.remove('hidden');
		startBtn.classList.remove('hidden');

		document.body.classList.add('game-over');
		document.body.classList.remove('playing');

		if (!onMobile()) {
			document.body.classList.add('pc');
			// Wait 1.5 seconds as the player might still be holding some W,A,S,D key.
			setTimeout(() => nameInput.focus(), 1500);
		}

		for (const e of document.querySelectorAll('.alien, .bomb, .explosion'))
			e.animate([{ opacity: 0, offset: 1 }], { duration: 1000, easing: 'linear' })
				.onfinish = () => e.remove();

		player.className = 'character stand dead';
		stopBackgroundWork();
	}

	function startBackgroundWork() {
		intervals.push(
			// Updated level, speed up bomb, alien spawn rate etc. as the game progresses.
			setInterval(() => {
				if (gameOver) return;

				levelElement.textContent = ++level;
				spawnInterval = Math.abs(spawnInterval - 50); // Decrese alien spawn interval time by 50 at each level (making them spawn faster)
				bombSpeed = Math.abs(bombSpeed - 100); // 100ms for bomb speed.
				shootIntervalMax = shootIntervalMax - 200 < 0 ? 0 : shootIntervalMax - 200; // 200ms for the maximum random shooting interval.
			}, levelingInterval)
		);
	}

	function stopBackgroundWork() {
		for (const interval of intervals)
			clearInterval(interval);
			
		intervals = [];
	}
});

function move({ player, sky, bombsShotElement }) {
	const noDirections = condition => condition && player.classList.remove('up', 'down', 'left', 'right', 'stand');

	if (!arrowFired) {
		if (upPressed) {
			player.style.top = (player.offsetTop <= sky.offsetHeight ? sky.offsetHeight : player.offsetTop - 1) + 'px';
			noDirections(!leftPressed && !rightPressed);
			player.classList.add('character', playerHit ? 'hit' : 'walk', 'up');
		}
		if (downPressed) {
			player.style.top = (player.offsetTop >= document.documentElement.clientHeight - player.offsetHeight ? document.documentElement.clientHeight - player.offsetHeight : player.offsetTop + 1) + 'px';
			noDirections(!leftPressed && !rightPressed);
			player.classList.add('character', playerHit ? 'hit' : 'walk', 'down');
		}
		if (leftPressed) {
			player.style.left = (player.offsetLeft <= 0 ? 0 : player.offsetLeft - 1) + 'px';
			noDirections(!upPressed && !downPressed);
			player.classList.add('character', playerHit ? 'hit' : 'walk', 'left');
		}
		if (rightPressed) {
			player.style.left = (player.offsetLeft >= sky.offsetWidth - player.offsetWidth ? sky.offsetWidth - player.offsetWidth : player.offsetLeft + 1) + 'px';
			if (!upPressed && !downPressed)
				player.classList.remove('up', 'down', 'left', 'right');
			player.classList.add('character', 'walk', 'right');
		}
	}

	if (spacePressed) {
		player.className = `character stand ${lastPressed} fire`;
		if (arrowFired || document.querySelector('.arrow'))return;
		
		arrowFired = true;
		const arrow = document.body.appendChild(document.createElement('div'));
		arrow.className = `arrow ${lastPressed}`;
		arrow.style.top = player.offsetTop + player.offsetHeight / 2 - arrow.offsetHeight / 2 + 'px';
		arrow.style.left = player.offsetLeft + player.offsetWidth / 2 - arrow.offsetWidth / 2 + 'px';
		const pressedBefore = lastPressed;
		const arrowMovementInterval = setInterval(() => {
			// Move arrow while facing it where the character was facing last until it's offscreen.
			if (pressedBefore === 'up')
				arrow.style.top = arrow.offsetTop - 5 + 'px';
			else if (pressedBefore === 'down')
				arrow.style.top = arrow.offsetTop + 5 + 'px';
			else if (pressedBefore === 'left')
				arrow.style.left = arrow.offsetLeft - 5 + 'px';
			else if (pressedBefore === 'right')
				arrow.style.left = arrow.offsetLeft + 5 + 'px';

			// Arrow is off screen
			if (arrow.offsetTop <= 0 || arrow.offsetTop >= document.documentElement.clientHeight || arrow.offsetLeft <= 0 || arrow.offsetLeft >= sky.offsetWidth) {
				arrow?.remove();
				clearInterval(arrowMovementInterval);
			}

			// Arrow hits a bomb or alien ship.
			const bomb = document.elementFromPoint(arrow.offsetLeft + arrow.offsetWidth / 2, arrow.offsetTop + arrow.offsetHeight / 2);
			if (arrow && bomb?.classList.contains('bomb')) {
				arrow?.remove();
				bomb.className = 'explosion shot';
				bomb.style.removeProperty('transform');
				setTimeout(() => bomb?.remove(), 500);
				bombsShotElement.textContent = ++bombsShotElement.textContent;
				clearInterval(arrowMovementInterval);
			}
		});

		setTimeout(() => {
			spacePressed = arrowFired = false;
			player.classList.remove('fire');
		}, 1000);
	}
}