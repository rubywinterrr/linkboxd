import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";

export default function InicioSesion (){
    const [ nombre, setNombre ] = useState <string>("");
    const [ apellido, setApellido ] = useState <string>("");
    const [ mail, setMail ] = useState <string>("");
    const [contraseña, setContraseña] = useState <string>("");
    const navigate = useNavigate();

    const dominio = [ '@gmail.com ', '@yahoo.com.ar', '@hotmail.com', 'outlook.com' , '@est.ort.edu.ar']
    const nombreGmail = mail.includes("@")? mail.split("@")[0] : mail;
    const sinEspaciosPersonal = nombreGmail.replace(/\s+/g, '')

    fetch("apidemaxi", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre,
            apellido,
            mail,
            contraseña,
        })
    })

    return (
        <div>
            <div>
                <input className='nombreInput' type='text' value={nombre} required placeholder='Su Nombre' onChange={(e)=> setNombre(e.target.value)}></input>
                <input className='apellidoInput' type='text' value={apellido} required placeholder='Su Apellido' onChange={(e)=> setApellido(e.target.value)}></input>
                <input className='mailInput' type='text' value={mail} required placeholder='Su Mail' onChange={(e)=> setMail(e.target.value)}></input>
                <input className='contraseñaInput' type='password' value={contraseña} required placeholder='Su Contraseña' onChange={(e)=> setContraseña(e.target.value)}></input>
            </div>
        </div>
    )
}