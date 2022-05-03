// Variables of pressed keys.
var upPressed, downPressed, leftPressed, rightPressed, lastPressed;

// Arrays of arrow and WASD key codes for controlling the player.
const leftKeys = [37, 65],
	rightKeys = [39, 68],
	upKeys = [38, 87],
	downKeys = [40, 83];

const keyup = event => {
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
}


const move = (player, skyHeight, screenWidth) => {
	const positionLeft = player.offsetLeft;
	const positionTop = player.offsetTop;

	if (upPressed) {
		// Don't go above the sky. 'document.elementFromPoint' is a bit buggy.
		player.style.top = (positionTop <= skyHeight ? skyHeight : positionTop - 1) + 'px';

		if (!leftPressed && !rightPressed)
			player.className = 'character walk up';
	}

	if (downPressed) {
		// Don't go below the map (visible screen).
		const screenHeight = document.documentElement.clientHeight;
		player.style.top = (positionTop >= screenHeight - player.offsetHeight ? screenHeight - player.offsetHeight : positionTop + 1) + 'px';

		if (!leftPressed && !rightPressed)
			player.className = 'character walk down';
	}



	if (leftPressed) {
		player.style.left = (positionLeft <= 0 ? 0 : positionLeft - 1) + 'px';

		if (!upPressed && !downPressed)
			player.className = 'character walk left';
	}

	if (rightPressed) {
		player.style.left = (positionLeft >= screenWidth - player.offsetWidth ? screenWidth - player.offsetWidth : positionLeft + 1) + 'px';

		if (!upPressed && !downPressed)
			player.className = 'character walk right';
	}
}


const keydown = event => {
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
	let spawnInterval = 1000, playing,
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

	startBtn.addEventListener('click', e => {
		playing = !document.body.classList.add('playing');
		// Animate aliet above sky and hide it
		mainAlien.animate([{ transform: 'translate(-50%, -250%)' }], { duration: 500, })
			.onfinish = () => mainAlien.classList.add('hidden');

		// Blink animate the player
		health.classList.remove('hidden');
		blink(health);
		// blink(player, 600);

		player.classList.add('blink');

		const newAlien = duration => {
			setTimeout(newAlien, spawnInterval);
			const alien = document.createElement('div');
			sky.appendChild(alien);
			console.log(alien);

			alien.className = 'alien';
			// Spawn alien inside the sky
			// const randomY = Math.random() * (skyHeight - alien.offsetHeight) + 'px';
			const randomY = Math.random() * (skyHeight - skyHeight / 2 - alien.offsetHeight);
			const randomX = Math.random() * (skyWidth - alien.offsetWidth);
			alien.style.left = randomX + 'px';
			// alien.style.top = randomY;
			// Animate top down
			alien.animate([{ opacity: 0, top: '-100%' }, { top: randomY + 'px' }], { duration: duration || 5000, easing: 'ease-in-out' })
				.onfinish = () => {
					alien.style.top = randomY + 'px';
					// Turn around the ship and go back up
					// setTimeout(() => {
					const stay = Math.random() > .5;
					// const transform = Math.random() > .5  ? 'rotate(180deg)' : 'rotate(0deg)';
					const transform = 'rotate(180deg)';
					alien.animate([
						{ opacity: 1, top: randomY + 'px' },
						{ transform },
						{ top: '-100%' }], { duration: 2000, easing: 'ease-in-out', fill: 'forwards' })
							.onfinish = () => alien.remove();
							
					// alien.animate([
					// 	{ opacity: 1, top: randomY + 'px' },
					// 	{ transform },
					// ], { duration: 1000, easing: 'ease-in-out' }).onfinish = () => {
					// 	alien.style.transform = transform;
					// 	alien.animate([{ top: '-100%' },], { duration: 2000, easing: 'ease-in-out', fill: 'forwards' })
					// 		.onfinish = () => alien.remove();
					// }
					// }, Math.random() * 5000);
				}

			// alien.style.top = skyHeight + 'px';
			// alien.style.left = Math.random() * skyWidth + 'px';


			// alien.style.top = Math.random() * skyWidth + 'px';
			// document.body.appendChild(alien);
			// Animate alien down and remove it
			// alien.animate([{ transform: 'translate(-50%, -250%)' }], { duration: Math.random() * 5000 + 5000, })
			// 	.onfinish = () => {
			// 		// alien.remove();
			// 		// newAlien();
			// 	}
			// Finish later
		}

		// Spawn alien ships
		newAlien(0);
		// setInterval(() => {
		// 	spawnInterval = spawnInterval - 100;
		// 	console.log(spawnInterval);
		// 	window.spawnInterval = spawnInterval;
		// }, 1000);
		// setTimeout(newAlien(), spawnInterval);
		spawnInterval;
	});

	// startBtn.click();
});