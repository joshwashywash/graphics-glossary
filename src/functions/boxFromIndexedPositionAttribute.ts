import type { BufferAttribute, InterleavedBufferAttribute } from "three/webgpu";
import { Box3, Vector3 } from "three/webgpu";

const _point = new Vector3();

export const boxFromIndexedPositionAttribute = (
	index: BufferAttribute,
	position: BufferAttribute | InterleavedBufferAttribute,
	box = new Box3(),
): Box3 => {
	for (let i = 0; i < index.count; i += 1) {
		box.expandByPoint(_point.fromBufferAttribute(position, index.getX(i)));
	}
	return box;
};
