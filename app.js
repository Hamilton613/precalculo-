document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const toast = message => {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 3200);
  };
  const views = ["inicio","transformaciones","calculadora","funciones","polinomios","trigonometria","tutor"];
  const labels = {inicio:"Inicio",transformaciones:"Transformaciones",calculadora:"Álgebra y ecuaciones",funciones:"Funciones y gráficas",polinomios:"Polinomios",trigonometria:"Trigonometría",tutor:"Tutor gratuito"};
  function navigate(view) {
    if (!views.includes(view)) return;
    document.querySelectorAll(".view").forEach(el => el.classList.toggle("active-view", el.id === `view-${view}`));
    document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === view));
    $("currentSection").textContent = labels[view];
    $("sidebar").classList.remove("open");
    if (view === "transformaciones" && window.Plotly) Plotly.Plots.resize($("graficaFuncion"));
    if (view === "funciones" && window.Plotly) Plotly.Plots.resize($("functionPlot"));
    window.scrollTo({top:0,behavior:"smooth"});
  }
  document.querySelectorAll("[data-view]").forEach(el => el.addEventListener("click", () => navigate(el.dataset.view)));
  $("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));

  const mathReady = () => window.math && window.nerdamer;
  function parseExpression(expression) {
    if (!window.math) throw new Error("No se pudo cargar la biblioteca matemática. Revisa tu conexión.");
    const normalized = normalizeExpression(expression);
    return math.parse(normalized);
  }
  function normalizeExpression(value) {
    return String(value).trim().replace(/×/g,"*").replace(/÷/g,"/").replace(/π/g,"pi").replace(/√\s*\(/g,"sqrt(").replace(/\bsen\b/gi,"sin").replace(/\babs\s*\(/gi,"abs(");
  }
  function evaluate(expression, xValue=0) {
    const node = parseExpression(expression);
    const result = node.compile().evaluate({x:xValue, pi:Math.PI, e:Math.E});
    const n = typeof result === "number" ? result : result && typeof result.toNumber === "function" ? result.toNumber() : Number(result);
    return Number.isFinite(n) ? n : null;
  }
  function safeEval(expression, x) {
    try { return evaluate(expression,x); } catch { return null; }
  }
  function cleanNumber(n) {
    if (!Number.isFinite(n)) return "no definido";
    if (Math.abs(n) < 1e-10) n = 0;
    return Number(n.toPrecision(10)).toString();
  }
  function setAnswer(container, title, result, steps=[], note="") {
    container.classList.remove("empty-state");
    container.replaceChildren();
    const heading=document.createElement("h3"); heading.className="answer-title"; heading.textContent=title; container.append(heading);
    const main=document.createElement("div"); main.className="answer-main"; main.textContent=result; container.append(main);
    if (steps.length) {
      const list=document.createElement("ol"); list.className="steps-list";
      steps.forEach(step=>{const li=document.createElement("li");li.textContent=step;list.append(li);});
      container.append(list);
    }
    if(note){const p=document.createElement("p");p.className="answer-note";p.textContent=note;container.append(p);}
  }
  function resetAnswer(container, title, text) {
    container.classList.add("empty-state");
    container.replaceChildren();
    const icon=document.createElement("div");icon.className="empty-symbol";icon.textContent="∑";
    const strong=document.createElement("strong");strong.textContent=title;
    const p=document.createElement("p");p.textContent=text;
    container.append(icon,strong,p);
  }
  function nerd(expression, action, variable="x") {
    if (!window.nerdamer) throw new Error("No se pudo cargar el motor algebraico. Revisa tu conexión.");
    const normalized=normalizeExpression(expression).replace(/\bsqrt\s*\(/g,"sqrt(");
    if(action==="simplificar") return nerdamer(`(${normalized})`).toString();
    if(action==="factorizar") return nerdamer(`factor(${normalized})`).toString();
    if(action==="expandir") return nerdamer(`expand(${normalized})`).toString();
    return "";
  }
  function texish(text) { return String(text).replace(/\*\*/g,"^").replace(/\*/g,"·"); }

  const algebraModes = {
    simplificar:{label:"Expresión algebraica",placeholder:"Ejemplo: (x^2-4)/(x-2)"},
    factorizar:{label:"Expresión para factorizar",placeholder:"Ejemplo: x^2-5*x+6"},
    expandir:{label:"Expresión para expandir",placeholder:"Ejemplo: (x+2)*(x+3)"},
    resolver:{label:"Ecuación (usa =)",placeholder:"Ejemplo: 2*x+5=15"},
    evaluar:{label:"Expresión para evaluar",placeholder:"Ejemplo: x^2+3*x"},
    desigualdad:{label:"Desigualdad (usa <, >, <= o >=)",placeholder:"Ejemplo: 2*x+3>7"}
  };
  let algebraMode="simplificar";
  document.querySelectorAll("[data-mode]").forEach(button=>button.addEventListener("click",()=>{
    algebraMode=button.dataset.mode;
    document.querySelectorAll("[data-mode]").forEach(b=>b.classList.toggle("active",b===button));
    $("algebraLabel").textContent=algebraModes[algebraMode].label;
    $("algebraInput").placeholder=algebraModes[algebraMode].placeholder;
    $("evalRow").hidden=algebraMode!=="evaluar";
    $("algebraInput").value=algebraMode==="resolver"?"2*x+5=15":algebraMode==="factorizar"?"x^2-5*x+6":algebraMode==="expandir"?"(x+2)*(x+3)":algebraMode==="desigualdad"?"2*x+3>7":algebraMode==="evaluar"?"x^2+3*x":"(x^2-4)/(x-2)";
    resetAnswer($("algebraResult"),"Tu procedimiento aparecerá aquí","Elige una operación e introduce tu ejercicio.");
  }));
  $("algebraForm").addEventListener("submit",event=>{
    event.preventDefault();
    const expr=$("algebraInput").value.trim(), variable=$("variableInput").value.trim()||"x";
    if(!expr){toast("Escribe una expresión primero.");return;}
    try {
      if(algebraMode==="simplificar"){
        let result=nerd(expr,"simplificar",variable);
        let note="Comprueba las restricciones originales si hay variables en denominadores o radicales.";
        const steps=["Identifica los términos y factores de la expresión.","Aplica las reglas algebraicas correspondientes.","Expresión simplificada: "+result+"."];
        setAnswer($("algebraResult"),"Expresión simplificada",texish(result),steps,note);
      } else if(algebraMode==="factorizar"){
        const result=nerd(expr,"factorizar",variable);
        setAnswer($("algebraResult"),"Factorización",texish(result),["Busca factores comunes o patrones de factorización.","Descompón la expresión en factores.","Comprueba multiplicando los factores para recuperar la expresión original."]);
      } else if(algebraMode==="expandir"){
        const result=nerd(expr,"expandir",variable);
        setAnswer($("algebraResult"),"Expresión desarrollada",texish(result),["Multiplica los factores cuando corresponda.","Aplica la propiedad distributiva.","Agrupa y reduce términos semejantes." ]);
      } else if(algebraMode==="resolver"){
        const sides=expr.split("=");
        if(sides.length!==2) throw new Error("Escribe una ecuación con un solo signo igual, por ejemplo 2*x+5=15.");
        const equation=`(${normalizeExpression(sides[0])})-(${normalizeExpression(sides[1])})`;
        const result=nerdamer.solve(equation,variable).toString();
        if(!result || result==="[]" ) throw new Error("No se encontró una solución explícita. Revisa la ecuación o prueba con una ecuación polinómica.");
        const values=result.replace(/^\[|\]$/g,"").split(",").map(v=>v.trim());
        const steps=["Escribe la ecuación original: "+expr+".","Agrupa los términos para dejar la ecuación igualada a cero.","Resuelve la ecuación para "+variable+".","Solución obtenida: "+variable+" = "+values.join(" o ")+".","Sustituye cada solución en la ecuación original para comprobarla."];
        setAnswer($("algebraResult"),"Solución de la ecuación",`${variable} = ${values.join("  o  "+variable+" = ")}`,steps,"El motor algebraico calcula la solución. Los pasos son una guía general; el método exacto depende del tipo de ecuación.");
      } else if(algebraMode==="evaluar"){
        const x=Number($("evalValue").value);
        const value=evaluate(expr,x);
        if(value===null) throw new Error("La expresión no está definida en ese valor.");
        setAnswer($("algebraResult"),"Evaluación de la expresión",`f(${cleanNumber(x)}) = ${cleanNumber(value)}`,["Sustituye cada aparición de "+variable+" por "+cleanNumber(x)+".","Respeta el orden de las operaciones: paréntesis, potencias, multiplicaciones y sumas.","Realiza las operaciones para obtener "+cleanNumber(value)+"."]);
      } else {
        const match=expr.match(/^(.*?)(<=|>=|<|>)(.*)$/);
        if(!match) throw new Error("Incluye un signo de desigualdad: <, >, <= o >=.");
        const left=match[1].trim(),op=match[2],right=match[3].trim();
        const difference=nerdamer(`(${normalizeExpression(left)})-(${normalizeExpression(right)})`).toString();
        let roots="No se pudieron calcular automáticamente";
        try { roots=nerdamer.solve(difference,variable).toString(); } catch {}
        const relation={ "<":"menor que",">":"mayor que","<=":"menor o igual que",">=":"mayor o igual que"}[op];
        setAnswer($("algebraResult"),"Desigualdad identificada",`${left} ${op} ${right}`,["Identifica los dos lados de la desigualdad.","La relación indica que el lado izquierdo es "+relation+" el lado derecho.","Al multiplicar o dividir por un número negativo, recuerda invertir el signo.","La expresión llevada a un solo lado es: "+difference+".","Puntos críticos candidatos: "+roots+"."],"Esta versión identifica la desigualdad y calcula raíces candidatas, pero no determina automáticamente todos los intervalos de solución. Comprueba el signo en cada intervalo.");
      }
    } catch(error) { toast(error.message||"No se pudo resolver la expresión."); }
  });

  function drawPlot(element, expression, range=10, extraExpression=null) {
    if(!window.Plotly) { element.textContent="No se pudo cargar la biblioteca de gráficas.";return; }
    const xs=[],ys=[],xs2=[],ys2=[];
    const count=501;
    for(let i=0;i<count;i++){
      const x=-range+2*range*i/(count-1), y=safeEval(expression,x);
      xs.push(x);ys.push(y!==null&&Math.abs(y)<1e5?y:null);
      if(extraExpression!==null){const y2=safeEval(extraExpression,x);xs2.push(x);ys2.push(y2!==null&&Math.abs(y2)<1e5?y2:null);}
    }
    if(!ys.some(y=>y!==null)) throw new Error("No se pudo graficar. Revisa la función y el dominio.");
    const data=[{x:xs,y:ys,type:"scatter",mode:"lines",name:"Función original",connectgaps:false,line:{color:"#3987e8",width:3}}];
    if(extraExpression!==null) data.push({x:xs2,y:ys2,type:"scatter",mode:"lines",name:"Función transformada",connectgaps:false,line:{color:"#7965e8",width:3}});
    Plotly.react(element,data,{margin:{l:48,r:16,t:20,b:42},paper_bgcolor:"white",plot_bgcolor:"white",font:{family:"DM Sans, sans-serif",color:"#8a92a4",size:10},xaxis:{title:"x",range:[-range,range],gridcolor:"#edf0f5",zerolinecolor:"#cfd4e0"},yaxis:{title:"y",gridcolor:"#edf0f5",zerolinecolor:"#cfd4e0",autorange:true},legend:{orientation:"h",y:1.12,x:0},hovermode:"x unified"},{responsive:true,displaylogo:false});
  }
  function transformExpression(expr,mode,units) {
    const u=cleanNumber(units);
    switch(mode){
      case "derecha":return expr.replace(/\bx\b/g,`(x-${u})`);
      case "izquierda":return expr.replace(/\bx\b/g,`(x+${u})`);
      case "arriba":return `(${expr})+${u}`;
      case "abajo":return `(${expr})-${u}`;
      case "reflexion-x":return `-(${expr})`;
      case "reflexion-y":return expr.replace(/\bx\b/g,"(-x)");
      case "estiramiento":return `${u}*(${expr})`;
      case "compresion":return `(${expr})/${u}`;
      default:throw new Error("Selecciona una transformación válida.");
    }
  }
  const transformDescriptions={
    derecha:(u)=>`Cada x se sustituye por (x − ${u}). La gráfica se desplaza ${u} unidad(es) a la derecha.`,
    izquierda:(u)=>`Cada x se sustituye por (x + ${u}). La gráfica se desplaza ${u} unidad(es) a la izquierda.`,
    arriba:(u)=>`Se suma ${u} a todos los valores de salida. La gráfica sube ${u} unidad(es).`,
    abajo:(u)=>`Se resta ${u} a todos los valores de salida. La gráfica baja ${u} unidad(es).`,
    "reflexion-x":()=>"Se multiplica la salida por −1. La gráfica se refleja respecto al eje X.",
    "reflexion-y":()=>"Se sustituye x por −x. La gráfica se refleja respecto al eje Y.",
    estiramiento:(u)=>`Se multiplican las salidas por ${u}. Como el factor es mayor que 1, la gráfica se estira verticalmente.`,
    compresion:(u)=>`Se divide la salida entre ${u}. Si el factor es mayor que 1, la gráfica se comprime verticalmente.`
  };
  $("transformForm").addEventListener("submit",event=>{
    event.preventDefault();
    const expr=$("funcion").value.trim(), mode=$("transformacion").value, units=Number($("unidades").value);
    if(!expr){toast("Escribe una función primero.");return;}
    if(!Number.isFinite(units)||units<0){toast("Escribe un número válido de unidades.");return;}
    if(["estiramiento","compresion"].includes(mode)&&units<=0){toast("El factor debe ser mayor que cero.");return;}
    try {
      const transformed=transformExpression(expr,mode,units);
      if(!safeEval(expr,1) && safeEval(expr,1)!==0 && !safeEval(expr,0) && safeEval(expr,0)!==0) throw new Error("No se reconoce la función. Prueba x^2, 2*x+1, sqrt(x), sin(x) o abs(x).");
      $("funcionOriginal").textContent="f(x) = "+expr;
      $("funcionTransformada").textContent="g(x) = "+transformed;
      $("textoExplicacion").textContent=transformDescriptions[mode](cleanNumber(units));
      drawPlot($("graficaFuncion"),expr,10,transformed);
    } catch(error){toast(error.message||"No se pudo calcular la transformación.");}
  });
  $("transformForm").requestSubmit();

  $("functionForm").addEventListener("submit",event=>{
    event.preventDefault();
    const expr=$("functionExpression").value.trim(), x=Number($("functionX").value), range=Number($("rangeInput").value);
    if(!expr){toast("Escribe una función.");return;}
    try{
      const value=evaluate(expr,x);
      $("functionValue").textContent=value===null?`f(${cleanNumber(x)}) no está definida`:`f(${cleanNumber(x)}) = ${cleanNumber(value)}`;
      const notes=[];
      if(/x\s*\^\s*2|x\*\*2/.test(expr)) notes.push("Parece incluir un término cuadrático; revisa si su gráfica es una parábola.");
      if(/sqrt/i.test(expr)) notes.push("La raíz cuadrada requiere que su radicando sea mayor o igual que cero.");
      if(/\/\s*\(?\s*x/i.test(expr)) notes.push("Revisa los valores que hacen cero al denominador.");
      if(/sin|cos|tan/i.test(expr)) notes.push("Las funciones trigonométricas de esta herramienta usan radianes.");
      notes.push(`Dominio visualizado: x entre −${range} y ${range}. El dominio matemático puede ser más amplio o tener restricciones.`);
      $("functionNotes").textContent=notes.join(" ");
      drawPlot($("functionPlot"),expr,range);
    }catch(error){toast(error.message||"No se pudo analizar la función.");}
  });
  $("functionForm").requestSubmit();

  let polyMode="ceros";
  document.querySelectorAll("[data-poly]").forEach(button=>button.addEventListener("click",()=>{
    polyMode=button.dataset.poly;
    document.querySelectorAll("[data-poly]").forEach(b=>b.classList.toggle("active",b===button));
    $("divisionFields").hidden=polyMode!=="division";
    $("complexFields").hidden=polyMode!=="complejos";
    $("polyLabel").textContent=polyMode==="complejos"?"Primer número complejo":polyMode==="division"?"Dividendo (polinomio)":"Polinomio";
    $("polyInput").value=polyMode==="ceros"?"x^2-5*x+6":polyMode==="division"?"x^2-4":"3+2*i";
    resetAnswer($("polyResult"),"El resultado aparecerá aquí","Selecciona una herramienta de polinomios.");
  }));
  $("polyForm").addEventListener("submit",event=>{
    event.preventDefault();
    const expr=$("polyInput").value.trim();
    if(!expr){toast("Escribe una expresión.");return;}
    try{
      if(polyMode==="ceros"){
        let roots;
        try{roots=nerdamer.solve(expr,"x").toString();}catch{roots="No se encontraron ceros en forma explícita.";}
        const factored=nerd(expr,"factor");
        setAnswer($("polyResult"),"Ceros y factorización",`Ceros: ${roots}`,["Iguala el polinomio a cero.","Factorización obtenida: "+factored+".","Iguala cada factor a cero para encontrar los ceros reales o complejos."],"El resultado depende de la capacidad simbólica del motor para el polinomio introducido. Para algunos polinomios de grado alto, las raíces pueden no expresarse de forma sencilla.");
      } else if(polyMode==="division"){
        const divisor=$("divisorInput").value.trim();
        if(!divisor) throw new Error("Escribe el divisor.");
        const quotient=nerdamer(`(${normalizeExpression(expr)})/(${normalizeExpression(divisor)})`).toString();
        setAnswer($("polyResult"),"Resultado de la división",quotient,["Identifica el dividendo y el divisor.","Divide el polinomio entre el divisor.","Simplifica el cociente: "+quotient+"."],"El motor simplifica el cociente algebraico. No siempre presenta el formato de cociente y residuo de la división larga.");
      }else{
        const second=$("complexSecond").value.trim();
        const first=normalizeExpression(expr), other=normalizeExpression(second);
        const sum=nerdamer(`(${first})+(${other})`).toString();
        const product=nerdamer(`(${first})*(${other})`).toString();
        const quotient=nerdamer(`(${first})/(${other})`).toString();
        setAnswer($("polyResult"),"Operaciones con números complejos",`Suma: ${sum}`,["Primer número: "+expr+".","Segundo número: "+second+".","Suma: "+sum+".","Producto: "+product+".","Cociente: "+quotient+"."],"Usa i para representar la unidad imaginaria, donde i² = −1. Evita dividir entre cero.");
      }
    }catch(error){toast(error.message||"No se pudo realizar el cálculo.");}
  });

  $("trigMode").addEventListener("change",()=>{
    const mode=$("trigMode").value;
    const labels={razon:"Ángulo en grados",inversa:"Valor de la razón (−1 a 1 para seno/coseno)",rad:"Ángulo en grados",deg:"Ángulo en radianes",senos:"Lado a (opuesto a A)",cosenos:"Lado a",cosenosAngulo:"Lado a"};
    $("trigALabel").textContent=labels[mode];
    $("trigExtra").hidden=["razon","inversa","rad","deg"].includes(mode);
    $("trigB").previousElementSibling.textContent=mode==="senos"?"Ángulo A en grados":mode==="cosenosAngulo"?"Lado b":"Lado b";
    $("trigC").previousElementSibling.textContent=mode==="senos"?"Ángulo B en grados":mode==="cosenosAngulo"?"Lado c":"Ángulo C en grados";
  });
  $("trigForm").addEventListener("submit",event=>{
    event.preventDefault();
    const mode=$("trigMode").value, a=Number($("trigA").value), b=Number($("trigB").value), c=Number($("trigC").value);
    try{
      let result="",steps=[];
      if(mode==="razon"){
        const rad=a*Math.PI/180;
        result=`sen(${a}°) = ${cleanNumber(Math.sin(rad))}; cos(${a}°) = ${cleanNumber(Math.cos(rad))}; tan(${a}°) = ${Math.abs(Math.cos(rad))<1e-10?"no definida":cleanNumber(Math.tan(rad))}`;
        steps=[`Convierte el ángulo a radianes: ${a} × π / 180 = ${cleanNumber(rad)}.`,`Calcula seno, coseno y tangente para el ángulo dado.`];
      }else if(mode==="inversa"){
        if(Math.abs(a)>1) throw new Error("Para seno o coseno inverso, el valor debe estar entre −1 y 1.");
        result=`arcsen(${a}) = ${cleanNumber(Math.asin(a)*180/Math.PI)}°; arccos(${a}) = ${cleanNumber(Math.acos(a)*180/Math.PI)}°`;
        steps=["Usa las funciones trigonométricas inversas.","Convierte el resultado de radianes a grados multiplicando por 180/π."];
      }else if(mode==="rad"){
        result=`${cleanNumber(a)}° = ${cleanNumber(a*Math.PI/180)} rad`;
        steps=[`Multiplica los grados por π/180.`,`Resultado: ${cleanNumber(a*Math.PI/180)} radianes.`];
      }else if(mode==="deg"){
        result=`${cleanNumber(a)} rad = ${cleanNumber(a*180/Math.PI)}°`;
        steps=["Multiplica los radianes por 180/π.","Resultado: "+cleanNumber(a*180/Math.PI)+" grados."];
      }else if(mode==="senos"){
        if(a<=0||b<=0||c<=0||b+c>=180) throw new Error("Introduce lados positivos y ángulos A y B cuya suma sea menor que 180°. Para la ley de senos, el segundo campo es el ángulo A y el tercero el ángulo B.");
        const side=a*Math.sin(b*Math.PI/180)/Math.sin(c*Math.PI/180);
        result=`Lado buscado ≈ ${cleanNumber(side)}`;
        steps=["Aplica la ley de senos: a/sen(A) = b/sen(B).","Despeja el lado: lado = "+cleanNumber(a)+" × sen("+b+"°) / sen("+c+"°).","Calcula el resultado: "+cleanNumber(side)+"."]; 
      }else if(mode==="cosenos"){
        if(a<=0||b<=0||c<=0) throw new Error("Los lados deben ser positivos y el ángulo debe ser válido.");
        const side=Math.sqrt(a*a+b*b-2*a*b*Math.cos(c*Math.PI/180));
        if(!Number.isFinite(side)) throw new Error("Los valores no forman un triángulo válido.");
        result=`Lado c ≈ ${cleanNumber(side)}`;
        steps=["Usa c² = a² + b² − 2ab cos(C).",`Sustituye: c² = ${a}² + ${b}² − 2(${a})(${b})cos(${c}°).`,`Despeja la raíz cuadrada: c ≈ ${cleanNumber(side)}.`];
      }else{
        if(a<=0||b<=0||c<=0) throw new Error("Los lados deben ser positivos.");
        const cosA=(b*b+c*c-a*a)/(2*b*c);
        if(cosA < -1 || cosA > 1) throw new Error("Esos lados no forman un triángulo.");
        const angle=Math.acos(cosA)*180/Math.PI;
        result=`Ángulo A ≈ ${cleanNumber(angle)}°`;
        steps=["Usa cos(A) = (b² + c² − a²)/(2bc).",`Sustituye los lados: cos(A) = (${b}² + ${c}² − ${a}²)/(2·${b}·${c}).`,"Aplica coseno inverso para hallar A: "+cleanNumber(angle)+"°."];
      }
      setAnswer($("trigResult"),"Resultado trigonométrico",result,steps,"Verifica que los datos correspondan al tipo de triángulo y a las unidades indicadas.");
    }catch(error){toast(error.message||"No se pudo completar el cálculo.");}
  });
  $("trigMode").dispatchEvent(new Event("change"));

  const chatHistory=[];
  function addMessage(text,role){
    const row=document.createElement("div");row.className=`message ${role==="user"?"user-message":"assistant-message"}`;
    const avatar=document.createElement("div");avatar.className="message-avatar";avatar.textContent=role==="user"?"T":"✦";
    const bubble=document.createElement("div");bubble.className="message-bubble";
    String(text).split(/\n{2,}/).forEach(part=>{const p=document.createElement("p");p.textContent=part;bubble.append(p);});
    row.append(avatar,bubble);$("chatMessages").append(row);$("chatMessages").scrollTop=$("chatMessages").scrollHeight;return row;
  }
  async function askTutor(question){
    addMessage(question,"user");chatHistory.push({role:"user",content:question});
    const pending=addMessage("Estoy preparando una explicación","assistant");pending.querySelector(".message-bubble").classList.add("loading-dots");
    $("chatStatus").textContent="Preparando explicación…";
    try{
      const response=await fetch("/api/tutor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:question,history:chatHistory.slice(-10)})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"No se pudo conectar con el tutor.");
      pending.remove();addMessage(data.reply,"assistant");chatHistory.push({role:"assistant",content:data.reply});
      $("chatStatus").textContent="Tutor gratuito activo. Comprueba los resultados de ejercicios importantes.";
    }catch(error){
      pending.remove();
      const fallback="No pude conectar con la IA. "+(location.protocol==="file:"?"Abre el proyecto mediante el servidor local, no haciendo doble clic en index.html. ":"")+ "Revisa que el servidor esté activo y que hayas configurado OPENAI_API_KEY en el archivo .env. Tus herramientas matemáticas siguen disponibles.";
      addMessage(fallback,"assistant");$("chatStatus").textContent=error.message||"No se pudo conectar con el tutor.";
    }
  }
  $("chatForm").addEventListener("submit",event=>{
    event.preventDefault();const input=$("chatInput"),question=input.value.trim();if(!question)return;input.value="";askTutor(question);
  });
  document.querySelectorAll("[data-prompt]").forEach(button=>button.addEventListener("click",()=>askTutor(button.dataset.prompt)));
  $("clearChat").addEventListener("click",()=>{
    chatHistory.length=0;
    $("chatMessages").replaceChildren();
    addMessage("¡Hola! Soy tu tutor de precálculo. ¿Qué tema o ejercicio quieres trabajar hoy?","assistant");
    $("chatStatus").textContent="Conversación reiniciada.";
  });
});
