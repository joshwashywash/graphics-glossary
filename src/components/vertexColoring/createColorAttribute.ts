import type { BufferAttribute, InterleavedBufferAttribute } from "three";
import { Float32BufferAttribute } from "three";

export default (
	position: BufferAttribute | InterleavedBufferAttribute,
	fx: (x: number) => number,
	fy: (y: number) => number,
	fz: (z: number) => number,
): Float32BufferAttribute => {
	const color: number[] = [];
	for (let i = 0; i < position.count; i += 1) {
		const x = fx(position.getX(i));
		const y = fy(position.getY(i));
		const z = fz(position.getZ(i));
		color.push(x, y, z);
	}

	return new Float32BufferAttribute(color, position.itemSize);
};
