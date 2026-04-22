import {
	AlwaysStencilFunc,
	EqualStencilFunc,
	KeepStencilOp,
	ReplaceStencilOp,
} from "three/webgpu";
import type { MaterialParameters } from "three/webgpu";

type MaskMaterialParameters = Pick<
	MaterialParameters,
	| "colorWrite"
	| "depthWrite"
	| "stencilFail"
	| "stencilFunc"
	| "stencilRef"
	| "stencilWrite"
	| "stencilZFail"
	| "stencilZPass"
>;

type MaskedMaterialParameters = Pick<
	MaterialParameters,
	| "stencilFail"
	| "stencilFunc"
	| "stencilRef"
	| "stencilWrite"
	| "stencilZFail"
	| "stencilZPass"
>;

export const createMask = (stencilRef = 1) => {
	const maskMaterialParameters: MaskMaterialParameters = {
		colorWrite: false,
		depthWrite: false,
		stencilFail: ReplaceStencilOp,
		stencilFunc: AlwaysStencilFunc,
		stencilRef,
		stencilWrite: true,
		stencilZFail: ReplaceStencilOp,
		stencilZPass: ReplaceStencilOp,
	};

	const maskedMaterialParameters: MaskedMaterialParameters = {
		stencilFail: KeepStencilOp,
		stencilFunc: EqualStencilFunc,
		stencilRef,
		stencilWrite: true,
		stencilZFail: KeepStencilOp,
		stencilZPass: KeepStencilOp,
	};

	return {
		maskMaterialParameters,
		maskedMaterialParameters,
	};
};
