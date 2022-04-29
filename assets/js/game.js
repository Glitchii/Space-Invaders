// Variables of pressed keys.
var upPressed, downPressed, leftPressed, rightPressed, lastPressed; 
// Arrays of arrow and WASD key codes for controlling the player.
var leftKeys = [37, 65],
	rightKeys = [39, 68],
	upKeys = [38, 87],
	downKeys = [40, 83];


function keyup(event) {
	if (leftKeys.includes(event.keyCode))
		leftPressed = false,
		lastPressed = 'left';
	if (rightKeys.includes(event.keyCode))
		rightPressed = false,
		lastPressed = 'right';
	if (upKeys.includes(event.keyCode))
		upPressed = false,
		lastPressed = 'up';
	if (downKeys.includes(event.keyCode))
		downPressed = false,
		lastPressed = 'down';

	player.className = 'character stand ' + lastPressed;
}


function move(player) {
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
		player.style.top = (positionTop <= sky.offsetHeight ? sky.offsetHeight : positionTop - 1) + 'px';

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


function keydown(event) {
	if (leftKeys.includes(event.keyCode))
		leftPressed = leftKeys.includes(event.keyCode);
	else if (rightKeys.includes(event.keyCode))
		rightPressed = rightKeys.includes(event.keyCode);
	else if (upKeys.includes(event.keyCode))
		upPressed = upKeys.includes(event.keyCode);
	else if (downKeys.includes(event.keyCode))
		downPressed = downKeys.includes(event.keyCode);
}


function myLoadFunction() {
	window.sky = document.querySelector('.sky')
	const player = document.getElementById('player'),
		timeout = setInterval(move, 10, player),
		sky = document.querySelector('.sky'),
		skyHeight = sky.offsetHeight;

	document.addEventListener('keydown', keydown);
	document.addEventListener('keyup', keyup);
}


document.addEventListener('DOMContentLoaded', myLoadFunction);