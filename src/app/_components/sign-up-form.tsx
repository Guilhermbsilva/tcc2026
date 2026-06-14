'use client';

import { Button, Input } from "@base-ui/react";
import { FormEvent, useRef, useState } from "react";
import { SignUpFormSchema, signUpFormSchema } from "../_schemas/auth-schemas";
import {z} from 'zod'
import NazaLogo from "@/components/pas-nazareno.png"
import "./sign-up-form.css"

export default function SignUpForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [errors, setErrors] = useState<z.ZodError<SignUpFormSchema>>();

    const formErrors = errors ? z.treeifyError(errors)?.properties : null;


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(formRef.current!)
        const data = Object.fromEntries(formData);

        const parsedData = signUpFormSchema.safeParse(data)

        if(!parsedData.success) {
            setErrors(parsedData.error)
            return;
        }

        setErrors(undefined);

        console.log("formulário final, onde eu chamo a API ->", data)
    }



    return (

        <><header>

            <h1 className="titulo2">MinistryHub</h1>

            <li className="lista">
                <a href="" className="quem-somos">Quem somos?</a>
                <a href="" className="title-cadastrar">Cadastrar</a>
            </li>

        </header><div className='backgroundcontainer'>

                <div className='content'></div>
            </div>
            
            <div className="forms">


                <img src={NazaLogo.src} alt="" />
                <p className="titulo">Faça Cadastro</p>
                <p className="normal">Faça login para acessar o sistema</p>
                <form
                    onSubmit={handleSubmit}
                    ref={formRef}
                    className=""
                >

                    <div>
                        <Input name="name" placeholder="Nome" />

                        {formErrors?.name && (
                            <div className="text-red-500 text-xs">
                                {formErrors?.name.errors[0]}
                            </div>
                        )}

                    </div>

                    <div>
                        <Input name="email" placeholder="email" type="email" />

                        {formErrors?.email && (
                            <div className="text-red-500 text-xs">
                                {formErrors?.email.errors[0]}
                            </div>
                        )}

                    </div>

                    <div>
                        <Input name="password" placeholder="Senha" type="password" />

                        {formErrors?.password && (
                            <div className="text-red-500 text-xs">
                                {formErrors?.password.errors[0]}
                            </div>
                        )}

                    </div>

                    <div>
                        <Input name="confirmPassword" placeholder="Confirmar Senha" type="password" />

                        {formErrors?.confirmPassword && (
                            <div className="text-red-500 text-xs">
                                {formErrors?.confirmPassword.errors[0]}
                            </div>
                        )}

                    </div>

                    <button>Cadastrar</button>

                </form>

                </div>
                </>
                )
            }