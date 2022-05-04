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

document.addEventListener('DOMContentLoaded', () => {
	let // The number of lives the player has by default.
		lives = 0
		// Interval at which alien ships spawn.
		spawnInterval = 1000,
		// Interval at which alien ships spawn.
		shootInterval = 1000,
		shootIntervalMax = 4000,
		shootIntervalMin = 1000,
		explosionTime = 1000,
		// The speed in seconds at which the bombs move once fired.
		bombSpeed = 5000,
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

	const restart = () => {
		document.body.classList.remove('playing');
		playing = false;
		lives = 3,
		spawnInterval = 4000,
		shootInterval = 2000,
		shootIntervalMax = 4000,
		shootIntervalMin = 1000,
		explosionTime = 1000,
		document.body.classList.add('game-over');
	}

	startBtn.addEventListener('click', e => {
		gameOver = false;
		playing = !document.body.classList.add('playing');
		player.classList.remove('dead', 'walk');
		player.classList.add('character', 'stand', 'down');
		// Animate alien above sky and hide it
		mainAlien.animate([{ transform: 'translate(-50%, -250%)' }], { duration: 500, })
			.onfinish = () => mainAlien.classList.add('hidden');

		// Blink animate the player
		// create lives dives based on the number of lives
		for (let i = 0; i < lives; i++)
			health.appendChild(document.createElement('li'));

		health.classList.remove('hidden');
		blink(health);
		// blink(player, 600);

		player.classList.add('blink');

		const newAlien = (duration, takeaway = 1) => {
			if (gameOver) return restart();
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

			CSSAnimation: {
				// @keyframes from-top-to-bottom-then-left-to-right-then-backup {
				// 	0% {
				// 		left: 0;
				// 		top: calc(var(--position-y) -100px);
				// 	}

				// 	15% {
				// 		left: 0;
				// 		top: calc(var(--position-y) 100px);
				// 	}

				// 	20% {
				// 		left: 0;
				// 	}

				// 	40% {
				// 		top: calc(var(--position-y) + 100px);
				// 		left: -50px
				// 	}

				// 	45% {
				// 		left: -50px
				// 	}

				// 	65% {
				// 		top: calc(var(--position-y) + 100px);
				// 		left: 50px;
				// 	}

				// 	80% {
				// 		left: 50px;
				// 		top: calc(var(--position-y) - 100px);
				// 	}

				// 	100% {
				// 		left: 50px;
				// 		top: calc(var(--position-y) - 100px);
				// 	}
				// }
			}

			// let posiotnX1 = randomX / 2 + alien.offsetWidth, posiotnX2 = randomX / 2 + alien.offsetWidth;
			// min = 1, max = 6 
			let moveX = Math.ceil(Math.random() * (6 - 1) + 1),
				posiotnX1 = randomX / moveX,
				posiotnX2 = randomX / moveX,
				shooting = true;
			// make sure position is not off screen using skyWidth as a max from the left
			// posiotnX1 = posiotnX1 > skyWidth ? skyWidth : posiotnX1;
			// posiotnX2 = posiotnX2 > skyWidth ? skyWidth : posiotnX2;
			// make sure position is not off screen using skyWidth as a max from the right
			// posiotnX1 = posiotnX1 < 0 ? 0 : posiotnX1;
			// posiotnX2 = posiotnX2 < 0 ? 0 : posiotnX2;

			// let bomb = document.createElement('div');
			// bomb.className = 'bomb';

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
					clearInterval(shootIntervalFunc)
					// console.log('Boom');
					bomb?.remove();

					const explosion = document.createElement('div');
					explosion.className = 'explosion';
					explosion.style.left = randomLandX + 'px';
					explosion.style.top = randomLandY + 'px';
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
							player.classList.add('dead');
							player.classList.remove('walk');
							// player.classList.remove('stand');
							playing = false;
						}
						health.lastChild && health.removeChild(health.lastChild);
						blink(health, 2000, 6);

					}
					setInterval(() => explosion.remove(), explosionTime);
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
	startBtn.click();

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