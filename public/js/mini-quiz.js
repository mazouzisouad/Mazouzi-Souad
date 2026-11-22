// Mini quiz des pages publiques : réponses mélangées, correction immédiate, score final.
(function () {
  var params = new URLSearchParams(location.search);
  // lien de parrainage : gardé sur l'appareil pour l'achat dans l'appli (même site)
  var parrain = (params.get('parrain') || '').toUpperCase();
  if (/^[A-HJ-NP-Z2-9]{6}$/.test(parrain)) { try { localStorage.setItem('__ca_parrain', parrain); } catch (e) {} }
  // défi d'un ami : « defi=8-10 »
  var defi = /^(\d{1,2})-(\d{1,2})$/.exec(params.get('defi') || '');
  defi = defi && +defi[1] <= +defi[2] ? { score: +defi[1], sur: +defi[2] } : null;
  function partager(score, sur) {
    var url = location.origin + location.pathname + '?defi=' + score + '-' + sur + (parrain ? '&parrain=' + parrain : '');
    var texte = 'J’ai eu ' + score + '/' + sur + ' au test du code de la route sur Code Ludique. Tu fais mieux ? 🚗';
    if (navigator.share) return navigator.share({ title: 'Code Ludique : défi code de la route', text: texte, url: url }).catch(function () {});
    if (navigator.clipboard) navigator.clipboard.writeText(texte + ' ' + url).then(function () { alert('Lien copié : colle-le à ton ami.'); });
  }
  function melange(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  document.querySelectorAll('.mini-quiz').forEach(function (bloc) {
    var donnees = JSON.parse(bloc.querySelector('script[type="application/json"]').textContent);
    var repondu = 0, bons = 0;
    if (defi) {
      var bandeau = el('div', 'carte defi');
      bandeau.appendChild(el('b', null, '🏁 Ton ami a eu ' + defi.score + '/' + defi.sur + ' : à toi de jouer !'));
      bloc.parentNode.insertBefore(bandeau, bloc);
    }
    var fin = el('div', 'carte mq-score'); fin.hidden = true;
    donnees.forEach(function (q, i) {
      var carte = el('div', 'mq-q');
      carte.appendChild(el('div', 'mq-num', 'Question ' + (i + 1) + ' / ' + donnees.length));
      carte.appendChild(el('h3', null, q.q));
      var opts = melange(q.o.map(function (t, k) { return { t: t, ok: k === 0 }; }));
      var boutons = opts.map(function (o, k) {
        var b = el('button', 'mq-o'); b.type = 'button';
        b.appendChild(el('b', null, String.fromCharCode(65 + k))); b.appendChild(el('span', null, o.t));
        b.addEventListener('click', function () {
          if (carte.dataset.fait) return; carte.dataset.fait = '1';
          boutons.forEach(function (x, j) { x.disabled = true; if (opts[j].ok) x.classList.add('ok'); });
          if (!o.ok) b.classList.add('ko'); else bons++;
          var e = el('div', 'mq-e'); e.setAttribute('role', 'status');
          e.appendChild(el('b', null, o.ok ? 'Bonne réponse ! ' : 'Pas tout à fait. ')); e.appendChild(document.createTextNode(q.e));
          carte.appendChild(e);
          if (++repondu === donnees.length) {
            fin.hidden = false; fin.innerHTML = '';
            fin.appendChild(el('div', null, 'Ton score : ' + bons + ' / ' + donnees.length));
            if (defi) fin.appendChild(el('p', null, bons / donnees.length > defi.score / defi.sur ? 'Bravo, tu fais mieux que ton ami (' + defi.score + '/' + defi.sur + ') !' :
              bons / donnees.length === defi.score / defi.sur ? 'Égalité avec ton ami (' + defi.score + '/' + defi.sur + ') !' : 'Ton ami fait mieux (' + defi.score + '/' + defi.sur + ') : entraîne-toi pour le battre !'));
            fin.appendChild(el('p', 'doux', bloc.dataset.fin || ''));
            var p2 = el('button', 'bouton secondaire', 'Défier un ami à mon tour'); p2.type = 'button';
            p2.addEventListener('click', function () { partager(bons, donnees.length); });
            var a = el('a', 'bouton', 'Continuer sur Code Ludique'); a.href = '/'; fin.appendChild(a); fin.appendChild(p2);
          }
        });
        carte.appendChild(b); return b;
      });
      bloc.appendChild(carte);
    });
    bloc.appendChild(fin);
  });
})();
