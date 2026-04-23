import {
	AlwaysStencilFunc,
	NotEqualStencilFunc,
	ReplaceStencilOp,
} from "three/webgpu";

export const createOutline = (stencilRef = 1) => {
	const outlineMaterialParameters = {
		stencilRef,
		stencilWrite: true,
		stencilFunc: NotEqualStencilFunc,
	};

	const materialParameters = {
		stencilRef,
		stencilWrite: true,
		stencilFail: ReplaceStencilOp,
		stencilZPass: ReplaceStencilOp,
		stencilZFail: ReplaceStencilOp,
		stencilFunc: AlwaysStencilFunc,
	};

	return {
		materialParameters,
		outlineMaterialParameters,
	};
};
