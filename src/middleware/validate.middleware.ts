import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";

type ValidationTarget = "body" | "params" | "query";

export const validateData = (
	schema: ZodTypeAny,
	target: ValidationTarget = "body"
) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req[target]);

		if (!result.success) {
			res.status(400).json({
				error: "Validasi gagal",
				details: result.error.format(),
			});
			return;
		}

		const mutableReq = req as Request & {
			body: unknown;
			params: unknown;
			query: unknown;
		};
		mutableReq[target] = result.data;

		next();
	};
};

export const validate = (schema: ZodTypeAny) => validateData(schema, "body");