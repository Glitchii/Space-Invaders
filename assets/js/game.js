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


const move = (player, skyHeight) => {
	const positionLeft = player.offsetLeft;
	const positionTop = player.offsetTop;

	if (leftPressed)
		player.style.left = positionLeft - 1 + 'px',
			player.className = 'character walk left';

	if (rightPressed)
		player.style.left = positionLeft + 1 + 'px',
			player.className = 'character walk right';

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

document.addEventListener('DOMContentLoaded', () => {
	var playing,
		player = document.getElementById('player'),
		startBtn = document.querySelector('.start'),
		sky = document.querySelector('.sky'),
		skyHeight = sky.offsetHeight,
		timeout = setInterval(move, 10, player, skyHeight),
		mainAlien = document.querySelector('#alien.main');

	document.addEventListener('keydown', keydown);
	document.addEventListener('keyup', keyup);

	startBtn.addEventListener('click', e => {
		playing = !document.body.classList.add('playing');
		// Animate aliet above sky and hide it
		mainAlien.animate([{ transform: 'translateY(-250%)' }], { duration: 500, })
			.onfinish = () => mainAlien.classList.add('hidden');
	});
});