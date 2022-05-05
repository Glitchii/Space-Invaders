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
const blink = (subject, duration = 1000, times = 3) => {
	return subject.animate(Array(times).fill([{ opacity: '.5' }, { opacity: '1' }]).flat(), { duration: duration, })
}
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
		defaultSpawnInterval = 100,
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
		intervals = [],
		player = document.getElementById('player'),
		startBtn = document.querySelector('.start'),
		sky = document.querySelector('.sky'),
		skyHeight = sky.offsetHeight,
		skyWidth = sky.offsetWidth,
		timeout = setInterval(move, 10, player, skyHeight, skyWidth),
		health = document.querySelector('.health'),
		mainAlien = document.querySelector('.alien.main');

	document.addEventListener('keydown', keydown);
	document.addEventListener('keyup', keyup);

	const endGame = () => {
		playing = false; lives = 3;
		spawnInterval = 4000;
		shootInterval = 2000;
		shootIntervalMax = 4000;
		shootIntervalMin = 1000;
		explosionTime = 1000;
		player.className = 'character dead';
		document.body.classList.remove('playing');
		renderLives(health, lives);

		for (e of document.querySelectorAll('.alien, .bomb, .explosion'))
			e.remove();

		for (int of intervals)
			clearInterval(int);
		intervals = [];
	}

	startBtn.addEventListener('click', e => {
		// lives = defaultLives,
		// level = defaultLevel,
		// spawnInterval = defaultSpawnInterval,
		// shootInterval = defaultShootInterval,
		// shootIntervalMax = defaultShootIntervalMax,
		// shootIntervalMin = defaultShootIntervalMin,
		// explosionTime = defaultExplosionTime,
		// bombsDodged = defaultBombsDodged,
		// bombSpeed = defaultBombSpeed,
		// aliensShot = defaultAliensShot,
		// bombsDodgedElement.textContent = bombsDodged;
		// document.body.classList.remove('game-over');

		gameOver = false;
		playing = !document.body.classList.add('playing');
		document.body.classList.remove('game-over');
		player.className = 'character stand down';
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


			// console.log(alien);
			window.spawnInterval = spawnInterval;
			0 && console.log({
				'Spawn interval': spawnInterval,
				'alien': alien,
				'random X': randomX,
				'random Y': randomY,
				'posiotnX1': posiotnX1,
				'posiotnX2': posiotnX2,
			})

			return
		}

		newAlien(0);
	});

	// spawnInterval = 2000;
	// startBtn.click();
	lives = 4

	// Interval to speed up spawn rate, shoot rate, and alien speed
	setInterval(() => {
		// Speed up everything as the level goes up
		bombSpeed -= 1;
		spawnInterval -= 1;
		shootInterval -= 1;
		shootIntervalMax -= 1;
		if (shootIntervalMax < shootIntervalMin) {
			shootIntervalMax = 1000;
			shootIntervalMin = 0;
		}
	}, 1000);

	// Interval to change displayed level
});