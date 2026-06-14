import { signUpFormSchema } from "@/app/_schemas/auth-schemas";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import {z} from 'zod';

export async function POST(request: NextRequest) {
    const body = await request.json();

    const parsedData = signUpFormSchema.safeParse(body);

    if (!parsedData.success) {
        return NextResponse.json(
            {errors: z.treeifyError(parsedData.error)?.properties},
            {
                status: 400,
            }
        );
    }

    return NextResponse.json({message: "success"});

}