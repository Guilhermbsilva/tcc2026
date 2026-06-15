import {z} from 'zod';

export const signUpFormSchema = z.object({

    name: z.string().min(1, {"message": "Nome é obrigatório"}).max(255),
    
    email: z.email({message: "Email invalido"}).max(255),

    cargo: z.string().min(1,{message: "cargo é obrigatório"}).max(255),

    password: z.string().min(8, {message: "Senha deve ter pelo menos 8 caracteres"}).max(255),

    confirmPassword: z.string(),


}).refine(data => data.password === data.confirmPassword,{
    message: "As senhas são diferentes",
    path: ["confirmPassword"]
});

export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;

export const cultoSchema = z.object({

    dia: z.string().min(1, {message: "escolha uma data"}),

})

export type cultoSchema = z.infer<typeof cultoSchema>;