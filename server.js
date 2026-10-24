const express = require("express");
const path = require("path");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function tutorLocal(message) {
  const q = message.toLowerCase();
  if (/hola|buenas|buenos días|buenas tardes/.test(q)) {
    return "¡Hola! Soy Áurea, tu tutor de precálculo. Puedo ayudarte con números reales, exponentes, radicales, expresiones algebraicas y racionales, ecuaciones, funciones, polinomios y trigonometría. Dime qué tema o ejercicio quieres practicar.\n\nTrabajo sin conexión a una IA externa, así que mis explicaciones son guiadas y se basan en temas frecuentes del curso.";
  }
  if (/números reales|numeros reales|conjuntos numéricos|conjuntos numericos/.test(q)) {
    return "Los números reales son todos los números que podemos ubicar en una recta numérica. Se dividen principalmente en racionales e irracionales.\n\n• Racionales: se pueden escribir como una fracción, por ejemplo 1/2, -3 y 0.75.\n• Irracionales: no se pueden expresar como una fracción exacta, por ejemplo √2 y π.\n\nEjemplo: 4 es racional porque puede escribirse como 4/1; √2 es irracional porque su decimal continúa sin repetirse de forma periódica.";
  }
  if (/exponente|potencia|leyes de exponentes/.test(q)) {
    return "Una potencia indica cuántas veces multiplicamos una base por sí misma. En 2³, la base es 2 y el exponente es 3: 2³ = 2·2·2 = 8.\n\nReglas básicas:\n• Misma base al multiplicar: se suman exponentes. x²·x³ = x⁵.\n• Misma base al dividir: se restan exponentes. x⁵/x² = x³, con x ≠ 0.\n• Exponente cero: x⁰ = 1, si x ≠ 0.\n• Exponente negativo: x⁻² = 1/x², si x ≠ 0.\n\nConsejo: identifica si estás multiplicando, dividiendo o elevando una potencia antes de elegir la regla.";
  }
  if (/radical|raíz|raiz/.test(q)) {
    return "La raíz cuadrada busca el número que, multiplicado por sí mismo, produce el valor dentro del radical. Por ejemplo, √25 = 5 porque 5·5 = 25.\n\nPara simplificar √12, busca un cuadrado perfecto: 12 = 4·3. Entonces √12 = √4·√3 = 2√3.\n\nRecuerda: en los números reales, la raíz cuadrada de un número negativo no está definida.";
  }
  if (/expresión racional|expresion racional|fracción algebraica|fraccion algebraica|dominio/.test(q)) {
    return "Una expresión racional es una fracción que contiene polinomios. Para simplificarla, factoriza el numerador y el denominador y cancela solamente los factores que se repiten.\n\nEjemplo: (x² − 4)/(x − 2). Factorizamos x² − 4 = (x − 2)(x + 2). Al cancelar el factor común queda x + 2.\n\nImportante: la expresión original no permite x = 2, porque el denominador sería cero. Aunque se simplifique, esa restricción se mantiene.";
  }
  if (/ecuación|ecuacion|despejar|modelado/.test(q)) {
    return "Para resolver una ecuación, intenta dejar la incógnita sola haciendo la misma operación en ambos lados.\n\nEjemplo: 2x + 3 = 11\n1. Resta 3 a ambos lados: 2x = 8.\n2. Divide ambos lados entre 2: x = 4.\n3. Comprueba: 2(4) + 3 = 11.\n\nLa solución es x = 4. Si escribes tu ecuación completa, puedo orientarte con los pasos.";
  }
  if (/función|funcion|gráfica|grafica|recta|pendiente/.test(q)) {
    return "Una función relaciona cada valor de entrada x con un único valor de salida y. A menudo se escribe y = f(x).\n\nEjemplo: f(x) = 2x + 1. Si x = 3, sustituimos: f(3) = 2(3) + 1 = 7. El punto correspondiente en la gráfica es (3, 7).\n\nPara dibujar una función sencilla, calcula varios puntos, ubícalos en el plano cartesiano y únelos según la forma de la gráfica.";
  }
  if (/polinom|factoriz|factor común|factor comun|ceros/.test(q)) {
    return "Un polinomio es una expresión formada por términos con variables elevadas a exponentes enteros no negativos, por ejemplo x² + 3x + 2.\n\nPara factorizar x² + 3x + 2, busca dos números que multiplicados den 2 y sumados den 3. Son 1 y 2. Por eso: x² + 3x + 2 = (x + 1)(x + 2).\n\nLos ceros se obtienen igualando cada factor a cero: x + 1 = 0 da x = −1; x + 2 = 0 da x = −2.";
  }
  if (/trigonom|seno|coseno|tangente|triángulo|triangulo/.test(q)) {
    return "En un triángulo rectángulo, las razones trigonométricas relacionan los lados con un ángulo.\n\n• seno = cateto opuesto / hipotenusa\n• coseno = cateto adyacente / hipotenusa\n• tangente = cateto opuesto / cateto adyacente\n\nEjemplo: si el cateto opuesto mide 3 y la hipotenusa 5, entonces seno(θ) = 3/5 = 0.6. Para hallar el ángulo, se usa el seno inverso: θ ≈ 36.87°. Asegúrate de que la calculadora esté en grados si trabajas en grados.";
  }
  if (/desigualdad|inecuación|inecuacion/.test(q)) {
    return "Una desigualdad compara cantidades usando <, >, ≤ o ≥. Se resuelve parecido a una ecuación, pero hay una regla importante: si multiplicas o divides ambos lados por un número negativo, debes cambiar el sentido del signo.\n\nEjemplo: −2x > 6. Divide entre −2 y cambia > por <: x < −3.";
  }
  return "Vamos paso a paso. Para ayudarte mejor, escribe el ejercicio completo o dime cuál de estos temas estás estudiando: números reales, exponentes y radicales, expresiones algebraicas, expresiones racionales, ecuaciones, desigualdades, funciones, gráficas, polinomios o trigonometría.\n\nSoy la versión gratuita local de Áurea: no utiliza créditos de API y ofrece explicaciones guiadas para temas frecuentes, pero no tiene la conversación abierta ni la capacidad general de una IA en línea.";
}

app.post("/api/tutor", (req, res) => {
  const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "Escribe una pregunta para el tutor." });
  res.json({ reply: tutorLocal(message), mode: "offline" });
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(port, () => {
  console.log(`Áurea está disponible en http://localhost:${port}`);
  console.log("Tutor gratuito local activado: no necesita clave API ni créditos.");
});
