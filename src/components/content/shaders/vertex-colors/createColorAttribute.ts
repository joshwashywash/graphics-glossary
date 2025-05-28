import type { BufferAttribute, InterleavedBufferAttribute } from "three";
import { Float32BufferAttribute } from "three";

export default (
	positionAttribute: BufferAttribute | InterleavedBufferAttribute,
	map: {
		x: (x: number) => number;
		y: (y: number) => number;
		z: (z: number) => number;
	},
): Float32BufferAttribute => {
	const color: number[] = [];
	for (let i = 0; i < positionAttribute.count; i += 1) {
		const x = map.x(positionAttribute.getX(i));
		const y = map.y(positionAttribute.getY(i));
		const z = map.z(positionAttribute.getZ(i));
		color.push(x, y, z);
	}

	return new Float32BufferAttribute(color, positionAttribute.itemSize);
};
