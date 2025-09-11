import { BoxGeometry, Matrix4, Vector3 } from "three";

const _matrix = new Matrix4().makeTranslation(new Vector3().setScalar(0.5));

export class VertexColorsBoxGeometry extends BoxGeometry {
	constructor(matrix = _matrix) {
		super();
		const positionAttribute = this.getAttribute("position");

		const colorAttribute = positionAttribute.clone().applyMatrix4(matrix);
		this.setAttribute("color", colorAttribute);
	}
}
