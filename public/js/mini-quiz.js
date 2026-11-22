// Mini quiz des pages publiques : réponses mélangées, correction immédiate, score final.
(function () {
  function melange(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  document.querySelectorAll('.mini-quiz').forEach(function (bloc) {
    var donnees = JSON.parse(bloc.querySelector('script[type="application/json"]').textContent);
    var repondu = 0, bons = 0;
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
            fin.appendChild(el('p', 'doux', bloc.dataset.fin || ''));
            var a = el('a', 'bouton', 'Continuer sur Code Ludique'); a.href = '/'; fin.appendChild(a);
          }
        });
        carte.appendChild(b); return b;
      });
      bloc.appendChild(carte);
    });
    bloc.appendChild(fin);
  });
})();
