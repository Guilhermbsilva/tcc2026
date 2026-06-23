"use client";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import {useForm} from "react-hook-form";
import { signUpFormSchema, SignUpFormSchema } from "../_schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import "./tabela.css"
import NazaLogo from "@/components/pas-nazareno.png"
import { supabase } from "@/lib/supabase";


export default function Tabela() {
    
    return(

        <><header>

            <h1 className="titulo2">MinistryHub</h1>

            <li className="lista">
                <a href="" className="quem-somos">Quem somos?</a>
                <a href="" className="title-cadastrar">Cadastrar</a>
            </li>

        </header><div className='backgroundcontainer'>

                <div className='content'></div>
            </div>


            <div id="tablea">

                <h1>Louvor</h1>
        
            <table className="escala">
                
            <thead>
                <tr>
                <th>a</th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                </tr>
            </thead>
            <tbody>
                <tr className="ministro">
                <td>a</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>
                <tr className="back1">
                <td>a</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>
                <tr className="back2">
                <td>a</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>
                <tr className="violao">
                <td>a</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>
                <tr className="guitarra">
                <td>a</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>
                <tr className="baixo">
                <td>a</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>
                <tr className="teclado">
                <td>a</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>
                <tr className="som">
                <td>a</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>
            </tbody>
            </table>
        </div>
            
 
        </>
        
    )
}
