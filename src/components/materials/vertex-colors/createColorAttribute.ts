import type { BufferAttribute, InterleavedBufferAttribute } from "three";
import { Float32BufferAttribute } from "three";

export default (
	positionAttribute: BufferAttribute | InterleavedBufferAttribute,
	fx: (x: number) => number,
	fy: (y: number) => number,
	fz: (z: number) => number,
): Float32BufferAttribute => {
	const color: number[] = [];
	for (let i = 0; i < positionAttribute.count; i += 1) {
		const x = fx(positionAttribute.getX(i));
		const y = fy(positionAttribute.getY(i));
		const z = fz(positionAttribute.getZ(i));
		color.push(x, y, z);
	}

	return new Float32BufferAttribute(color, positionAttribute.itemSize);
};
