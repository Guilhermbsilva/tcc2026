import {z} from 'zod';

export const signUpFormSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }).max(255),
  email: z.email({ message: "Email invalido" }).max(255),
  funcaoSolicitada: z.string().min(1, { message: "informe sua função" }).max(255),
  password: z.string().min(8, { message: "Senha deve ter pelo menos 8 caracteres" }).max(255),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas são diferentes",
  path: ["confirmPassword"],
});

export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;


export const cultoSchema = z.object({

    dia: z.string().min(1, {message: "escolha uma data"}),
    descricao: z.string().max(255).optional(),
})

export type cultoSchema = z.infer<typeof cultoSchema>;

export const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const vincularMinisterioSchema = z.object({
  usuario_id: z.string().min(1, { message: "selecione um usuário" }),
  ministerio_id: z.string().min(1, { message: "selecione um ministério" }),
  funcao: z.string().min(1, { message: "informe a função" }).max(255),
});

export type VincularMinisterioSchema = z.infer<typeof vincularMinisterioSchema>;

export const gerarEscalaSchema = z.object({
  culto_id: z.string().min(1, { message: "selecione um culto" }),
  ministerio_id: z.string().min(1, { message: "selecione um ministério" }),
});

export type GerarEscalaSchema = z.infer<typeof gerarEscalaSchema>;

export const modeloCultoSchema = z.object({
  nome: z.string().min(1, { message: "informe o nome do template" }).max(255),
});

export type ModeloCultoSchema = z.infer<typeof modeloCultoSchema>;

export const funcaoTemplateSchema = z.object({
  funcao: z.string().min(1, { message: "informe a função" }).max(255),
  quantidade: z.number().min(1, { message: "mínimo 1" }), // sem coerce
});

export type FuncaoTemplateSchema = z.infer<typeof funcaoTemplateSchema>;