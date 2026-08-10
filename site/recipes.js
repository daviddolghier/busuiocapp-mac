(() => {
  const STORAGE_KEY = "busuioc_recipes";
  const els = {
    grid: document.getElementById("recipesGrid"), search: document.getElementById("recipeSearch"), dialog: document.getElementById("recipeDialog"), form: document.getElementById("recipeForm"), title: document.getElementById("recipeTitle"), category: document.getElementById("recipeCategory"), ingredients: document.getElementById("recipeIngredients"), time: document.getElementById("recipeTime"), steps: document.getElementById("recipeSteps"), toast: document.getElementById("recipeToast"), layout: document.getElementById("toggleLayout"), imagePreview: document.getElementById("recipeImagePreview"), imageName: document.getElementById("recipeImageName"), imageFile: document.getElementById("recipeImageFile"), clearImage: document.getElementById("clearRecipeImage")
  };
  const DEFAULT_RECIPES = [
    {
      id: "cartofi-prajiti",
      title: "Cartofi prăjiți",
      category: "main",
      ingredients: "cartofi, ulei de floarea-soarelui, sare, piper negru, boia de ardei dulce, usturoi praf (opțional), pătrunjel proaspăt",
      time: "35 min",
      steps: `1. Curăță cartofii și taie-i în bețișoare uniforme de circa 1 cm grosime — cât mai egale, ca să se prăjească uniform.
2. Clătește bine cartofii tăiați cu apă rece, apoi usucă-i complet cu un prosop de bucătărie. Uscarea este esențială — apa în contact cu uleiul încins provoacă stropi și înmoaie cartofii în loc să-i rumenească.
3. Încinge uleiul în tigaie (sau friteuză) la 175–180 °C. Verifică temperatura lăsând să cadă un cub mic de pâine — ar trebui să se rumenească în circa 30 de secunde.
4. Adaugă cartofii în loturi mici, ca să nu scadă brusc temperatura uleiului. Nu supraîncărca tigaia.
5. Prăjește 5–7 minute, amestecând rar, până devin aurii și crocanți la exterior și moi la interior.
6. Scoate-i cu o spumieră și lasă-i pe hârtie absorbantă 1–2 minute.
7. Condimentează imediat cu sare, piper, boia și usturoi praf. Săratul după prăjire (nu înainte) menține crustă crocantă.
8. Presară pătrunjel proaspăt tocat și servește de îndată — cartofii prăjiți sunt la ei acasă abia scoși din tigaie.

💡 Sfat: Pentru cartofi extra-crocanți, fierbe-i 5 minute înainte de prăjire, lasă-i să se răcească și abia apoi pune-i în ulei.`
    },
    {
      id: "placinte-branza",
      title: "Plăcinte cu brânză",
      category: "main",
      ingredients: "făină, apă, sare, ulei, ouă, brânză de vaci, brânză sărată (feta sau telemea), smântână, zahăr (opțional), marar proaspăt",
      time: "60 min",
      steps: `1. Pregătește aluatul: Amestecă 500 g de făină cu un praf de sare, adaugă treptat 200–220 ml apă caldă și 3 linguri ulei. Frământă până obții un aluat elastic și neted, circa 10 minute. Acoperă cu un prosop și lasă-l să se odihnească 20 minute.
2. Pregătește umplutura: Amestecă 400 g brânză de vaci bine scursă cu 150 g brânză sărată rasă. Adaugă 2 ouă, 2 linguri smântână și mădăr tocat fin. Dacă brânza e prea sărată, clătește-o înainte. Gustă umplutura și ajustează sarea.
3. Împarte aluatul în bile de mărimea unui pumn. Întinde fiecare bilă subțire pe blatul uns cu ulei — cât mai subțire posibil, ca o foaie de pergament.
4. Pune o porție generoasă de umplutură pe jumătate din foaie, lasă marginile libere. Pliază foaia în două, presând bine marginile ca să nu iasă umplutura la copt.
5. Încinge o tigaie anti-aderentă la foc mediu cu puțin ulei. Prăjește plăcintele câte 3–4 minute pe fiecare parte, până devin aurii și pufoase.
6. Scoate pe un platou și servește calde, cu smântână proaspătă alături.

💡 Sfat: Plăcintele pot fi și coapte la 200 °C timp de 20–25 minute, dacă preferi varianta mai ușoară, fără ulei la prăjit.`
    },
    {
      id: "paste-bolognese",
      title: "Paste bolognese",
      category: "main",
      ingredients: "paste (spaghetti sau tagliatelle), carne tocată (vită sau amestec vită-porc), roșii în conservă (pasată), ceapă, morcov, țelină, usturoi, vin roșu sec, concentrat de roșii, ulei de măsline, dafin, cimbru, sare, piper, parmezan",
      time: "90 min",
      steps: `1. Pregătește soffritto-ul (baza aromată): Toacă mărunt ceapa, morcovul și țelina. Călește-le în ulei de măsline la foc mediu, 8–10 minute, amestecând des, până devin moi și ușor aurii.
2. Adaugă usturoiul tocat și mai căleşte 1 minut.
3. Adaugă carnea tocată și rumeneşte-o bine la foc mare, amestecând cu o lingură de lemn și sfărâmând cocoloașele. Carnea trebuie să fie bine rumenită, nu aburită — acesta este secretul aromei intense.
4. Toarnă vinul roșu și lasă-l să fiarbă puternic 2–3 minute, până se evaporă alcoolul și rămâne aroma.
5. Adaugă roșiile în conservă, concentratul de roșii (2 linguri), dafinul și cimbrul. Amestecă bine.
6. Reduce focul la minim și lasă sosul să fiarbă lent, cu capac pus parțial, minimum 45–60 minute. Cu cât fierbe mai încet și mai mult, cu atât devine mai aromat. Amestecă din când în când. Dacă se usucă prea tare, adaugă puțin bulion sau apă.
7. Gustă și ajustează sarea și piperul.
8. Fierbe pastele al dente conform instrucțiunilor de pe pachet. Reservă o cană din apa de fierbere.
9. Amestecă pastele direct în sos, adăugând puțin din apa de fierbere dacă sosul e prea gros — amidonul din apă leagă frumos sosul de paste.
10. Servește imediat cu parmezan ras generos deasupra.

💡 Secretul unui bolognese autentic: răbdarea — sosul fierbe cel puțin o oră la foc minim.`
    },
    {
      id: "paste-napoli",
      title: "Paste napoli",
      category: "main",
      ingredients: "paste (rigatoni, penne sau spaghetti), roșii pelate sau pasată de roșii, ceapă, usturoi, ulei de măsline extravirgin, busuioc proaspăt, sare, piper, zahăr (un vârf), parmezan sau pecorino",
      time: "40 min",
      steps: `1. Toacă ceapa mărunt și zdrobește 2–3 căței de usturoi. Căleşte-le în ulei de măsline generos (3–4 linguri) la foc mediu, fără să se rumenească — vrei ca ceapa să devină transparentă și dulce, nu arsă.
2. Adaugă roșiile pelate (strivite cu mâna) sau pasata. Dacă roșiile sunt acide, adaugă un vârf de cuțit de zahăr pentru echilibru.
3. Condimentează cu sare și piper și lasă sosul să fiarbă la foc mic 25–30 minute, amestecând din când în când. Sosul trebuie să se concentreze și să se îngroașe ușor.
4. Spre finalul gătirii, adaugă frunze de busuioc proaspăt — nu înainte, că se pierde aroma la căldură prea mare.
5. Fierbe pastele al dente. Amestecă-le direct în tigaie cu sosul, la foc mic, 1–2 minute, ca pastele să absoarbă sosul.
6. Servește cu parmezan sau pecorino ras și câteva frunze de busuioc proaspăt.

💡 Napoli clasic nu are carne — toată profunzimea vine din roșii bune, ulei de calitate și busuioc. Folosește cele mai bune roșii pe care le găsești.`
    },
    {
      id: "paste-carbonara",
      title: "Paste carbonara",
      category: "main",
      ingredients: "spaghetti sau rigatoni, guanciale (sau pancetta sau bacon afumat), ouă (gălbenuș + ou întreg), pecorino romano (sau parmezan), piper negru proaspăt măcinat, sare (doar pentru apa pastelor)",
      time: "30 min",
      steps: `1. Taie guanciale în cubulețe sau bețișoare. Căleşte-l în tigaie la foc mediu fără ulei adăugat — îşi va lăsa propriul grăsime. Rumenește până devine crocant. Nu arunca grăsimea din tigaie — este ingredientul secret al carbonarei.
2. Bate într-un bol 3 gălbenușuri și 1 ou întreg (pentru 2 porții) cu pecorino sau parmezan ras generos. Adaugă mult piper negru proaspăt. Amestecă bine — trebuie să obții o cremă groasă.
3. Fierbe pastele în apă cu sare (fără ulei) până sunt al dente. Rezervă 1–2 căni din apa de fierbere înainte de a scurge pastele — aceasta este cheia carbonarei.
4. Scoate tigaia cu guanciale de pe foc. Adaugă pastele fierbinți direct în tigaie și amestecă.
5. Toarnă crema de ouă și brânză peste paste, adăugând câte puțin din apa de fierbere și amestecând rapid și energic. Apa fierbinte gătește ușor oul fără să-l facă scrambled eggs — vrei o cremă mătăsoasă, nu bucăți de ou.
6. Adaugă apă câte puțin până obții consistența dorită — cremoasă, dar nu lichidă.
7. Servește imediat cu extra parmezan și piper negru.

⚠️ Atenție: Carbonara nu conține smântână! Cremozitatea vine exclusiv din ouă, brânză și apa de paste.`
    },
    {
      id: "pancakes-americane",
      title: "Pancakes americane",
      category: "main",
      ingredients: "făină, ouă, lapte, unt topit, zahăr, praf de copt, bicarbonat de sodiu, sare, vanilie, lapte bătut (buttermilk) sau puțin iaurt, sirop de arțar sau miere, fructe proaspete",
      time: "30 min",
      steps: `1. Amestecă ingredientele uscate: 250 g făină, 2 lingurițe praf de copt, 1/2 linguriță bicarbonat, 2 linguri zahăr, un praf de sare.
2. Amestecă separat ingredientele umede: 2 ouă, 250 ml lapte bătut (sau lapte normal + 1 lingură iaurt), 3 linguri unt topit (dar nu fierbinte), 1 linguriță extract de vanilie.
3. Toarnă ingredientele umede peste cele uscate și amestecă scurt, cu câteva mișcări largi. Foarte important: aluatul trebuie să rămână puțin grunjos — nu amesteca până devine perfect neted. Mixatul în exces distruge pancakes-urile, dând un rezultat tare și cauciucat.
4. Lasă aluatul să se odihnească 5 minute — în acest timp praful de copt reacționează și crează bule de aer.
5. Încinge o tigaie anti-aderentă la foc mediu și unge-o ușor cu unt. Când untul face spumă, e pregătită.
6. Toarnă câte un polonic de aluat per pancake. Coace la foc mediu-mic până apar bule pe suprafață și marginile par uscate — circa 2–3 minute. Întoarce și mai coace 1–2 minute pe cealaltă parte.
7. Servește cald, cu strat generos de sirop de arțar, fructe proaspete și un cub de unt care se topește deasupra.

💡 Sfat: Nu apăsa pancakes-urile cu spatula după ce le-ai întors — lasă-le să crească natural.`
    },
    {
      id: "clatite-simple",
      title: "Clătite (Simplu, doar de prăjit)",
      category: "main",
      ingredients: "ouă, lapte, făină, sare, ulei sau unt pentru prăjit",
      time: "25 min",
      steps: `1. Bate 3 ouă cu un praf de sare. Adaugă 500 ml lapte și amestecă bine.
2. Incorporează treptat 150–180 g de făină, amestecând continuu ca să nu apară cocoloașe. Aluatul trebuie să fie fluid — mai lichid decât aluatul de clătite groase.
3. Lasă aluatul să stea 10–15 minute — făina are nevoie de timp să absoarbă lichidul și aluatul va deveni mai omogen.
4. Încinge o tigaie cu diametru mediu (24–26 cm) la foc mediu. Unge-o cu foarte puțin unt sau ulei — clătitele nu trebuie să înoate în grăsime.
5. Toarnă un polonic mic de aluat, rotind rapid tigaia ca aluatul să se distribuie uniform în strat subțire. Acesta este gestul clasic al clătitelor.
6. Coace 1–1,5 minute până marginile se dezlipesc singure și clătita prinde puțin culoare pe dedesubt.
7. Întoarce cu o spatulă sau chiar cu un gest rapid al mâinii dacă ai curaj. Mai coace 30–40 de secunde.
8. Aşează pe un platou. Servește cu ce îți place: gem, miere, dulceață, ciocolată, smântână sau pur și simplu natural.

💡 Sfat: Prima clătită prinde de obicei — e pentru bucătar. Tigaia are nevoie să se „antreneze".`
    },
    {
      id: "pelimeni",
      title: "Pelimeni",
      category: "main",
      ingredients: "făină, ouă, apă caldă, sare (pentru aluat) | carne tocată (porc și vită amestec), ceapă, usturoi, sare, piper negru, puțin lapte sau apă rece (pentru umplutură) | unt, smântână, marar (pentru servire)",
      time: "90 min",
      steps: `1. Pregătește aluatul: Amestecă 3 ouă cu 1 linguriță sare și 150 ml apă caldă. Adaugă treptat 500–550 g de făină și frământă 10 minute până obții un aluat elastic și neted, care nu se lipește de mâini. Înfășoară în folie alimentară și lasă-l să se odihnească 30 minute la temperatura camerei.
2. Pregătește umplutura: Amestecă 500 g carne tocată (ideal jumătate porc, jumătate vită) cu 1 ceapă rasă fin, 2 căței de usturoi zdrobiți, sare și mult piper negru. Adaugă 3–4 linguri lapte sau apă rece și amestecă energic — umplutura trebuie să fie suculentă, nu uscată.
3. Întinde aluatul pe o suprafață înfăinată, subțire (circa 2 mm). Taie cercuri cu un pahar de circa 6–7 cm diametru.
4. Pune o linguriță de umplutură în centrul fiecărui cerc. Pliază în semilună și lipește bine marginile, apoi unește cele două capete dând forma clasică de pelimeni.
5. Fierbe pelimenii în apă cu sare: când apa fierbe, adaugă pelimenii și amestecă ușor. Fierb în 5–7 minute de la momentul în care se ridică la suprafață.
6. Scoate cu o spumieră și servește imediat cu un cub de unt deasupra, smântână și marar tocat.

💡 Pelimenii se pot congela înainte de a fi fierți — aşează-i pe un platou și bagă la congelator, apoi mută-i în pungă. Fierb direct din congelat, adăugând 2–3 minute în plus.`
    },
    {
      id: "zeama-de-pui",
      title: "Zeamă de pui",
      category: "main",
      ingredients: "carcasă de pui sau bucăți cu os (aripioare, spate, pulpe), morcov, ceapă, țelină, rădăcină de pătrunjel, usturoi, sare, piper boabe, dafin, tăieței de casă (sau fidea fină), verdețuri proaspete (pătrunjel, leuștean), oțet sau suc de lămâie (opțional)",
      time: "120 min",
      steps: `1. Pune puiul în oală cu apă rece suficientă să-l acopere (circa 3–4 litri). Adaugă o linguriță de sare. Aduce la fierbere la foc mare.
2. Când apare spuma la suprafață, scoate-o cu grijă cu o lingură sau spumieră — acest pas este esențial pentru o zeamă limpede și curată la gust.
3. Reduce focul la minim — zeama trebuie să aburească, nu să fiarbă turbulent. Adaugă morcovii curățați (întregi sau în bucăți mari), ceapa (curățată, întreagă), țelina, rădăcina de pătrunjel, usturoiul, boabele de piper și dafinul.
4. Fierbe la foc foarte mic 1 oră și 30 minute, fără capac sau cu capac pus parțial. Secretul zemaei este fierberea înceată — extrage tot colagenul și aromele din os.
5. Scoate bucățile de carne. Dezosează puiul și toacă carnea în bucăți medii. Filtrează zeama printr-o sită fină — aruncă legumele fierte (și-au dat tot.
6. Pune zeama înapoi pe foc. Adaugă tăiețeii de casă sau fidea și fierbe conform instrucțiunilor (5–8 minute).
7. Pune carnea dezosată înapoi în zeamă.
8. La final, presară verdețuri proaspete din abundență — pătrunjelul și leușteanul sunt obligatorii. Un strop de oțet sau suc de lămâie la servire deschide aromele perfect.

💡 Zeama de casă este vindecătoare — cu cât fierbe mai lent, cu atât e mai bogată în colagen și arome.`
    },
    {
      id: "zeama-de-peste",
      title: "Zeamă de pește",
      category: "main",
      ingredients: "pește (crap, biban, șalău sau un mix — cu cap și oase pentru gust mai bun), cartofi, morcov, ceapă, roșii, ardei gras, usturoi, ulei de floarea-soarelui, sare, piper boabe, dafin, cimbru, boia de ardei, oțet de mere sau vin alb, verdețuri proaspete (pătrunjel, mădăr)",
      time: "60 min",
      steps: `1. Dacă folosești pește întreg, curăță-l, eviscerează-l și taie-l în bucăți mari. Capul și coada dau cel mai mult gust — nu le arunca.
2. Pune la fiert 2 litri de apă cu sare. Adaugă capul și coada de pește împreună cu boabele de piper, dafinul și cimbrul. Fierbe 20 minute la foc mic, scoțând spuma la nevoie.
3. Filtrează zeama de oase — acum ai un fond aromat de pește.
4. Într-o oală separată, căleşte în ulei ceapa tăiată mărunt, morcovul în rondele și ardeiul gras tocat. Adaugă usturoiul și boiaua de ardei și mai căleşte 1 minut.
5. Toarnă fondul de pește în oală. Adaugă roșiile tocate (sau roșii în conservă) și cartofii tăiați cubulețe. Fierbe 15–20 minute la foc mediu.
6. Adaugă bucățile de pește (fără cap și coadă) și fierbe la foc mic 10–12 minute — nu mai mult, că peștele se face tare.
7. La final, adaugă un strop de oțet de mere sau vin alb pentru acrișor și verdețuri proaspete tocate.
8. Servește fierbinte cu pâine de casă sau mămăligă.

💡 Zeama de pește este delicată — nu supraferbe peștele și nu amesteca prea des, că se dezintegrează.`
    },
    {
      id: "omleta-mega",
      title: "Omletă mega",
      category: "main",
      ingredients: "ouă (4–5 per porție), unt, sare, piper, brânză rasă (cheddar, emmental sau mozzarella), șuncă sau salam, ciuperci, ardei gras, roșii cherry, spanac proaspăt, ceapă verde, smântână sau lapte (opțional)",
      time: "20 min",
      steps: `1. Bate ouăle cu un praf de sare, piper și 1–2 linguri de smântână sau lapte — aceasta face omleta mai pufoasă. Nu bate prea mult — câteva mișcări sunt suficiente, vrei să rămână urme galbene și albe, nu un amestec perfect omogen.
2. Pregătește toate topping-urile: toacă ciupercile și căleşte-le separat în unt până elimină toată apa. Toacă ardeiul, roșiile cherry în jumătăți, ceapa verde și șunca.
3. Topeşte unt generos în tigaie la foc mediu. Când face spumă, toarnă amestecul de ouă.
4. Nu amesteca! Lasă omleta să se gătească lent la foc mic. Cu o spatulă, trage ușor marginile spre centru, lăsând oul lichid să curgă sub marginea ridicată.
5. Când omleta este aproape gătită (ușor lichidă la suprafață), presară brânza rasă pe jumătate din omletă. Adaugă șunca, legumele și verdețurile.
6. Pliază omleta în două, acoperind umplutura. Glisează-o pe farfurie.
7. Brânza se topește din căldura reziduală. Servește imediat, garnisită cu ceapă verde și câteva picături de sos tabasco dacă îți place picant.

💡 O omletă mega bună e moale în interior, nu uscată. Focul mic și răbdarea sunt secretele.`
    },
    {
      id: "shakshuka",
      title: "Shakshuka (Tot omleta dar diferita)",
      category: "main",
      ingredients: "ouă, roșii în conservă (pelate sau pasată), ardei gras roșu sau verde, ceapă, usturoi, chimen măcinat, coriandru măcinat, boia de ardei afumată, ardei iute (opțional), sare, zahăr, ulei de măsline, feta (opțional), pâine sau pită pentru servit, verdețuri (pătrunjel sau coriandru proaspăt)",
      time: "35 min",
      steps: `1. Încinge 3 linguri de ulei de măsline în o tigaie adâncă sau o tavă cu pereți înalți, la foc mediu.
2. Adaugă ceapa tăiată cubulețe și ardeiul gras tocat. Căleşte 8–10 minute până devin moi și ușor caramelizate.
3. Adaugă usturoiul tocat, chimenul, coriandrul și boiaua de ardei afumată. Dacă folosești ardei iute, adaugă-l acum. Prăjește condimentele 1 minut, amestecând — această etapă este esențială pentru activarea aromelor.
4. Toarnă roșiile în conservă. Dacă folosești roșii pelate, strivește-le cu lingura în tigaie. Adaugă sare și un praf de zahăr pentru echilibru.
5. Lasă sosul să fiarbă la foc mediu-mic 15 minute, amestecând din când în când, până se concentrează și se îngroașă ușor.
6. Cu o lingură, fă adâncituri în sos — câte una pentru fiecare ou. Sparge câte un ou în fiecare adâncitură.
7. Acoperă tigaia cu un capac și gătește la foc mic 5–8 minute: albușul trebuie să fie complet coagulat, dar gălbenușul — cremos și curgător. Acesta este punctul perfect al shakshukei.
8. Presară feta fărâmițată deasupra (opțional), urmată de verdețuri proaspete tocate.
9. Servește direct din tigaie, cu pâine proaspătă sau pită pentru a înmuia în sosul roșu aromat.

💡 Secretul shakshukei: sosul trebuie să fie suficient de consistent înainte să adaugi ouăle — dacă e prea lichid, albușul se împrăștie și nu se gătește corect.`
    }
  ];

  DEFAULT_RECIPES.push(
    {
      id: "tzatziki",
      title: "Tzatziki",
      category: "other",
      ingredients: "iaurt grecesc gros, castraveți, usturoi, ulei de măsline extravirgin, suc de lămâie sau oțet de mere, sare, piper alb, mărar proaspăt sau mentă",
      time: "15 min + 30 min odihnă",
      steps: `1. Rade castraveții (fără coajă, fără semințe) pe răzătoarea mare. Presară sare generosă și lasă-i 15–20 minute să lase apa. Stoarce-i bine cu mâinile sau învelește-i într-un prosop curat și stoarce — apa din castravete este inamicul tzatziki-ului cremos.
2. Zdrobește 2–3 căței de usturoi cu un praf de sare, până devine pastă fină. Usturoiul pisat (nu dat prin presă) are o textură mai bună și nu devine picant în exces.
3. Amestecă 400–500 g iaurt grecesc (gras, de minim 10%) cu usturoiul zdrobit, castraveții storși bine, 2 linguri ulei de măsline, 1–2 lingurițe suc de lămâie și mărar tocat din abundență.
4. Amestecă ușor, gustă și ajustează sarea, lămâia și usturoiul după preferință.
5. Dă la frigider minimum 30 minute — important! Tzatziki-ul devine mai bun pe măsură ce stă, aromele se îmbină și se intensifică.
6. La servire, toarnă un strop de ulei de măsline pe deasupra și adaugă câteva frunze de mărar sau o crenguță de mentă.
7. Servește cu pâine prăjită, lipie, legume crude (ardei, morcov, castraveți), carne la grătar sau ca sos pentru shawarma și gyros.

💡 Calitatea iaurtului face diferența — iaurtul grecesc gros (strâns) dă un tzatziki cremos, nu lichid. Evită iaurtul diluat.`
    }
  );
  let recipes = [];
  let activeCategory = "main";
  let editingId = null;
  let draftImage = "";
  let portrait = localStorage.getItem("busuioc_recipes_layout") === "portrait";
  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const id = () => `recipe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const showToast = message => { els.toast.textContent = message; els.toast.classList.add("is-visible"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => els.toast.classList.remove("is-visible"), 2500); };
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  const safeImage = recipe => recipe.image || "images/default.png";
  function setPortrait(value) {
    portrait = value;
    localStorage.setItem("busuioc_recipes_layout", portrait ? "portrait" : "expanded");
    els.grid.classList.toggle("recipes-grid--portrait", portrait);
    els.layout.querySelector("i").className = `bi bi-${portrait ? "view-stacked" : "grid-3x3-gap"}`;
    els.layout.querySelector("span").textContent = portrait ? "Aranjare lungă" : "Aranjare portret";
  }
  function render() {
    const query = els.search.value.trim().toLocaleLowerCase("ro");
    const visible = recipes.filter(recipe => recipe.category === activeCategory && `${recipe.title} ${recipe.ingredients}`.toLocaleLowerCase("ro").includes(query));
    els.grid.innerHTML = visible.length ? visible.map(recipe => `<article class="recipe-card" data-recipe-id="${escapeHtml(recipe.id)}"><div class="recipe-card__image"><img src="${escapeHtml(safeImage(recipe))}" alt="${escapeHtml(recipe.title)}" onerror="this.src='images/default.png'" /><span class="recipe-card__time"><i class="bi bi-clock"></i>${escapeHtml(recipe.time || "La alegere")}</span></div><div class="recipe-card__content"><div><p class="recipe-card__kicker">${recipe.category === "main" ? "Rețetă principală" : "Altele"}</p><h2>${escapeHtml(recipe.title)}</h2></div><p class="recipe-card__ingredients"><i class="bi bi-basket2"></i>${escapeHtml(recipe.ingredients)}</p><button class="recipe-card__more" data-action="toggle-details" type="button">Vezi rețeta întreagă <i class="bi bi-arrow-right"></i></button><div class="recipe-card__details"><p>${escapeHtml(recipe.steps || "Adaugă pașii rețetei din Editare.").replace(/\n/g, "<br>")}</p><div class="recipe-card__actions"><button class="icon-btn" data-action="edit" type="button" title="Editează rețeta"><i class="bi bi-pencil"></i></button><button class="icon-btn recipe-card__delete" data-action="delete" type="button" title="Șterge rețeta"><i class="bi bi-trash3"></i></button></div></div></div></article>`).join("") : `<div class="recipes-empty"><i class="bi bi-journal-plus"></i><h2>Nicio rețetă aici încă</h2><p>Adaugă una nouă pentru colecția voastră.</p><button class="btn btn--primary" data-action="add-empty" type="button"><i class="bi bi-plus-lg"></i> Adaugă rețetă</button></div>`;
    setPortrait(portrait);
  }
  function updateImagePicker(image = "", name = "") {
    draftImage = image;
    els.imagePreview.hidden = !image;
    els.imagePreview.src = image || "";
    els.imageName.textContent = image ? (name || "Imagine selectată") : "Opțional — alege direct din calculator.";
    els.clearImage.hidden = !image;
  }
  function openEditor(recipe) {
    editingId = recipe?.id || null;
    document.getElementById("recipeDialogTitle").textContent = recipe ? "Editează rețeta" : "Adaugă o rețetă";
    els.title.value = recipe?.title || ""; els.category.value = recipe?.category || activeCategory; els.ingredients.value = recipe?.ingredients || ""; els.time.value = recipe?.time || ""; els.steps.value = recipe?.steps || "";
    updateImagePicker(recipe?.image || "", recipe?.image ? "Imaginea rețetei" : "");
    els.dialog.showModal(); els.title.focus();
  }
  function closeEditor() { els.dialog.close(); }
  try { recipes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(DEFAULT_RECIPES); } catch { recipes = structuredClone(DEFAULT_RECIPES); }
  if (!localStorage.getItem(STORAGE_KEY)) save();
  document.querySelectorAll(".recipe-tab").forEach(button => button.addEventListener("click", () => { activeCategory = button.dataset.category; document.querySelectorAll(".recipe-tab").forEach(tab => tab.classList.toggle("is-active", tab === button)); render(); }));
  els.search.addEventListener("input", render);
  document.getElementById("addRecipe").onclick = () => openEditor();
  document.getElementById("editRecipes").onclick = () => { setPortrait(false); showToast("Alege o rețetă și apasă creionul pentru editare."); };
  document.getElementById("focusSearch").onclick = () => { document.getElementById("recipeSearchArea").scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => els.search.focus(), 350); };
  els.layout.onclick = () => setPortrait(!portrait);
  document.getElementById("closeRecipeDialog").onclick = closeEditor; document.getElementById("cancelRecipe").onclick = closeEditor;
  async function pickImage() {
    try {
      if (window.mediaLibrary?.importRecipeImage) {
        const result = await window.mediaLibrary.importRecipeImage();
        if (!result?.canceled) updateImagePicker(result.src, result.name);
      } else els.imageFile.click();
    } catch { showToast("Imaginea nu a putut fi importată."); }
  }
  document.getElementById("importRecipeImage").onclick = pickImage;
  els.clearImage.onclick = () => updateImagePicker();
  els.imageFile.addEventListener("change", event => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => updateImagePicker(reader.result, file.name); reader.readAsDataURL(file); });
  els.form.addEventListener("submit", event => { event.preventDefault(); const recipe = { id: editingId || id(), title: els.title.value.trim(), category: els.category.value, ingredients: els.ingredients.value.trim(), time: els.time.value.trim(), image: draftImage, steps: els.steps.value.trim() }; recipes = editingId ? recipes.map(item => item.id === editingId ? recipe : item) : [recipe, ...recipes]; save(); activeCategory = recipe.category; document.querySelectorAll(".recipe-tab").forEach(tab => tab.classList.toggle("is-active", tab.dataset.category === activeCategory)); closeEditor(); render(); showToast("Rețeta a fost salvată."); });
  els.grid.addEventListener("click", event => { const action = event.target.closest("[data-action]")?.dataset.action; const card = event.target.closest("[data-recipe-id]"); if (action === "add-empty") return openEditor(); if (!card) return; const recipe = recipes.find(item => item.id === card.dataset.recipeId); if (action === "edit") return openEditor(recipe); if (action === "delete") { if (confirm(`Ștergi rețeta „${recipe.title}”?`)) { recipes = recipes.filter(item => item.id !== recipe.id); save(); render(); showToast("Rețeta a fost ștearsă."); } return; } if (action === "toggle-details") card.classList.toggle("is-open"); });
  render();
})();
