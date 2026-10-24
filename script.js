document.addEventListener("DOMContentLoaded", function () {
    
    const boton = document.getElementById("btnCalcular");
    const funcionInput = document.getElementById("funcion");
    const transformacionInput = document.getElementById("transformacion");
    const unidadesInput = document.getElementById("unidades");

    const funcionOriginal = document.getElementById("funcionOriginal");
    const funcionTransformada = document.getElementById("funcionTransformada");
    const explicacion = document.getElementById("textoExplicacion");


    boton.addEventListener("click", function () {

        const funcion = funcionInput.value.trim();
        const transformacion = transformacionInput.value;
        const unidades = Number(unidadesInput.value);

        if (funcion === "") {
            alert("Escribe una función primero.");
            return;
        }

        if (isNaN(unidades) || unidades < 0) {
            alert("Escribe un número válido de unidades.");
            return;
        }

        funcionOriginal.textContent = "f(x) = " + funcion;

        let resultado = "";
        let mensaje = "";


        switch (transformacion) {

            case "derecha":

                resultado = transformarHorizontal(
                    funcion,
                    unidades,
                    "-"
                );

                mensaje =
                    "La función se desplazó " +
                    unidades +
                    " unidad(es) hacia la derecha.";

                break;


            case "izquierda":

                resultado = transformarHorizontal(
                    funcion,
                    unidades,
                    "+"
                );

                mensaje =
                    "La función se desplazó " +
                    unidades +
                    " unidad(es) hacia la izquierda.";

                break;


            case "arriba":

                resultado =
                    "(" + funcion + ") + " + unidades;

                mensaje =
                    "La función se desplazó " +
                    unidades +
                    " unidad(es) hacia arriba.";

                break;


            case "abajo":

                resultado =
                    "(" + funcion + ") - " + unidades;

                mensaje =
                    "La función se desplazó " +
                    unidades +
                    " unidad(es) hacia abajo.";

                break;


            case "reflexion-x":

                resultado =
                    "-(" + funcion + ")";

                mensaje =
                    "La función fue reflejada respecto al eje X.";

                break;


            case "reflexion-y":

                resultado =
                    transformarHorizontal(
                        funcion,
                        0,
                        "-",
                        true
                    );

                mensaje =
                    "La función fue reflejada respecto al eje Y.";

                break;


            case "estiramiento":

                if (unidades <= 0) {
                    alert(
                        "Para el estiramiento utiliza un número mayor que 0."
                    );
                    return;
                }

                resultado =
                    unidades + "(" + funcion + ")";

                mensaje =
                    "La función tuvo un estiramiento vertical " +
                    "por un factor de " +
                    unidades + ".";

                break;


            case "compresion":

                if (unidades <= 0) {
                    alert(
                        "Para la compresión utiliza un número mayor que 0."
                    );
                    return;
                }

                resultado =
                    "(1/" + unidades + ")(" + funcion + ")";

                mensaje =
                    "La función tuvo una compresión vertical " +
                    "por un factor de 1/" +
                    unidades + ".";

                break;
        }


        funcionTransformada.textContent =
            "g(x) = " + resultado;

        explicacion.textContent = mensaje;


        dibujarGrafica(
            funcion,
            resultado
        );

    });


    function transformarHorizontal(
        funcion,
        unidades,
        signo,
        reflexion = false
    ) {

        if (reflexion) {

            return reemplazarVariable(
                funcion,
                "(-x)"
            );

        }

        return reemplazarVariable(
            funcion,
            "(x " + signo + " " + unidades + ")"
        );
    }


    function reemplazarVariable(funcion, reemplazo) {

        return funcion.replace(
            /(?<![a-zA-Z])x(?![a-zA-Z])/gi,
            reemplazo
        );

    }


    function prepararFuncion(funcion) {

        let expresion = funcion.toLowerCase().trim();

        expresion = expresion.replace(/\s+/g, "");


        expresion = expresion.replace(
            /sqrt/g,
            "Math.sqrt"
        );

        expresion = expresion.replace(
            /sin/g,
            "Math.sin"
        );

        expresion = expresion.replace(
            /cos/g,
            "Math.cos"
        );

        expresion = expresion.replace(
            /tan/g,
            "Math.tan"
        );

        expresion = expresion.replace(
            /abs/g,
            "Math.abs"
        );

        expresion = expresion.replace(
            /\bpi\b/g,
            "Math.PI"
        );


        expresion = expresion.replace(
            /\^/g,
            "**"
        );


        // 2x -> 2*x
        expresion = expresion.replace(
            /(\d)(x)/g,
            "$1*$2"
        );

        // 2( -> 2*(
        expresion = expresion.replace(
            /(\d)\(/g,
            "$1*("
        );

        // )( -> )*(
        expresion = expresion.replace(
            /\)\(/g,
            ")*("
        );

        // x( -> x*(
        expresion = expresion.replace(
            /x\(/g,
            "x*("
        );

        // )x -> )*x
        expresion = expresion.replace(
            /\)x/g,
            ")*x"
        );


        // -x -> (-x)
        expresion = expresion.replace(
            /(^|[+\-*/])x/g,
            "$1x"
        );

        return expresion;
    }


    function evaluarFuncion(funcion, x) {

        try {

            const expresion =
                prepararFuncion(funcion);

            const calcular =
                new Function(
                    "x",
                    "return " + expresion
                );

            const resultado =
          calcular(x);

            if (
                typeof resultado === "number" &&
                Number.isFinite(resultado)
            ) {

                return resultado;

            }

            return null;

        }

        catch (error) {

            return null;

        }

    }


    function crearPuntos(funcion) {

        const puntosX = [];
        const puntosY = [];

        const paso = 0.05;

        for (
            let x = -10;
            x <= 10;
            x += paso
        ) {

            const y =
                evaluarFuncion(funcion, x);

            if (
                y !== null &&
                Number.isFinite(y) &&
                Math.abs(y) <= 100
            ) {

                puntosX.push(x);
                puntosY.push(y);

            }
            else {

                // Evita unir partes separadas de la gráfica
                puntosX.push(x);
                puntosY.push(null);

            }

        }

        return {
            x: puntosX,
            y: puntosY
        };

    }


    function dibujarGrafica(
        funcionOriginalTexto,
        funcionTransformadaTexto
    ) {

        const original =
            crearPuntos(funcionOriginalTexto);

        const transformada =
            crearPuntos(funcionTransformadaTexto);


        const puntosOriginales =
            original.y.filter(y => y !== null);

        const puntosTransformados =
            transformada.y.filter(y => y !== null);


        if (
            puntosOriginales.length === 0 ||
            puntosTransformados.length === 0
        ) {

            alert(
                "No se pudo interpretar la función. " +
                "Prueba con ejemplos como x^2, x^3 o 2*x+1."
            );

            return;

        }


        const graficaOriginal = {

            x: original.x,
            y: original.y,

            mode: "lines",

            name: "Función original",

            connectgaps: false,

            line: {
                width: 3
            }

        };



        const graficaTransformada = {

            x: transformada.x,
            y: transformada.y,

            mode: "lines",

            name: "Función transformada",

            connectgaps: false,

            line: {
                width: 3
            }

        };


        const datos = [
            graficaOriginal,
            graficaTransformada
        ];



        const configuracion = {

            title: {
                text: "Comparación de funciones"
            },

            xaxis: {

                title: "Eje X",

                zeroline: true,

                showgrid: true,

                gridcolor: "#dddddd",

                range: [-10, 10]

            },

            yaxis: {

                title: "Eje Y",

                zeroline: true,

                showgrid: true,

                gridcolor: "#dddddd",

                range: [-10, 10]

            },

            margin: {

                l: 60,
                r: 30,
                t: 60,
                b: 60

            },

            legend: {

                orientation: "h",

                x: 0.5,

                xanchor: "center",

                y: 1.05

            },

            hovermode: "x unified"

        };



        Plotly.react(
            "graficaFuncion",
            datos,
            configuracion,
            {
                responsive: true,
                displaylogo: false
            }
        );

    }

});
