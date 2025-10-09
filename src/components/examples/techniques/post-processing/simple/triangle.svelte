<script lang="ts">
	const minX = -1;
	const maxX = 3;
	const minY = -1;
	const maxY = 3;

	const width = maxX - minX;
	const height = maxY - minY;

	const halfWidth = 0.5 * width;
	const halfHeight = 0.5 * height;

	const strokeWidth = 1 / 50;

	const viewBox = `${minX} ${minY} ${width} ${height}`;

	const trianglePoints = [
		minX, // corner
		minY,

		maxX, // top
		minY,

		minX, // right
		maxY,
	].join(" ");

	const transform = `translate(0, ${halfHeight}) scale(1,-1)`;
</script>

<svg
	{viewBox}
	xmlns="http://www.w3.org/2000/svg"
>
	<text
		font-size={0.25}
		text-anchor="middle"
		dominant-baseline="middle"
		y="50%"
		fill="red"
	>
		screen
	</text>
	<g
		{transform}
		fill="none"
		stroke-width={strokeWidth}
		stroke-dasharray={strokeWidth}
	>
		<rect
			x={minX}
			width="50%"
			y={minY}
			height="50%"
			stroke="red"
		/>
		<polygon
			points={trianglePoints}
			stroke="yellow"
			stroke-dashoffset={0.5 * strokeWidth}
		/>
	</g>
</svg>
